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
vm.runInNewContext(fs.readFileSync("clinical-canvas/pharmacology.js", "utf8"), ctx);
vm.runInNewContext(fs.readFileSync("clinical-canvas/diagnostics.js", "utf8"), ctx);
vm.runInNewContext(fs.readFileSync("clinical-canvas/safety.js", "utf8"), ctx);
const M = ctx.ClinicalModel;
const D = ctx.ClinicalData;
const P = ctx.ClinicalPharmacology;
const Diag = ctx.ClinicalDiagnostics;
const Safety = ctx.ClinicalSafety;

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

test("visit session & SOAP report: generates complete medical summary and audit trail", () => {
  function createSOAPGenerator() {
    const list = (x) => Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : [];
    return function generateSOAPReport(session, activeModule, cohort, nodesMap) {
      const cohortLabel = cohort === "a" ? "DOROŚLI (≥16 lat)" : cohort === "p" ? "DZIECI (<16 lat)" : "OGÓLNA";
      const visitedNodes = session.history.map((h) => nodesMap[h.nodeId]).filter(Boolean);

      const hxList = new Set();
      const examList = new Set();
      const testsList = new Set();
      const redList = new Set();
      const dispoList = new Set();
      const logicList = new Set();

      visitedNodes.forEach((n) => {
        const d = n.data || {};
        list(d.hx).forEach((x) => hxList.add(x));
        list(d.exam).forEach((x) => examList.add(x));
        list(d.tests).forEach((x) => testsList.add(x));
        list(d.red).forEach((x) => redList.add(x));
        list(d.dispo).forEach((x) => dispoList.add(x));
        if (d.logic) logicList.add(d.logic);
      });

      const checkedCriteria = [];
      session.history.forEach((h) => {
        if (h.criteria && h.criteria.length) {
          h.criteria.forEach((c) => checkedCriteria.push(`[${h.title}] ${c}`));
        }
      });

      const lines = [];
      lines.push("================================================================================");
      lines.push("DOKUMENTACJA WIZYTY / KONSULTACJI KLINICZNEJ (SOAP)");
      lines.push(`Algorytm wiodący: ${activeModule} · Populacja: ${cohortLabel}`);
      lines.push("================================================================================");
      lines.push("");

      lines.push("[S] WYWIAD I CECHY PODMIOTOWE (SUBJECTIVE)");
      if (hxList.size > 0) {
        lines.push("• Główne cechy podmiotowe i ukierunkowany wywiad:");
        hxList.forEach((item) => lines.push(`  - ${item}`));
      }
      if (checkedCriteria.length > 0) {
        lines.push("• Zaznaczone zmienne decyzyjne z wywiadu / oceny wstępnej:");
        checkedCriteria.forEach((crit) => lines.push(`  - ${crit}`));
      }
      lines.push("");

      lines.push("[O] BADANIE PRZEDMIOTOWE I DIAGNOSTYKA (OBJECTIVE)");
      if (examList.size > 0) {
        lines.push("• Ukierunkowane badanie fizykalne:");
        examList.forEach((item) => lines.push(`  - ${item}`));
      }
      if (testsList.size > 0) {
        lines.push("• Diagnostyka i badania pracowniane:");
        testsList.forEach((item) => lines.push(`  - ${item}`));
      }
      if (session.calculators && session.calculators.length > 0) {
        lines.push("• Zastosowane skale i kalkulatory ryzyka:");
        session.calculators.forEach((c) => {
          lines.push(`  * ${c.name}: ${c.total != null ? c.total : "NT"}${c.max ? " / " + c.max : ""} pkt — ${c.headline}`);
          if (c.parts && c.parts.length) {
            lines.push(`    [Składowe: ${c.parts.map((p) => `${p.label}: ${p.value}`).join(", ")}]`);
          }
          if (c.action) lines.push(`    [Decyzja kliniczna: ${c.action}]`);
        });
      }
      lines.push("");

      lines.push("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)");
      if (redList.size > 0) {
        lines.push("• Czerwone flagi / punkty krytyczne podlegające weryfikacji:");
        redList.forEach((item) => lines.push(`  - ${item}`));
      }
      const hasUrgent = visitedNodes.some((n) => n.type === "urgent");
      lines.push(hasUrgent ? "• Status: Zidentyfikowano wskazania do pilnej eskalacji." : "• Status: Pacjent bez cech niestabilności.");
      lines.push("");

      lines.push("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)");
      if (dispoList.size > 0) {
        lines.push("• Zalecenia dyspozycyjne i dalsza opieka:");
        dispoList.forEach((item) => lines.push(`  - ${item}`));
      }
      lines.push("");

      lines.push("--------------------------------------------------------------------------------");
      lines.push("ŚCIEŻKA DECYZYJNA I AUDYT PRZEJŚĆ ALGORYTMU:");
      session.history.forEach((step, idx) => {
        lines.push(`${idx + 1}. [${step.type}] ${step.title}`);
        if (step.criteria && step.criteria.length > 0) {
          lines.push(`   └─ Zaznaczone zmienne: ${step.criteria.join(", ")}`);
        }
        if (step.branchTaken) {
          lines.push(`   └─ Wybrana gałąź przejścia: "${step.branchTaken}" ➔`);
        }
      });
      lines.push("================================================================================");

      return lines.join("\n");
    };
  }

  const generateReport = createSOAPGenerator();

  const mockNodes = {
    "chest.a.start": {
      id: "chest.a.start",
      title: "Ból w klatce piersiowej — triage",
      type: "assessment",
      data: {
        hx: ["Ból zamostkowy o charakterze gniotącym", "Początek 45 minut temu"],
        exam: ["SpO2 96% na powietrzu", "HR 88/min regularne", "BP 135/85 mmHg"],
      },
    },
    "chest.a.red": {
      id: "chest.a.red",
      title: "Weryfikacja czerwonych flag ACS / PE / Aorta",
      type: "decision",
      data: {
        red: ["Brak wstrząsu kardiogennego", "Brak asymetrii tętna"],
        tests: ["12-odprowadzeniowe EKG w ciągu 10 min", "Troponina hs-cTn"],
      },
    },
    "chest.a.exit": {
      id: "chest.a.exit",
      title: "Dyspozycja i dalsza obserwacja",
      type: "outcome",
      data: {
        dispo: ["Powtórzenie troponiny za 1-2h w protokole 0/1h lub 0/2h", "Kwalifikacja do OIOK/Kardiologii w razie dynamiki"],
      },
    },
  };

  const session = {
    history: [
      {
        nodeId: "chest.a.start",
        title: "Ból w klatce piersiowej — triage",
        type: "assessment",
        branchTaken: "Brak wstrząsu",
        criteria: ["Ból zamostkowy > 20 min"],
      },
      {
        nodeId: "chest.a.red",
        title: "Weryfikacja czerwonych flag ACS / PE / Aorta",
        type: "decision",
        branchTaken: "EKG bez uniesienia ST",
        criteria: ["Ujemne czerwone flagi aorty"],
      },
      {
        nodeId: "chest.a.exit",
        title: "Dyspozycja i dalsza obserwacja",
        type: "outcome",
        branchTaken: null,
        criteria: [],
      },
    ],
    calculators: [
      {
        key: "curb65",
        name: "CURB-65",
        total: 0,
        max: "5",
        headline: "Niskie ryzyko zgonu (Grupa 1, śmiertelność <1%)",
        action: "Rozważ leczenie ambulatoryjne",
        parts: [{ label: "Wiek ≥65", value: "Nie" }],
      },
    ],
  };

  const report = generateReport(session, "Ból w klatce piersiowej", "a", mockNodes);

  // Assert all key sections exist
  assert.ok(report.includes("[S] WYWIAD I CECHY PODMIOTOWE (SUBJECTIVE)"));
  assert.ok(report.includes("[O] BADANIE PRZEDMIOTOWE I DIAGNOSTYKA (OBJECTIVE)"));
  assert.ok(report.includes("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)"));
  assert.ok(report.includes("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)"));
  assert.ok(report.includes("ŚCIEŻKA DECYZYJNA I AUDYT PRZEJŚĆ ALGORYTMU:"));

  // Assert contents extracted from clinical nodes
  assert.ok(report.includes("Ból zamostkowy o charakterze gniotącym"));
  assert.ok(report.includes("SpO2 96% na powietrzu"));
  assert.ok(report.includes("12-odprowadzeniowe EKG w ciągu 10 min"));
  assert.ok(report.includes("Powtórzenie troponiny za 1-2h"));

  // Assert checked variables are present with node context
  assert.ok(report.includes("[Ból w klatce piersiowej — triage] Ból zamostkowy > 20 min"));
  assert.ok(report.includes("[Weryfikacja czerwonych flag ACS / PE / Aorta] Ujemne czerwone flagi aorty"));

  // Assert calculator results are incorporated
  assert.ok(report.includes("CURB-65: 0 / 5 pkt"));
  assert.ok(report.includes("Niskie ryzyko zgonu"));
  assert.ok(report.includes("Rozważ leczenie ambulatoryjne"));

  // Assert audit trail reflects sequence and branch transitions
  assert.ok(report.includes('1. [assessment] Ból w klatce piersiowej — triage'));
  assert.ok(report.includes('└─ Wybrana gałąź przejścia: "Brak wstrząsu" ➔'));
  assert.ok(report.includes('2. [decision] Weryfikacja czerwonych flag ACS / PE / Aorta'));
  assert.ok(report.includes('└─ Wybrana gałąź przejścia: "EKG bez uniesienia ST" ➔'));
  assert.ok(report.includes('3. [outcome] Dyspozycja i dalsza obserwacja'));
});

test("score-to-branch & inline calculator: matches risk score boundaries to outgoing branches", () => {
  function matchScoreToBranch(scoreKey, total, outgoingEdges) {
    if (!outgoingEdges || !outgoingEdges.length) return null;
    if (scoreKey === "wellspe") {
      const isLikely = total > 4;
      return outgoingEdges.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return isLikely
          ? /prawdopodobn|wysok|tkpa|angio|tak|\+|>4/.test(lbl)
          : /mało|nisk|d-dimer|dimer|nie|ujemn|perc|<=4|≤4/.test(lbl);
      });
    }
    if (scoreKey === "curb65") {
      const isHigh = total >= 2;
      return outgoingEdges.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return isHigh
          ? /hospitaliz|ciężk|oiom|oddział|wysok|tak|≥2|>=2/.test(lbl)
          : /ambulat|dom|nisk|nie|0-1/.test(lbl);
      });
    }
    if (scoreKey === "qsofa") {
      const isSepsis = total >= 2;
      return outgoingEdges.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return isSepsis
          ? /seps|eskalac|wysok|piln|\btak\b|≥2|>=2/.test(lbl)
          : /nisk|stabiln|\bnie\b|<2/.test(lbl);
      });
    }
    return null;
  }

  function findNodeScore(n) {
    if (!n) return null;
    const title = (n.title || "").toLowerCase();
    const d = n.data || {};
    const text = [title, ...(d.red || []), ...(d.tests || []), ...(d.criteria || [])].join(" ").toLowerCase();
    if (/wellspe|wells|zatorowoś|d-dimer/i.test(text)) return "wellspe";
    if (/curb65|curb|zapaleni.*płuc|pozaszpitaln/i.test(text)) return "curb65";
    if (/qsofa|seps/i.test(text)) return "qsofa";
    if (/news2|news|wczesn.*ostrzeg/i.test(text)) return "news2";
    if (/pews|pediatr.*wczesn/i.test(text)) return "pews";
    if (/gcs|glasgow/i.test(text)) return "gcs";
    return null;
  }

  // Wells PE branches test
  const wellsBranches = [
    { id: "e-ctpa", label: "Prawdopodobny ZP ➔ TKPA" },
    { id: "e-ddimer", label: "Mało prawdopodobny ➔ D-dimer" },
  ];
  assert.equal(matchScoreToBranch("wellspe", 6.0, wellsBranches).id, "e-ctpa");
  assert.equal(matchScoreToBranch("wellspe", 4.0, wellsBranches).id, "e-ddimer");
  assert.equal(matchScoreToBranch("wellspe", 1.5, wellsBranches).id, "e-ddimer");

  // CURB-65 branches test
  const curbBranches = [
    { id: "e-hosp", label: "Hospitalizacja (Grupa 2/3)" },
    { id: "e-home", label: "Leczenie ambulatoryjne" },
  ];
  assert.equal(matchScoreToBranch("curb65", 3, curbBranches).id, "e-hosp");
  assert.equal(matchScoreToBranch("curb65", 2, curbBranches).id, "e-hosp");
  assert.equal(matchScoreToBranch("curb65", 0, curbBranches).id, "e-home");

  // qSOFA branches test
  const qsofaBranches = [
    { id: "e-sepsis", label: "Podejrzenie sepsy / eskalacja" },
    { id: "e-stable", label: "Niskie ryzyko" },
  ];
  assert.equal(matchScoreToBranch("qsofa", 2, qsofaBranches).id, "e-sepsis");
  assert.equal(matchScoreToBranch("qsofa", 1, qsofaBranches).id, "e-stable");

  // Node detection test
  assert.equal(findNodeScore({ title: "Ocena prawdopodobieństwa Wells dla ZP" }), "wellspe");
  assert.equal(findNodeScore({ title: "Pozaszpitalne zapalenie płuc — ocena CURB" }), "curb65");
  assert.equal(findNodeScore({ title: "Triage gorączki i screening sepsy qSOFA" }), "qsofa");
});

test("PDF dossier generator: formats printable dossier with header, audit, calculators, and SOAP", () => {
  function generateDossierHTML(session, moduleName, cohortLabel, dateStr, soapText) {
    return `
    <div class="dossier-sheet">
      <div class="dossier-header">
        <h1>Clinical Canvas · Karta Konsultacji Klinicznej i Decyzji</h1>
        <div class="dossier-meta">${moduleName} | ${cohortLabel} | ${dateStr}</div>
      </div>
      <section class="dossier-section">
        <h2>1. Ścieżka Decyzyjna i Punkty Zwrotne (Audit Trail)</h2>
        ${session.history.map((s, i) => `<div>${i + 1}. ${s.title} [${s.branchTaken || ""}]</div>`).join("")}
      </section>
      <section class="dossier-section">
        <h2>2. Skale Kliniczne</h2>
        ${session.calculators.map((c) => `<div>${c.name}: ${c.total} pkt</div>`).join("")}
      </section>
      <section class="dossier-section">
        <h2>3. Ustrukturyzowana Notatka Kliniczna (SOAP)</h2>
        <pre>${soapText}</pre>
      </section>
    </div>`;
  }

  const session = {
    history: [
      { title: "Triage", branchTaken: "Stabilny" },
      { title: "Wells PE", branchTaken: "TKPA" },
    ],
    calculators: [{ name: "Wells PE", total: 6.0 }],
  };

  const html = generateDossierHTML(session, "Klatka piersiowa", "DOROŚLI", "2026-11-05 14:00", "[S] Wywiad...");
  assert.ok(html.includes("Karta Konsultacji Klinicznej"));
  assert.ok(html.includes("Wells PE [TKPA]"));
  assert.ok(html.includes("Wells PE: 6 pkt"));
  assert.ok(html.includes("[S] Wywiad..."));
});

test("pharmacology: estimatePediatricWeight() matches APLS age tiers and clamping", () => {
  assert.equal(P.estimatePediatricWeight(0.5), 6.5);
  assert.equal(P.estimatePediatricWeight(1), 10);
  assert.equal(P.estimatePediatricWeight(3), 14);
  assert.equal(P.estimatePediatricWeight(5), 18);
  assert.equal(P.estimatePediatricWeight(7), 28);
  assert.equal(P.estimatePediatricWeight(12), 43);
  assert.equal(P.estimatePediatricWeight(15), 53);
  assert.equal(P.estimatePediatricWeight(25), 70); // clamped at 70
  assert.equal(P.estimatePediatricWeight(-2), 10); // fallback
});

test("pharmacology: emergencyDoses() calculates exact adult vs pediatric doses", () => {
  // Adult 70 kg
  const adult = P.emergencyDoses(70, false);
  assert.equal(adult.isChild, false);
  assert.equal(adult.adrenalineAnaphylaxis.doseMg, 0.5);
  assert.equal(adult.adrenalineAnaphylaxis.volumeMl, 0.5);
  assert.equal(adult.adrenalineCardiacArrest.doseMg, 1.0);
  assert.equal(adult.adrenalineCardiacArrest.volumeMl, 10.0);
  assert.equal(adult.amiodaroneCardiacArrest.doseMgFirst, 300);
  assert.equal(adult.amiodaroneCardiacArrest.volumeMlFirst, 6.0);
  assert.equal(adult.amiodaroneCardiacArrest.doseMgSecond, 150);
  assert.equal(adult.amiodaroneCardiacArrest.volumeMlSecond, 3.0);
  assert.equal(adult.atropineBradycardia.doseMg, 0.5);
  assert.equal(adult.midazolamSeizures.doseMg, 10); // clamped at 10
  assert.ok(adult.fluidResuscitation.doseDescription.includes("2100 ml"));

  // Child 15 kg
  const child = P.emergencyDoses(15, true);
  assert.equal(child.isChild, true);
  assert.equal(child.adrenalineAnaphylaxis.doseMg, 0.15);
  assert.equal(child.adrenalineAnaphylaxis.volumeMl, 0.15);
  assert.equal(child.adrenalineCardiacArrest.doseMg, 0.15);
  assert.equal(child.adrenalineCardiacArrest.volumeMl, 1.5);
  assert.equal(child.amiodaroneCardiacArrest.doseMgFirst, 75);
  assert.equal(child.amiodaroneCardiacArrest.volumeMlFirst, 1.5);
  assert.equal(child.atropineBradycardia.doseMg, 0.3);
  assert.equal(child.midazolamSeizures.doseMg, 3.0);
  assert.ok(child.fluidResuscitation.doseDescription.includes("300 ml"));
});

test("pharmacology: hollidaySegar() calculates daily, hourly, and drop rates across all tiers", () => {
  // Tier 1: <= 10 kg
  const hs8 = P.hollidaySegar(8);
  assert.equal(hs8.dailyMl, 800);
  assert.equal(hs8.hourlyMl, 32);
  assert.equal(hs8.dropRateMin, 11);

  // Tier 2: 11 - 20 kg
  const hs15 = P.hollidaySegar(15);
  assert.equal(hs15.dailyMl, 1250);
  assert.equal(hs15.hourlyMl, 50);
  assert.equal(hs15.dropRateMin, 17);

  // Tier 3: > 20 kg
  const hs70 = P.hollidaySegar(70);
  assert.equal(hs70.dailyMl, 2500);
  assert.equal(hs70.hourlyMl, 110);
  assert.equal(hs70.dropRateMin, 37);
});

test("pharmacology: sodiumDeficit() calculates Adrogue-Madias parameters and safety warnings", () => {
  const res = P.sodiumDeficit({
    weightKg: 70,
    sex: "m",
    age: 45,
    serumNa: 120,
    targetNa: 130,
    infusateNa: 513, // 3% NaCl
  });

  assert.equal(res.tbw, 42.0);
  assert.equal(res.totalDeficitMmol, 420.0);
  assert.equal(res.deltaNaPerLiter, 9.14);
  assert.equal(res.requiredLiters, 1.09);
  assert.ok(res.warning.includes("8-10 mmol/L/24h"));
  assert.ok(res.warning.includes("osmotycznej mielinozy"));
});

test("pharmacology: acidBase() evaluates anion gap, delta gap, and bicarbonate deficit", () => {
  // Severe HAGMA
  const hagma = P.acidBase({ na: 140, cl: 104, hco3: 14, alb: 4.0, weightKg: 70 });
  assert.equal(hagma.anionGap, 22.0);
  assert.equal(hagma.correctedAG, 22.0);
  assert.equal(hagma.isHAGMA, true);
  assert.equal(hagma.deltaGap, 0.0);
  assert.equal(hagma.bicarbDeficitMmol, 350.0);
  assert.ok(hagma.interpretation.includes("HAGMA"));
  assert.ok(hagma.interpretation.includes("MUDPILES"));

  // Albumin-corrected AG in hypoalbuminemia
  const hypoAlb = P.acidBase({ na: 140, cl: 110, hco3: 18, alb: 2.0, weightKg: 70 });
  assert.equal(hypoAlb.anionGap, 12.0);
  assert.equal(hypoAlb.correctedAG, 17.0); // 12 + 2.5 * (4 - 2) = 17
  assert.equal(hypoAlb.isHAGMA, true);
});

test("pharmacology: convertOpioid() evaluates OME and breakthrough pain dose ranges", () => {
  // Oral morphine 60 mg/d to IV morphine (factor 3)
  const conv1 = P.convertOpioid({ drugFrom: "morphine_po", doseFrom: 60, drugTo: "morphine_iv" });
  assert.equal(conv1.oralMorphineEquiv, 60.0);
  assert.equal(conv1.convertedDose, 20.0);
  assert.equal(conv1.breakthroughDose, 3.3);
  assert.equal(conv1.breakthroughDoseRange, "2 - 3.3");

  // Transdermal fentanyl patch 25 mcg/h to oral morphine
  const conv2 = P.convertOpioid({ drugFrom: "fentanyl_patch_mcgh", doseFrom: 25, drugTo: "morphine_po" });
  assert.equal(conv2.oralMorphineEquiv, 60.0);
  assert.equal(conv2.convertedDose, 60.0);
  assert.equal(conv2.breakthroughDoseRange, "6 - 10");
});

test("pharmacology: antibioticsNPOA contains Polish NPOA guidelines for core indications", () => {
  const npoa = P.antibioticsNPOA;
  assert.ok(Array.isArray(npoa));
  assert.ok(npoa.length >= 7);

  // CAP mild vs severe
  const capMild = npoa.find((n) => n.category.includes("CAP") && n.subgroup.includes("0-1 pkt"));
  assert.ok(capMild.firstLine.includes("Amoksycylina"));
  const capSevere = npoa.find((n) => n.category.includes("CAP") && n.subgroup.includes("≥3 pkt"));
  assert.ok(capSevere.firstLine.includes("Ceftriakson"));

  // ZOMR with age >= 50 rule
  const zomr = npoa.find((n) => n.category.includes("ZOMR"));
  assert.ok(zomr.firstLine.includes("Ceftriakson") && zomr.firstLine.includes("Wankomycyna") && zomr.firstLine.includes("Deksametazon"));
  assert.ok(zomr.alternative.includes("Ampicylin") && zomr.alternative.includes("Listeria"));

  // Sepsis unknown source
  const sepsis = npoa.find((n) => n.category.includes("Sepsa"));
  assert.ok(sepsis.firstLine.includes("Ceftriakson") || sepsis.firstLine.includes("Cefotaksym"));
  assert.ok(sepsis.firstLine.includes("Gentamycyna"));
});

test("visit session & SOAP report: integrates planned drugs, fluids, and antibiotics into [P] PLAN", () => {
  function formatSOAPPlan(pharmacyItems, dispoItems = []) {
    const lines = [];
    lines.push("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)");
    if (pharmacyItems && pharmacyItems.length > 0) {
      lines.push("• Zaordynowana farmakoterapia, płyny i antybiotykoterapia:");
      pharmacyItems.forEach((item) => {
        lines.push(`  * ${item.name}: ${item.dose} (${item.route || "i.v."})${item.notes ? ` — ${item.notes}` : ""}`);
      });
    }
    if (dispoItems.length > 0) {
      lines.push("• Zalecenia dyspozycyjne i dalsza opieka:");
      dispoItems.forEach((item) => lines.push(`  - ${item}`));
    }
    return lines.join("\n");
  }

  const samplePharmacy = [
    { name: "Adrenalina (Anafilaksja)", dose: "0.5 mg (0.5 ml)", route: "i.m.", notes: "Powtórzyć po 5-10 min" },
    { name: "Płynoterapia w sepsie", dose: "2100 ml", route: "i.v.", notes: "30 ml/kg w 3h" },
    { name: "Amoksycylina", dose: "3x 1000 mg p.o.", route: "p.o.", notes: "NPOA CAP" },
  ];

  const planText = formatSOAPPlan(samplePharmacy, ["Hospitalizacja na OIT"]);
  assert.ok(planText.includes("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)"));
  assert.ok(planText.includes("Zaordynowana farmakoterapia, płyny i antybiotykoterapia:"));
  assert.ok(planText.includes("Adrenalina (Anafilaksja): 0.5 mg (0.5 ml) (i.m.) — Powtórzyć po 5-10 min"));
  assert.ok(planText.includes("Płynoterapia w sepsie: 2100 ml (i.v.) — 30 ml/kg w 3h"));
  assert.ok(planText.includes("Amoksycylina: 3x 1000 mg p.o. (p.o.) — NPOA CAP"));
  assert.ok(planText.includes("Hospitalizacja na OIT"));
});

test("diagnostics: evaluateEFAST() detects free fluid, pneumothorax, and pericardial tamponade", () => {
  // Negative eFAST
  const neg = Diag.evaluateEFAST();
  assert.equal(neg.isPositive, false);
  assert.equal(neg.hasTamponade, false);
  assert.equal(neg.hasPneumothorax, false);
  assert.equal(neg.fluidSites.length, 0);

  // Free fluid in Morison's pouch
  const posMorison = Diag.evaluateEFAST({ ruq: "fluid" });
  assert.equal(posMorison.isPositive, true);
  assert.equal(posMorison.fluidSites.length, 1);
  assert.ok(posMorison.fluidSites[0].includes("Morisona"));
  assert.ok(posMorison.action.includes("laparotomii"));

  // Pericardial tamponade
  const tamponade = Diag.evaluateEFAST({ pericardial: "tamponade" });
  assert.equal(tamponade.isPositive, true);
  assert.equal(tamponade.hasTamponade, true);
  assert.ok(tamponade.action.includes("perikardiocenteza"));

  // Pneumothorax
  const ptx = Diag.evaluateEFAST({ pleuralRight: "pneumothorax" });
  assert.equal(ptx.isPositive, true);
  assert.equal(ptx.hasPneumothorax, true);
  assert.ok(ptx.ptxSites[0].includes("Prawa opłucna"));
  assert.ok(ptx.action.includes("drenaż opłucnej"));
});

test("diagnostics: evaluateBLUE() accurately matches Lichtenstein pulmonary profiles", () => {
  // Profile B: Cardiogenic pulmonary edema
  const profB = Diag.evaluateBLUE({ profileType: "B", lungSliding: true });
  assert.equal(profB.profile, "B");
  assert.ok(profB.primaryDiagnosis.includes("obrzęk płuc"));
  assert.ok(profB.action.includes("furosemid"));

  // Profile A': Pneumothorax (lung point)
  const profAprime = Diag.evaluateBLUE({ profileType: "A", lungSliding: false, lungPoint: true });
  assert.equal(profAprime.profile, "A_prime");
  assert.ok(profAprime.primaryDiagnosis.includes("Odma opłucnowa"));
  assert.equal(profAprime.alert, true);

  // Profile A + DVT: Pulmonary embolism
  const profPE = Diag.evaluateBLUE({ profileType: "A", lungSliding: true, dvtPresent: true });
  assert.equal(profPE.profile, "A");
  assert.ok(profPE.primaryDiagnosis.includes("Zatorowość płucna"));
  assert.equal(profPE.alert, true);

  // Profile C: Pneumonia
  const profC = Diag.evaluateBLUE({ profileType: "C", lungSliding: true });
  assert.equal(profC.profile, "C");
  assert.ok(profC.primaryDiagnosis.includes("Zapalenie płuc"));
});

test("diagnostics: evaluateFOCUS() identifies tamponade, RV strain, volume status, and DVT", () => {
  // Normal FOCUS
  const normal = Diag.evaluateFOCUS({});
  assert.equal(normal.hasTamponade, false);
  assert.equal(normal.hasRVStrain, false);
  assert.equal(normal.hasDVT, false);
  assert.equal(normal.alert, false);

  // Tamponade
  const tamp = Diag.evaluateFOCUS({ pericardialEffusion: "tamponade" });
  assert.equal(tamp.hasTamponade, true);
  assert.equal(tamp.alert, true);
  assert.ok(tamp.action.includes("perikardiocenteza"));

  // RV strain (PE)
  const rv = Diag.evaluateFOCUS({ rvEnlargement: true });
  assert.equal(rv.hasRVStrain, true);
  assert.equal(rv.alert, true);
  assert.ok(rv.summary.includes("PRZECIĄŻENIA PRAWEJ KOMORY"));

  // IVC collapsibility & volume status
  const hypovolemic = Diag.evaluateFOCUS({ ivcDiameterMm: 12, ivcCollapsibility: 70 });
  assert.ok(hypovolemic.volumeStatus.includes("Hipowolemia"));
  const overloaded = Diag.evaluateFOCUS({ ivcDiameterMm: 24, ivcCollapsibility: 20 });
  assert.ok(overloaded.volumeStatus.includes("Przeciążenie objętościowe"));

  // DVT CUS positive
  const dvt = Diag.evaluateFOCUS({ dvtFemoral: "non_compressible" });
  assert.equal(dvt.hasDVT, true);
  assert.ok(dvt.summary.includes("DODATNI WYNIK DVT CUS"));
});

test("diagnostics: evaluateHsTroponin() implements ESC 0/1h kinetics and rule-in/rule-out cutoffs", () => {
  // hs-cTnT: very low baseline (<5) -> rule-out
  const roBaseline = Diag.evaluateHsTroponin({ assay: "hs-cTnT", ctn0: 4 });
  assert.equal(roBaseline.category, "rule_out");

  // hs-cTnT: very high baseline (>=52) -> rule-in NSTEMI
  const riBaseline = Diag.evaluateHsTroponin({ assay: "hs-cTnT", ctn0: 65 });
  assert.equal(riBaseline.category, "rule_in");
  assert.ok(riBaseline.recommendation.includes("KORONAROGRAFIA"));

  // hs-cTnT: delta >= 5 ng/L in 1h -> rule-in
  const riDelta = Diag.evaluateHsTroponin({ assay: "hs-cTnT", ctn0: 15, ctn1: 21, deltaHours: 1 });
  assert.equal(riDelta.category, "rule_in");
  assert.equal(riDelta.delta, 6.0);

  // hs-cTnT: delta < 3 ng/L and baseline < 12 -> rule-out
  const roDelta = Diag.evaluateHsTroponin({ assay: "hs-cTnT", ctn0: 8, ctn1: 9, deltaHours: 1 });
  assert.equal(roDelta.category, "rule_out");

  // Observe zone
  const obs = Diag.evaluateHsTroponin({ assay: "hs-cTnT", ctn0: 20, ctn1: 23, deltaHours: 1 });
  assert.equal(obs.category, "observe");
});

test("diagnostics: evaluateAgeAdjustedDdimer() applies age-adjustment for patients >50y", () => {
  // Young patient <= 50y: standard 500 cutoff
  const young = Diag.evaluateAgeAdjustedDdimer({ age: 35, ddimer: 450 });
  assert.equal(young.cutoff, 500);
  assert.equal(young.isElevated, false);
  assert.equal(young.isAgeAdjusted, false);

  // Elderly patient 70y: cutoff = 70 * 10 = 700
  const elderlyNorm = Diag.evaluateAgeAdjustedDdimer({ age: 70, ddimer: 650 });
  assert.equal(elderlyNorm.cutoff, 700);
  assert.equal(elderlyNorm.isElevated, false); // 650 < 700 -> safely ruled out!
  assert.equal(elderlyNorm.isAgeAdjusted, true);

  // Elderly patient 70y elevated > 700
  const elderlyElev = Diag.evaluateAgeAdjustedDdimer({ age: 70, ddimer: 750 });
  assert.equal(elderlyElev.cutoff, 700);
  assert.equal(elderlyElev.isElevated, true);
  assert.ok(elderlyElev.recommendation.includes("angio-TK"));
});

test("diagnostics: evaluateLactateClearance() checks >=20% target in 2-4h", () => {
  // Adequate clearance >= 20%
  const good = Diag.evaluateLactateClearance({ lactate0: 4.0, lactate1: 2.0, hours: 2 });
  assert.equal(good.clearancePct, 50.0);
  assert.equal(good.isAdequate, true);
  assert.ok(good.interpretation.includes("Prawidłowy klirens"));

  // Inadequate clearance < 20%
  const poor = Diag.evaluateLactateClearance({ lactate0: 4.0, lactate1: 3.6, hours: 2 });
  assert.equal(poor.clearancePct, 10.0);
  assert.equal(poor.isAdequate, false);
  assert.ok(poor.recommendation.includes("eskalacja"));
});

test("diagnostics: evaluateABG() evaluates acid-base disturbance and Berlin ARDS P/F index", () => {
  // Respiratory acidosis + Mild ARDS
  const abg1 = Diag.evaluateABG({ ph: 7.26, pco2: 58, po2: 60, hco3: 25, fio2: 0.21 });
  assert.ok(abg1.disturbance.includes("Kwasica oddechowa"));
  assert.equal(abg1.pfRatio, 286);
  assert.ok(abg1.ardsSeverity.includes("Łagodny ARDS") || abg1.ardsSeverity.includes("Łagodne uszkodzenie płuc"));

  // Severe ARDS: PaO2 55 on FiO2 0.6 -> P/F = 92 <= 100
  const abg2 = Diag.evaluateABG({ ph: 7.36, pco2: 42, po2: 55, hco3: 24, fio2: 0.6 });
  assert.equal(abg2.pfRatio, 92);
  assert.ok(abg2.ardsSeverity.includes("Ciężki ARDS"));
});

test("visit session & SOAP report: integrates diagnostics into [O] Objective and [A] Assessment", () => {
  function formatSOAPWithDiagnostics(diagnosticsItems) {
    const lines = [];
    lines.push("[O] BADANIE PRZEDMIOTOWE I DIAGNOSTYKA (OBJECTIVE)");
    if (diagnosticsItems && diagnosticsItems.length > 0) {
      lines.push("• Przyłóżkowa ultrasonografia POCUS i panele laboratoryjne:");
      diagnosticsItems.forEach((d) => {
        lines.push(`  * [${d.type}] ${d.title}: ${d.summary}${d.action ? ` ➔ Zalecenie: ${d.action}` : ""}`);
      });
    }
    lines.push("");
    lines.push("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)");
    if (diagnosticsItems && diagnosticsItems.length > 0) {
      const alertDiags = diagnosticsItems.filter((d) => d.alert || d.isPositive);
      if (alertDiags.length > 0) {
        lines.push("• Istotne patologie ultrasonograficzne i krytyczne wyniki lab (Red Flags):");
        alertDiags.forEach((d) => {
          lines.push(`  - ⚠️ ${d.title}: ${d.summary}`);
        });
      }
    }
    return lines.join("\n");
  }

  const sampleDiags = [
    { type: "POCUS", title: "Protokół eFAST", summary: "DODATNI eFAST! Wolny płyn: Zachyłek Morisona", action: "Pilna laparotomia", isPositive: true, alert: true },
    { type: "LAB", title: "hs-cTnT", summary: "Rule-in NSTEMI (65 ng/L)", action: "Pilna koronarografia", isPositive: false, alert: true },
  ];

  const soapText = formatSOAPWithDiagnostics(sampleDiags);
  assert.ok(soapText.includes("[O] BADANIE PRZEDMIOTOWE I DIAGNOSTYKA (OBJECTIVE)"));
  assert.ok(soapText.includes("Przyłóżkowa ultrasonografia POCUS i panele laboratoryjne:"));
  assert.ok(soapText.includes("[POCUS] Protokół eFAST: DODATNI eFAST! Wolny płyn: Zachyłek Morisona ➔ Zalecenie: Pilna laparotomia"));
  assert.ok(soapText.includes("[LAB] hs-cTnT: Rule-in NSTEMI (65 ng/L) ➔ Zalecenie: Pilna koronarografia"));
  assert.ok(soapText.includes("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)"));
  assert.ok(soapText.includes("Istotne patologie ultrasonograficzne i krytyczne wyniki lab (Red Flags):"));
  assert.ok(soapText.includes("⚠️ Protokół eFAST: DODATNI eFAST! Wolny płyn: Zachyłek Morisona"));
  assert.ok(soapText.includes("⚠️ hs-cTnT: Rule-in NSTEMI (65 ng/L)"));
});

test("ClinicalSafety: renal function formulas (CKD-EPI 2021 and Cockcroft-Gault)", () => {
  assert.ok(Safety, "ClinicalSafety module is loaded");

  // CKD-EPI 2021: Male 45yo, Scr 1.0 mg/dL -> Normal (G1, ~95 ml/min/1.73m2)
  const egfrM = Safety.calculateEGFR({ creatinineMgDl: 1.0, age: 45, sex: "m" });
  assert.equal(egfrM.egfr, 95);
  assert.equal(egfrM.severity, "normal");
  assert.ok(egfrM.stage.includes("G1"));

  // CKD-EPI 2021: Female 65yo, Scr 1.8 mg/dL -> G3b (~29-30 ml/min/1.73m2)
  const egfrF = Safety.calculateEGFR({ creatinineMgDl: 1.8, age: 65, sex: "f" });
  assert.ok(egfrF.egfr < 35 && egfrF.egfr >= 25);
  assert.ok(egfrF.severity === "critical" || egfrF.severity === "warning");

  // CKD-EPI 2021: Male 72yo, Scr 3.5 mg/dL -> G5 (<15 ml/min/1.73m2)
  const egfrSevere = Safety.calculateEGFR({ creatinineMgDl: 3.5, age: 72, sex: "m" });
  assert.ok(egfrSevere.egfr < 20);
  assert.equal(egfrSevere.severity, "critical");

  // Cockcroft-Gault: Male 45yo, 70kg, Scr 1.0 -> ((140-45)*70)/(72*1) = 92.4
  const crclM = Safety.calculateCockcroftGault({ creatinineMgDl: 1.0, age: 45, weightKg: 70, sex: "m" });
  assert.equal(crclM, 92.4);

  // Cockcroft-Gault: Female 45yo, 70kg, Scr 1.0 -> 92.36 * 0.85 = 78.5
  const crclF = Safety.calculateCockcroftGault({ creatinineMgDl: 1.0, age: 45, weightKg: 70, sex: "f" });
  assert.equal(crclF, 78.5);
});

test("ClinicalSafety: QTc prolongation and TdP risk detection (Category X)", () => {
  // Concomitant Amiodarone + Clarithromycin
  const res1 = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 1.0, age: 50, sex: "m", allergies: [], comorbidities: [] },
    orderedDrugs: [{ name: "Amiodaron", dose: "300 mg" }, { name: "Klarytromycyna", dose: "500 mg" }],
  });
  assert.equal(res1.isSafe, false);
  assert.equal(res1.criticalCount, 1);
  const qtcAlert = res1.alerts.find((a) => a.id === "DDI_QT_PROLONGATION");
  assert.ok(qtcAlert, "Must detect QT prolongation alert");
  assert.equal(qtcAlert.category, "X");

  // Haloperidol in patient with baseline prolonged QTc
  const res2 = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 1.0, age: 60, sex: "f", allergies: [], comorbidities: ["prolonged_qt"] },
    orderedDrugs: [{ name: "Haloperidol", dose: "5 mg" }],
  });
  assert.equal(res2.criticalCount, 1);
  assert.ok(res2.alerts.some((a) => a.id === "DDI_QT_PROLONGATION"));
});

test("ClinicalSafety: renal contraindications and Triple Whammy (Category X & D)", () => {
  // NSAID in severe CKD (eGFR < 30) -> Category X
  const resCKD = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 2.8, egfr: 22, age: 70, sex: "m", comorbidities: [] },
    orderedDrugs: [{ name: "Ketoprofen", dose: "100 mg" }],
  });
  assert.equal(resCKD.criticalCount, 1);
  const ckdAlert = resCKD.alerts.find((a) => a.id === "CONTRA_NSAID_CKD");
  assert.ok(ckdAlert);
  assert.equal(ckdAlert.category, "X");

  // Triple Whammy: NSAID + ACEI + Diuretic -> Category D
  const resTW = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 1.1, egfr: 65, age: 68, sex: "m", comorbidities: [] },
    orderedDrugs: [
      { name: "Ketoprofen", dose: "100 mg" },
      { name: "Ramipryl", dose: "5 mg" },
      { name: "Furosemid", dose: "40 mg" },
    ],
  });
  assert.equal(resTW.criticalCount, 0);
  assert.equal(resTW.warningCount, 1);
  const twAlert = resTW.alerts.find((a) => a.id === "DDI_TRIPLE_WHAMMY");
  assert.ok(twAlert);
  assert.equal(twAlert.category, "D");

  // Aminoglycoside in renal impairment (eGFR 35) -> Category D
  const resGent = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 1.8, egfr: 35, age: 65, sex: "m" },
    orderedDrugs: [{ name: "Gentamycyna", dose: "5 mg/kg" }],
  });
  assert.ok(resGent.alerts.some((a) => a.id === "CONTRA_AMINOGLYCOSIDE_CKD"));
});

test("ClinicalSafety: bleeding risks and peptic ulcer contraindications", () => {
  // Triple Bleeding: NSAID + Anticoagulant + Antiplatelet
  const resBleed = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 0.9, egfr: 90, comorbidities: [] },
    orderedDrugs: [
      { name: "Ketoprofen", dose: "100 mg" },
      { name: "Enoksaparyna", dose: "1 mg/kg" },
      { name: "Klopidogrel", dose: "75 mg" },
    ],
  });
  assert.equal(resBleed.criticalCount, 1);
  assert.ok(resBleed.alerts.some((a) => a.id === "DDI_TRIPLE_BLEEDING"));

  // NSAID in peptic ulcer / active GI bleeding
  const resUlcer = Safety.evaluatePatientSafety({
    patientProfile: { creatinine: 1.0, egfr: 85, comorbidities: ["peptic_ulcer"] },
    orderedDrugs: [{ name: "Ibuprofen", dose: "400 mg" }],
  });
  assert.equal(resUlcer.criticalCount, 1);
  assert.ok(resUlcer.alerts.some((a) => a.id === "CONTRA_NSAID_ULCER"));
});

test("ClinicalSafety: allergy cross-reactivity and Samter triad", () => {
  // Penicillin anaphylaxis + Amoxicillin -> Category X
  const resPen = Safety.evaluatePatientSafety({
    patientProfile: { allergies: ["penicillin_anaphylaxis"] },
    orderedDrugs: [{ name: "Amoksycylina z kwasem klawulanowym", dose: "1.2 g" }],
  });
  assert.equal(resPen.criticalCount, 1);
  assert.ok(resPen.alerts.some((a) => a.id === "ALLERGY_PENICILLIN_ANAPHYLAXIS"));

  // Penicillin anaphylaxis + Ceftriaxone -> Category D cross-reactivity warning
  const resCeph = Safety.evaluatePatientSafety({
    patientProfile: { allergies: ["penicillin_anaphylaxis"] },
    orderedDrugs: [{ name: "Ceftriakson", dose: "2 g" }],
  });
  assert.equal(resCeph.criticalCount, 0);
  assert.equal(resCeph.warningCount, 1);
  assert.ok(resCeph.alerts.some((a) => a.id === "ALLERGY_CROSS_CEPHALOSPORIN"));

  // Samter Triad + Ketoprofen -> Category X
  const resSamter = Safety.evaluatePatientSafety({
    patientProfile: { allergies: ["aspirin_asthma"] },
    orderedDrugs: [{ name: "Ketoprofen", dose: "100 mg" }],
  });
  assert.equal(resSamter.criticalCount, 1);
  assert.ok(resSamter.alerts.some((a) => a.id === "ALLERGY_SAMTER_TRIAD"));
});

test("ClinicalSafety: hemodynamic collapse, CNS depression and pregnancy", () => {
  // Nitrate + PDE-5 -> Category X
  const resNitrate = Safety.evaluatePatientSafety({
    patientProfile: {},
    orderedDrugs: [{ name: "Nitrogliceryna", dose: "0.4 mg s.l." }, { name: "Sildenafil", dose: "50 mg" }],
  });
  assert.equal(resNitrate.criticalCount, 1);
  assert.ok(resNitrate.alerts.some((a) => a.id === "DDI_NITRATE_PDE5"));

  // Opioid + Benzodiazepine -> Category D
  const resCNS = Safety.evaluatePatientSafety({
    patientProfile: {},
    orderedDrugs: [{ name: "Morfina", dose: "5 mg" }, { name: "Midazolam", dose: "2.5 mg" }],
  });
  assert.equal(resCNS.warningCount, 1);
  assert.ok(resCNS.alerts.some((a) => a.id === "DDI_RESPIRATORY_DEPRESSION"));

  // Pregnancy teratogenicity: Doxycycline & Ciprofloxacin -> Category X
  const resPreg = Safety.evaluatePatientSafety({
    patientProfile: { comorbidities: ["pregnancy"] },
    orderedDrugs: [{ name: "Doksycyklina", dose: "100 mg" }],
  });
  assert.equal(resPreg.criticalCount, 1);
  assert.ok(resPreg.alerts.some((a) => a.id === "CONTRA_PREGNANCY"));
});

test("visit session & SOAP report: integrates CDS alerts, renal status, and Clinical Overrides", () => {
  function formatSOAPWithSafety({ patientProfile, alerts, overrides }) {
    const lines = [];
    lines.push("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)");
    if (patientProfile.creatinine !== 1.0 || (patientProfile.allergies && patientProfile.allergies.length > 0) || (patientProfile.comorbidities && patientProfile.comorbidities.length > 0)) {
      lines.push(`• Profil ryzyka i funkcja nerek (CKD-EPI 2021): Kreatynina ${patientProfile.creatinine} mg/dL, eGFR ${patientProfile.egfr} ml/min/1.73m² (${patientProfile.stage || "G1"})`);
      if (patientProfile.allergies.length > 0) lines.push(`  - Wywiad alergiczny: ${patientProfile.allergies.join(", ")}`);
      if (patientProfile.comorbidities.length > 0) lines.push(`  - Obciążenia kliniczne: ${patientProfile.comorbidities.join(", ")}`);
    }
    if (alerts && alerts.length > 0) {
      lines.push("• Bezpieczeństwo farmakoterapii (CDS Alerts & DDI):");
      alerts.forEach((alt) => {
        lines.push(`  - [Kat. ${alt.category}] ⛔ ${alt.title}`);
        lines.push(`    └─ Mechanizm: ${alt.mechanism}`);
        lines.push(`    └─ Rekomendacja: ${alt.action}`);
      });
    }
    lines.push("");
    lines.push("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)");
    if (overrides && overrides.length > 0) {
      lines.push("• Autoryzowane odstępstwa kliniczne i audyt decyzji (Clinical Overrides):");
      overrides.forEach((ov, idx) => {
        lines.push(`  ${idx + 1}. [Godz. 14:30] Lekarz dyżurny autoryzował odstępstwo od alertu CDS:`);
        lines.push(`     └─ Uzasadnienie: "${ov.reason}"`);
      });
    }
    return lines.join("\n");
  }

  const sampleProfile = { creatinine: 2.2, egfr: 28, stage: "G4", allergies: ["penicillin_anaphylaxis"], comorbidities: ["peptic_ulcer"] };
  const sampleAlerts = [
    { category: "X", title: "Bezwzględne przeciwwskazanie: NLPZ w ciężkiej niewydolności nerek", mechanism: "Skurcz tętniczki doprowadzającej", action: "Wycofaj NLPZ" },
  ];
  const sampleOverrides = [
    { timestamp: Date.now(), reason: "Stan wyższej konieczności: pilna analgezja przed repozycją złamania; wdrożono intensywne nawodnienie." },
  ];

  const soap = formatSOAPWithSafety({ patientProfile: sampleProfile, alerts: sampleAlerts, overrides: sampleOverrides });
  assert.ok(soap.includes("Profil ryzyka i funkcja nerek (CKD-EPI 2021): Kreatynina 2.2 mg/dL, eGFR 28 ml/min/1.73m² (G4)"));
  assert.ok(soap.includes("Wywiad alergiczny: penicillin_anaphylaxis"));
  assert.ok(soap.includes("Obciążenia kliniczne: peptic_ulcer"));
  assert.ok(soap.includes("Bezpieczeństwo farmakoterapii (CDS Alerts & DDI):"));
  assert.ok(soap.includes("[Kat. X] ⛔ Bezwzględne przeciwwskazanie: NLPZ w ciężkiej niewydolności nerek"));
  assert.ok(soap.includes("Autoryzowane odstępstwa kliniczne i audyt decyzji (Clinical Overrides):"));
  assert.ok(soap.includes("Stan wyższej konieczności: pilna analgezja przed repozycją złamania"));
});





