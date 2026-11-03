#!/usr/bin/env python3
import io
import json
import os
import tempfile
import unittest
from pathlib import Path

# Use a temporary runtime directory for test DB
test_tmpdir = tempfile.TemporaryDirectory()
os.environ["CLINICAL_RUNTIME"] = test_tmpdir.name

import importlib.util
server_path = Path(__file__).resolve().parent.parent / "clinical-server.py"
spec = importlib.util.spec_from_file_location("clinical_server", server_path)
srv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(srv)


class MockSocket:
    def __init__(self, data=b""):
        self.rfile = io.BytesIO(data)
        self.wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if "b" in mode and "r" in mode:
            return self.rfile
        return self.wfile

    def sendall(self, data):
        self.wfile.write(data)


class DummyServer:
    pass


def call_handler(method, path, body=None, headers=None, client_ip="127.0.0.1"):
    raw_lines = [f"{method} {path} HTTP/1.1", "Host: localhost"]
    hdrs = headers or {}
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        raw_lines.append(f"Content-Length: {len(data)}")
        if "Content-Type" not in hdrs:
            raw_lines.append("Content-Type: application/json")
    for k, v in hdrs.items():
        raw_lines.append(f"{k}: {v}")
    raw_lines.append("")
    raw_lines.append("")
    raw_req = "\r\n".join(raw_lines).encode("utf-8")
    if data:
        raw_req += data

    sock = MockSocket(raw_req)
    srv.Handler(sock, (client_ip, 12345), DummyServer())
    res = sock.wfile.getvalue().decode("utf-8")
    header_part, _, body_part = res.partition("\r\n\r\n")
    status_line = header_part.splitlines()[0]
    status_code = int(status_line.split(" ")[1])
    parsed_body = json.loads(body_part) if body_part else None
    return status_code, parsed_body


def make_valid_payload():
    return {
        "schema_version": 2,
        "graphs": {
            "chest.a": {
                "title": "Ból w klatce piersiowej",
                "cohort": "a",
                "nodes": [
                    {"id": "chest.a.start", "type": "assessment", "x": 260, "y": 0, "title": "Wywiad"},
                    {"id": "chest.a.red", "type": "decision", "x": 260, "y": 132, "title": "Zagrożenie?"},
                ],
                "edges": [
                    {"id": "chest.a.start-red", "from": "chest.a.start", "to": "chest.a.red", "label": ""},
                ],
            }
        },
    }


class TestValidPayload(unittest.TestCase):
    def test_valid_payload_accepted(self):
        payload = make_valid_payload()
        self.assertTrue(srv.valid_payload(payload))

    def test_invalid_schema_version(self):
        payload = make_valid_payload()
        payload["schema_version"] = 1
        self.assertFalse(srv.valid_payload(payload))

    def test_too_many_graphs(self):
        payload = {"schema_version": 2, "graphs": {f"g{i}": {"nodes": [], "edges": []} for i in range(91)}}
        self.assertFalse(srv.valid_payload(payload))

    def test_total_node_limit(self):
        payload = {"schema_version": 2, "graphs": {}}
        for g_idx in range(6):
            count = 350 if g_idx < 5 else 251
            payload["graphs"][f"g{g_idx}"] = {
                "nodes": [{"id": f"n-{g_idx}-{i}", "x": 0, "y": 0} for i in range(count)],
                "edges": [],
            }
        self.assertFalse(srv.valid_payload(payload))

    def test_duplicate_node_id_across_graphs(self):
        payload = make_valid_payload()
        payload["graphs"]["chest.p"] = {
            "title": "Pediatria",
            "cohort": "p",
            "nodes": [
                {"id": "chest.a.start", "x": 0, "y": 0},
            ],
            "edges": [],
        }
        self.assertFalse(srv.valid_payload(payload))

    def test_invalid_coordinates(self):
        for bad_coord in (float("nan"), float("inf"), 50001, -50001, True, "100"):
            payload = make_valid_payload()
            payload["graphs"]["chest.a"]["nodes"][0]["x"] = bad_coord
            self.assertFalse(srv.valid_payload(payload), f"Failed to reject x={bad_coord}")

    def test_invalid_edges(self):
        # Self-referential edge
        p1 = make_valid_payload()
        p1["graphs"]["chest.a"]["edges"].append(
            {"id": "e-self", "from": "chest.a.start", "to": "chest.a.start"}
        )
        self.assertFalse(srv.valid_payload(p1))

        # Dangling edge endpoint
        p2 = make_valid_payload()
        p2["graphs"]["chest.a"]["edges"].append(
            {"id": "e-ghost", "from": "chest.a.start", "to": "nonexistent"}
        )
        self.assertFalse(srv.valid_payload(p2))


class TestServerHTTP(unittest.TestCase):
    def test_health(self):
        status, data = call_handler("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")

    def test_loopback_fallback_and_state_crud(self):
        # Initial state should be revision 0, payload None for local-dev
        status, data = call_handler("GET", "/api/state")
        self.assertEqual(status, 200)
        self.assertEqual(data["revision"], 0)
        self.assertIsNone(data["payload"])

        # Save revision 1
        valid_payload = make_valid_payload()
        status, data = call_handler(
            "PUT",
            "/api/state",
            body={"revision": 0, "payload": valid_payload},
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["revision"], 1)

        # Read back saved revision
        status, data = call_handler("GET", "/api/state")
        self.assertEqual(status, 200)
        self.assertEqual(data["revision"], 1)
        self.assertEqual(data["payload"]["schema_version"], 2)

        # Revision conflict: PUT with stale revision 0 should fail with 409
        status, data = call_handler(
            "PUT",
            "/api/state",
            body={"revision": 0, "payload": valid_payload},
        )
        self.assertEqual(status, 409)
        self.assertEqual(data["revision"], 1)

    def test_remote_without_header_returns_403(self):
        # Non-loopback connection without X-Visitor-Id is rejected
        status, data = call_handler("GET", "/api/state", client_ip="192.168.1.100")
        self.assertEqual(status, 403)
        self.assertIn("error", data)

    def test_remote_with_header_succeeds(self):
        # Non-loopback connection with X-Visitor-Id is accepted
        status, data = call_handler(
            "GET",
            "/api/state",
            headers={"X-Visitor-Id": "remote-user-xyz"},
            client_ip="192.168.1.100",
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["revision"], 0)

    def test_path_normalization(self):
        # Query parameters and trailing slashes should be normalized
        status, data = call_handler("GET", "/api/state/?nocache=1")
        self.assertEqual(status, 200)

        status, data = call_handler("GET", "/api/health?test=true")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "ok")

    def test_invalid_payload_rejected(self):
        status, data = call_handler(
            "PUT",
            "/api/state",
            body={"revision": 1, "payload": {"schema_version": 999}},
        )
        self.assertEqual(status, 400)


if __name__ == "__main__":
    unittest.main()
