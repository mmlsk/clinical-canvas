"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const ctx = {};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync("clinical-canvas/clinical-data.js", "utf8"), ctx);
vm.runInNewContext(fs.readFileSync("clinical-canvas/graph-model.js", "utf8"), ctx);
const M = ctx.ClinicalModel;
const D = ctx.ClinicalData;

test("defaults(): generates all 24 baseline graphs and 168 nodes", () => {
  const defs = M.defaults();
  assert.equal(defs.schema_version, 2);
  assert.equal(defs.content_revision, D.revision);

  const keys = Object.keys(defs.graphs);
  assert.equal(keys.length, 24); // 12 modules x 2 cohorts (a, p)

  let nodeCount = 0;
  for (const m of D.modules) {
    for (const c of ["a", "p"]) {
      const g = defs.graphs[`${m.id}.${c}`];
      assert.ok(g, `Missing graph ${m.id}.${c}`);
      assert.equal(g.cohort, c);
      assert.equal(g.nodes.length, 7);
      assert.equal(g.edges.length, 7);
      nodeCount += g.nodes.length;
    }
  }
  assert.equal(nodeCount, 168);

  const validated = M.validate(defs);
  assert.equal(Object.keys(validated.graphs).length, 24);
});

test("makeGraph(): constructs clean 7-node standard pathway", () => {
  const m = D.modules[0];
  const g = M.makeGraph(m, "a");
  assert.equal(g.cohort, "a");
  assert.equal(g.nodes[0].id, `${m.id}.a.start`);
  assert.equal(g.nodes[0].type, "assessment");

  const edgeTargets = g.edges.map((e) => [e.from.replace(`${m.id}.a.`, ""), e.to.replace(`${m.id}.a.`, "")]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(edgeTargets)), [
    ["start", "red"],
    ["red", "urgent"],
    ["red", "question"],
    ["question", "yes"],
    ["question", "no"],
    ["yes", "exit"],
    ["no", "exit"],
  ]);
});

test("validate(): rejects invalid schemas and graph counts", () => {
  assert.throws(() => M.validate(null), /Oczekiwany format Clinical Canvas v2/);
  assert.throws(() => M.validate({ schema_version: 1, graphs: {} }), /Oczekiwany format Clinical Canvas v2/);
  assert.throws(() => M.validate({ schema_version: 2, graphs: [] }), /Oczekiwany format Clinical Canvas v2/);

  const tooMany = { schema_version: 2, graphs: {} };
  for (let i = 0; i <= 90; i++) tooMany.graphs[`mod_${i}`] = { nodes: [], edges: [] };
  assert.throws(() => M.validate(tooMany), /Za dużo modułów/);

  assert.throws(() => M.validate({ schema_version: 2, graphs: { constructor: { nodes: [], edges: [] } } }), /Nieprawidłowy identyfikator modułu/);
  assert.throws(() => M.validate({ schema_version: 2, graphs: { "unknown.a": { nodes: [], edges: [] } } }), /Nieznany moduł/);
});

test("validate(): enforces node and edge capacity limits", () => {
  // Per-graph nodes limit (> 400)
  const hugeGraph = {
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: Array.from({ length: 401 }, (_, i) => ({ id: `n-${i}`, title: "Krok", type: "note", x: 0, y: 0 })),
        edges: [],
      },
    },
  };
  assert.throws(() => M.validate(hugeGraph), /Nieprawidłowy rozmiar grafu/);

  // Per-graph edges limit (> 800)
  const hugeEdges = {
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: [{ id: "n1", title: "Krok 1", type: "note", x: 0, y: 0 }, { id: "n2", title: "Krok 2", type: "note", x: 0, y: 0 }],
        edges: Array.from({ length: 801 }, (_, i) => ({ id: `e-${i}`, from: "n1", to: "n2" })),
      },
    },
  };
  assert.throws(() => M.validate(hugeEdges), /Nieprawidłowy rozmiar grafu/);
});

test("validate(): catches duplicate IDs and invalid coordinates", () => {
  // Duplicate node ID in same graph
  assert.throws(() => M.validate({
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: [
          { id: "dup", title: "Krok 1", type: "note", x: 0, y: 0 },
          { id: "dup", title: "Krok 2", type: "note", x: 10, y: 10 },
        ],
        edges: [],
      },
    },
  }), /Duplikat ID lub nieznany typ węzła/);

  // Duplicate node ID across different graphs
  assert.throws(() => M.validate({
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test A",
        cohort: "a",
        nodes: [{ id: "global-dup", title: "Krok A", type: "note", x: 0, y: 0 }],
        edges: [],
      },
      "chest.p": {
        title: "Test P",
        cohort: "p",
        nodes: [{ id: "global-dup", title: "Krok P", type: "note", x: 10, y: 10 }],
        edges: [],
      },
    },
  }), /Duplikat ID lub nieznany typ węzła/);

  // Unknown node type
  assert.throws(() => M.validate({
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: [{ id: "n1", title: "Krok 1", type: "invalid-type", x: 0, y: 0 }],
        edges: [],
      },
    },
  }), /Duplikat ID lub nieznany typ węzła/);

  // Out of bounds coordinates
  for (const badCoord of [50001, -50001, NaN, Infinity]) {
    assert.throws(() => M.validate({
      schema_version: 2,
      graphs: {
        "chest.a": {
          title: "Test",
          cohort: "a",
          nodes: [{ id: "n1", title: "Krok 1", type: "note", x: badCoord, y: 0 }],
          edges: [],
        },
      },
    }), /Nieprawidłowe współrzędne/);
  }
});

test("validate(): enforces edge validity and connection endpoints", () => {
  // Self-referential edge
  assert.throws(() => M.validate({
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: [{ id: "n1", title: "Krok 1", type: "note", x: 0, y: 0 }],
        edges: [{ id: "e1", from: "n1", to: "n1" }],
      },
    },
  }), /Duplikat lub nieprawidłowe połączenie/);

  // Dangling edge target
  assert.throws(() => M.validate({
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Test",
        cohort: "a",
        nodes: [{ id: "n1", title: "Krok 1", type: "note", x: 0, y: 0 }],
        edges: [{ id: "e1", from: "n1", to: "nonexistent" }],
      },
    },
  }), /Duplikat lub nieprawidłowe połączenie/);
});

test("migrate(): transforms legacy v1 export to valid legacy.all graph", () => {
  assert.throws(() => M.migrate(null), /To nie jest stary eksport makiety/);
  assert.throws(() => M.migrate({ nodes: "invalid" }), /To nie jest stary eksport makiety/);

  const legacy = {
    nodes: [
      { id: "leg-1", t: "Wstępna ocena", type: "phase", x: 100, y: 100, d: { opis: "opis 1", logika: "logika 1", red: ["flaga 1"] } },
      { id: "leg-2", t: "Ryzyko", type: "risk", x: 200, y: 200, d: { opis: "zagrożenie" } },
      { id: "leg-3", t: "Badanie", type: "lab", x: 300, y: 300 },
    ],
    edges: [
      { from: "leg-1", to: "leg-2", label: "TAK" },
      { from: "leg-1", to: "leg-3", label: "NIE" },
    ],
  };

  const migrated = M.migrate(legacy);
  assert.equal(migrated.schema_version, 2);
  const legGraph = migrated.graphs["legacy.all"];
  assert.ok(legGraph);
  assert.equal(legGraph.cohort, "all");
  assert.equal(legGraph.nodes.length, 3);
  assert.equal(legGraph.edges.length, 2);

  // Check type mappings
  assert.equal(legGraph.nodes[0].type, "assessment"); // phase -> assessment
  assert.equal(legGraph.nodes[1].type, "urgent");     // risk -> urgent
  assert.equal(legGraph.nodes[2].type, "test");       // lab -> test
  assert.equal(legGraph.nodes[0].custom, true);

  // Check edge ID assignment
  assert.equal(legGraph.edges[0].id, "legacy-edge-0");
  assert.equal(legGraph.edges[1].id, "legacy-edge-1");
});

test("mergeWithDefaults(): merges customized graphs over baseline defaults", () => {
  const customStore = {
    graphs: {
      "chest.a": {
        title: "Zmodyfikowany ból klatki",
        cohort: "a",
        nodes: [{ id: "custom-node-1", title: "Własny krok", type: "note", x: 100, y: 100 }],
        edges: [],
      },
    },
  };

  const merged = M.mergeWithDefaults(customStore);
  assert.equal(merged.schema_version, 2);
  assert.equal(Object.keys(merged.graphs).length, 24);

  // chest.a should be customized
  assert.equal(merged.graphs["chest.a"].title, "Zmodyfikowany ból klatki");
  assert.equal(merged.graphs["chest.a"].nodes[0].id, "custom-node-1");

  // overview.a should remain original default
  assert.equal(merged.graphs["overview.a"].nodes.length, 7);
});

test("canvas keyboard navigation: Tab/Shift+Tab node cycling logic", () => {
  const g = M.defaults().graphs["chest.a"];
  const nodes = g.nodes;
  assert.equal(nodes.length, 7);

  // When no node is selected (-1), Tab selects 0, Shift+Tab selects last (6)
  const tabFromNone = (currentIndex, shift) =>
    currentIndex === -1 ? (shift ? nodes.length - 1 : 0) : (currentIndex + (shift ? -1 : 1) + nodes.length) % nodes.length;

  assert.equal(tabFromNone(-1, false), 0);
  assert.equal(tabFromNone(-1, true), 6);

  // Cycling forward
  let idx = 0;
  for (let i = 1; i <= 7; i++) {
    idx = tabFromNone(idx, false);
    assert.equal(idx, i % 7);
  }

  // Cycling backward
  idx = 0;
  assert.equal(tabFromNone(idx, true), 6);
  assert.equal(tabFromNone(6, true), 5);
});

test("canvas keyboard navigation: Arrow nudging step and boundary limits", () => {
  const nudge = (coord, delta) => Math.max(-50000, Math.min(50000, coord + delta));

  // Normal step 16px, Shift step 64px
  assert.equal(nudge(100, 16), 116);
  assert.equal(nudge(100, -16), 84);
  assert.equal(nudge(100, 64), 164);
  assert.equal(nudge(100, -64), 36);

  // Boundary clamping
  assert.equal(nudge(49980, 64), 50000);
  assert.equal(nudge(-49980, -64), -50000);
});

test("layout(): arranges standard pathway hierarchically with descending Y coordinates", () => {
  const g = M.defaults().graphs["chest.a"];
  // Mess up coordinates
  g.nodes.forEach((n) => {
    n.x = 9999;
    n.y = -9999;
  });

  const res = M.layout(g, { anchorX: 260, dx: 260, dy: 152 });
  assert.equal(res.nodes.length, 7);

  // Root node should be at layer 0 (y = 0)
  const root = res.nodes.find((n) => n.id === "chest.a.start");
  assert.equal(root.y, 0);
  assert.equal(root.x, 260);

  // Descendants should have strictly increasing Y coordinates
  const red = res.nodes.find((n) => n.id === "chest.a.red");
  assert.equal(red.y, 152);

  // All nodes must be snapped to 4px grid
  for (const n of res.nodes) {
    assert.equal(n.x % 4, 0, `Node ${n.id} x=${n.x} not on 4px grid`);
    assert.equal(n.y % 4, 0, `Node ${n.id} y=${n.y} not on 4px grid`);
  }
});

test("layout(): centers multi-branch siblings symmetrically around anchorX", () => {
  const custom = {
    nodes: [
      { id: "root", title: "Start", type: "assessment", x: 0, y: 0 },
      { id: "b1", title: "Branch 1", type: "decision", x: 0, y: 0 },
      { id: "b2", title: "Branch 2", type: "decision", x: 0, y: 0 },
    ],
    edges: [
      { id: "e1", from: "root", to: "b1" },
      { id: "e2", from: "root", to: "b2" },
    ],
  };

  M.layout(custom, { anchorX: 300, dx: 200, dy: 100 });
  const root = custom.nodes.find((n) => n.id === "root");
  const b1 = custom.nodes.find((n) => n.id === "b1");
  const b2 = custom.nodes.find((n) => n.id === "b2");

  assert.equal(root.x, 300);
  assert.equal(root.y, 0);

  assert.equal(b1.y, 100);
  assert.equal(b2.y, 100);

  // Sibling nodes should be spaced symmetrically around 300: 200 and 400
  assert.equal(b1.x, 200);
  assert.equal(b2.x, 400);
});

test("layout(): handles cyclic and disconnected graphs safely", () => {
  const cyclic = {
    nodes: [
      { id: "n1", title: "Node 1", type: "note", x: 0, y: 0 },
      { id: "n2", title: "Node 2", type: "note", x: 0, y: 0 },
      { id: "island", title: "Island", type: "note", x: 0, y: 0 },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n1" },
    ],
  };

  const res = M.layout(cyclic);
  assert.equal(res.nodes.length, 3);
  for (const n of res.nodes) {
    assert.ok(Number.isFinite(n.x));
    assert.ok(Number.isFinite(n.y));
    assert.ok(n.x >= -50000 && n.x <= 50000);
    assert.ok(n.y >= -50000 && n.y <= 50000);
  }
});

test("validate(): accepts and sanitizes node.data.criteria list field", () => {
  const payload = {
    schema_version: 2,
    graphs: {
      "chest.a": {
        title: "Klatka piersiowa",
        cohort: "a",
        nodes: [
          {
            id: "n1",
            title: "Ocena wstępna",
            type: "assessment",
            x: 0,
            y: 0,
            data: {
              criteria: ["SpO2 < 92%", "SBP < 90 mmHg", "Ból opłucnowy"],
            },
          },
        ],
        edges: [],
      },
    },
  };
  const val = M.validate(payload);
  const n = val.graphs["chest.a"].nodes[0];
  assert.deepStrictEqual(n.data.criteria, [
    "SpO2 < 92%",
    "SBP < 90 mmHg",
    "Ból opłucnowy",
  ]);
});

test("decision criteria & branch logic: variable extraction and auto-pan centering", () => {
  // Test helper mimicking app.js branchVariables logic
  function branchVariables(n, e, target) {
    const list = (x) => Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : [];
    const d = n.data || {};
    const label = (e.label || "").trim();
    const lowLabel = label.toLowerCase();

    const critList = list(d.criteria);
    if (critList.length) {
      if (lowLabel) {
        const matching = critList.filter((c) => {
          const low = c.toLowerCase();
          return (
            low.startsWith(`[${lowLabel}]`) ||
            low.startsWith(`${lowLabel}:`) ||
            low.includes(lowLabel)
          );
        });
        if (matching.length)
          return matching.map((c) => c.replace(/^\[[^\]]+\]\s*|^[^:]+:\s*/, ""));
      }
      return critList;
    }

    const isAffirmative =
      /tak|dodatn|obecn|wysok|niestabiln|piln|ciężk|kryt|spełni|alert/i.test(lowLabel) ||
      (target?.type === "urgent" && !/nie|ujemn|brak|stabiln/i.test(lowLabel));
    const isNegative = /nie|ujemn|brak|stabiln|nisk|norm/i.test(lowLabel);

    if (isAffirmative && list(d.red).length) return list(d.red);
    if (isNegative && list(d.red).length) {
      return ["Brak obecności czerwonych flag i cech niestabilności", ...list(d.exam).slice(0, 2)];
    }
    if (list(d.tests).length && (/badani|wynik|test|rtg|tk|lab/i.test(lowLabel) || target?.type === "test")) {
      return list(d.tests);
    }
    if (list(d.exam).length && (/objaw|stan|badani/i.test(lowLabel) || target?.type === "assessment")) {
      return list(d.exam);
    }
    if (list(d.hx).length) return list(d.hx);
    if (label) return [`Kryterium: ${label}`];
    return [`Wskazanie kliniczne: ${target?.title || "Przejście do kolejnego etapu"}`];
  }

  // Case 1: Prefixed custom criteria
  const customNode = {
    data: {
      criteria: ["[Tak] Tachykardia > 100", "[Tak] D-dimer > 500", "[Nie] Prawidłowy HR i brak duszności"],
    },
  };
  assert.deepStrictEqual(branchVariables(customNode, { label: "Tak" }, { type: "test" }), [
    "Tachykardia > 100",
    "D-dimer > 500",
  ]);
  assert.deepStrictEqual(branchVariables(customNode, { label: "Nie" }, { type: "note" }), [
    "Prawidłowy HR i brak duszności",
  ]);

  // Case 2: Affirmative branch derives red flags
  const redNode = {
    data: {
      red: ["Hipotensja SBP < 90", "Zaburzenia świadomości"],
      exam: ["Szmer pęcherzykowy symetryczny"],
    },
  };
  assert.deepStrictEqual(branchVariables(redNode, { label: "Tak" }, { type: "urgent" }), [
    "Hipotensja SBP < 90",
    "Zaburzenia świadomości",
  ]);

  // Case 3: Negative branch derives absence of red flags
  assert.deepStrictEqual(branchVariables(redNode, { label: "Nie" }, { type: "assessment" }), [
    "Brak obecności czerwonych flag i cech niestabilności",
    "Szmer pęcherzykowy symetryczny",
  ]);

  // Case 4: Centering pan transform calculation
  const W = 220, H = 110, k = 1.0;
  const viewport = { width: 1000, height: 600 };
  const targetNode = { x: 300, y: 200 };
  const targetCenterX = targetNode.x + W / 2; // 410
  const targetCenterY = targetNode.y + H / 2; // 255
  const panX = Math.round(viewport.width / 2 - targetCenterX * k); // 500 - 410 = 90
  const panY = Math.round((viewport.height - 40) / 2 - targetCenterY * k); // 280 - 255 = 25
  assert.equal(panX, 90);
  assert.equal(panY, 25);
});
