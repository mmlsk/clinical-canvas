#!/usr/bin/env python3
"""Preview-only persistence, scoped by the authenticated proxy visitor header."""
import hashlib
import json
import math
import os
import sqlite3
import tempfile
from contextlib import closing
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(os.environ.get("CLINICAL_RUNTIME", ROOT / "clinical-runtime"))
try:
    RUNTIME.mkdir(exist_ok=True)
except OSError:
    RUNTIME = Path(tempfile.gettempdir()) / "clinical-runtime"
    RUNTIME.mkdir(exist_ok=True)
DB = RUNTIME / "state.sqlite3"
with closing(sqlite3.connect(DB)) as db:
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("CREATE TABLE IF NOT EXISTS visitor_boards (visitor_key TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL)")

def valid_payload(value):
    if not isinstance(value, dict) or value.get("schema_version") != 2:
        return False
    graphs = value.get("graphs")
    if not isinstance(graphs, dict) or len(graphs) > 90:
        return False
    all_nodes, all_edges, total = set(), set(), 0
    for g in graphs.values():
        if not isinstance(g, dict):
            return False
        nodes, edges = g.get("nodes"), g.get("edges")
        if not isinstance(nodes, list) or not isinstance(edges, list) or len(nodes) > 400 or len(edges) > 800:
            return False
        total += len(nodes)
        if total > 2000:
            return False
        ids = set()
        for n in nodes:
            if not isinstance(n, dict):
                return False
            ident = n.get("id")
            if not isinstance(ident, str) or not ident or len(ident) > 160 or ident in all_nodes:
                return False
            for coord in ("x", "y"):
                v = n.get(coord)
                if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or abs(v) > 50000:
                    return False
            ids.add(ident)
            all_nodes.add(ident)
        for e in edges:
            if not isinstance(e, dict):
                return False
            ident = e.get("id")
            if not isinstance(ident, str) or not ident or len(ident) > 200 or ident in all_edges:
                return False
            if e.get("from") not in ids or e.get("to") not in ids or e.get("from") == e.get("to"):
                return False
            all_edges.add(ident)
    return True

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Never log graph text, visitor identifiers, or request bodies.
        print(fmt % args, flush=True)

    def reply(self, status, data):
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Visitor-Id")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def visitor(self):
        value = self.headers.get("X-Visitor-Id", "")
        if not value:
            ip = self.client_address[0]
            if ip in ("127.0.0.1", "::1", "localhost"):
                value = "local-dev"
        if not value or len(value) > 300:
            self.reply(403, {"error": "A visitor identity from the private preview proxy is required."})
            return None
        return hashlib.sha256(value.encode()).hexdigest()

    def do_OPTIONS(self):
        self.reply(200, {})

    def do_GET(self):
        raw_path = self.path.split("?")[0]
        path = raw_path.rstrip("/") or "/"
        if path == "/api/health":
            return self.reply(200, {"status": "ok"})
        if path in ("/", "/index.html", "/styles.css", "/clinical-data.js", "/storage-adapter.js", "/score-engine.js", "/calculators.js", "/app.js"):
            name = path.lstrip("/") or "index.html"
            source = ROOT / "clinical-canvas" / name
            raw = source.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/css" if name.endswith(".css") else "application/javascript" if name.endswith(".js") else "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
            return
        if path != "/api/state":
            return self.reply(404, {"error": "Not found"})
        key = self.visitor()
        if key is None:
            return
        with closing(sqlite3.connect(DB, timeout=10)) as db:
            row = db.execute("SELECT revision, payload FROM visitor_boards WHERE visitor_key=?", (key,)).fetchone()
        self.reply(200, {"revision": row[0] if row else 0, "payload": json.loads(row[1]) if row else None})

    def do_PUT(self):
        raw_path = self.path.split("?")[0]
        path = raw_path.rstrip("/") or "/"
        if path != "/api/state":
            return self.reply(404, {"error": "Not found"})
        key = self.visitor()
        if key is None:
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size < 1 or size > 8 * 1024 * 1024:
                return self.reply(413, {"error": "Request limit"})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict):
                return self.reply(400, {"error": "Expected a JSON object"})
            expected, payload = data.get("revision"), data.get("payload")
            if type(expected) is not int or expected < 0 or not valid_payload(payload):
                return self.reply(400, {"error": "Invalid state"})
            with closing(sqlite3.connect(DB, timeout=10)) as db:
                with db:
                    db.execute("BEGIN IMMEDIATE")
                    row = db.execute("SELECT revision FROM visitor_boards WHERE visitor_key=?", (key,)).fetchone()
                    current = row[0] if row else 0
                    if current != expected:
                        return self.reply(409, {"error": "Revision conflict", "revision": current})
                    revision = current + 1
                    db.execute(
                        "INSERT INTO visitor_boards(visitor_key,revision,payload) VALUES(?,?,?) "
                        "ON CONFLICT(visitor_key) DO UPDATE SET revision=excluded.revision,payload=excluded.payload",
                        (key, revision, json.dumps(payload, ensure_ascii=False, allow_nan=False)),
                    )
            self.reply(200, {"revision": revision})
        except (ValueError, TypeError, KeyError):
            self.reply(400, {"error": "Malformed JSON"})
        except sqlite3.Error:
            self.reply(503, {"error": "Persistence temporarily unavailable"})

if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8765), Handler).serve_forever()
