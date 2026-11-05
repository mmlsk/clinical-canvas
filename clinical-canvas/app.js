"use strict";
(() => {
  const D = window.ClinicalData;
  const M = window.ClinicalModel;
  const { TYPES, defaults, validate, migrate, mergeWithDefaults } = M;
  const $ = (id) => document.getElementById(id);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const escape = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const NS = "http://www.w3.org/2000/svg";
  let active = "chest",
    cohort = "a",
    selected = null,
    editing = false,
    query = "",
    transform = { x: 20, y: 20, k: 1 },
    activeBranch = null,
    checkedVars = new Set();
  const visitSession = {
    history: [],
    calculators: [],
    pharmacy: [],
    diagnostics: [],
    safetyOverrides: [],
  };
  const patientSafetyProfile = {
    creatinine: 1.0,
    egfr: 90,
    age: 45,
    sex: "m",
    weight: 70,
    allergies: [],
    comorbidities: [],
  };
  let currentPharmTab = "rko",
    currentPharmWeight = 70,
    currentPharmAge = null,
    currentPharmIsChild = false;
  const sodiumInputs = { serumNa: 120, targetNa: 130, infusateNa: 154, sex: "m", age: 45 };
  const acidBaseInputs = { na: 140, cl: 104, hco3: 24, alb: 4.0 };
  const opioidInputs = { drugFrom: "morphine_po", doseFrom: 60, drugTo: "morphine_iv" };
  let npoaSearch = "",
    npoaCategory = "all";
  let currentDiagTab = "efast";
  const efastState = { ruq: "normal", luq: "normal", pelvic: "normal", pericardial: "normal", pleuralRight: "normal", pleuralLeft: "normal" };
  const blueState = { profileType: "A", lungSliding: true, lungPoint: false, plaps: false, dvtPresent: false };
  const focusState = { pericardialEffusion: "none", rvEnlargement: false, lvContractility: "normal", ivcDiameterMm: 18, ivcCollapsibility: 60, dvtFemoral: "compressible", dvtPopliteal: "compressible" };
  const labState = {
    cTnAssay: "hs-cTnT", cTn0: 10, cTn1: 12, cTnDeltaH: 1,
    dDimerAge: 65, dDimerVal: 620,
    lact0: 4.2, lact1: 2.8, lactH: 2,
    abgPh: 7.28, abgPco2: 55, abgPo2: 65, abgHco3: 25, abgBe: -1, abgFio2: 0.21,
  };
  let undo = [],
    redo = [],
    pendingSave,
    toastTimer,
    drag = null,
    counter = 0;
  const pointers = new Map();
  let pinchStart = null;
  let store = { schema_version: 2, graphs: {} };
  const svg = $("canvas"),
    viewport = $("viewport"),
    panel = $("details");
  function uuid() {
    let id;
    do {
      id =
        globalThis.crypto?.randomUUID?.() ||
        `n-${Date.now().toString(36)}-${++counter}`;
    } while (
      Object.values(store.graphs).some(
        (g) => g.nodes.some((n) => n.id === id) || g.edges.some((e) => e.id === id),
      )
    );
    return id;
  }
  function list(x) {
    return Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : [];
  }
  function ensureStr(x, max = 18000) {
    if (typeof x !== "string" || x.length > max)
      throw Error("Nieprawidłowy lub zbyt długi tekst.");
    return x;
  }
  function safeURL(x) {
    try {
      const u = new URL(x);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch {
      return null;
    }
  }
  async function load() {
    store = defaults();
    try {
      const raw = await window.CanvasPersistence.read();
      if (raw) {
        const saved = raw.schema_version === 2 ? validate(raw) : migrate(raw);
        // Rebase untouched clinical content on updated evidence; preserve user edits and geometry.
        if (raw.content_revision !== D.revision) {
          const base = defaults();
          for (const [key, g] of Object.entries(saved.graphs)) {
            const baseline = base.graphs[key];
            if (!baseline) continue;
            g.nodes = g.nodes.map((n) => {
              const fresh = baseline.nodes.find((b) => b.id === n.id);
              return !n.custom && fresh
                ? { ...clone(fresh), x: n.x, y: n.y }
                : n;
            });
          }
        }
        store = mergeWithDefaults(saved);
        $("save-state").textContent = window.CanvasPersistence.mode === "offline" ? "Wczytano zapis lokalny" : "Wczytano zapis serwerowy";
        return;
      }
      $("save-state").textContent = "Zapis serwerowy gotowy";
    } catch (e) {
      $("save-state").textContent = "Brak odczytu zapisu — dostępny eksport JSON";
      toast(
        e.message || "Nie odczytano zapisu. Dostępna wersja bazowa i eksport JSON.",
        6000,
      );
    }
  }
  async function persist() {
    clearTimeout(pendingSave);
    pendingSave = null;
    try {
      await window.CanvasPersistence.write(clone(store));
      $("save-state").textContent =
        (window.CanvasPersistence.mode === "offline" ? "Zapisano lokalnie · " : "Zapisano na serwerze podglądu · ") +
        new Date().toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        });
    } catch (e) {
      $("save-state").textContent = "Brak zapisu — wyeksportuj JSON";
      toast(
        e.message || "Nie zapisano zmian. Pozostają w tej sesji; użyj eksportu.",
        6000,
      );
    }
  }
  function schedule() {
    clearTimeout(pendingSave);
    $("save-state").textContent = "Niezapisane zmiany…";
    pendingSave = setTimeout(persist, 350);
  }
  function checkpoint() {
    undo.push(clone(store));
    if (undo.length > 25) undo.shift();
    redo = [];
    updateHistory();
  }
  function updateHistory() {
    $("undo").disabled = !undo.length;
    $("redo").disabled = !redo.length;
  }
  function toast(message, delay = 3500) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), delay);
  }
  function graphKey(c = cohort) {
    return active === "legacy"
      ? "legacy.all"
      : `${active}.${c === "all" ? "a" : c}`;
  }
  function currentGraph() {
    return store.graphs[graphKey()] || store.graphs["overview.a"];
  }
  function visibleGraphs() {
    return active === "legacy"
      ? [store.graphs["legacy.all"]].filter(Boolean)
      : (cohort === "all" ? ["a", "p"] : [cohort])
          .map((c) => store.graphs[`${active}.${c}`])
          .filter(Boolean);
  }
  function nodeInfo(id) {
    for (const [key, g] of Object.entries(store.graphs)) {
      const n = g.nodes.find((n) => n.id === id);
      if (n) return { n, g, key };
    }
    return null;
  }
  function selectedInfo() {
    return selected?.kind === "node" ? nodeInfo(selected.id) : null;
  }
  function searchable(n) {
    return `${n.title} ${JSON.stringify(n.data)}`.toLocaleLowerCase("pl");
  }
  function renderNav() {
    const q = query.toLocaleLowerCase("pl");
    $("modules").innerHTML =
      D.modules
        .map((m, i) => {
          const matches = ["a", "p"].reduce(
            (s, c) =>
              s +
              (store.graphs[`${m.id}.${c}`]?.nodes.filter(
                (n) => !q || searchable(n).includes(q),
              ).length || 0),
            0,
          );
          if (q && !matches && !m.title.toLocaleLowerCase("pl").includes(q))
            return "";
          return `<button class="module ${m.id === active ? "active" : ""}" data-module="${m.id}" aria-current="${m.id === active ? "page" : "false"}"><span class="num">${i}</span><span>${escape(m.title)}</span>${q ? `<span class="count">${matches}</span>` : ""}</button>`;
        })
        .join("") +
      (store.graphs["legacy.all"]
        ? `<button class="module ${active === "legacy" ? "active" : ""}" data-module="legacy">Archiwum v1</button>`
        : "");
    if (!$("modules").children.length)
      $("modules").innerHTML =
        '<p class="empty">Brak wyników. Zmień frazę.</p>';
    $("module-count").textContent = String(D.modules.length);
  }
  function renderHeading() {
    const m = D.modules.find((m) => m.id === active);
    $("chapter").textContent =
      active === "legacy"
        ? "Archiwum · treść niezweryfikowana w v2"
        : `Ścieżka ${D.modules.indexOf(m)} / ${D.modules.length - 1} · ocena kliniczna`;
    $("title").textContent = m?.title || "Archiwum własnej makiety v1";
    $("subtitle").textContent =
      m?.subtitle ||
      "Zachowane dane starszej wersji. Zawartość kliniczna archiwum nie ma statusu aktualnych ścieżek i wymaga weryfikacji.";
    $("cohorts")
      .querySelectorAll("button")
      .forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.cohort === cohort));
        b.disabled = active === "legacy";
      });
  }
  function S(tag, attrs = {}, text) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function rows(text, max = 26) {
    const result = [];
    let row = "";
    for (const word of text.split(/\s+/)) {
      if ((row + " " + word).trim().length > max && row) {
        result.push(row);
        row = word;
      } else row = (row + " " + word).trim();
    }
    if (row) result.push(row);
    return result;
  }
  const W = 220,
    H = 108;
  function route(a, b, index) {
    // Orthogonal routes on the seven-node graph. Authored routes avoid unrelated nodes.
    let pts;
    if (Math.abs(a.x - b.x) < 10) {
      const x = a.x + W / 2;
      pts = [
        [x, a.y + H],
        [x, b.y],
      ];
    } else if (Math.abs(a.y - b.y) < 10) {
      const right = b.x > a.x;
      pts = [
        [a.x + (right ? W : 0), a.y + H / 2],
        [b.x + (right ? 0 : W), b.y + H / 2],
      ];
    } else if (b.y > a.y) {
      const sx = a.x + W / 2 + (b.x < a.x ? -24 : 24),
        tx = b.x + W / 2 + (a.x < b.x ? -24 : 24);
      const sy = a.y + H,
        ty = b.y,
        mid = sy + (ty - sy) * 0.5;
      pts = [
        [sx, sy],
        [sx, mid],
        [tx, mid],
        [tx, ty],
      ];
    } else {
      const sx = a.x + W,
        sy = a.y + H / 2,
        tx = b.x + W,
        ty = b.y + H / 2,
        outer = Math.max(sx, tx) + 40 + index * 5;
      pts = [
        [sx, sy],
        [outer, sy],
        [outer, ty],
        [tx, ty],
      ];
    }
    // Rounded right-angle path, radius <= 7.
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i],
        a0 = pts[i - 1],
        b0 = pts[i + 1],
        r = Math.min(
          7,
          Math.hypot(p[0] - a0[0], p[1] - a0[1]) / 2,
          Math.hypot(b0[0] - p[0], b0[1] - p[1]) / 2,
        );
      const inP = [
          p[0] + Math.sign(a0[0] - p[0]) * r,
          p[1] + Math.sign(a0[1] - p[1]) * r,
        ],
        out = [
          p[0] + Math.sign(b0[0] - p[0]) * r,
          p[1] + Math.sign(b0[1] - p[1]) * r,
        ];
      d += `L${inP[0]},${inP[1]}Q${p[0]},${p[1]} ${out[0]},${out[1]}`;
    }
    d += `L${pts.at(-1)[0]},${pts.at(-1)[1]}`;
    const mid =
      pts.length === 2
        ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]
        : [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2];
    const vertical = pts.length === 2 && pts[0][0] === pts[1][0];
    return {
      d,
      labelX: mid[0] + (vertical ? 32 : 0),
      labelY: mid[1] - (vertical ? 0 : 17),
    };
  }
  function draw() {
    viewport.replaceChildren();
    let all = [],
      nodeCount = 0;
    visibleGraphs().forEach((g, gi) => {
      const offset = gi * 900,
        group = S("g", { transform: `translate(${offset},0)` });
      viewport.appendChild(group);
      if (cohort === "all") {
        group.appendChild(
          S(
            "text",
            { x: 260, y: -22, fill: "var(--muted)", "font-size": 15 },
            g.cohort === "a" ? "DOROŚLI" : "DZIECI",
          ),
        );
      }
      g.edges.forEach((e, i) => {
        const a = g.nodes.find((n) => n.id === e.from),
          b = g.nodes.find((n) => n.id === e.to);
        if (!a || !b) return;
        const r = route(a, b, i),
          isSelected = selected?.kind === "edge" && selected.id === e.id,
          isActiveBranch = activeBranch === e.id;
        const edge = S("g", { "data-edge": e.id, class: isActiveBranch ? "active-branch-g" : "" });
        edge.append(
          S("path", { class: "edge-hit", d: r.d }),
          S("path", {
            class: `edge ${isSelected ? "selected" : ""} ${isActiveBranch ? "active-branch" : ""}`,
            d: r.d,
          }),
        );
        if (e.label) {
          const maxLabel = rows(e.label, 26)[0] || "",
            ew = maxLabel.length * 6 + 12;
          edge.append(
            S("rect", {
              class: "edge-mask",
              x: r.labelX - ew / 2,
              y: r.labelY - 9,
              width: ew,
              height: 18,
              rx: 2,
            }),
            S(
              "text",
              {
                class: "edge-label",
                x: r.labelX,
                y: r.labelY + 3,
                "text-anchor": "middle",
              },
              maxLabel,
            ),
          );
        }
        group.appendChild(edge);
      });
      g.nodes.forEach((n) => {
        nodeCount++;
        const match =
          query && searchable(n).includes(query.toLocaleLowerCase("pl"));
        const ng = S("g", {
          class: `node ${selected?.id === n.id ? "selected" : ""} ${match ? "match" : query ? "dim" : ""}`,
          "data-node": n.id,
          "data-type": n.type,
          transform: `translate(${n.x},${n.y})`,
        });
        ng.append(
          S("rect", { class: "body", width: W, height: H, rx: 6 }),
          S("rect", { class: "bar", width: 3, height: H - 24, x: 0, y: 12 }),
        );
        ng.appendChild(
          S(
            "text",
            { class: "node-type", x: 14, y: 21 },
            TYPES[n.type].split(" / ")[0],
          ),
        );
        const lines = rows(n.title).slice(0, 3),
          title = S("text", { class: "node-text", x: 14, y: 44 });
        lines.forEach((line, i) =>
          title.appendChild(
            S(
              "tspan",
              { x: 14, dy: i ? 18 : 0 },
              line + (i === 2 && rows(n.title).length > 3 ? "…" : ""),
            ),
          ),
        );
        ng.appendChild(title);
        const outgoing = g.edges.filter((e) => e.from === n.id);
        if (outgoing.length > 0) {
          const chipsGroup = S("g", { class: "node-chips" });
          let chipX = 14;
          outgoing.slice(0, 3).forEach((e) => {
            const targetNode = g.nodes.find((tn) => tn.id === e.to);
            const labelRaw = e.label || (targetNode ? targetNode.title : "Dalej");
            const chipText = (labelRaw.length > 10 ? labelRaw.slice(0, 9) + "…" : labelRaw) + " ➔";
            const chipW = Math.max(42, chipText.length * 6 + 12);
            if (chipX + chipW <= W - 10) {
              const chipG = S("g", {
                class: `node-chip ${activeBranch === e.id ? "active" : ""}`,
                "data-jump-node": e.to,
                "data-branch-edge": e.id,
              });
              chipG.append(
                S("rect", {
                  x: chipX,
                  y: 84,
                  width: chipW,
                  height: 18,
                  rx: 9,
                  class: "chip-bg",
                }),
                S(
                  "text",
                  {
                    x: chipX + chipW / 2,
                    y: 96,
                    "text-anchor": "middle",
                    class: "chip-text",
                  },
                  chipText,
                ),
              );
              chipsGroup.appendChild(chipG);
              chipX += chipW + 6;
            }
          });
          ng.appendChild(chipsGroup);
        } else {
          ng.appendChild(
            S(
              "text",
              { class: "node-sub", x: 14, y: 94 },
              "Krok końcowy ścieżki",
            ),
          );
        }
        if (editing)
          ng.appendChild(
            S("circle", {
              class: "port",
              cx: W,
              cy: H / 2,
              r: 7,
              "aria-label": "Przeciągnij, aby połączyć",
            }),
          );
        group.appendChild(ng);
        all.push({ ...n, x: n.x + offset });
      });
    });
    $("node-count").textContent = `${nodeCount} kroków`;
    $("steps").innerHTML = all
      .map(
        (n, i) =>
          `<button data-step="${escape(n.id)}" aria-current="${selected?.id === n.id}" title="${escape(n.title)}">${i + 1}. ${escape(n.title)}</button>`,
      )
      .join("");
    applyTransform();
  }
  function applyTransform() {
    viewport.setAttribute(
      "transform",
      `translate(${transform.x},${transform.y}) scale(${transform.k})`,
    );
    $("zoom").textContent = `${Math.round(transform.k * 100)}%`;
  }
  function fit() {
    const ns = visibleGraphs().flatMap((g, i) =>
      g.nodes.map((n) => ({ ...n, x: n.x + i * 900 })),
    );
    if (!ns.length) {
      transform = { x: 20, y: 20, k: 1 };
      applyTransform();
      return;
    }
    const minX = Math.min(...ns.map((n) => n.x)) - 15,
      maxX = Math.max(...ns.map((n) => n.x + W)) + 15;
    const minY = Math.min(...ns.map((n) => n.y)) - (cohort === "all" ? 40 : 15),
      maxY = Math.max(...ns.map((n) => n.y + H)) + 15;
    const r = svg.getBoundingClientRect(),
      k = Math.min(
        1.5,
        Math.max(
          0.12,
          Math.min(
            (r.width - 22) / (maxX - minX),
            (r.height - 54) / (maxY - minY),
          ),
        ),
      );
    transform = {
      x: (r.width - (maxX - minX) * k) / 2 - minX * k,
      y: (r.height - 38 - (maxY - minY) * k) / 2 - minY * k,
      k,
    };
    applyTransform();
  }
  function zoom(delta) {
    const r = svg.getBoundingClientRect(),
      x = r.width / 2,
      y = (r.height - 40) / 2,
      k = Math.min(2.5, Math.max(0.12, transform.k * delta));
    transform.x = x - ((x - transform.x) * k) / transform.k;
    transform.y = y - ((y - transform.y) * k) / transform.k;
    transform.k = k;
    applyTransform();
  }
  function panToNode(id) {
    const info = nodeInfo(id);
    if (!info) return;
    const vg = visibleGraphs();
    const idx = vg.indexOf(info.g);
    const offset = idx >= 0 ? idx * 900 : 0;
    const r = svg.getBoundingClientRect();
    const targetCenterX = info.n.x + offset + W / 2;
    const targetCenterY = info.n.y + H / 2;
    transform.x = Math.round(r.width / 2 - targetCenterX * transform.k);
    transform.y = Math.round((r.height - 40) / 2 - targetCenterY * transform.k);
    applyTransform();
  }
  function updateSOAPBadge() {
    const badge = $("soap-badge");
    if (badge) {
      const count = visitSession.history.length + (visitSession.pharmacy?.length || 0) + (visitSession.diagnostics?.length || 0);
      badge.textContent = count;
      badge.hidden = count === 0;
    }
  }
  function recordStep(id, branchEdge = null) {
    const info = nodeInfo(id);
    if (!info) return;
    const existing = visitSession.history.find((h) => h.nodeId === id);
    let branchLabel = null;
    if (branchEdge) {
      const g = Object.values(store.graphs).find((graph) =>
        graph.edges.some((e) => e.id === branchEdge),
      );
      const edge = g?.edges.find((e) => e.id === branchEdge);
      branchLabel = edge?.label || "Dalej";
    }
    if (existing) {
      existing.timestamp = Date.now();
      if (branchLabel) existing.branchTaken = branchLabel;
    } else {
      visitSession.history.push({
        nodeId: id,
        graphKey: info.key,
        title: info.n.title,
        type: info.n.type,
        timestamp: Date.now(),
        branchTaken: branchLabel,
        criteria: [],
      });
    }
    updateSOAPBadge();
  }
  function selectNode(id, pan = false, branchEdge = null) {
    selected = { kind: "node", id };
    editing = false;
    recordStep(id, branchEdge);
    if (pan) panToNode(id);
    draw();
    renderPanel();
    if (walkthroughActive) renderWalkthrough();
  }
  function chooseModule(id) {
    active = id;
    editing = false;
    selected = null;
    activeBranch = null;
    renderNav();
    renderHeading();
    const g = visibleGraphs()[0];
    if (g?.nodes[0]) selectNode(g.nodes[0].id);
    draw();
    renderPanel();
    fit();
    if (walkthroughActive) renderWalkthrough();
  }
  const SECTIONS = [
    ["criteria", "Zmienne decyzyjne i kryteria przejścia"],
    ["hx", "Badanie podmiotowe"],
    ["exam", "Badanie przedmiotowe"],
    ["red", "Czerwone flagi"],
    ["tests", "Badania i interpretacja"],
    ["dispo", "Dalsze postępowanie"],
    ["pit", "Pułapki / critical aspects"],
    ["hy", "High-yield"],
    ["gem", "Hidden gems"],
  ];
  function branchVariables(n, e, target) {
    const d = n.data || {};
    const label = (e.label || "").trim();
    const lowLabel = label.toLowerCase();

    // 1. Explicit criteria defined in node
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

    // 2. Derive from clinical data based on branch polarity
    const isAffirmative =
      /tak|dodatn|obecn|wysok|niestabiln|piln|ciężk|kryt|spełni|alert/i.test(
        lowLabel,
      ) ||
      (target?.type === "urgent" &&
        !/nie|ujemn|brak|stabiln/i.test(lowLabel));
    const isNegative = /nie|ujemn|brak|stabiln|nisk|norm/i.test(lowLabel);

    if (isAffirmative && list(d.red).length) {
      return list(d.red);
    }
    if (isNegative && list(d.red).length) {
      return [
        "Brak obecności czerwonych flag i cech niestabilności",
        ...list(d.exam).slice(0, 2),
      ];
    }

    if (
      list(d.tests).length &&
      (/badani|wynik|test|rtg|tk|lab/i.test(lowLabel) || target?.type === "test")
    ) {
      return list(d.tests);
    }

    if (
      list(d.exam).length &&
      (/objaw|stan|badani/i.test(lowLabel) || target?.type === "assessment")
    ) {
      return list(d.exam);
    }

    if (list(d.hx).length) {
      return list(d.hx);
    }

    if (label) {
      return [`Kryterium: ${label}`];
    }
    return [
      `Wskazanie kliniczne: ${target?.title || "Przejście do kolejnego etapu"}`,
    ];
  }
  function sourceHTML(key) {
    const s = Object.hasOwn(D.sources, key) ? D.sources[key] : null,
      url = s?.url || safeURL(key);
    return url
      ? `<a class="source" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(s?.name || key)} ↗</a>`
      : `<p>${escape(key)} (nieaktywny adres)</p>`;
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

  function matchScoreToBranch(scoreKey, total, outgoingEdges) {
    if (!outgoingEdges || !outgoingEdges.length) return null;
    if (scoreKey === "wellspe") {
      const isLikely = total > 4;
      return outgoingEdges.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return isLikely
          ? /prawdopodobn|wysok|tkpa|angio|\btak\b|\+|>4/.test(lbl)
          : /mało|nisk|d-dimer|dimer|\bnie\b|ujemn|perc|<=4|≤4/.test(lbl);
      });
    }
    if (scoreKey === "curb65") {
      const isHigh = total >= 2;
      return outgoingEdges.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return isHigh
          ? /hospitaliz|ciężk|oiom|oddział|wysok|\btak\b|≥2|>=2/.test(lbl)
          : /ambulat|dom|nisk|\bnie\b|0-1/.test(lbl);
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

  function renderInlineCalcHTML(scoreKey, n, outgoing) {
    if (!scoreKey || !["wellspe", "curb65", "qsofa"].includes(scoreKey)) return "";
    const calcLabels = {
      wellspe: "Wells dla zatorowości płucnej (PE)",
      curb65: "Skala ciężkości CURB-65",
      qsofa: "qSOFA — szybka ocena sepsy",
    };

    const existing = visitSession.calculators.find((c) => c.key === scoreKey);
    let itemsHTML = "";

    if (scoreKey === "wellspe") {
      const items = [
        { id: "peMostLikely", label: "Alternatywne rozpoznanie mniej prawdopodobne niż ZP (+3.0)", pts: 3.0 },
        { id: "dvtSigns", label: "Kliniczne objawy DVT (obrzęk, bolesność łydki) (+3.0)", pts: 3.0 },
        { id: "hr", label: "Tachykardia: częstość serca > 100/min (+1.5)", pts: 1.5 },
        { id: "immobilizationOrSurgery", label: "Unieruchomienie ≥3 dni lub operacja w ciągu 4 tyg (+1.5)", pts: 1.5 },
        { id: "previousVte", label: "Przebyty udokumentowany ZP lub DVT (+1.5)", pts: 1.5 },
        { id: "hemoptysis", label: "Krwioplucie (+1.0)", pts: 1.0 },
        { id: "malignancy", label: "Choroba nowotworowa leczona obecnie/ostatnie 6 mies (+1.0)", pts: 1.0 },
      ];
      itemsHTML = items
        .map((it) => {
          const checked = checkedVars.has(`calc-${scoreKey}-${it.id}`);
          return `<label class="inline-calc-item">
            <input type="checkbox" data-calc-item="${it.id}" data-calc-key="${scoreKey}" data-calc-pts="${it.pts}" ${checked ? "checked" : ""}>
            <span>${escape(it.label)}</span>
          </label>`;
        })
        .join("");
    } else if (scoreKey === "curb65") {
      const items = [
        { id: "confusion", label: "Confusion: Nowe zaburzenia świadomości (AMTS ≤ 8)", pts: 1 },
        { id: "urea", label: "Urea: Mocznik > 7 mmol/l (BUN > 19 mg/dl)", pts: 1 },
        { id: "rr", label: "Respiratory rate: Częstość oddechów ≥ 30/min", pts: 1 },
        { id: "bp", label: "Blood pressure: SBP < 90 mmHg lub DBP ≤ 60 mmHg", pts: 1 },
        { id: "age", label: "Age: Wiek pacjenta ≥ 65 lat", pts: 1 },
      ];
      itemsHTML = items
        .map((it) => {
          const checked = checkedVars.has(`calc-${scoreKey}-${it.id}`);
          return `<label class="inline-calc-item">
            <input type="checkbox" data-calc-item="${it.id}" data-calc-key="${scoreKey}" data-calc-pts="${it.pts}" ${checked ? "checked" : ""}>
            <span>${escape(it.label)}</span>
          </label>`;
        })
        .join("");
    } else if (scoreKey === "qsofa") {
      const items = [
        { id: "rr", label: "Częstość oddechów ≥ 22/min (+1)", pts: 1 },
        { id: "ams", label: "Zaburzenia świadomości / GCS < 15 (+1)", pts: 1 },
        { id: "sbp", label: "Skurczowe ciśnienie krwi SBP ≤ 100 mmHg (+1)", pts: 1 },
      ];
      itemsHTML = items
        .map((it) => {
          const checked = checkedVars.has(`calc-${scoreKey}-${it.id}`);
          return `<label class="inline-calc-item">
            <input type="checkbox" data-calc-item="${it.id}" data-calc-key="${scoreKey}" data-calc-pts="${it.pts}" ${checked ? "checked" : ""}>
            <span>${escape(it.label)}</span>
          </label>`;
        })
        .join("");
    }

    const currentTotal = existing ? existing.total : 0;
    const isHigh = scoreKey === "wellspe" ? currentTotal > 4 : currentTotal >= 2;

    return `
    <div class="inline-calc-box" data-calc-box="${scoreKey}">
      <div class="inline-calc-header">
        <span class="inline-calc-title">⚡ Szybka ocena: ${calcLabels[scoreKey]}</span>
        <span class="inline-calc-score-badge" id="inline-score-badge-${scoreKey}" data-level="${isHigh ? "high" : "low"}">Wynik: ${currentTotal} pkt</span>
      </div>
      <div class="inline-calc-grid">
        ${itemsHTML}
      </div>
      <button type="button" class="inline-calc-apply-btn" data-calc-apply="${scoreKey}">
        ✓ Zastosuj wynik i dopasuj gałąź schematu
      </button>
    </div>`;
  }

  function renderPanel() {
    if (selected?.kind === "edge") {
      renderEdgePanel();
      return;
    }
    const info = selectedInfo();
    if (!info) {
      panel.innerHTML =
        '<div class="empty">Wybierz krok na płótnie lub na liście. Każdy moduł zawiera wywiad, badanie, wskazania do badań i źródła.</div>';
      return;
    }
    const { n, g } = info,
      d = n.data || {};
    if (editing) {
      renderEditor(n);
      return;
    }
    const scoreKey = findNodeScore(n);
    const calculator = scoreKey || ["gcs", "news2", "pews", "curb65", "qsofa", "wellspe"].find((key) =>
      n.title.toLowerCase().includes(key),
    );
    const outgoing = g.edges.filter((e) => e.from === n.id);
    const inlineCalcHTML = scoreKey ? renderInlineCalcHTML(scoreKey, n, outgoing) : "";

    let decisionCompartmentHTML = "";
    if (outgoing.length > 0) {
      const branchCardsHTML = outgoing
        .map((e) => {
          const target = g.nodes.find((tn) => tn.id === e.to);
          if (!target) return "";
          const vars = branchVariables(n, e, target);
          const branchCheckedCount = vars.filter((_, idx) =>
            checkedVars.has(`${e.id}-${idx}`),
          ).length;
          const isBranchActive = activeBranch === e.id;
          const branchLabel = e.label || "Dalej";

          return `
          <div class="branch-card ${isBranchActive ? "active-branch-card" : ""}" data-edge-id="${escape(e.id)}">
            <div class="branch-header">
              <span class="branch-badge">${escape(branchLabel)}</span>
              <span class="branch-match-count">${branchCheckedCount > 0 ? `Zaznaczono ${branchCheckedCount}/${vars.length}` : `${vars.length} kryteriów`}</span>
            </div>
            <div class="branch-criteria-list">
              ${vars
                .map((v, idx) => {
                  const varKey = `${e.id}-${idx}`;
                  const isChecked = checkedVars.has(varKey);
                  return `
                  <label class="criterion-check ${isChecked ? "checked" : ""}">
                    <input type="checkbox" data-var="${escape(varKey)}" data-edge="${escape(e.id)}" ${isChecked ? "checked" : ""}>
                    <span>${escape(v)}</span>
                  </label>`;
                })
                .join("")}
            </div>
            <button type="button" class="branch-jump-btn" data-jump-node="${escape(target.id)}" data-branch-edge="${escape(e.id)}">
              <span class="branch-arrow">Przejdź do:</span> <strong>${escape(target.title)}</strong> ➔
            </button>
          </div>`;
        })
        .join("");

      decisionCompartmentHTML = `
      <section class="decision-compartment">
        <h3>
          <span>Warunki decyzyjne i przejście do kolejnych kroków</span>
          <span class="decision-count-badge">${outgoing.length} ${outgoing.length === 1 ? "ścieżka" : "ścieżki"}</span>
        </h3>
        <p class="compartment-subtitle">Zaznacz zmienne kliniczne obecne u pacjenta, aby podświetlić gałąź schematu i przejść do kolejnego kafelka.</p>
        ${inlineCalcHTML}
        <div class="branch-list">
          ${branchCardsHTML}
        </div>
      </section>`;
    } else {
      decisionCompartmentHTML = `
      <section class="decision-compartment terminal">
        <h3>Punkt końcowy schematu</h3>
        <p class="compartment-subtitle">Ten kafelek stanowi zakończenie bieżącej ścieżki decyzyjnej. Sprawdź zalecenia dyspozycyjne poniżej.</p>
        ${inlineCalcHTML}
      </section>`;
    }

    const activeWeight = currentPharmWeight || (cohort === "p" ? 15 : 70);
    const activeChild = cohort === "p" || activeWeight < 40;
    const contextualDrugs = findNodeContextualDrugs(n, activeWeight, activeChild);
    const tileDrugHTML = renderTileDrugBox(contextualDrugs, activeWeight);
    const contextualDiags = findNodeContextualDiagnostics(n);
    const tileDiagHTML = renderTileDiagBox(contextualDiags);

    panel.innerHTML = `<div class="detail-head"><div class="kicker">${escape(TYPES[n.type])} · ${n.cohort === "a" ? "DOROŚLI" : n.cohort === "p" ? "DZIECI" : "WSPÓLNE"}</div><h2>${escape(n.title)}</h2><div class="meta">${n.custom ? "Treść własna / edytowana. Wymaga ponownej weryfikacji." : `Synteza źródeł sprawdzona: ${D.reviewed}. Nie oznacza aktualizacji wytycznej w tym dniu.`}</div><div class="detail-toolbar"><button data-action="edit">Edytuj krok</button><button data-action="child">+ Gałąź</button>${calculator ? `<button data-action="calculate" data-score="${calculator}">Oblicz ${calculator.toUpperCase()}</button>` : ""}</div></div><div class="detail-body"><p>${escape(d.body || "Brak opisu — możesz dodać własny.")}</p>${decisionCompartmentHTML}${tileDiagHTML}${tileDrugHTML}${SECTIONS.map(
      ([key, label]) =>
        list(d[key]).length
          ? `<section class="detail-section ${key === "red" ? "red" : ""}"><h3>${label}</h3><ul>${list(
              d[key],
            )
              .map((t) => `<li>${escape(t)}</li>`)
              .join("")}</ul></section>`
          : "",
    ).join(
      "",
    )}${d.logic ? `<section class="detail-section"><h3>Dlaczego tak?</h3><p>${escape(d.logic)}</p></section>` : ""}<section class="detail-section"><h3>Podstawa i zakres</h3>${list(d.src).map(sourceHTML).join("") || "<p>Brak źródła. Węzeł wymaga weryfikacji.</p>"}</section></div>`;
  }
  function renderEditor(n) {
    const d = n.data || {};
    panel.innerHTML = `<div class="detail-head"><div class="kicker">EDYCJA LOKALNA</div><h2>Edytuj krok</h2><div class="meta">Zmiana oznaczy treść jako własną. Pola list: jeden punkt na linię.</div></div><div class="detail-body edit">
    <label for="edit-title">Tytuł</label><input id="edit-title" data-field="title" maxlength="500" value="${escape(n.title)}">
    <label for="edit-type">Typ</label><select id="edit-type" data-field="type">${Object.entries(
      TYPES,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${n.type === k ? "selected" : ""}>${v}</option>`,
      )
      .join("")}</select>
    <label for="edit-body">Opis / postępowanie</label><textarea id="edit-body" data-field="body" rows="5" maxlength="18000">${escape(d.body || "")}</textarea>
    ${SECTIONS.map(([key, label]) => `<label for="edit-${key}">${label}</label><textarea id="edit-${key}" data-field="${key}" rows="3" maxlength="18000">${escape(list(d[key]).join("\n"))}</textarea>`).join("")}
    <label for="edit-logic">Logika</label><textarea id="edit-logic" data-field="logic" rows="3" maxlength="18000">${escape(d.logic || "")}</textarea>
    <label for="edit-src">Źródła: ID lub adres http(s), jeden na linię</label><textarea id="edit-src" data-field="src" rows="3" maxlength="10000">${escape(list(d.src).join("\n"))}</textarea>
    <div class="actions"><button class="primary" data-action="done">Zakończ</button><button data-action="link">Połącz</button><button data-action="delete">Usuń</button></div></div>`;
  }
  function renderEdgePanel() {
    const g = Object.values(store.graphs).find((g) =>
      g.edges.some((e) => e.id === selected.id),
    );
    const e = g?.edges.find((e) => e.id === selected.id);
    if (!e) {
      selected = null;
      renderPanel();
      return;
    }
    panel.innerHTML = `<div class="detail-head"><div class="kicker">POŁĄCZENIE KIERUNKOWE</div><h2>Etykieta decyzji</h2></div><div class="detail-body edit"><label for="edge-label">Etykieta</label><input id="edge-label" maxlength="300" value="${escape(e.label)}"><div class="actions"><button data-action="delete-edge">Usuń połączenie</button></div></div>`;
  }
  function changeHistory(kind) {
    const source = kind === "undo" ? undo : redo,
      target = kind === "undo" ? redo : undo;
    if (!source.length) return;
    target.push(clone(store));
    store = source.pop();
    selected = null;
    editing = false;
    updateHistory();
    renderNav();
    draw();
    renderPanel();
    schedule();
  }
  function showDialog(title, body) {
    $("dialog-content").innerHTML =
      `<h2 id="dialog-title">${escape(title)}</h2>${body}`;
    if (!$("dialog").open) $("dialog").showModal();
  }
  function confirmAction(title, body, action) {
    showDialog(
      title,
      `<p>${escape(body)}</p><div class="actions"><button id="confirm-yes" class="primary">Potwierdź</button><button id="confirm-no">Anuluj</button></div>`,
    );
    $("confirm-yes").onclick = () => {
      $("dialog").close();
      action();
    };
    $("confirm-no").onclick = () => $("dialog").close();
  }
  function addNode(parent = null, template = null) {
    const info = parent ? nodeInfo(parent) : null,
      g = info?.g || currentGraph(),
      n = info?.n;
    if (g.nodes.length >= 400 || Object.values(store.graphs).reduce((s,x)=>s+x.nodes.length,0) >= 2000 || (n && g.edges.length >= 800)) {
      toast("Osiągnięto limit rozmiaru makiety. Wyeksportuj lub podziel własne elementy.");
      return false;
    }
    const id = uuid(),
      node = {
        id,
        title: template?.title || "Nowy krok",
        type: template?.type || "note",
        x: n ? n.x + 270 : 260,
        y: n ? n.y + 150 : 850,
        cohort: g.cohort,
        custom: true,
        data: clone(
          template?.data || {
            body: "Dodaj wskazania, działanie i źródło. Własna treść wymaga weryfikacji.",
          },
        ),
      };
    while (
      g.nodes.some(
        (other) =>
          Math.abs(other.x - node.x) < W && Math.abs(other.y - node.y) < H + 20,
      )
    )
      node.y += 140;
    if(Math.abs(node.x)>50000 || Math.abs(node.y)>50000){
      toast("Brak miejsca w tym obszarze. Przesuń węzeł nadrzędny bliżej środka.");
      return false;
    }
    checkpoint();
    g.nodes.push(node);
    if (n)
      g.edges.push({ id: uuid(), from: n.id, to: id, label: "nowa gałąź" });
    selected = { kind: "node", id };
    editing = true;
    draw();
    renderPanel();
    fit();
    schedule();
    return true;
  }
  window.addEventListener("clinical:score", ev => {
    if (!currentGraph()) {
      toast("Poczekaj na wczytanie makiety.");
      ev.preventDefault();
      return;
    }
    const template = ev.detail;
    if (!template || template.type !== "scale") return;
    if (active !== "legacy" && ["a","p"].includes(template.targetCohort) && cohort !== template.targetCohort) {
      cohort = template.targetCohort;
      chooseModule(active);
    }
    if (!addNode(null, template)) {
      ev.preventDefault();
      return;
    }
    editing = false;
    renderPanel();
  });
  function linkDialog() {
    const info = selectedInfo();
    if (!info) return;
    if(info.g.edges.length>=800){toast("Osiągnięto limit 800 połączeń.");return;}
    const choices = info.g.nodes.filter((n) => n.id !== info.n.id);
    if (!choices.length) {
      toast("Dodaj drugi węzeł.");
      return;
    }
    showDialog(
      "Połącz krok",
      `<label for="link-target">Węzeł docelowy</label><select id="link-target">${choices.map((n) => `<option value="${escape(n.id)}">${escape(n.title)}</option>`).join("")}</select><label for="link-label">Etykieta</label><input id="link-label" placeholder="np. TAK, wynik dodatni"><div class="actions"><button id="link-confirm" class="primary">Dodaj połączenie</button></div>`,
    );
    $("link-confirm").onclick = () => {
      const to = $("link-target").value;
      if (info.g.edges.some((e) => e.from === info.n.id && e.to === to)) {
        toast("To połączenie już istnieje.");
        return;
      }
      checkpoint();
      info.g.edges.push({
        id: uuid(),
        from: info.n.id,
        to,
        label: $("link-label").value.slice(0, 300),
      });
      $("dialog").close();
      draw();
      schedule();
    };
  }
  panel.addEventListener("focusin", (ev) => {
    if (ev.target.matches("[data-field],#edge-label")) checkpoint();
  });
  panel.addEventListener("input", (ev) => {
    const field = ev.target.dataset.field;
    if (field) {
      const info = selectedInfo();
      if (!info) return;
      const value = ev.target.value;
      if (field === "title" || field === "type") info.n[field] = value;
      else if (["body", "logic"].includes(field)) info.n.data[field] = value;
      else
        info.n.data[field] = value
          .split("\n")
          .filter((x) => x.trim())
          .slice(0, 80);
      info.n.custom = true;
      // Crucial: only update SVG/navigation. Never replace the active editor DOM.
      draw();
      renderNav();
      schedule();
    } else if (ev.target.id === "edge-label") {
      const g = Object.values(store.graphs).find((g) =>
        g.edges.some((e) => e.id === selected?.id),
      );
      const edge = g?.edges.find((e) => e.id === selected.id);
      if (edge) {
        edge.label = ev.target.value;
        draw();
        schedule();
      }
    }
  });
  panel.addEventListener("change", (ev) => {
    const check = ev.target.closest(".criterion-check input");
    if (check) {
      const varKey = check.dataset.var;
      const edgeId = check.dataset.edge;
      const labelText = check.nextElementSibling?.textContent?.trim() || "";
      if (check.checked) {
        checkedVars.add(varKey);
        activeBranch = edgeId;
      } else {
        checkedVars.delete(varKey);
      }
      if (selected?.id) {
        const step = visitSession.history.find((h) => h.nodeId === selected.id);
        if (step) {
          if (check.checked && !step.criteria.includes(labelText)) {
            step.criteria.push(labelText);
          } else if (!check.checked) {
            step.criteria = step.criteria.filter((c) => c !== labelText);
          }
        }
      }
      updateSOAPBadge();
      draw();
      renderPanel();
    }
  });
  panel.addEventListener("click", (ev) => {
    const jumpBtn = ev.target.closest("[data-jump-node]");
    if (jumpBtn) {
      const targetId = jumpBtn.dataset.jumpNode;
      const branchEdge = jumpBtn.dataset.branchEdge;
      if (branchEdge) activeBranch = branchEdge;
      selectNode(targetId, true, branchEdge);
      return;
    }
    const branchCard = ev.target.closest(".branch-card");
    if (branchCard && !ev.target.closest("button, input, label")) {
      const edgeId = branchCard.dataset.edgeId;
      if (edgeId) {
        activeBranch = activeBranch === edgeId ? null : edgeId;
        draw();
        renderPanel();
      }
      return;
    }
    const action = ev.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "calculate") window.ClinicalCalculators?.open(ev.target.closest("[data-score]").dataset.score);
    if (action === "edit") {
      editing = true;
      draw();
      renderPanel();
      $("edit-title").focus();
    }
    if (action === "done") {
      editing = false;
      draw();
      renderPanel();
      persist();
    }
    if (action === "child") addNode(selected.id);
    if (action === "link") linkDialog();
    if (action === "delete") deleteSelectedNode();
    if (action === "delete-edge") deleteSelectedEdge();
  });
  $("modules").addEventListener("click", (ev) => {
    const button = ev.target.closest("[data-module]");
    if (button) chooseModule(button.dataset.module);
  });
  $("steps").addEventListener("click", (ev) => {
    const button = ev.target.closest("[data-step]");
    if (button) {
      selectNode(button.dataset.step, true);
      if (innerWidth < 1000)
        panel.scrollIntoView({ behavior: "auto", block: "start" });
    }
  });
  $("cohorts").addEventListener("click", (ev) => {
    const button = ev.target.closest("[data-cohort]");
    if (button) {
      cohort = button.dataset.cohort;
      chooseModule(active);
    }
  });
  $("search").addEventListener("input", (ev) => {
    query = ev.target.value.trim();
    renderNav();
    draw();
  });
  $("fit").onclick = fit;
  function autoLayout() {
    const graphs = visibleGraphs();
    if (!graphs.length) return;
    checkpoint();
    graphs.forEach((g) => {
      M.layout(g);
    });
    draw();
    fit();
    schedule();
    toast("Uporządkowano układ ścieżki.");
  }
  $("auto-layout").onclick = autoLayout;
  $("zoom-in").onclick = () => zoom(1.2);
  $("toggle-canvas").onclick = () => {
    const show = document.body.classList.toggle("mobile-canvas");
    $("toggle-canvas").textContent = show ? "Ukryj płótno" : "Pokaż płótno";
    $("toggle-canvas").setAttribute("aria-expanded", String(show));
    if(show) fit();
  };
  $("zoom-out").onclick = () => zoom(1 / 1.2);
  $("undo").onclick = () => changeHistory("undo");
  $("redo").onclick = () => changeHistory("redo");
  $("add").onclick = () => showLibrary();
  function showLibrary() {
    const scales = [
      [
        "GCS",
        "E/V/M zapisuj osobno; oceń wpływ sedacji, intubacji i rozwoju mowy. Spadek jest sygnałem eskalacji. Sama suma nie decyduje o intubacji.",
        "gcs",
      ],
      [
        "AVPU / ACVPU",
        "Alert / Voice / Pain / Unresponsive; C oznacza nowe splątanie w NEWS2. Szybki screening, potem dokładniejsza ocena i trend.",
        "abcde",
      ],
      [
        "NEWS2",
        "Dla odpowiednich pacjentów ≥16 lat, nie ciężarnych. Suma 5–6: pilna ocena; ≥7: alarm. 3 punkty w jednym parametrze również wymagają eskalacji. Częstość obserwacji według właściwej kategorii lokalnej karty.",
        "news",
      ],
      [
        "PEWS",
        "System pediatryczny zależny od lokalnej wersji i wieku; nie istnieje jeden uniwersalny próg dla wszystkich PEWS. Kalkulator w tej makiecie: Brighton / UBC 31.05.2024, domeny 0–9 + modyfikatory 0–4. Eskaluj także przy klinicznym niepokoju.",
        "pews",
      ],
      [
        "Wells / PERC",
        "Właściwa populacja dorosłych: Wells PE >4 → likely, ≤4 → unlikely i D-dimer. PERC tylko przy niskim klinicznym podejrzeniu. Nie przenoś na dzieci i ciężarne.",
        "pe",
      ],
      [
        "NIHSS / FAST",
        "FAST to screening. NIHSS opisuje deficyt, lecz niski wynik nie wyklucza udaru, zwłaszcza tylnego krążenia, ani nie wyznacza sam kwalifikacji leczenia.",
        "stroke",
      ],
      [
        "Glasgow-Blatchford / Rockall",
        "UGIB u dorosłych: GBS przed endoskopią; pełny Rockall po. W tym atlasie próg wczesnego wypisu NICE: GBS=0. Nie stosuj do dzieci ani dolnego krwawienia.",
        "bleed",
      ],
      [
        "Traffic-light NICE",
        "U dzieci <5 lat: green/amber/red. Progi gorączki niemowląt i pozostałe cechy określają ryzyko. System nie zastępuje oceny u starszych dzieci.",
        "feverP",
      ],
    ];
    showDialog(
      "Dodaj krok lub skalę",
      `<p>Szablon możesz edytować. To opis stosowania skali, nie kalkulator ani automatyczna kwalifikacja leczenia.</p><div class="actions"><button id="blank-node" class="primary">Pusty węzeł</button></div><div class="actions">${scales.map((s, i) => `<button data-scale="${i}">${escape(s[0])}</button>`).join("")}</div>`,
    );
    $("blank-node").onclick = () => {
      $("dialog").close();
      addNode();
    };
    $("dialog-content")
      .querySelectorAll("[data-scale]")
      .forEach(
        (b) =>
          (b.onclick = () => {
            const s = scales[+b.dataset.scale];
            $("dialog").close();
            addNode(null, {
              title: s[0],
              type: "scale",
              data: { body: s[1], src: [s[2]] },
            });
          }),
      );
  }
  function point(ev) {
    const r = svg.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left - transform.x) / transform.k,
      y: (ev.clientY - r.top - transform.y) / transform.k,
    };
  }
  svg.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    pointers.set(ev.pointerId, { clientX: ev.clientX, clientY: ev.clientY });
    if (pointers.size === 2) {
      if (drag?.mode === "node" && drag.moved) schedule();
      const pts = Array.from(pointers.values());
      pinchStart = {
        dist: Math.hypot(pts[1].clientX - pts[0].clientX, pts[1].clientY - pts[0].clientY),
        k: transform.k,
        midX: (pts[0].clientX + pts[1].clientX) / 2,
        midY: (pts[0].clientY + pts[1].clientY) / 2,
        tx: transform.x,
        ty: transform.y,
      };
      drag = { mode: "pinch" };
      svg.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      return;
    }
    if (pointers.size > 2) return;
    const chip = ev.target.closest("[data-jump-node]");
    if (chip) {
      const targetId = chip.getAttribute("data-jump-node");
      const branchEdge = chip.getAttribute("data-branch-edge");
      if (branchEdge) activeBranch = branchEdge;
      selectNode(targetId, true, branchEdge);
      ev.preventDefault();
      return;
    }
    const ng = ev.target.closest("[data-node]"),
      eg = ev.target.closest("[data-edge]");
    if (ev.target.classList.contains("port") && ng) {
      drag = {
        mode: "connect",
        from: ng.dataset.node,
        start: point(ev),
        last: point(ev),
      };
      ev.preventDefault();
      return;
    }
    if (ng) {
      const info = nodeInfo(ng.dataset.node);
      const p = point(ev),
        offset = visibleGraphs().indexOf(info.g) * 900;
      drag = {
        mode: "node",
        id: info.n.id,
        offsetX: p.x - info.n.x - offset,
        offsetY: p.y - info.n.y,
        groupOffset: offset,
        clientX: ev.clientX,
        clientY: ev.clientY,
        moved: false,
      };
    } else if (eg) {
      selected = { kind: "edge", id: eg.dataset.edge };
      activeBranch = eg.dataset.edge;
      editing = false;
      draw();
      renderPanel();
      return;
    } else
      drag = {
        mode: "pan",
        sx: ev.clientX,
        sy: ev.clientY,
        x: transform.x,
        y: transform.y,
      };
    svg.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  svg.addEventListener("pointermove", (ev) => {
    if (pointers.has(ev.pointerId)) {
      pointers.set(ev.pointerId, { clientX: ev.clientX, clientY: ev.clientY });
    }
    if (!drag) return;
    if (drag.mode === "pinch" && pointers.size >= 2) {
      const pts = Array.from(pointers.values());
      const dist = Math.hypot(pts[1].clientX - pts[0].clientX, pts[1].clientY - pts[0].clientY);
      if (pinchStart && pinchStart.dist > 5) {
        const ratio = dist / pinchStart.dist;
        const k = Math.min(2.5, Math.max(0.12, pinchStart.k * ratio));
        const r = svg.getBoundingClientRect();
        const midX = (pts[0].clientX + pts[1].clientX) / 2;
        const midY = (pts[0].clientY + pts[1].clientY) / 2;
        const mx = pinchStart.midX - r.left;
        const my = pinchStart.midY - r.top;
        transform.x = mx - ((mx - pinchStart.tx) * k) / pinchStart.k + (midX - pinchStart.midX);
        transform.y = my - ((my - pinchStart.ty) * k) / pinchStart.k + (midY - pinchStart.midY);
        transform.k = k;
        applyTransform();
      }
      return;
    }
    if (drag.mode === "pan") {
      transform.x = drag.x + ev.clientX - drag.sx;
      transform.y = drag.y + ev.clientY - drag.sy;
      svg.classList.add("panning");
      applyTransform();
    }
    if (drag.mode === "node") {
      if (
        !drag.moved &&
        Math.hypot(ev.clientX - drag.clientX, ev.clientY - drag.clientY) < 5
      )
        return;
      if (!drag.moved) checkpoint();
      drag.moved = true;
      const info = nodeInfo(drag.id),
        p = point(ev);
      info.n.x = Math.max(-50000, Math.min(50000, Math.round((p.x - drag.offsetX - drag.groupOffset) / 4) * 4));
      info.n.y = Math.max(-50000, Math.min(50000, Math.round((p.y - drag.offsetY) / 4) * 4));
      draw();
    }
  });
  svg.addEventListener("pointerup", (ev) => {
    pointers.delete(ev.pointerId);
    if (drag?.mode === "pinch") {
      if (pointers.size === 1) {
        const remaining = Array.from(pointers.values())[0];
        drag = {
          mode: "pan",
          sx: remaining.clientX,
          sy: remaining.clientY,
          x: transform.x,
          y: transform.y,
        };
        pinchStart = null;
        return;
      }
      drag = null;
      pinchStart = null;
      svg.classList.remove("panning");
      return;
    }
    if (!drag) return;
    if (drag.mode === "node") {
      if (drag.moved) schedule();
      else selectNode(drag.id);
    }
    if (drag.mode === "connect") {
      const target = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest("[data-node]")?.dataset.node;
      const from = nodeInfo(drag.from),
        to = nodeInfo(target);
      if (
        from &&
        to &&
        from.g === to.g &&
        from.g.edges.length < 800 &&
        target !== drag.from &&
        !from.g.edges.some((e) => e.from === drag.from && e.to === target)
      ) {
        checkpoint();
        from.g.edges.push({
          id: uuid(),
          from: drag.from,
          to: target,
          label: "",
        });
        draw();
        schedule();
        toast("Dodano połączenie.");
      }
    }
    svg.classList.remove("panning");
    drag = null;
  });
  svg.addEventListener("pointercancel", () => {
    pointers.delete(ev.pointerId);
    if (drag?.mode === "node" && drag.moved) schedule();
    drag = null;
    pinchStart = null;
    svg.classList.remove("panning");
  });
  svg.addEventListener(
    "wheel",
    (ev) => {
      ev.preventDefault();
      const r = svg.getBoundingClientRect(),
        mx = ev.clientX - r.left,
        my = ev.clientY - r.top,
        k = Math.max(
          0.12,
          Math.min(2.5, transform.k * (ev.deltaY < 0 ? 1.1 : 1 / 1.1)),
        );
      transform.x = mx - ((mx - transform.x) * k) / transform.k;
      transform.y = my - ((my - transform.y) * k) / transform.k;
      transform.k = k;
      applyTransform();
    },
    { passive: false },
  );
  function deleteSelectedNode() {
    const info = selectedInfo();
    if (!info) return;
    confirmAction(
      "Usunąć krok?",
      `„${info.n.title}” i wszystkie jego połączenia zostaną usunięte. Możesz cofnąć tę operację.`,
      () => {
        checkpoint();
        info.g.nodes = info.g.nodes.filter((n) => n.id !== info.n.id);
        info.g.edges = info.g.edges.filter(
          (e) => e.from !== info.n.id && e.to !== info.n.id,
        );
        selected = null;
        editing = false;
        draw();
        renderPanel();
        schedule();
      },
    );
  }
  function deleteSelectedEdge() {
    if (selected?.kind !== "edge") return;
    checkpoint();
    for (const g of Object.values(store.graphs))
      g.edges = g.edges.filter((e) => e.id !== selected.id);
    selected = null;
    draw();
    renderPanel();
    schedule();
  }
  window.addEventListener("keydown", (ev) => {
    if (ev.target.closest("input,textarea,select") || $("dialog").open || $("calc-dialog").open) return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
      ev.preventDefault();
      changeHistory(ev.shiftKey ? "redo" : "undo");
    }
    if (ev.key === "Escape") {
      editing = false;
      selected = null;
      draw();
      renderPanel();
    }
    if (ev.key === "Delete" || ev.key === "Backspace") {
      if (selected?.kind === "edge") {
        ev.preventDefault();
        deleteSelectedEdge();
      } else if (selected?.kind === "node") {
        ev.preventDefault();
        deleteSelectedNode();
      }
    }
    if (ev.key === "Tab") {
      const g = visibleGraphs()[0];
      if (g && g.nodes.length) {
        ev.preventDefault();
        const currentIndex = selected?.kind === "node" ? g.nodes.findIndex((n) => n.id === selected.id) : -1;
        const nextIndex = currentIndex === -1
          ? (ev.shiftKey ? g.nodes.length - 1 : 0)
          : (currentIndex + (ev.shiftKey ? -1 : 1) + g.nodes.length) % g.nodes.length;
        selectNode(g.nodes[nextIndex].id);
      }
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.key)) {
      if (selected?.kind === "node") {
        const info = selectedInfo();
        if (info) {
          ev.preventDefault();
          const step = ev.shiftKey ? 64 : 16;
          const dx = ev.key === "ArrowLeft" ? -step : ev.key === "ArrowRight" ? step : 0;
          const dy = ev.key === "ArrowUp" ? -step : ev.key === "ArrowDown" ? step : 0;
          checkpoint();
          info.n.x = Math.max(-50000, Math.min(50000, info.n.x + dx));
          info.n.y = Math.max(-50000, Math.min(50000, info.n.y + dy));
          draw();
          schedule();
        }
      }
    }
  });
  $("theme").onclick = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    document.documentElement.dataset.theme = dark ? "light" : "dark";
    $("theme").setAttribute("aria-pressed", String(!dark));
  };
  $("reload-state").onclick = () => confirmAction(
    "Wczytać zapis?", "Bieżące niezapisane zmiany zostaną zastąpione zapisem. Najpierw wyeksportuj je, jeśli chcesz zachować kopię.",
    async () => {
      clearTimeout(pendingSave);pendingSave=null;undo=[];redo=[];
      await load();selected=null;editing=false;renderNav();chooseModule(active);updateHistory();
    }
  );
  $("sources").onclick = () =>
    showDialog(
      "Źródła i metodologia",
      `<p>Źródła pierwotne: NICE, RCH, CHOP, ACR, RCP i RCUK. Sprawdzenie treści tej syntezy: ${D.reviewed}; nie jest to data publikacji każdego dokumentu. Ścieżki są syntezą edukacyjną, nie kompletnym protokołem wszystkich chorób.</p><p>Zakres wieku i jurysdykcja zależą od źródła. W węzłach podano ograniczenia zastosowania; decyzje terapeutyczne wymagają właściwego lokalnego protokołu.</p>${Object.values(
        D.sources,
      )
        .map(
          (s) =>
            `<div class="source-line"><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)} ↗</a><div class="dialog-url">${escape(s.url)}</div></div>`,
        )
        .join("")}`,
    );
  $("help").onclick = () =>
    showDialog(
      "Jak pracować na płótnie",
      `<ul><li>Wybierz objaw i populację. Obie ścieżki można porównać, lecz nie są jednym algorytmem dawkowania.</li><li>Przeciągnij tło, zmień zoom lub dopasuj widok. Przycisk <b>Uporządkuj</b> na dolnym pasku automatycznie wyrównuje kroki w czytelne, hierarchiczne drzewo decyzyjne.</li><li>Skróty klawiszowe płótna: <b>Tab / Shift+Tab</b> przełącza po kolei kroki ścieżki; <b>Strzałki</b> (lub <b>Shift+Strzałki</b>) precyzyjnie przesuwają zaznaczony krok (16px / 64px); <b>Delete / Backspace</b> usuwa zaznaczone połączenie lub krok (z potwierdzeniem); <b>Escape</b> cofa zaznaczenie; <b>Ctrl/Cmd+Z</b> cofa/ponawia edycje.</li><li>W szczegółach przejdź do edycji. Zmiana nie traci fokusu i oznacza treść jako własną.</li><li>Dodaj gałąź, skalę lub pusty węzeł. Połącz kontrolką „Połącz” w edytorze albo przeciągnij port do drugiego węzła.</li><li>Cofnij/ponów; Ctrl/Cmd+Z poza polem tekstowym. Eksport JSON to przenośna kopia.</li><li>W podglądzie zapis działa na serwerze i jest oddzielny dla odwiedzającego. SQLite i serwer są częścią środowiska podglądowego, nie usługą produkcyjną z gwarancją trwałości. Zachowuj eksporty JSON.</li><li>Wersja samodzielna zapisuje lokalnie. Brak współedycji na żywo i synchronizacji między urządzeniami. Przy konflikcie kart wyeksportuj zmiany i użyj „Wczytaj zapis”. Nie wpisuj danych pacjentów.</li><li>Import starego JSON tworzy osobne archiwum i nie zastępuje nowych ścieżek. Archiwum kliniczne wymaga ponownej weryfikacji.</li></ul>`,
    );
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function buildExportSvg() {
    const graphs = visibleGraphs();
    const allNodes = graphs.flatMap((g, i) =>
      g.nodes.map((n) => ({ ...n, x: n.x + i * 900 })),
    );
    if (!allNodes.length) return null;
    const minX = Math.min(...allNodes.map((n) => n.x));
    const maxX = Math.max(...allNodes.map((n) => n.x + W));
    const minY = Math.min(...allNodes.map((n) => n.y));
    const maxY = Math.max(...allNodes.map((n) => n.y + H));
    const pad = 40;
    const headerHeight = 70;
    const originX = minX - pad;
    const originY = minY - pad - headerHeight;
    const totalW = maxX - minX + pad * 2;
    const totalH = maxY - minY + pad * 2 + headerHeight;

    const mod = D.modules.find((m) => m.id === active) || { title: "Algorytm kliniczny" };
    const cohortLabel = cohort === "a" ? "DOROŚLI" : cohort === "p" ? "DZIECI" : "DOROŚLI I DZIECI";

    const clone = viewport.cloneNode(true);
    clone.removeAttribute("transform");
    clone.querySelectorAll(".port, .edge-hit").forEach((el) => el.remove());
    clone.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    clone.querySelectorAll(".dim").forEach((el) => el.classList.remove("dim"));
    clone.querySelectorAll(".match").forEach((el) => el.classList.remove("match"));

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${originX} ${originY} ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 1L9 5L0 9" fill="none" stroke="#839c99" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .bg { fill: #ffffff; }
    .doc-title { font-size: 22px; font-weight: 700; fill: #166260; }
    .doc-sub { font-size: 13px; fill: #536a6c; }
    .node .body { fill: #ffffff; stroke: #b9cbca; stroke-width: 1.2px; }
    .node .bar { fill: #166260; }
    .node[data-type="decision"] .bar { fill: #896027; }
    .node[data-type="urgent"] .bar { fill: #9e322d; }
    .node[data-type="urgent"] .body { stroke: #9e322d; stroke-width: 1.5px; }
    .node[data-type="test"] .bar { fill: #355e90; }
    .node[data-type="treatment"] .bar { fill: #166260; }
    .node[data-type="scale"] .bar { fill: #6366f1; }
    .node[data-type="note"] .bar { fill: #64748b; }
    .node-type { fill: #536a6c; font-size: 11px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; }
    .node-text { fill: #182e30; font-size: 14px; font-weight: 600; }
    .node-sub { fill: #536a6c; font-size: 11px; }
    .edge { fill: none; stroke: #839c99; stroke-width: 1.6px; marker-end: url(#arrow); }
    .edge-mask { fill: #ffffff; stroke: #d5e0df; stroke-width: 1px; }
    .edge-label { fill: #536a6c; font-size: 11px; font-weight: 500; }
  </style>
  <rect class="bg" x="${originX}" y="${originY}" width="${totalW}" height="${totalH}" />
  <g class="header-banner">
    <text class="doc-title" x="${minX}" y="${minY - headerHeight + 28}">${escape(mod.title)}</text>
    <text class="doc-sub" x="${minX}" y="${minY - headerHeight + 50}">Populacja: ${escape(cohortLabel)} · Clinical Canvas v2</text>
  </g>
  ${clone.innerHTML}
</svg>`;
  }
  function exportImage(format = "png") {
    const svgString = buildExportSvg();
    if (!svgString) {
      toast("Brak widocznych kroków do eksportu.");
      return;
    }
    const filename = `clinical-canvas-${active}-${cohort}`;
    if (format === "svg") {
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(blob, `${filename}.svg`);
      toast("Wyeksportowano grafikę SVG.");
      return;
    }
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = (img.naturalWidth || img.width) * scale;
      canvas.height = (img.naturalHeight || img.height) * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          downloadBlob(pngBlob, `${filename}.png`);
          toast("Wyeksportowano grafikę PNG (2x).");
        }
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast("Nie udało się wyrenderować PNG.");
    };
    img.src = url;
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "clinical-canvas-v2.json");
    toast("Pobrano kopię JSON.");
  }
  function showExportDialog() {
    const mod = D.modules.find((m) => m.id === active) || { title: "Algorytm kliniczny" };
    const cohortLabel = cohort === "a" ? "Dorośli" : cohort === "p" ? "Dzieci" : "Dorośli i dzieci";
    showDialog(
      "Eksport algorytmu",
      `<p class="dialog-meta">Bieżący widok: <b>${escape(mod.title)}</b> (${escape(cohortLabel)})</p>
      <div class="export-options">
        <button id="export-svg" class="export-option-btn">
          <span class="export-format">Wektorowy SVG (.svg)</span>
          <span class="export-desc">Zachowuje 100% ostrości w dowolnym powiększeniu; idealny do prezentacji i publikacji wektorowej.</span>
        </button>
        <button id="export-png" class="export-option-btn primary">
          <span class="export-format">Wysoka rozdzielczość PNG (.png)</span>
          <span class="export-desc">Raster 2× Retina z czystym białym tłem — gotowy do druku, dokumentacji i materiałów edukacyjnych.</span>
        </button>
        <button id="export-json" class="export-option-btn">
          <span class="export-format">Kopia danych JSON (.json)</span>
          <span class="export-desc">Pełna edytowalna kopia wszystkich ścieżek z możliwością ponownego zaimportowania.</span>
        </button>
      </div>`,
    );
    $("export-svg").onclick = () => {
      $("dialog").close();
      exportImage("svg");
    };
    $("export-png").onclick = () => {
      $("dialog").close();
      exportImage("png");
    };
    $("export-json").onclick = () => {
      $("dialog").close();
      exportJson();
    };
  }
  $("export").onclick = () => showExportDialog();
  $("import").onclick = () => $("import-file").click();
  $("import-file").addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("Plik przekracza limit 5 MB.");
      return;
    }
    try {
      const raw = JSON.parse(await file.text()),
        data = raw.schema_version === 2 ? validate(raw) : migrate(raw);
      // A structurally valid file does not imply verified clinical content.
      for (const g of Object.values(data.graphs))
        for (const n of g.nodes) n.custom = true;
      const merged = validate({
        schema_version: 2,
        graphs: { ...defaults().graphs, ...store.graphs, ...data.graphs },
      });
      confirmAction(
        "Zaimportować makietę?",
        "Dane o tych samych identyfikatorach modułów zastąpią bieżące zmiany. Inne moduły i ich edycje pozostaną nienaruszone. Możesz cofnąć import.",
        () => {
          checkpoint();
          store = merged;
          selected = null;
          editing = false;
          chooseModule(data.graphs["legacy.all"] ? "legacy" : active);
          persist();
          toast(
            "Import zakończony; struktura zweryfikowana, treść kliniczna wymaga oceny.",
          );
        },
      );
    } catch (e) {
      toast("Import odrzucony bez zmiany danych: " + e.message, 6500);
    }
  });
  $("restore").onclick = () =>
    confirmAction(
      "Przywrócić bazę?",
      "Własne zmiany zostaną zastąpione wersją bazową. Najpierw wykonaj eksport, jeśli chcesz je zachować. Operację można cofnąć.",
      () => {
        checkpoint();
        store = defaults();
        chooseModule("overview");
        persist();
      },
    );
  function generateSOAPReport() {
    const g = currentGraph() || visibleGraphs()[0];
    const m = D.modules.find((mod) => mod.id === active) || {
      name: g?.title || "Konsultacja",
    };
    const cohortLabel =
      cohort === "a"
        ? "DOROŚLI (≥16 lat)"
        : cohort === "p"
          ? "DZIECI (<16 lat)"
          : "OGÓLNA (dorośli i dzieci)";
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const visitedNodes = visitSession.history
      .map((h) => nodeInfo(h.nodeId)?.n)
      .filter(Boolean);

    const hxList = new Set();
    const examList = new Set();
    const testsList = new Set();
    const redList = new Set();
    const dispoList = new Set();
    const logicList = new Set();
    const sourcesList = new Set();

    visitedNodes.forEach((n) => {
      const d = n.data || {};
      list(d.hx).forEach((x) => hxList.add(x));
      list(d.exam).forEach((x) => examList.add(x));
      list(d.tests).forEach((x) => testsList.add(x));
      list(d.red).forEach((x) => redList.add(x));
      list(d.dispo).forEach((x) => dispoList.add(x));
      if (d.logic) logicList.add(d.logic);
      list(d.src).forEach((x) => sourcesList.add(x));
    });

    const checkedCriteria = [];
    visitSession.history.forEach((h) => {
      if (h.criteria && h.criteria.length) {
        h.criteria.forEach((c) => checkedCriteria.push(`[${h.title}] ${c}`));
      }
    });

    const lines = [];
    lines.push("================================================================================");
    lines.push("DOKUMENTACJA WIZYTY / KONSULTACJI KLINICZNEJ (SOAP)");
    lines.push(`Data oceny: ${dateStr}`);
    lines.push(`Algorytm wiodący: ${m.name} · Populacja: ${cohortLabel}`);
    lines.push("================================================================================");
    lines.push("");

    // S - Subjective
    lines.push("[S] WYWIAD I CECHY PODMIOTOWE (SUBJECTIVE)");
    if (hxList.size > 0) {
      lines.push("• Główne cechy podmiotowe i ukierunkowany wywiad:");
      hxList.forEach((item) => lines.push(`  - ${item}`));
    } else {
      lines.push("• Zebrano ukierunkowany wywiad podmiotowy według standardu algorytmu.");
    }
    if (checkedCriteria.length > 0) {
      lines.push("• Zaznaczone zmienne decyzyjne z wywiadu / oceny wstępnej:");
      checkedCriteria.forEach((crit) => lines.push(`  - ${crit}`));
    }
    lines.push("");

    // O - Objective
    lines.push("[O] BADANIE PRZEDMIOTOWE I DIAGNOSTYKA (OBJECTIVE)");
    if (examList.size > 0) {
      lines.push("• Ukierunkowane badanie fizykalne:");
      examList.forEach((item) => lines.push(`  - ${item}`));
    }
    if (testsList.size > 0) {
      lines.push("• Diagnostyka i badania pracowniane:");
      testsList.forEach((item) => lines.push(`  - ${item}`));
    }
    if (visitSession.diagnostics && visitSession.diagnostics.length > 0) {
      lines.push("• Przyłóżkowa ultrasonografia POCUS i panele laboratoryjne:");
      visitSession.diagnostics.forEach((d) => {
        lines.push(`  * [${d.type}] ${d.title}: ${d.summary}${d.action ? ` ➔ Zalecenie: ${d.action}` : ""}`);
      });
    }
    if (visitSession.calculators.length > 0) {
      lines.push("• Zastosowane skale i kalkulatory ryzyka:");
      visitSession.calculators.forEach((c) => {
        lines.push(`  * ${c.name}: ${c.total != null ? c.total : "NT"}${c.max ? " / " + c.max : ""} pkt — ${c.headline}`);
        if (c.parts && c.parts.length) {
          const partsSummary = c.parts.map((p) => `${p.label}: ${p.value} (${p.score}p)`).join(", ");
          lines.push(`    [Składowe: ${partsSummary}]`);
        }
        if (c.action) lines.push(`    [Decyzja kliniczna: ${c.action}]`);
      });
    } else {
      lines.push("• Skale kliniczne: Nie rejestrowano odrębnego wyniku w kalkulatorze.");
    }
    lines.push("");

    // A - Assessment
    lines.push("[A] OCENA KLINICZNA I STRATYFIKACJA RYZYKA (ASSESSMENT)");
    if (redList.size > 0) {
      lines.push("• Czerwone flagi / punkty krytyczne podlegające weryfikacji:");
      redList.forEach((item) => lines.push(`  - ${item}`));
    }
    if (visitSession.diagnostics && visitSession.diagnostics.length > 0) {
      const alertDiags = visitSession.diagnostics.filter((d) => d.alert || d.isPositive);
      if (alertDiags.length > 0) {
        lines.push("• Istotne patologie ultrasonograficzne i krytyczne wyniki lab (Red Flags):");
        alertDiags.forEach((d) => {
          lines.push(`  - ⚠️ ${d.title}: ${d.summary}`);
        });
      }
    }
    const hasUrgent = visitedNodes.some((n) => n.type === "urgent");
    if (hasUrgent) {
      lines.push("• Status: Zidentyfikowano wskazania do pilnej eskalacji / procedury natychmiastowej.");
    } else {
      lines.push("• Status: Pacjent bez cech niestabilności hemodynamicznej / oddechowej w chwili badania.");
    }
    if (logicList.size > 0) {
      lines.push("• Uzasadnienie postępowania:");
      logicList.forEach((log) => lines.push(`  - ${log}`));
    }
    const { egfrRes, report: safetyReport } = evaluateCurrentSafety();
    if (patientSafetyProfile.creatinine !== 1.0 || (patientSafetyProfile.allergies && patientSafetyProfile.allergies.length > 0) || (patientSafetyProfile.comorbidities && patientSafetyProfile.comorbidities.length > 0)) {
      lines.push(`• Profil ryzyka i funkcja nerek (CKD-EPI 2021): Kreatynina ${patientSafetyProfile.creatinine} mg/dL, eGFR ${egfrRes.egfr} ml/min/1.73m² (${egfrRes.stage})`);
      if (patientSafetyProfile.allergies.length > 0) lines.push(`  - Wywiad alergiczny: ${patientSafetyProfile.allergies.join(", ")}`);
      if (patientSafetyProfile.comorbidities.length > 0) lines.push(`  - Obciążenia kliniczne: ${patientSafetyProfile.comorbidities.join(", ")}`);
    }
    if (safetyReport.alerts && safetyReport.alerts.length > 0) {
      lines.push("• Bezpieczeństwo farmakoterapii (CDS Alerts & DDI):");
      safetyReport.alerts.forEach((alt) => {
        lines.push(`  - [Kat. ${alt.category}] ⛔ ${alt.title}`);
        lines.push(`    └─ Mechanizm: ${alt.mechanism}`);
        lines.push(`    └─ Rekomendacja: ${alt.action}`);
      });
    }
    lines.push("");

    // P - Plan
    lines.push("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)");
    if (visitSession.pharmacy && visitSession.pharmacy.length > 0) {
      lines.push("• Zaordynowana farmakoterapia, płyny i antybiotykoterapia:");
      visitSession.pharmacy.forEach((item) => {
        lines.push(`  * ${item.name}: ${item.dose} (${item.route || "i.v."})${item.notes ? ` — ${item.notes}` : ""}`);
      });
    }
    if (visitSession.safetyOverrides && visitSession.safetyOverrides.length > 0) {
      lines.push("• Autoryzowane odstępstwa kliniczne i audyt decyzji (Clinical Overrides):");
      visitSession.safetyOverrides.forEach((ov, idx) => {
        const timeStr = new Date(ov.timestamp).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
        lines.push(`  ${idx + 1}. [Godz. ${timeStr}] Lekarz dyżurny autoryzował odstępstwo od alertu CDS:`);
        lines.push(`     └─ Uzasadnienie: "${ov.reason}"`);
      });
    }
    if (dispoList.size > 0) {
      lines.push("• Zalecenia dyspozycyjne i dalsza opieka:");
      dispoList.forEach((item) => lines.push(`  - ${item}`));
    } else {
      lines.push("• Zastosowano postępowanie doraźne i dalsze zgodnie z algorytmem.");
    }
    if (sourcesList.size > 0) {
      lines.push("• Podstawa wytycznych:");
      Array.from(sourcesList).slice(0, 3).forEach((src) => lines.push(`  - ${src}`));
    }
    lines.push("");

    // Audit trail
    lines.push("--------------------------------------------------------------------------------");
    lines.push("ŚCIEŻKA DECYZYJNA I AUDYT PRZEJŚĆ ALGORYTMU:");
    if (visitSession.history.length === 0) {
      lines.push("(Brak zarejestrowanych kroków w bieżącej sesji)");
    } else {
      visitSession.history.forEach((step, idx) => {
        const typeLabel = TYPES[step.type] ? TYPES[step.type].split(" / ")[0] : "Krok";
        lines.push(`${idx + 1}. [${typeLabel}] ${step.title}`);
        if (step.criteria && step.criteria.length > 0) {
          lines.push(`   └─ Zaznaczone zmienne: ${step.criteria.join(", ")}`);
        }
        if (step.branchTaken) {
          lines.push(`   └─ Wybrana gałąź przejścia: "${step.branchTaken}" ➔`);
        }
      });
    }
    lines.push("================================================================================");

    return lines.join("\n");
  }

  function openSOAPDialog() {
    const dialog = $("soap-dialog");
    const textarea = $("soap-textarea");
    if (!dialog || !textarea) return;
    textarea.value = generateSOAPReport();
    if (!dialog.open) dialog.showModal();
  }

  function resetSession() {
    visitSession.history = [];
    visitSession.calculators = [];
    visitSession.pharmacy = [];
    visitSession.diagnostics = [];
    visitSession.safetyOverrides = [];
    patientSafetyProfile.creatinine = 1.0;
    patientSafetyProfile.egfr = 90;
    patientSafetyProfile.allergies = [];
    patientSafetyProfile.comorbidities = [];
    checkedVars.clear();
    activeBranch = null;
    updateSOAPBadge();
    updateSafetyBadge();
    const g = visibleGraphs()[0];
    if (g?.nodes[0]) selectNode(g.nodes[0].id);
    draw();
    renderPanel();
    const textarea = $("soap-textarea");
    if (textarea) textarea.value = generateSOAPReport();
    toast("Zresetowano ścieżkę pacjenta.");
  }

  window.addEventListener("clinical:score-evaluated", (ev) => {
    const detail = ev.detail;
    if (!detail) return;
    const existingIdx = visitSession.calculators.findIndex(
      (c) => c.key === detail.key,
    );
    if (existingIdx >= 0) {
      visitSession.calculators[existingIdx] = detail;
    } else {
      visitSession.calculators.push(detail);
    }
    updateSOAPBadge();
  });

  const soapReportBtn = $("soap-report");
  if (soapReportBtn) soapReportBtn.onclick = openSOAPDialog;
  const soapCloseBtn = $("soap-close");
  if (soapCloseBtn) soapCloseBtn.onclick = () => $("soap-dialog").close();
  const soapCopyBtn = $("soap-copy");
  if (soapCopyBtn)
    soapCopyBtn.onclick = () => {
      const text = $("soap-textarea").value;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => toast("Skopiowano raport SOAP do schowka."))
          .catch(() => {
            $("soap-textarea").select();
            document.execCommand("copy");
            toast("Skopiowano raport SOAP do schowka.");
          });
      } else {
        $("soap-textarea").select();
        document.execCommand("copy");
        toast("Skopiowano raport SOAP do schowka.");
      }
    };
  const soapDownloadBtn = $("soap-download");
  if (soapDownloadBtn)
    soapDownloadBtn.onclick = () => {
      const text = $("soap-textarea").value;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      downloadBlob(blob, `raport-soap-${dateStr}.txt`);
      toast("Pobrano plik raportu SOAP.");
    };
  const soapResetBtn = $("soap-reset");
  if (soapResetBtn) soapResetBtn.onclick = resetSession;

  let walkthroughActive = false;

  function startWalkthrough() {
    walkthroughActive = true;
    const overlay = $("walkthrough-overlay");
    if (overlay) overlay.hidden = false;
    renderWalkthrough();
  }

  function exitWalkthrough() {
    walkthroughActive = false;
    const overlay = $("walkthrough-overlay");
    if (overlay) overlay.hidden = true;
  }

  function renderWalkthrough() {
    if (!walkthroughActive) return;
    const info = selectedInfo();
    const g = visibleGraphs()[0];
    if (!info || !g) return;
    const { n } = info;
    const d = n.data || {};
    const nodes = g.nodes;
    const currentIndex = nodes.findIndex((node) => node.id === n.id);
    const totalCount = nodes.length;

    const titleEl = $("wt-step-title");
    if (titleEl) titleEl.textContent = n.title;
    const counterEl = $("wt-step-counter");
    if (counterEl)
      counterEl.textContent = `Krok ${currentIndex + 1} z ${totalCount} (${TYPES[n.type].split(" / ")[0]})`;

    // Timeline dots
    const timelineEl = $("wt-timeline");
    if (timelineEl) {
      timelineEl.innerHTML = nodes
        .map((node, i) => {
          const isVisited = visitSession.history.some((h) => h.nodeId === node.id);
          const isActive = node.id === n.id;
          return `<div class="wt-dot ${isActive ? "active" : isVisited ? "visited" : ""}" data-wt-step="${node.id}" title="${escape(node.title)}"></div>`;
        })
        .join("");
    }

    // Red flag / Urgent banner
    const alertBanner = $("wt-alert-banner");
    const redItems = list(d.red);
    if (alertBanner) {
      if (n.type === "urgent" || redItems.length > 0) {
        alertBanner.hidden = false;
        const alertText = $("wt-alert-text");
        if (alertText)
          alertText.textContent =
            redItems.join(" • ") || "Krok alarmowy: stan zagrożenia życia lub natychmiastowej interwencji.";
      } else {
        alertBanner.hidden = true;
      }
    }

    const outgoing = g.edges.filter((e) => e.from === n.id);
    const scoreKey = findNodeScore(n);

    let bodyHTML = `
      <div class="wt-card">
        <h3><span>Postępowanie i cel kliniczny</span></h3>
        <p style="margin: 0; line-height: 1.6; font-size: 13px;">${escape(d.body || "Brak szczegółowego opisu.")}</p>
      </div>
    `;

    if (list(d.hx).length || list(d.exam).length) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Wywiad i badanie przedmiotowe</span></h3>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6;">
          ${list(d.hx).map((x) => `<li><strong>[Wywiad]:</strong> ${escape(x)}</li>`).join("")}
          ${list(d.exam).map((x) => `<li><strong>[Badanie]:</strong> ${escape(x)}</li>`).join("")}
        </ul>
      </div>`;
    }

    if (scoreKey) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Kalkulator decyzyjny powiązany z krokiem</span></h3>
        ${renderInlineCalcHTML(scoreKey, n, outgoing)}
      </div>`;
    }

    const activeWeight = currentPharmWeight || (cohort === "p" ? 15 : 70);
    const activeChild = cohort === "p" || activeWeight < 40;
    const contextualDiags = findNodeContextualDiagnostics(n);
    if (contextualDiags.length > 0) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Sugerowana diagnostyka przyłóżkowa POCUS / Lab</span></h3>
        ${renderTileDiagBox(contextualDiags)}
      </div>`;
    }
    const contextualDrugs = findNodeContextualDrugs(n, activeWeight, activeChild);
    if (contextualDrugs.length > 0) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Sugerowana farmakoterapia doraźna (${activeWeight} kg)</span></h3>
        ${renderTileDrugBox(contextualDrugs, activeWeight)}
      </div>`;
    }

    if (outgoing.length > 0) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Ścieżki decyzyjne i wybór gałęzi</span></h3>
        <div class="branch-list">
          ${outgoing.map((e) => {
            const target = g.nodes.find((tn) => tn.id === e.to);
            if (!target) return "";
            const isBranchActive = activeBranch === e.id;
            const vars = branchVariables(n, e, target);
            return `
            <div class="branch-card ${isBranchActive ? "active-branch-card" : ""}" data-edge-id="${escape(e.id)}">
              <div class="branch-header">
                <span class="branch-badge">${escape(e.label || "Dalej")}</span>
                <span class="branch-match-count">${vars.length} kryteriów</span>
              </div>
              <div class="branch-criteria-list">
                ${vars.map((v, idx) => {
                  const varKey = `${e.id}-${idx}`;
                  const isChecked = checkedVars.has(varKey);
                  return `
                  <label class="criterion-check ${isChecked ? "checked" : ""}">
                    <input type="checkbox" data-var="${escape(varKey)}" data-edge="${escape(e.id)}" ${isChecked ? "checked" : ""}>
                    <span>${escape(v)}</span>
                  </label>`;
                }).join("")}
              </div>
              <button type="button" class="branch-jump-btn" data-jump-node="${escape(target.id)}" data-branch-edge="${escape(e.id)}">
                Przejdź do: <strong>${escape(target.title)}</strong> ➔
              </button>
            </div>`;
          }).join("")}
        </div>
      </div>`;
    }

    if (list(d.dispo).length || d.logic) {
      bodyHTML += `
      <div class="wt-card">
        <h3><span>Dalsza dyspozycja i uzasadnienie</span></h3>
        ${list(d.dispo).map((disp) => `<p style="margin: 4px 0; font-size: 12.5px;">• ${escape(disp)}</p>`).join("")}
        ${d.logic ? `<p style="margin: 8px 0 0; font-size: 11.5px; color: var(--muted); font-style: italic;">Dlaczego tak: ${escape(d.logic)}</p>` : ""}
      </div>`;
    }

    const mainBody = $("wt-main-body");
    if (mainBody) mainBody.innerHTML = bodyHTML;

    const prevBtn = $("wt-prev");
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;

    const nextBtn = $("wt-next");
    if (nextBtn) {
      const activeEdge = outgoing.find((e) => e.id === activeBranch);
      const nextTargetId = activeEdge
        ? activeEdge.to
        : outgoing[0]
          ? outgoing[0].to
          : nodes[currentIndex + 1]
            ? nodes[currentIndex + 1].id
            : null;

      nextBtn.disabled = !nextTargetId;
      if (nextTargetId) {
        const nextNode = g.nodes.find((tn) => tn.id === nextTargetId);
        nextBtn.textContent = nextNode ? `Kolejny: ${nextNode.title.slice(0, 16)}… ➔` : "Kolejny krok ➔";
        nextBtn.dataset.nextId = nextTargetId;
      } else {
        nextBtn.textContent = "Punkt końcowy ✓";
      }
    }
  }

  function printPDFDossier() {
    const container = $("dossier-print-container");
    if (!container) return;
    const { egfrRes, report: safetyReport } = evaluateCurrentSafety();
    const g = currentGraph() || visibleGraphs()[0];
    const m = D.modules.find((mod) => mod.id === active) || {
      name: g?.title || "Konsultacja",
    };
    const cohortLabel =
      cohort === "a"
        ? "DOROŚLI (≥16 lat)"
        : cohort === "p"
          ? "DZIECI (<16 lat)"
          : "OGÓLNA";
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    container.innerHTML = `
    <div class="dossier-sheet">
      <div class="dossier-header">
        <div>
          <h1>Clinical Canvas · Karta Konsultacji Klinicznej i Decyzji</h1>
          <div class="dossier-meta">
            <strong>Algorytm:</strong> ${escape(m.name)} &nbsp;|&nbsp; <strong>Populacja:</strong> ${escape(cohortLabel)} &nbsp;|&nbsp; <strong>Data oceny:</strong> ${dateStr}
          </div>
        </div>
        <div class="dossier-meta" style="text-align: right;">
          Standard: <b>Clinical Canvas v2.1</b><br>
          Ref: CC-${Date.now().toString(36).toUpperCase()}
        </div>
      </div>

      <section class="dossier-section">
        <h2>1. Ścieżka Decyzyjna i Punkty Zwrotne (Audit Trail)</h2>
        <div class="dossier-audit-list">
          ${visitSession.history.length === 0 ? "<p>Brak zarejestrowanych etapów w bieżącej sesji.</p>" : visitSession.history.map((step, idx) => `
            <div class="dossier-audit-step">
              <strong>Etap ${idx + 1}: ${escape(step.title)}</strong> [${step.type}]
              ${step.criteria && step.criteria.length ? `<br><span style="color:#444">Zaznaczone kryteria: ${escape(step.criteria.join(", "))}</span>` : ""}
              ${step.branchTaken ? `<br><strong style="color:#164c4b">➔ Wybrana gałąź: "${escape(step.branchTaken)}"</strong>` : ""}
            </div>
          `).join("")}
        </div>
      </section>

      ${visitSession.calculators.length > 0 ? `
        <section class="dossier-section">
          <h2>2. Skale Kliniczne i Zastosowane Kalkulatory</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Skala</th>
                <th>Wynik</th>
                <th>Stratyfikacja i Znaczenie Kliniczne</th>
                <th>Zalecenie</th>
              </tr>
            </thead>
            <tbody>
              ${visitSession.calculators.map((c) => `
                <tr>
                  <td><strong>${escape(c.name)}</strong></td>
                  <td><b>${c.total != null ? c.total : "NT"}${c.max ? " / " + c.max : ""} pkt</b></td>
                  <td>${escape(c.headline)}</td>
                  <td>${escape(c.action || "—")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      ` : ""}

      ${visitSession.pharmacy && visitSession.pharmacy.length > 0 ? `
        <section class="dossier-section">
          <h2>Farmakoterapia Doraźna, Płynoterapia i Antybiotykoterapia ([P] Plan)</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Lek / Płyn</th>
                <th>Dawka i Droga</th>
                <th>Wskazanie / Uwagi</th>
              </tr>
            </thead>
            <tbody>
              ${visitSession.pharmacy.map((p) => `
                <tr>
                  <td><strong>${escape(p.name)}</strong></td>
                  <td><b>${escape(p.dose)}</b> (${escape(p.route || "i.v.")})</td>
                  <td>${escape(p.notes || "Zgodnie z protokołem")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      ` : ""}

      ${visitSession.diagnostics && visitSession.diagnostics.length > 0 ? `
        <section class="dossier-section">
          <h2>Diagnostyka Przyłóżkowa POCUS i Badania Laboratoryjne ([O] Objective)</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Protokół / Badanie</th>
                <th>Wynik ultrasonograficzny / laboratoryjny</th>
                <th>Interpretacja i Dalsze Zalecenia</th>
              </tr>
            </thead>
            <tbody>
              ${visitSession.diagnostics.map((d) => `
                <tr>
                  <td><strong>${escape(d.title)}</strong><br><small style="color:#666">${escape(d.type)}</small></td>
                  <td>${escape(d.summary)}</td>
                  <td>${escape(d.action || "W normie")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      ` : ""}

      ${(safetyReport.alerts.length > 0 || (visitSession.safetyOverrides && visitSession.safetyOverrides.length > 0) || patientSafetyProfile.creatinine !== 1.0) ? `
        <section class="dossier-section">
          <h2>Bezpieczeństwo Farmakoterapii, Interakcje (CDS) i Odstępstwa Kliniczne</h2>
          <p style="font-size: 9pt; margin-bottom: 6pt;">
            <strong>Ocena nerkowa (CKD-EPI 2021):</strong> Kreatynina: ${patientSafetyProfile.creatinine} mg/dL | eGFR: <b>${egfrRes.egfr} ml/min/1.73m²</b> (${escape(egfrRes.stage)})
            ${patientSafetyProfile.allergies.length > 0 ? `<br><strong>Alergie:</strong> ${escape(patientSafetyProfile.allergies.join(", "))}` : ""}
            ${patientSafetyProfile.comorbidities.length > 0 ? `<br><strong>Obciążenia:</strong> ${escape(patientSafetyProfile.comorbidities.join(", "))}` : ""}
          </p>
          ${safetyReport.alerts.length > 0 ? `
            <table class="dossier-table">
              <thead>
                <tr>
                  <th>Kategoria</th>
                  <th>Alert / Interakcja</th>
                  <th>Mechanizm ryzyka</th>
                  <th>Zalecane postępowanie</th>
                </tr>
              </thead>
              <tbody>
                ${safetyReport.alerts.map((alt) => `
                  <tr style="background: ${alt.category === 'X' ? '#fff5f5' : '#fffdf0'}">
                    <td><strong style="color: ${alt.category === 'X' ? '#b00' : '#b7791f'}">Kat. ${escape(alt.category)}</strong></td>
                    <td><b>${escape(alt.title)}</b><br><small>Leki: ${escape((alt.drugsInvolved || []).join(", "))}</small></td>
                    <td style="font-size: 8.5pt;">${escape(alt.mechanism)}</td>
                    <td style="font-size: 8.5pt;">${escape(alt.action)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : "<p style='font-size:9pt; color:#2e7d32;'>Brak krytycznych interakcji i przeciwwskazań farmakologicznych.</p>"}

          ${visitSession.safetyOverrides && visitSession.safetyOverrides.length > 0 ? `
            <div style="margin-top: 8pt; padding: 6pt 8pt; background: #fff8e1; border: 1pt solid #ffe082; border-radius: 4pt; font-size: 8.5pt;">
              <strong>Zarejestrowane autoryzacje odstępstw klinicznych (Clinical Overrides):</strong>
              <ul style="margin: 4pt 0 0 16pt; padding: 0;">
                ${visitSession.safetyOverrides.map((ov) => `
                  <li>[${new Date(ov.timestamp).toLocaleTimeString("pl-PL")}] Uzasadnienie lekarza: <em>${escape(ov.reason)}</em></li>
                `).join("")}
              </ul>
            </div>
          ` : ""}
        </section>
      ` : ""}

      <section class="dossier-section">
        <h2>3. Ustrukturyzowana Notatka Kliniczna (Format SOAP)</h2>
        <div style="font-size: 9pt; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f8fbfb; border: 1pt solid #ccc; padding: 10pt; border-radius: 4pt; line-height: 1.5;">${escape(generateSOAPReport())}</div>
      </section>

      <div class="dossier-signatures">
        <div class="dossier-signature-box">
          Data badania: ${dateStr}<br>
          Pieczęć i podpis lekarza prowadzącego / kwalifikującego
        </div>
        <div class="dossier-signature-box">
          Stanowisko Triage / Oddział docelowy<br>
          Potwierdzenie przekazania / hospitalizacji
        </div>
      </div>
    </div>`;

    window.print();
  }

  // Walkthrough and Dossier button listeners
  const wtBtn = $("walkthrough-btn");
  if (wtBtn) wtBtn.onclick = startWalkthrough;
  const wtCloseBtn = $("wt-close");
  if (wtCloseBtn) wtCloseBtn.onclick = exitWalkthrough;
  const wtSoapBtn = $("wt-soap-btn");
  if (wtSoapBtn) wtSoapBtn.onclick = openSOAPDialog;
  const wtPdfBtn = $("wt-pdf-btn");
  if (wtPdfBtn) wtPdfBtn.onclick = printPDFDossier;
  const dossierBtn = $("dossier-btn");
  if (dossierBtn) dossierBtn.onclick = printPDFDossier;
  const soapDossierBtn = $("soap-dossier-btn");
  if (soapDossierBtn) soapDossierBtn.onclick = printPDFDossier;

  const wtPrevBtn = $("wt-prev");
  if (wtPrevBtn)
    wtPrevBtn.onclick = () => {
      const g = visibleGraphs()[0];
      if (!g) return;
      const info = selectedInfo();
      const idx = g.nodes.findIndex((node) => node.id === info?.n.id);
      if (idx > 0) selectNode(g.nodes[idx - 1].id, true);
    };

  const wtNextBtn = $("wt-next");
  if (wtNextBtn)
    wtNextBtn.onclick = () => {
      const nextId = $("wt-next").dataset.nextId;
      if (nextId) selectNode(nextId, true);
    };

  const wtTimeline = $("wt-timeline");
  if (wtTimeline)
    wtTimeline.onclick = (ev) => {
      const dot = ev.target.closest("[data-wt-step]");
      if (dot) selectNode(dot.dataset.wtStep, true);
    };

  // Inline calculator change handling
  document.addEventListener("change", (ev) => {
    const calcInput = ev.target.closest("[data-calc-item]");
    if (calcInput) {
      const box = calcInput.closest("[data-calc-box]");
      if (!box) return;
      const scoreKey = calcInput.dataset.calcKey;
      const varKey = `calc-${scoreKey}-${calcInput.dataset.calcItem}`;
      if (calcInput.checked) checkedVars.add(varKey);
      else checkedVars.delete(varKey);

      const checkedInputs = box.querySelectorAll("input[data-calc-item]:checked");
      let total = 0;
      checkedInputs.forEach((ci) => {
        total += parseFloat(ci.dataset.calcPts || 0);
      });

      const badge = $(`inline-score-badge-${scoreKey}`);
      if (badge) {
        badge.textContent = `Wynik: ${total} pkt`;
        const isHigh = scoreKey === "wellspe" ? total > 4 : total >= 2;
        badge.dataset.level = isHigh ? "high" : "low";
      }

      const calcData = {
        key: scoreKey,
        name: scoreKey === "wellspe" ? "Wells PE" : scoreKey === "curb65" ? "CURB-65" : "qSOFA",
        total: total,
        max: scoreKey === "wellspe" ? "12.5" : scoreKey === "curb65" ? "5" : "3",
        headline:
          scoreKey === "wellspe"
            ? total > 4
              ? "Wysokie prawdopodobieństwo ZP (>4 pkt) — wskazana TKPA"
              : "Małe prawdopodobieństwo ZP (≤4 pkt) — oznacz D-dimer"
            : scoreKey === "curb65"
              ? total >= 2
                ? "Wskazana hospitalizacja (Grupa 2/3)"
                : "Niskie ryzyko zgonu (Grupa 1)"
              : total >= 2
                ? "Wysokie ryzyko sepsy (≥2 pkt)"
                : "Niskie ryzyko (<2 pkt)",
        action:
          scoreKey === "wellspe"
            ? total > 4
              ? "Wykonaj angio-TK klatki piersiowej (TKPA)"
              : "Oznacz D-dimer; jeśli ujemny, wyklucz ZP"
            : "",
        timestamp: Date.now(),
      };
      const exIdx = visitSession.calculators.findIndex((c) => c.key === scoreKey);
      if (exIdx >= 0) visitSession.calculators[exIdx] = calcData;
      else visitSession.calculators.push(calcData);
      updateSOAPBadge();

      const g = visibleGraphs()[0];
      const outgoing = g ? g.edges.filter((e) => e.from === selected?.id) : [];
      const matched = matchScoreToBranch(scoreKey, total, outgoing);
      if (matched) activeBranch = matched.id;
      draw();
      renderPanel();
      if (walkthroughActive) renderWalkthrough();
    }
  });

  document.addEventListener("click", (ev) => {
    const applyBtn = ev.target.closest("[data-calc-apply]");
    if (applyBtn) {
      const scoreKey = applyBtn.dataset.calcApply;
      const existing = visitSession.calculators.find((c) => c.key === scoreKey);
      const total = existing ? existing.total : 0;
      const g = visibleGraphs()[0];
      const outgoing = g ? g.edges.filter((e) => e.from === selected?.id) : [];
      const matched = matchScoreToBranch(scoreKey, total, outgoing);
      if (matched) {
        activeBranch = matched.id;
        toast(`Dopasowano gałąź: ${matched.label || "Kolejny krok"}`);
      } else {
        toast(`Zastosowano wynik ${total} pkt.`);
      }
      draw();
      renderPanel();
      if (walkthroughActive) renderWalkthrough();
    }
  });

  // --- Clinical Pharmacology & Emergency Therapeutics Suite ---
  function addPrescription(item) {
    if (!item || !item.name) return;
    const exists = visitSession.pharmacy.some(
      (p) => p.name === item.name && p.dose === item.dose
    );
    if (!exists) {
      visitSession.pharmacy.push({
        name: item.name,
        dose: item.dose,
        route: item.route || "i.v.",
        notes: item.notes || "",
        timestamp: Date.now(),
      });
      updateSOAPBadge();
      updateSafetyBadge();
      toast(`Dodano do planu: ${item.name} (${item.dose})`);
    } else {
      toast(`Pozycja "${item.name}" znajduje się już w planie leczenia.`);
    }
  }

  function findNodeContextualDrugs(node, weightKg, isChild) {
    const P = (typeof window !== "undefined" && window.ClinicalPharmacology) || (typeof globalThis !== "undefined" && globalThis.ClinicalPharmacology);
    if (!node || !P) return [];
    const text = ((node.title || "") + " " + (node.data?.body || "") + " " + list(node.data?.red).join(" ")).toLowerCase();
    const ed = P.emergencyDoses(weightKg, isChild);
    const items = [];

    if (/rko|asystol|pea|migotan|zatrzyman|defibryl/.test(text)) {
      items.push({ name: "Adrenalina (RKO ALS/EPLS)", dose: `${ed.adrenalineCardiacArrest.doseMg} mg (${ed.adrenalineCardiacArrest.volumeMl} ml 1:10 000)`, route: "i.v. / i.o.", notes: ed.adrenalineCardiacArrest.notes });
      items.push({ name: "Amiodaron (RKO)", dose: `I dawka ${ed.amiodaroneCardiacArrest.doseMgFirst} mg (${ed.amiodaroneCardiacArrest.volumeMlFirst} ml), II dawka ${ed.amiodaroneCardiacArrest.doseMgSecond} mg`, route: "i.v. / i.o.", notes: ed.amiodaroneCardiacArrest.notes });
    }
    if (/anafilak|uczuleni|obrzęk naczynioruchow|pokrzywk/.test(text)) {
      items.push({ name: "Adrenalina (Anafilaksja)", dose: `${ed.adrenalineAnaphylaxis.doseMg} mg (${ed.adrenalineAnaphylaxis.volumeMl} ml 1:1000)`, route: "i.m.", notes: ed.adrenalineAnaphylaxis.notes });
      items.push({ name: "Hydrokortyzon", dose: `${ed.hydrocortisone.doseMg} mg`, route: "i.v.", notes: ed.hydrocortisone.notes });
      items.push({ name: "Płynoterapia wstrząsu", dose: isChild ? `${Math.round(weightKg * 20)} ml (20 ml/kg)` : "500-1000 ml bolus", route: "i.v.", notes: ed.fluidResuscitation.notes });
    }
    if (/seps|posocznic|qsofa/.test(text)) {
      items.push({ name: "Płynoterapia w sepsie (30 ml/kg)", dose: `${Math.round(weightKg * 30)} ml (PWE / Plasmalyte)`, route: "i.v. w ciągu 3h", notes: "Zgodnie z pakietem Surviving Sepsis Campaign / Sepsis-6." });
      items.push({ name: "Antybiotyk empiryczny w sepsie", dose: "Ceftriakson 1x 2g i.v. + Gentamycyna 5-7 mg/kg", route: "i.v.", notes: "NPOA: pobrać posiewy krwi przed podaniem, czas < 1h." });
    }
    if (/astm|obturac|duszno|skurcz oskrzel|świsty/.test(text)) {
      items.push({ name: "Salbutamol nebulizacja", dose: `${ed.salbutamolNebulization.doseMg} mg`, route: "wziewnie z tlenem", notes: ed.salbutamolNebulization.notes });
      items.push({ name: "Bromek ipratropium", dose: `${ed.ipratropiumNebulization.doseMg} mg`, route: "wziewnie", notes: ed.ipratropiumNebulization.notes });
      items.push({ name: "Hydrokortyzon", dose: `${ed.hydrocortisone.doseMg} mg`, route: "i.v.", notes: ed.hydrocortisone.notes });
    }
    if (/drgawk|padaczk|stan padaczkowy/.test(text)) {
      items.push({ name: "Midazolam", dose: `${ed.midazolamSeizures.doseMg} mg (${ed.midazolamSeizures.volumeMl} ml)`, route: "b.u.c. / i.m.", notes: ed.midazolamSeizures.notes });
      items.push({ name: "Diazepam wlewka doodbytnicza", dose: `${ed.diazepamSeizures.doseMg} mg`, route: "p.r.", notes: ed.diazepamSeizures.notes });
    }
    if (/hipoglikem|glukoz|cukrzyc/.test(text)) {
      items.push({ name: "Glukoza i.v.", dose: ed.glucoseHypoglycemia.doseDescription, route: "i.v.", notes: ed.glucoseHypoglycemia.notes });
    }
    if (/bólu|ból |analgez|morfin|nasilony ból/.test(text)) {
      items.push({ name: "Paracetamol", dose: isChild ? `${Math.round(weightKg * 15)} mg (15 mg/kg)` : "1000 mg", route: "i.v. / p.o.", notes: "Co 6h. Max 60 mg/kg/d u dzieci lub 4000 mg/d u dorosłych." });
      items.push({ name: isChild ? "Ibuprofen" : "Ketoprofen", dose: isChild ? `${Math.round(weightKg * 10)} mg (10 mg/kg)` : "100 mg", route: isChild ? "p.o." : "i.v. / p.o.", notes: isChild ? "Co 8h p.o." : "Co 12h powoli i.v. lub p.o." });
      items.push({ name: "Morfina", dose: isChild ? `${+(weightKg * 0.1).toFixed(1)} mg (0.1 mg/kg)` : "2-5 mg miareczkowana", route: "i.v. / s.c.", notes: "Miareczkować co 5-10 min do ustąpienia bólu (VAS < 4)." });
    }
    if (/zapalenie płuc|pneumon|curb/.test(text)) {
      items.push({ name: "Antybiotyk CAP (NPOA)", dose: "Amoksycylina 3x 1000 mg p.o. (lub Augmentin 3x 1.2g i.v. + Klarytromycyna 2x 500 mg)", route: "p.o. / i.v.", notes: "Dobrać do skali CURB-65. Szczegóły w leksykonie NPOA." });
    }
    if (/moczow|zum|odmiedniczk/.test(text)) {
      items.push({ name: "Antybiotyk ZUM (NPOA)", dose: "Fosfomycyna 3g p.o. jednorazowo LUB Ciprofloksacyna 2x 500 mg p.o. (OOZN)", route: "p.o. / i.v.", notes: "NPOA 2024: unikać fluorochinolonów w niepowikłanym pęcherzu." });
    }

    return items;
  }

  function renderTileDrugBox(items, weightKg) {
    if (!items || items.length === 0) return "";
    return `
      <section class="tile-drug-box">
        <div class="tile-drug-head">
          <span class="tile-drug-title">💊 Sugerowana farmakoterapia doraźna (${weightKg} kg)</span>
          <button type="button" class="pharm-quick-open-btn" data-action="open-pharm">Otwórz leksykon ➔</button>
        </div>
        <div class="tile-drug-list">
          ${items.map((item) => {
            const isAdded = visitSession.pharmacy.some((p) => p.name === item.name && p.dose === item.dose);
            return `
              <div class="tile-drug-item">
                <div class="tile-drug-item-info">
                  <strong>${escape(item.name)}</strong>: <span>${escape(item.dose)}</span> <em style="color:#555">(${escape(item.route)})</em>
                  ${item.notes ? `<div class="tile-drug-notes">${escape(item.notes)}</div>` : ""}
                </div>
                <button type="button" class="tile-drug-add-btn ${isAdded ? "added" : ""}" data-drug-name="${escape(item.name)}" data-drug-dose="${escape(item.dose)}" data-drug-route="${escape(item.route)}" data-drug-notes="${escape(item.notes)}">
                  ${isAdded ? "✓ W planie" : "+ Dołącz"}
                </button>
              </div>`;
          }).join("")}
        </div>
      </section>`;
  }

  function updatePharmPatientBar() {
    const weightInput = $("pharm-weight");
    const popBadge = $("pharm-pop-badge");
    if (!weightInput || !popBadge) return;
    const w = Math.max(2, parseFloat(weightInput.value) || 70);
    currentPharmWeight = w;
    currentPharmIsChild = cohort === "p" || w < 40;
    if (currentPharmIsChild) {
      popBadge.textContent = `PEDIATRIA (${w} kg < 40 kg)`;
      popBadge.classList.add("peds");
    } else {
      popBadge.textContent = `DOROSŁY (${w} kg ≥ 40 kg)`;
      popBadge.classList.remove("peds");
    }
  }

  function openPharmModal(tab = null) {
    const dialog = $("pharm-dialog");
    if (!dialog) return;
    if (tab) currentPharmTab = tab;
    const weightInput = $("pharm-weight");
    if (weightInput) weightInput.value = currentPharmWeight;
    updatePharmPatientBar();
    renderPharmModal(currentPharmTab);
    if (!dialog.open) dialog.showModal();
  }

  function closePharmModal() {
    const dialog = $("pharm-dialog");
    if (dialog?.open) dialog.close();
  }

  function renderPharmModal(tab = "rko") {
    currentPharmTab = tab;
    const P = (typeof window !== "undefined" && window.ClinicalPharmacology) || (typeof globalThis !== "undefined" && globalThis.ClinicalPharmacology);
    const panelEl = $("pharm-panel");
    const descEl = $("pharm-description");
    if (!panelEl || !descEl || !P) return;

    // Update tab bar state
    const tabs = document.querySelectorAll(".pharm-tab");
    tabs.forEach((t) => {
      const isSel = t.dataset.pharmTab === tab;
      t.setAttribute("aria-selected", String(isSel));
    });

    const w = currentPharmWeight;
    const isChild = currentPharmIsChild;

    if (tab === "rko") {
      descEl.textContent = "Dawkowanie leków stanów nagłych i resuscytacji krążeniowo-oddechowej (ALS/EPLS) wyliczane w czasie rzeczywistym dla masy pacjenta.";
      panelEl.innerHTML = renderPharmRKO(P, w, isChild);
    } else if (tab === "fluids") {
      descEl.textContent = "Płynoterapia podstawowa (Holliday-Segar), resuscytacja we wstrząsie septycznym oraz precyzyjne kalkulatory sodu (Adrogue-Madias) i równowagi kwasowo-zasadowej.";
      panelEl.innerHTML = renderPharmFluids(P, w, isChild);
    } else if (tab === "pain") {
      descEl.textContent = "Drabina analgetyczna WHO, dawkowanie nieopioidów oraz kalkulator równoważnika doustnego morfiny (OME) z dawkami ratunkowymi bólu przebijającego.";
      panelEl.innerHTML = renderPharmPain(P, w, isChild);
    } else if (tab === "npoa") {
      descEl.textContent = "Empiryczna antybiotykoterapia pierwszego rzutu i alternatywna wg zaleceń Narodowego Programu Ochrony Antybiotyków (NPOA 2024-2026).";
      panelEl.innerHTML = renderPharmNPOA(P, w, isChild);
    }
  }

  function renderPharmRKO(P, w, isChild) {
    const d = P.emergencyDoses(w, isChild);
    const items = [
      {
        title: "Adrenalina (Anafilaksja)",
        sub: d.adrenalineAnaphylaxis.indication,
        prep: d.adrenalineAnaphylaxis.prep,
        dose: `${d.adrenalineAnaphylaxis.doseMg} mg (${d.adrenalineAnaphylaxis.volumeMl} ml)`,
        route: d.adrenalineAnaphylaxis.route,
        notes: d.adrenalineAnaphylaxis.notes,
      },
      {
        title: "Adrenalina (RKO / Zatrzymanie krążenia)",
        sub: d.adrenalineCardiacArrest.indication,
        prep: d.adrenalineCardiacArrest.prep,
        dose: `${d.adrenalineCardiacArrest.doseMg} mg (${d.adrenalineCardiacArrest.volumeMl} ml)`,
        route: d.adrenalineCardiacArrest.route,
        notes: d.adrenalineCardiacArrest.notes,
      },
      {
        title: "Amiodaron (RKO - VT/VF bez tętna)",
        sub: d.amiodaroneCardiacArrest.indication,
        prep: d.amiodaroneCardiacArrest.prep,
        dose: `I dawka: ${d.amiodaroneCardiacArrest.doseMgFirst} mg (${d.amiodaroneCardiacArrest.volumeMlFirst} ml), II dawka: ${d.amiodaroneCardiacArrest.doseMgSecond} mg (${d.amiodaroneCardiacArrest.volumeMlSecond} ml)`,
        route: d.amiodaroneCardiacArrest.route,
        notes: d.amiodaroneCardiacArrest.notes,
      },
      {
        title: "Atropina (Objawowa Bradykardia)",
        sub: d.atropineBradycardia.indication,
        prep: d.atropineBradycardia.prep,
        dose: `${d.atropineBradycardia.doseMg} mg (${d.atropineBradycardia.volumeMl} ml)`,
        route: d.atropineBradycardia.route,
        notes: d.atropineBradycardia.notes,
      },
      {
        title: "Midazolam (Napad drgawkowy)",
        sub: d.midazolamSeizures.indication,
        prep: d.midazolamSeizures.prep,
        dose: `${d.midazolamSeizures.doseMg} mg (${d.midazolamSeizures.volumeMl} ml)`,
        route: d.midazolamSeizures.route,
        notes: d.midazolamSeizures.notes,
      },
      {
        title: "Diazepam (Wlewka doodbytnicza)",
        sub: d.diazepamSeizures.indication,
        prep: d.diazepamSeizures.prep,
        dose: `${d.diazepamSeizures.doseMg} mg`,
        route: d.diazepamSeizures.route,
        notes: d.diazepamSeizures.notes,
      },
      {
        title: "Salbutamol (Nebulizacja z tlenem)",
        sub: d.salbutamolNebulization.indication,
        prep: d.salbutamolNebulization.prep,
        dose: `${d.salbutamolNebulization.doseMg} mg`,
        route: d.salbutamolNebulization.route,
        notes: d.salbutamolNebulization.notes,
      },
      {
        title: "Bromek ipratropium (Nebulizacja)",
        sub: d.ipratropiumNebulization.indication,
        prep: d.ipratropiumNebulization.prep,
        dose: `${d.ipratropiumNebulization.doseMg} mg`,
        route: d.ipratropiumNebulization.route,
        notes: d.ipratropiumNebulization.notes,
      },
      {
        title: "Hydrokortyzon",
        sub: d.hydrocortisone.indication,
        prep: "Ampułki 100 mg / 250 mg",
        dose: `${d.hydrocortisone.doseMg} mg`,
        route: d.hydrocortisone.route,
        notes: d.hydrocortisone.notes,
      },
      {
        title: "Glukoza (Hipoglikemia objawowa)",
        sub: d.glucoseHypoglycemia.indication,
        prep: d.glucoseHypoglycemia.prep,
        dose: d.glucoseHypoglycemia.doseDescription,
        route: d.glucoseHypoglycemia.route,
        notes: d.glucoseHypoglycemia.notes,
      },
      {
        title: "Płynoterapia we wstrząsie (Bolus)",
        sub: d.fluidResuscitation.indication,
        prep: d.fluidResuscitation.solution,
        dose: d.fluidResuscitation.doseDescription,
        route: d.fluidResuscitation.route,
        notes: d.fluidResuscitation.notes,
      },
    ];

    return `
      <div class="pharm-grid">
        ${items.map((item) => {
          const isAdded = visitSession.pharmacy.some((p) => p.name === item.title && p.dose === item.dose);
          return `
            <div class="pharm-card">
              <h4><span>${escape(item.title)}</span> <small style="font-size:11px;color:var(--muted)">${escape(item.route)}</small></h4>
              <div class="pharm-card-meta">${escape(item.sub)} · <em>${escape(item.prep)}</em></div>
              <div class="pharm-card-dose">Dawka: ${escape(item.dose)}</div>
              <div style="font-size:12px;color:var(--muted);line-height:1.45;margin-bottom:12px;">${escape(item.notes)}</div>
              <button type="button" class="pharm-add-btn ${isAdded ? "added" : ""}" data-drug-name="${escape(item.title)}" data-drug-dose="${escape(item.dose)}" data-drug-route="${escape(item.route)}" data-drug-notes="${escape(item.notes)}">
                ${isAdded ? "✓ W planie" : "+ Dołącz do planu"}
              </button>
            </div>`;
        }).join("")}
      </div>`;
  }

  function renderPharmFluids(P, w, isChild) {
    const hs = P.hollidaySegar(w);
    const sepsisBolus = Math.round(w * 30);
    const naDef = P.sodiumDeficit({
      weightKg: w,
      sex: sodiumInputs.sex,
      age: sodiumInputs.age,
      serumNa: sodiumInputs.serumNa,
      targetNa: sodiumInputs.targetNa,
      infusateNa: sodiumInputs.infusateNa,
    });
    const ab = P.acidBase({
      na: acidBaseInputs.na,
      cl: acidBaseInputs.cl,
      hco3: acidBaseInputs.hco3,
      alb: acidBaseInputs.alb,
      weightKg: w,
    });

    const isHsAdded = visitSession.pharmacy.some((p) => p.name.includes("Holliday-Segar"));
    const isSepsisAdded = visitSession.pharmacy.some((p) => p.name.includes("Sepsa (30 ml/kg)"));
    const isNaAdded = visitSession.pharmacy.some((p) => p.name.includes("Korekta hiponatremii"));
    const isAbAdded = visitSession.pharmacy.some((p) => p.name.includes("Korekta kwasicy"));

    return `
      <div class="pharm-grid">
        <!-- Holliday-Segar Maintenance -->
        <div class="pharm-card">
          <h4><span>1. Płynoterapia podtrzymująca (Holliday-Segar)</span></h4>
          <div class="pharm-card-meta">Standardowe dobowe zapotrzebowanie na płyny dla masy ${w} kg</div>
          <div class="pharm-card-dose">${hs.dailyMl} ml / dobę (${hs.hourlyMl} ml / godz.)</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px;">
            Szybkość wlewu grawitacyjnego: <strong>${hs.dropRateMin} kropli/min</strong> (standardowy aparat 20 kropli/ml).<br>
            Reguła 4-2-1: 100 ml/kg na pierwsze 10 kg, 50 ml/kg na kolejne 10 kg, 20 ml/kg powyżej 20 kg.
          </div>
          <button type="button" class="pharm-add-btn ${isHsAdded ? "added" : ""}" data-drug-name="Płyny podtrzymujące (Holliday-Segar)" data-drug-dose="${hs.dailyMl} ml/24h (${hs.hourlyMl} ml/h)" data-drug-route="i.v." data-drug-notes="Płyn wieloelektrolitowy lub 0.9% NaCl z 5% Glukozą">
            ${isHsAdded ? "✓ W planie" : "+ Dołącz nawadnianie podtrzymujące"}
          </button>
        </div>

        <!-- Sepsis Resuscitation -->
        <div class="pharm-card">
          <h4><span>2. Resuscytacja w sepsie (Surviving Sepsis Campaign)</span></h4>
          <div class="pharm-card-meta">Zalecana objętość początkowa w hipoperfuzji lub wstrząsie septycznym</div>
          <div class="pharm-card-dose">Bolus 30 ml/kg = ${sepsisBolus} ml w ciągu pierwszych 3h</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px;">
            Zalecane krystaloidy zbilansowane (PWE, Plasmalyte) przed 0.9% NaCl. Monitorować odpowiedź hemodynamiczną (MAP ≥65 mmHg, powrót włośniczkowy, diureza, spadek mleczanów).
          </div>
          <button type="button" class="pharm-add-btn ${isSepsisAdded ? "added" : ""}" data-drug-name="Resuscytacja płynowa w sepsie (30 ml/kg)" data-drug-dose="${sepsisBolus} ml w 3h" data-drug-route="i.v." data-drug-notes="Krystaloid zbilansowany (PWE / Plasmalyte), kontrola objawów przewodnienia">
            ${isSepsisAdded ? "✓ W planie" : "+ Dołącz bolus sepsy do planu"}
          </button>
        </div>

        <!-- Adrogue-Madias Sodium Calculator -->
        <div class="pharm-card" style="grid-column: 1 / -1;">
          <h4><span>3. Deficyt sodu i kalkulator Adrogue-Madias (Hipo-/Hipernatremia)</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="na-serum">Aktualny sód (Na+) w surowicy [mmol/L]:</label>
              <input id="na-serum" type="number" value="${sodiumInputs.serumNa}" min="90" max="180">
            </div>
            <div class="pharm-field">
              <label for="na-target">Docelowy sód (Na+) [mmol/L]:</label>
              <input id="na-target" type="number" value="${sodiumInputs.targetNa}" min="100" max="160">
            </div>
          </div>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="na-infusate">Roztwór infuzyjny:</label>
              <select id="na-infusate">
                <option value="154" ${sodiumInputs.infusateNa === 154 ? "selected" : ""}>0.9% NaCl (154 mmol Na+/L)</option>
                <option value="513" ${sodiumInputs.infusateNa === 513 ? "selected" : ""}>3% NaCl (513 mmol Na+/L - hipertoniczny)</option>
              </select>
            </div>
            <div class="pharm-field">
              <label for="na-sex">Płeć i wiek pacjenta (współczynnik TBW):</label>
              <select id="na-sex">
                <option value="m" ${sodiumInputs.sex === "m" ? "selected" : ""}>Mężczyzna (TBW 60% / 50% starszy)</option>
                <option value="f" ${sodiumInputs.sex === "f" ? "selected" : ""}>Kobieta (TBW 50% / 45% starsza)</option>
              </select>
            </div>
          </div>
          <div class="pharm-result-box">
            <strong>Całkowita woda ustrojowa (TBW):</strong> ${naDef.tbw} L |
            <strong>Całkowity deficyt sodu:</strong> ${naDef.totalDeficitMmol} mmol Na+<br>
            <strong>Spodziewany przyrost Na+ po 1L roztworu:</strong> ΔNa+ = ${naDef.deltaNaPerLiter > 0 ? "+" : ""}${naDef.deltaNaPerLiter} mmol/L<br>
            <strong>Wymagana objętość płynu do osiągnięcia celu:</strong> ${naDef.requiredLiters} L (${Math.round(naDef.requiredLiters * 1000)} ml)
          </div>
          <div class="pharm-alert">
            <strong>⚠️ KRYTYCZNE OSTRZEŻENIE BEZPIECZEŃSTWA:</strong> ${naDef.warning}
          </div>
          <button type="button" class="pharm-add-btn ${isNaAdded ? "added" : ""}" data-drug-name="Korekta hiponatremii (Adrogue-Madias)" data-drug-dose="${naDef.requiredLiters} L płynu (deficyt ${naDef.totalDeficitMmol} mmol)" data-drug-route="i.v." data-drug-notes="Maks. zmiana 8-10 mmol/L/24h. Kontrola elektrolitów co 2-4h.">
            ${isNaAdded ? "✓ W planie" : "+ Dołącz korektę sodu do planu"}
          </button>
        </div>

        <!-- Acid-Base and Anion Gap -->
        <div class="pharm-card" style="grid-column: 1 / -1;">
          <h4><span>4. Luka Anionowa (AG), Delta Gap i Deficyt Wodorowęglanów</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="ab-na">Sód (Na+) [mmol/L]:</label>
              <input id="ab-na" type="number" value="${acidBaseInputs.na}">
            </div>
            <div class="pharm-field">
              <label for="ab-cl">Chlorki (Cl-) [mmol/L]:</label>
              <input id="ab-cl" type="number" value="${acidBaseInputs.cl}">
            </div>
          </div>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="ab-hco3">Wodorowęglany (HCO3-) w gazometrii [mmol/L]:</label>
              <input id="ab-hco3" type="number" value="${acidBaseInputs.hco3}">
            </div>
            <div class="pharm-field">
              <label for="ab-alb">Albumina w surowicy [g/dL]:</label>
              <input id="ab-alb" type="number" step="0.1" value="${acidBaseInputs.alb}">
            </div>
          </div>
          <div class="pharm-result-box">
            <strong>Luka anionowa (AG):</strong> ${ab.anionGap} mEq/L (skorygowana o albuminę: <strong>${ab.correctedAG} mEq/L</strong>)<br>
            <strong>Delta Gap:</strong> ${ab.deltaGap} mEq/L |
            <strong>Wyliczony deficyt wodorowęglanów:</strong> ${ab.bicarbDeficitMmol} mmol HCO3-<br>
            <strong>Ocena kliniczna:</strong> ${ab.interpretation}
          </div>
          <button type="button" class="pharm-add-btn ${isAbAdded ? "added" : ""}" data-drug-name="Korekta kwasicy metabolicznej" data-drug-dose="${ab.bicarbDeficitMmol > 0 ? `Deficyt ${ab.bicarbDeficitMmol} mmol HCO3- (podawać 1/2 dawki i.v.)` : "Monitorowanie RKZ"}" data-drug-route="i.v." data-drug-notes="${ab.interpretation.split(".")[0]}">
            ${isAbAdded ? "✓ W planie" : "+ Dołącz plan leczenia kwasicy"}
          </button>
        </div>
      </div>`;
  }

  function renderPharmPain(P, w, isChild) {
    const op = P.convertOpioid({
      drugFrom: opioidInputs.drugFrom,
      doseFrom: opioidInputs.doseFrom,
      drugTo: opioidInputs.drugTo,
    });

    const isParaAdded = visitSession.pharmacy.some((p) => p.name.includes("Paracetamol"));
    const isNsaidAdded = visitSession.pharmacy.some((p) => p.name.includes("NLPZ"));
    const isMetaAdded = visitSession.pharmacy.some((p) => p.name.includes("Metamizol"));
    const isOpAdded = visitSession.pharmacy.some((p) => p.name.includes("Schemat opioidowy"));

    const paraDose = isChild ? `${Math.round(w * 15)} mg (15 mg/kg)` : "1000 mg";
    const nsaidName = isChild ? "Ibuprofen" : "Ketoprofen";
    const nsaidDose = isChild ? `${Math.round(w * 10)} mg (10 mg/kg)` : "100 mg";

    return `
      <div class="pharm-grid">
        <!-- Non-opioids & WHO ladder -->
        <div class="pharm-card">
          <h4><span>1. Drabina Analgetyczna WHO · Stopień I (Nieopioidy)</span></h4>
          <div class="pharm-card-meta">Dostosowane do masy ciała ${w} kg (${isChild ? "pediatria" : "dorośli"})</div>

          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line);">
            <strong>Paracetamol:</strong> ${paraDose} co 6h p.o. / i.v. (max ${isChild ? "60 mg/kg/d" : "4000 mg/d"})
            <div style="margin-top: 4px;">
              <button type="button" class="pharm-add-btn ${isParaAdded ? "added" : ""}" data-drug-name="Paracetamol" data-drug-dose="${paraDose} co 6h" data-drug-route="p.o. / i.v." data-drug-notes="Brak działania przeciwzapalnego, bezpieczny żołądkowo">
                ${isParaAdded ? "✓ W planie" : "+ Dodaj Paracetamol"}
              </button>
            </div>
          </div>

          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line);">
            <strong>${nsaidName} (NLPZ):</strong> ${nsaidDose} ${isChild ? "co 8h p.o." : "co 12h i.v. / p.o."}
            <div style="margin-top: 4px;">
              <button type="button" class="pharm-add-btn ${isNsaidAdded ? "added" : ""}" data-drug-name="${nsaidName} (NLPZ)" data-drug-dose="${nsaidDose}" data-drug-route="${isChild ? "p.o." : "i.v. / p.o."}" data-drug-notes="Uwaga na wrzody, krwawienia i eGFR">
                ${isNsaidAdded ? "✓ W planie" : `+ Dodaj ${nsaidName}`}
              </button>
            </div>
          </div>

          <div>
            <strong>Metamizol (Pyralgina):</strong> ${isChild ? "10-15 mg/kg i.v./p.o." : "1000 mg co 8h i.v. / p.o."} (max 4g/d)
            <div style="margin-top: 4px;">
              <button type="button" class="pharm-add-btn ${isMetaAdded ? "added" : ""}" data-drug-name="Metamizol (Pyralgina)" data-drug-dose="${isChild ? `${Math.round(w * 12)} mg` : "1000 mg co 8h"}" data-drug-route="i.v. / p.o." data-drug-notes="Silny lek spazmolityczny i przeciwgorączkowy">
                ${isMetaAdded ? "✓ W planie" : "+ Dodaj Metamizol"}
              </button>
            </div>
          </div>
        </div>

        <!-- Opioid Converter (OME) -->
        <div class="pharm-card" style="grid-column: 1 / -1;">
          <h4><span>2. Konwerter Równoważnika Doustnego Morfiny (OME / Equianalgesic)</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="op-from">Aktualnie stosowany lek opioidowy:</label>
              <select id="op-from">
                <option value="morphine_po" ${opioidInputs.drugFrom === "morphine_po" ? "selected" : ""}>Morfina doustnie (p.o.)</option>
                <option value="morphine_iv" ${opioidInputs.drugFrom === "morphine_iv" ? "selected" : ""}>Morfina dożylnie/podskórnie (i.v. / s.c.)</option>
                <option value="oxycodone_po" ${opioidInputs.drugFrom === "oxycodone_po" ? "selected" : ""}>Oksykodon doustnie (p.o.)</option>
                <option value="oxycodone_iv" ${opioidInputs.drugFrom === "oxycodone_iv" ? "selected" : ""}>Oksykodon dożylnie (i.v.)</option>
                <option value="tramadol_po" ${opioidInputs.drugFrom === "tramadol_po" ? "selected" : ""}>Tramadol doustnie (p.o.)</option>
                <option value="fentanyl_patch_mcgh" ${opioidInputs.drugFrom === "fentanyl_patch_mcgh" ? "selected" : ""}>Fentanyl plaster transdermalny (mcg/h)</option>
              </select>
            </div>
            <div class="pharm-field">
              <label for="op-dose">Dobowa dawka stosowana (mg/d lub mcg/h dla plastra):</label>
              <input id="op-dose" type="number" min="0" step="5" value="${opioidInputs.doseFrom}">
            </div>
          </div>
          <div class="pharm-field">
            <label for="op-to">Docelowy lek, na który następuje zamiana:</label>
            <select id="op-to">
              <option value="morphine_po" ${opioidInputs.drugTo === "morphine_po" ? "selected" : ""}>Morfina doustnie (p.o.)</option>
              <option value="morphine_iv" ${opioidInputs.drugTo === "morphine_iv" ? "selected" : ""}>Morfina dożylnie/podskórnie (i.v. / s.c.)</option>
              <option value="oxycodone_po" ${opioidInputs.drugTo === "oxycodone_po" ? "selected" : ""}>Oksykodon doustnie (p.o.)</option>
              <option value="oxycodone_iv" ${opioidInputs.drugTo === "oxycodone_iv" ? "selected" : ""}>Oksykodon dożylnie (i.v.)</option>
              <option value="tramadol_po" ${opioidInputs.drugTo === "tramadol_po" ? "selected" : ""}>Tramadol doustnie (p.o.)</option>
              <option value="fentanyl_patch_mcgh" ${opioidInputs.drugTo === "fentanyl_patch_mcgh" ? "selected" : ""}>Fentanyl plaster transdermalny (mcg/h)</option>
            </select>
          </div>
          <div class="pharm-result-box">
            <strong>Dobowy równoważnik doustnej morfiny (OME):</strong> ${op.oralMorphineEquiv} mg OME / dobę<br>
            <strong>Równoważna wyliczona dawka leku docelowego:</strong> <b>${op.convertedDose}</b> mg/dobę (lub mcg/h)<br>
            <strong>Zalecana bezpieczna dawka startowa przy rotacji (redukcja 25-50%):</strong> ${+(op.convertedDose * 0.5).toFixed(1)} – ${+(op.convertedDose * 0.75).toFixed(1)} mg/dobę<br>
            <strong>Dawka ratunkowa na ból przebijający:</strong> <b>${op.breakthroughDoseRange} mg</b> (1/10 do 1/6 dawki dobowej)
          </div>
          <div class="pharm-alert">
            <strong>⚠️ ZASADA ROTACJI OPIOIDÓW:</strong> ${op.notes}
          </div>
          <button type="button" class="pharm-add-btn ${isOpAdded ? "added" : ""}" data-drug-name="Schemat opioidowy (${op.drugTo})" data-drug-dose="${op.convertedDose} mg/d (ból przebijający: ${op.breakthroughDose} mg)" data-drug-route="wg protokołu" data-drug-notes="Równoważnik ${op.oralMorphineEquiv} mg OME/d. Redukcja dawki startowej o 25-50%.">
            ${isOpAdded ? "✓ W planie" : "+ Dołącz schemat opioidowy do planu"}
          </button>
        </div>
      </div>`;
  }

  function renderPharmNPOA(P, w, isChild) {
    const categories = ["all", "Pozaszpitalne zapalenie płuc (CAP)", "Zakażenia układu moczowego (ZUM)", "Sepsa o nieznanym punkcie wyjścia", "Zapalenie opon mózgowo-rdzeniowych (ZOMR)", "Zakażenia skóry i tkanek miękkich"];
    const q = npoaSearch.toLowerCase().trim();

    const filtered = P.antibioticsNPOA.filter((reg) => {
      const matchCat = npoaCategory === "all" || reg.category === npoaCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const hay = (reg.category + " " + reg.subgroup + " " + reg.firstLine + " " + reg.alternative + " " + reg.notes).toLowerCase();
      return hay.includes(q);
    });

    return `
      <div>
        <div class="pharm-calc-pair" style="margin-bottom: 14px;">
          <div class="pharm-field">
            <label for="npoa-category-select">Filtruj wg jednostki chorobowej:</label>
            <select id="npoa-category-select">
              ${categories.map((c) => `<option value="${escape(c)}" ${npoaCategory === c ? "selected" : ""}>${c === "all" ? "Wszystkie kategorie zaleceń NPOA" : escape(c)}</option>`).join("")}
            </select>
          </div>
          <div class="pharm-field">
            <label for="npoa-search-input">Szukaj antybiotyku lub objawu:</label>
            <input id="npoa-search-input" type="search" placeholder="np. amoksycylina, posiew, alergia, ceftriakson..." value="${escape(npoaSearch)}">
          </div>
        </div>

        <div class="pharm-alert" style="background:#f0fdf4;border-color:#bbf7d0;border-left-color:#16a34a;color:#14532d;margin-bottom:14px;">
          <strong>🛡️ GŁÓWNE ZASADY NPOA:</strong> Zawsze pobierz krew lub materiał na posiew PRZED podaniem pierwszej dawki antybiotyku. W sepsie czas do podania <1h. Monitoruj stężenia wankomycyny i aminoglikozydów. Przy eGFR < 50 ml/min/1.73m² zweryfikuj dawkę leku.
        </div>

        <div class="pharm-grid">
          ${filtered.map((reg) => {
            const isAdded = visitSession.pharmacy.some((p) => p.name.includes(reg.subgroup) || p.dose.includes(reg.firstLine.split(" ")[0]));
            return `
              <div class="pharm-card">
                <h4><span>${escape(reg.category)}</span></h4>
                <div class="pharm-card-meta"><strong>${escape(reg.subgroup)}</strong></div>
                <div class="pharm-card-dose" style="font-size:13px;line-height:1.45;">I rzut: ${escape(reg.firstLine)}</div>
                <div style="font-size:12px;color:#444;line-height:1.45;margin-bottom:8px;">
                  <strong>Alternatywa / alergia:</strong> ${escape(reg.alternative)}
                </div>
                <div style="font-size:11.5px;color:var(--muted);line-height:1.45;margin-bottom:12px;">
                  <em>${escape(reg.notes)}</em>
                </div>
                <button type="button" class="pharm-add-btn ${isAdded ? "added" : ""}" data-drug-name="Antybiotyk: ${escape(reg.subgroup)}" data-drug-dose="${escape(reg.firstLine)}" data-drug-route="wg wskazań" data-drug-notes="Alternatywa: ${escape(reg.alternative)}">
                  ${isAdded ? "✓ W planie" : "+ Dołącz schemat NPOA do planu"}
                </button>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  // Event handlers for Pharmacology Suite
  const pharmBtn = $("pharm-btn");
  if (pharmBtn) pharmBtn.onclick = () => openPharmModal();
  const wtPharmBtn = $("wt-pharm-btn");
  if (wtPharmBtn) wtPharmBtn.onclick = () => openPharmModal();
  const pharmCloseBtn = $("pharm-close");
  if (pharmCloseBtn) pharmCloseBtn.onclick = closePharmModal;

  const pharmWeightInput = $("pharm-weight");
  if (pharmWeightInput) {
    pharmWeightInput.addEventListener("input", () => {
      updatePharmPatientBar();
      renderPharmModal(currentPharmTab);
    });
  }

  const pharmEstBtn = $("pharm-est-btn");
  if (pharmEstBtn) {
    pharmEstBtn.onclick = () => {
      const P = (typeof window !== "undefined" && window.ClinicalPharmacology) || (typeof globalThis !== "undefined" && globalThis.ClinicalPharmacology);
      const ageVal = parseFloat($("pharm-age")?.value);
      if (P && Number.isFinite(ageVal)) {
        const est = P.estimatePediatricWeight(ageVal);
        if (pharmWeightInput) pharmWeightInput.value = est;
        updatePharmPatientBar();
        renderPharmModal(currentPharmTab);
        toast(`Oszacowano masę ciała: ${est} kg (APLS dla ${ageVal} lat)`);
      } else {
        toast("Podaj wiek dziecka w latach, aby oszacować wagę.");
      }
    };
  }

  const pharmTabsContainer = document.querySelector(".pharm-tabs");
  if (pharmTabsContainer) {
    pharmTabsContainer.addEventListener("click", (ev) => {
      const tabBtn = ev.target.closest("[data-pharm-tab]");
      if (tabBtn) {
        renderPharmModal(tabBtn.dataset.pharmTab);
      }
    });
  }

  const pharmPanelEl = $("pharm-panel");
  if (pharmPanelEl) {
    pharmPanelEl.addEventListener("input", (ev) => {
      const id = ev.target.id;
      if (id === "na-serum") sodiumInputs.serumNa = parseFloat(ev.target.value) || 120;
      else if (id === "na-target") sodiumInputs.targetNa = parseFloat(ev.target.value) || 130;
      else if (id === "na-infusate") sodiumInputs.infusateNa = parseFloat(ev.target.value) || 154;
      else if (id === "na-sex") sodiumInputs.sex = ev.target.value;
      else if (id === "ab-na") acidBaseInputs.na = parseFloat(ev.target.value) || 140;
      else if (id === "ab-cl") acidBaseInputs.cl = parseFloat(ev.target.value) || 104;
      else if (id === "ab-hco3") acidBaseInputs.hco3 = parseFloat(ev.target.value) || 24;
      else if (id === "ab-alb") acidBaseInputs.alb = parseFloat(ev.target.value) || 4.0;
      else if (id === "op-from") opioidInputs.drugFrom = ev.target.value;
      else if (id === "op-dose") opioidInputs.doseFrom = parseFloat(ev.target.value) || 0;
      else if (id === "op-to") opioidInputs.drugTo = ev.target.value;
      else if (id === "npoa-category-select") npoaCategory = ev.target.value;
      else if (id === "npoa-search-input") npoaSearch = ev.target.value;
      renderPharmModal(currentPharmTab);
    });
    pharmPanelEl.addEventListener("change", (ev) => {
      const id = ev.target.id;
      if (["na-infusate", "na-sex", "op-from", "op-to", "npoa-category-select"].includes(id)) {
        if (id === "na-infusate") sodiumInputs.infusateNa = parseFloat(ev.target.value) || 154;
        else if (id === "na-sex") sodiumInputs.sex = ev.target.value;
        else if (id === "op-from") opioidInputs.drugFrom = ev.target.value;
        else if (id === "op-to") opioidInputs.drugTo = ev.target.value;
        else if (id === "npoa-category-select") npoaCategory = ev.target.value;
        renderPharmModal(currentPharmTab);
      }
    });
  }

  const pharmAddPlanBtn = $("pharm-add-plan-btn");
  if (pharmAddPlanBtn) {
    pharmAddPlanBtn.onclick = () => {
      closePharmModal();
      openSOAPDialog();
    };
  }

  document.addEventListener("click", (ev) => {
    const drugBtn = ev.target.closest(".tile-drug-add-btn, .pharm-add-btn");
    if (drugBtn) {
      const name = drugBtn.dataset.drugName;
      const dose = drugBtn.dataset.drugDose;
      const route = drugBtn.dataset.drugRoute;
      const notes = drugBtn.dataset.drugNotes;
      if (name && dose) {
        addPrescription({ name, dose, route, notes });
        drugBtn.classList.add("added");
        drugBtn.textContent = "✓ W planie";
      }
      return;
    }
    const openPharmAction = ev.target.closest("[data-action='open-pharm']");
    if (openPharmAction) {
      openPharmModal();
      return;
    }
    const openDiagAction = ev.target.closest("[data-action='open-diag']");
    if (openDiagAction) {
      const targetTab = openDiagAction.dataset.diagTab || null;
      openDiagnosticsModal(targetTab);
      return;
    }
  });

  // --- Clinical Diagnostics Suite: POCUS & Acute Laboratory Medicine ---
  function addDiagnosticRecord(item) {
    if (!item || !item.title) return;
    const existsIdx = visitSession.diagnostics.findIndex((d) => d.title === item.title);
    if (existsIdx >= 0) {
      visitSession.diagnostics[existsIdx] = item;
    } else {
      visitSession.diagnostics.push(item);
    }
    updateSOAPBadge();
    toast(`Zapisano w karcie: ${item.title}`);

    // Active decision support: match branch if pathological
    if (item.alert || item.isPositive) {
      const g = visibleGraphs()[0];
      const outgoing = g ? g.edges.filter((e) => e.from === selected?.id) : [];
      const matched = outgoing.find((e) => {
        const lbl = (e.label || "").toLowerCase();
        return /\btak\b|dodatn|obecn|wysok|ciężk|piln|eskalac|drenaż|tamponad|zator|zawał|krwaw/.test(lbl);
      });
      if (matched) {
        activeBranch = matched.id;
        toast(`Dopasowano gałąź eskalacji: ${matched.label || "Pilne postępowanie"}`);
        draw();
        renderPanel();
        if (walkthroughActive) renderWalkthrough();
      }
    }
  }

  function findNodeContextualDiagnostics(node) {
    const D = (typeof window !== "undefined" && window.ClinicalDiagnostics) || (typeof globalThis !== "undefined" && globalThis.ClinicalDiagnostics);
    if (!node || !D) return [];
    const text = ((node.title || "") + " " + (node.data?.body || "") + " " + list(node.data?.red).join(" ")).toLowerCase();
    const items = [];

    // Trauma / Shock -> eFAST
    if (/uraz|wypad|krwotok|wstrząs hipowol|tępy uraz|obrażen/.test(text)) {
      items.push({
        type: "POCUS",
        title: "Protokół eFAST",
        summary: "Ocena 6 okien anatomicznych pod kątem wolnego płynu i odmy",
        tab: "efast",
      });
    }

    // Dyspnea / Asthma / COPD / Pneumothorax / Pulmonary edema -> BLUE Protocol
    if (/duszno|astm|obturac|pochp|obrzęk płuc|odm|świsty|rzężen/.test(text)) {
      items.push({
        type: "POCUS",
        title: "Protokół BLUE",
        summary: "Ultrasonograficzna ocena profili płucnych (A, B, B', A', C, PLAPS)",
        tab: "blue",
      });
    }

    // Chest pain / ACS / Cardiac / Tamponade / PE -> hs-cTn, D-dimer, FOCUS
    if (/klatce piersiow|zawał|ozw|dławic|nstem|stemi|zamostkow/.test(text)) {
      items.push({
        type: "LAB",
        title: "Kinetyka hs-cTn 0/1h",
        summary: "Algorytm ESC wykluczenia / potwierdzenia zawału serca NSTEMI",
        tab: "lab",
      });
    }

    if (/zator|d-dimer|zakrzep|dvt|duszno.*nagł/.test(text)) {
      items.push({
        type: "LAB",
        title: "Age-adjusted D-dimer",
        summary: "Próg odcięcia dostosowany do wieku (>50 lat: wiek × 10 µg/L)",
        tab: "lab",
      });
      items.push({
        type: "POCUS",
        title: "FOCUS & DVT CUS",
        summary: "Ocena przeciążenia prawej komory (RV strain) i kompresji żył",
        tab: "focus",
      });
    }

    // Sepsis / Shock / Acidosis -> Lactates, ABG
    if (/seps|wstrząs|posocznic|kwasic|mleczan|resuscytac/.test(text)) {
      items.push({
        type: "LAB",
        title: "Klirens mleczanów",
        summary: "Ocena ustępowania hipoperfuzji (spadek ≥20% w 2-4h)",
        tab: "lab",
      });
      items.push({
        type: "LAB",
        title: "Gazometria (ABG) & P/F",
        summary: "Równowaga kwasowo-zasadowa i wskaźnik Horowitza (PaO2/FiO2)",
        tab: "lab",
      });
    }

    return items;
  }

  function renderTileDiagBox(items) {
    if (!items || items.length === 0) return "";
    return `
      <section class="tile-diag-box">
        <div class="tile-diag-head">
          <span class="tile-diag-title">🔬 Sugerowana diagnostyka przyłóżkowa POCUS / Lab</span>
          <button type="button" class="diag-quick-open-btn" data-action="open-diag">Otwórz pracownię ➔</button>
        </div>
        <div class="tile-diag-list">
          ${items.map((item) => {
            const isRecorded = visitSession.diagnostics.some((d) => d.title === item.title);
            return `
              <div class="tile-diag-item">
                <div>
                  <strong>[${escape(item.type)}] ${escape(item.title)}</strong>: <span style="color:#555">${escape(item.summary)}</span>
                </div>
                <div style="display:flex;gap:6px;">
                  <button type="button" class="tile-diag-add-btn ${isRecorded ? "added" : ""}" data-diag-title="${escape(item.title)}" data-diag-tab="${escape(item.tab)}" data-action="open-diag">
                    ${isRecorded ? "✓ W karcie" : "Zbadaj ➔"}
                  </button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </section>`;
  }

  function openDiagnosticsModal(tab = null) {
    const dialog = $("diagnostics-dialog");
    if (!dialog) return;
    if (tab) currentDiagTab = tab;
    renderDiagnosticsModal(currentDiagTab);
    if (!dialog.open) dialog.showModal();
  }

  function closeDiagnosticsModal() {
    const dialog = $("diagnostics-dialog");
    if (dialog?.open) dialog.close();
  }

  function renderDiagnosticsModal(tab = "efast") {
    currentDiagTab = tab;
    const D = (typeof window !== "undefined" && window.ClinicalDiagnostics) || (typeof globalThis !== "undefined" && globalThis.ClinicalDiagnostics);
    const panelEl = $("diagnostics-panel");
    const descEl = $("diagnostics-description");
    if (!panelEl || !descEl || !D) return;

    const tabs = document.querySelectorAll(".diagnostics-tab");
    tabs.forEach((t) => {
      const isSel = t.dataset.diagTab === tab;
      t.setAttribute("aria-selected", String(isSel));
    });

    if (tab === "efast") {
      descEl.textContent = "Protokół eFAST (Extended Focused Assessment with Sonography in Trauma): ocena 6 okien anatomicznych w poszukiwaniu wolnego płynu i odmy opłucnowej.";
      panelEl.innerHTML = renderDiagEFAST(D);
    } else if (tab === "blue") {
      descEl.textContent = "Protokół BLUE (Bedside Lung Ultrasound in Emergency — Lichtenstein): różnicowanie ostrej niewydolności oddechowej na podstawie profili płucnych.";
      panelEl.innerHTML = renderDiagBLUE(D);
    } else if (tab === "focus") {
      descEl.textContent = "Echokardiografia przyłóżkowa w stanach nagłych (FOCUS) oraz 2-punktowa ultrasonografia uciskowa żył (DVT CUS).";
      panelEl.innerHTML = renderDiagFOCUS(D);
    } else if (tab === "lab") {
      descEl.textContent = "Kluczowe algorytmy laboratoryjne medycyny ratunkowej: kinetyka troponiny ESC, D-dimer skorygowany o wiek, klirens mleczanów i gazometria ze wskaźnikiem Horowitza.";
      panelEl.innerHTML = renderDiagLab(D);
    }
  }

  function renderDiagEFAST(D) {
    const evalResult = D.evaluateEFAST(efastState);
    const windowsDef = [
      { key: "ruq", label: "RUQ / Morison", tag: "Wątroba / Nerka", desc: "Zachyłek wątrobowo-nerkowy" },
      { key: "luq", label: "LUQ / Śledziona", tag: "Śledziona / Nerka", desc: "Zachyłek śledzionowo-nerkowy" },
      { key: "pelvic", label: "Miednica", tag: "Pęcherz / Macica", desc: "Zachyłek Douglasa / pęcherzowo-odbytniczy" },
      { key: "pericardial", label: "Osierdzie", tag: "Podmieczykowate", desc: "Worek osierdziowy i kurczliwość" },
      { key: "pleuralRight", label: "Opłucna prawa", tag: "Płuca RKO", desc: "Linia środkowo-obojczykowa i pachowa" },
      { key: "pleuralLeft", label: "Opłucna lewa", tag: "Płuca LKO", desc: "Linia środkowo-obojczykowa i pachowa" },
    ];

    const isRecorded = visitSession.diagnostics.some((d) => d.title === "Protokół eFAST");

    return `
      <div>
        <div class="diag-grid">
          ${windowsDef.map((win) => {
            const currentVal = efastState[win.key];
            const isPleural = win.key.startsWith("pleural");
            const isPericardial = win.key === "pericardial";
            return `
              <div class="pocus-window-card">
                <div class="pocus-window-head">
                  <strong>${escape(win.label)}</strong>
                  <span class="pocus-window-tag">${escape(win.tag)}</span>
                </div>
                <div style="font-size:12px;color:var(--muted);margin-bottom:6px;">${escape(win.desc)}</div>
                <div class="pocus-status-btns">
                  <button type="button" class="pocus-btn normal ${currentVal === "normal" ? "selected" : ""}" data-efast-win="${win.key}" data-val="normal">✓ Norma</button>
                  <button type="button" class="pocus-btn fluid ${currentVal === "fluid" ? "selected" : ""}" data-efast-win="${win.key}" data-val="fluid">+ Płyn</button>
                  ${isPericardial ? `<button type="button" class="pocus-btn tamponade ${currentVal === "tamponade" ? "selected" : ""}" data-efast-win="${win.key}" data-val="tamponade">! Tamponada</button>` : ""}
                  ${isPleural ? `<button type="button" class="pocus-btn ptx ${currentVal === "pneumothorax" ? "selected" : ""}" data-efast-win="${win.key}" data-val="pneumothorax">! Odma</button>` : ""}
                  <button type="button" class="pocus-btn ${currentVal === "nt" ? "selected" : ""}" data-efast-win="${win.key}" data-val="nt">NT</button>
                </div>
              </div>`;
          }).join("")}
        </div>

        <div class="diag-alert ${evalResult.isPositive ? "" : "ok"}">
          <strong>${evalResult.isPositive ? "⚠️ WYNIK PATOLOGICZNY:" : "✓ WYNIK PRAWIDŁOWY:"}</strong> ${escape(evalResult.summary)}
          ${evalResult.action ? `<br><strong>Postępowanie:</strong> ${escape(evalResult.action)}` : ""}
        </div>

        <button type="button" id="diag-save-efast-btn" class="pharm-add-btn ${isRecorded ? "added" : ""}" style="font-size:12.5px;padding:8px 14px;">
          ${isRecorded ? "✓ Zaktualizowano w karcie" : "+ Dołącz wynik eFAST do dokumentacji"}
        </button>
      </div>`;
  }

  function renderDiagBLUE(D) {
    const res = D.evaluateBLUE(blueState);
    const isRecorded = visitSession.diagnostics.some((d) => d.title === "Protokół BLUE");

    return `
      <div class="diag-grid">
        <div class="diag-card">
          <h4><span>Profil ultrasonograficzny płuc (BLUE)</span></h4>
          <div class="pharm-field">
            <label for="blue-profile-select">Profil dominujący:</label>
            <select id="blue-profile-select">
              <option value="A" ${blueState.profileType === "A" ? "selected" : ""}>Profil A (linie A, ślizganie obecne) ➔ Astma / POChP / ZP</option>
              <option value="B" ${blueState.profileType === "B" ? "selected" : ""}>Profil B (liczne obustronne linie B) ➔ Obrzęk płuc kardiogenny</option>
              <option value="B_prime" ${blueState.profileType === "B_prime" ? "selected" : ""}>Profil B' (linie B bez ślizgania) ➔ Zapalenie płuc</option>
              <option value="A_prime" ${blueState.profileType === "A_prime" ? "selected" : ""}>Profil A' (linie A bez ślizgania + punkt płucny) ➔ Odma</option>
              <option value="C" ${blueState.profileType === "C" ? "selected" : ""}>Profil C (konsolidacja podopłucnowa) ➔ Zapalenie płuc</option>
            </select>
          </div>

          <div style="margin: 10px 0;">
            <label class="pocus-sign-check">
              <input type="checkbox" id="blue-sliding-chk" ${blueState.lungSliding ? "checked" : ""}>
              <span><strong>Ślizganie opłucnej (Lung sliding)</strong> zachowane (objaw brzegu morskiego w M-mode)</span>
            </label>
            <label class="pocus-sign-check">
              <input type="checkbox" id="blue-lungpoint-chk" ${blueState.lungPoint ? "checked" : ""}>
              <span><strong>Punkt płucny (Lung point)</strong> obecny (patognomoniczny dla odmy)</span>
            </label>
            <label class="pocus-sign-check">
              <input type="checkbox" id="blue-plaps-chk" ${blueState.plaps ? "checked" : ""}>
              <span><strong>Objaw PLAPS</strong> (płyn w zachyłku przeponowo-żebrowym w linii pachowej)</span>
            </label>
            <label class="pocus-sign-check">
              <input type="checkbox" id="blue-dvt-chk" ${blueState.dvtPresent ? "checked" : ""}>
              <span><strong>Dodatni DVT CUS</strong> (brak zapadalności żyły udowej / podkolanowej)</span>
            </label>
          </div>
        </div>

        <div class="diag-card">
          <h4><span>Interpretacja kliniczna Lichtensteina</span></h4>
          <div class="pharm-card-dose">Rozpoznanie: ${escape(res.primaryDiagnosis)}</div>
          <div style="font-size:12.5px;line-height:1.6;margin-bottom:12px;">
            <strong>Profil BLUE:</strong> ${escape(res.profile)}<br>
            <strong>Zalecane postępowanie:</strong> ${escape(res.action)}
          </div>
          ${res.alert ? `<div class="diag-alert" style="margin:8px 0 12px;">⚠️ Stan zagrożenia życia — pilna interwencja!</div>` : ""}
          <button type="button" id="diag-save-blue-btn" class="pharm-add-btn ${isRecorded ? "added" : ""}">
            ${isRecorded ? "✓ Zaktualizowano w karcie" : "+ Dołącz protokół BLUE do karty"}
          </button>
        </div>
      </div>`;
  }

  function renderDiagFOCUS(D) {
    const res = D.evaluateFOCUS(focusState);
    const isRecorded = visitSession.diagnostics.some((d) => d.title === "FOCUS & DVT CUS");

    return `
      <div class="diag-grid">
        <div class="diag-card">
          <h4><span>Parametry echokardiograficzne (FOCUS)</span></h4>
          <div class="pharm-field">
            <label for="focus-effusion-select">Płyn w worku osierdziowym:</label>
            <select id="focus-effusion-select">
              <option value="none" ${focusState.pericardialEffusion === "none" ? "selected" : ""}>Brak płynu w osierdziu</option>
              <option value="small" ${focusState.pericardialEffusion === "small" ? "selected" : ""}>Mały płyn (<10 mm)</option>
              <option value="moderate" ${focusState.pericardialEffusion === "moderate" ? "selected" : ""}>Umiarkowany płyn (10-20 mm)</option>
              <option value="tamponade" ${focusState.pericardialEffusion === "tamponade" ? "selected" : ""}>Tamponada (rozkurczowe zapadanie RV/RA)</option>
            </select>
          </div>
          <div class="pharm-field">
            <label for="focus-rv-select">Wielkość i przeciążenie prawej komory (RV):</label>
            <select id="focus-rv-select">
              <option value="false" ${!focusState.rvEnlargement ? "selected" : ""}>Prawidłowa RV (RV < LV)</option>
              <option value="true" ${focusState.rvEnlargement ? "selected" : ""}>Przeciążenie prawej komory (RV > LV / McConnell sign w ZP)</option>
            </select>
          </div>
          <div class="pharm-field">
            <label for="focus-lv-select">Kurczliwość lewej komory (Eyeball EF):</label>
            <select id="focus-lv-select">
              <option value="normal" ${focusState.lvContractility === "normal" ? "selected" : ""}>Prawidłowa frakcja wyrzutowa (EF 55-70%)</option>
              <option value="hyperdynamic" ${focusState.lvContractility === "hyperdynamic" ? "selected" : ""}>Hiperdynamiczna (sepsa / hipowolemia)</option>
              <option value="mild" ${focusState.lvContractility === "mild" ? "selected" : ""}>Łagodna dysfunkcja (EF 40-50%)</option>
              <option value="severe" ${focusState.lvContractility === "severe" ? "selected" : ""}>Ciężka dysfunkcja skurczowa (EF < 30%)</option>
            </select>
          </div>
        </div>

        <div class="diag-card">
          <h4><span>Żyła główna dolna (IVC) & Kompresja żył (DVT)</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="focus-ivc-dia">Średnica IVC [mm]:</label>
              <input id="focus-ivc-dia" type="number" min="5" max="35" value="${focusState.ivcDiameterMm}">
            </div>
            <div class="pharm-field">
              <label for="focus-ivc-col">Zapadalność na wdechu [%]:</label>
              <input id="focus-ivc-col" type="number" min="0" max="100" value="${focusState.ivcCollapsibility}">
            </div>
          </div>
          <div class="pharm-field">
            <label for="focus-dvt-fem">Żyła udowa wspólna (CFV):</label>
            <select id="focus-dvt-fem">
              <option value="compressible" ${focusState.dvtFemoral === "compressible" ? "selected" : ""}>Prawidłowa kompresja (podatna)</option>
              <option value="non_compressible" ${focusState.dvtFemoral === "non_compressible" ? "selected" : ""}>Brak kompresji (DVT dodatnia)</option>
            </select>
          </div>
          <div class="pharm-field">
            <label for="focus-dvt-pop">Żyła podkolanowa (PV):</label>
            <select id="focus-dvt-pop">
              <option value="compressible" ${focusState.dvtPopliteal === "compressible" ? "selected" : ""}>Prawidłowa kompresja (podatna)</option>
              <option value="non_compressible" ${focusState.dvtPopliteal === "non_compressible" ? "selected" : ""}>Brak kompresji (DVT dodatnia)</option>
            </select>
          </div>
        </div>

        <div class="diag-card" style="grid-column: 1 / -1;">
          <h4><span>Syntetyczna ocena hemodynamiczna FOCUS</span></h4>
          <div class="diag-result-box">
            <strong>Ocena wolemii i CVP:</strong> ${escape(res.volumeStatus)}<br>
            <strong>Wnioski:</strong> ${escape(res.summary)}<br>
            <strong>Postępowanie:</strong> ${escape(res.action)}
          </div>
          ${res.alert ? `<div class="diag-alert">⚠️ Zidentyfikowano krytyczną patologię sercowo-naczyniową!</div>` : ""}
          <button type="button" id="diag-save-focus-btn" class="pharm-add-btn ${isRecorded ? "added" : ""}" style="margin-top:10px;">
            ${isRecorded ? "✓ Zaktualizowano w karcie" : "+ Dołącz badanie FOCUS & DVT do karty"}
          </button>
        </div>
      </div>`;
  }

  function renderDiagLab(D) {
    const ctnRes = D.evaluateHsTroponin({
      assay: labState.cTnAssay,
      ctn0: labState.cTn0,
      ctn1: labState.cTn1,
      deltaHours: labState.cTnDeltaH,
    });
    const ddimerRes = D.evaluateAgeAdjustedDdimer({
      age: labState.dDimerAge,
      ddimer: labState.dDimerVal,
    });
    const lactRes = D.evaluateLactateClearance({
      lactate0: labState.lact0,
      lactate1: labState.lact1,
      hours: labState.lactH,
    });
    const abgRes = D.evaluateABG({
      ph: labState.abgPh,
      pco2: labState.abgPco2,
      po2: labState.abgPo2,
      hco3: labState.abgHco3,
      be: labState.abgBe,
      fio2: labState.abgFio2,
    });

    const isCtnRecorded = visitSession.diagnostics.some((d) => d.title.includes("hs-cTn"));
    const isDdimerRecorded = visitSession.diagnostics.some((d) => d.title.includes("D-dimer"));
    const isLactRecorded = visitSession.diagnostics.some((d) => d.title.includes("mleczanów"));
    const isAbgRecorded = visitSession.diagnostics.some((d) => d.title.includes("Gazometria"));

    return `
      <div class="diag-grid">
        <!-- hs-cTn ESC 0/1h kinetics -->
        <div class="diag-card">
          <h4><span>1. Kinetyka hs-cTn 0/1h (ESC NSTE-ACS)</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-ctn-assay">Test troponiny:</label>
              <select id="lab-ctn-assay">
                <option value="hs-cTnT" ${labState.cTnAssay === "hs-cTnT" ? "selected" : ""}>hs-cTnT (Roche)</option>
                <option value="hs-cTnI" ${labState.cTnAssay === "hs-cTnI" ? "selected" : ""}>hs-cTnI (Abbott/Siemens)</option>
              </select>
            </div>
            <div class="pharm-field">
              <label for="lab-ctn-0">0h [ng/L]:</label>
              <input id="lab-ctn-0" type="number" value="${labState.cTn0}">
            </div>
          </div>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-ctn-1">1h kontrola [ng/L]:</label>
              <input id="lab-ctn-1" type="number" value="${labState.cTn1}">
            </div>
            <div class="pharm-field">
              <label for="lab-ctn-delta">Odstęp [godz.]:</label>
              <input id="lab-ctn-delta" type="number" value="${labState.cTnDeltaH}" min="1" max="3">
            </div>
          </div>
          <div class="diag-result-box">
            <strong>Kategoria ESC:</strong> <span style="text-transform:uppercase;font-weight:700;color:${ctnRes.category === "rule_in" ? "#b91c1c" : ctnRes.category === "rule_out" ? "#15803d" : "#b45309"}">${ctnRes.category}</span><br>
            ${escape(ctnRes.interpretation)}<br>
            <small style="color:var(--muted)">${escape(ctnRes.recommendation)}</small>
          </div>
          <button type="button" id="diag-save-ctn-btn" class="pharm-add-btn ${isCtnRecorded ? "added" : ""}" style="margin-top:10px;">
            ${isCtnRecorded ? "✓ W karcie" : "+ Dołącz hs-cTn do karty"}
          </button>
        </div>

        <!-- Age-adjusted D-dimer -->
        <div class="diag-card">
          <h4><span>2. Age-Adjusted D-Dimer (ADJUST-PE)</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-ddimer-age">Wiek pacjenta [lata]:</label>
              <input id="lab-ddimer-age" type="number" value="${labState.dDimerAge}">
            </div>
            <div class="pharm-field">
              <label for="lab-ddimer-val">D-dimery [µg/L]:</label>
              <input id="lab-ddimer-val" type="number" value="${labState.dDimerVal}">
            </div>
          </div>
          <div class="diag-result-box">
            <strong>Próg odcięcia:</strong> ${ddimerRes.cutoff} µg/L ${ddimerRes.isAgeAdjusted ? "(skorygowany o wiek)" : "(standardowy)"}<br>
            <strong>Status:</strong> ${ddimerRes.isElevated ? "<span style='color:#b91c1c;font-weight:700;'>PODWYŻSZONY (+)</span>" : "<span style='color:#15803d;font-weight:700;'>UJEMNY (-)</span>"}<br>
            <small style="color:var(--muted)">${escape(ddimerRes.recommendation)}</small>
          </div>
          <button type="button" id="diag-save-ddimer-btn" class="pharm-add-btn ${isDdimerRecorded ? "added" : ""}" style="margin-top:10px;">
            ${isDdimerRecorded ? "✓ W karcie" : "+ Dołącz D-dimer do karty"}
          </button>
        </div>

        <!-- Lactate clearance -->
        <div class="diag-card">
          <h4><span>3. Klirens mleczanów w sepsie / wstrząsie</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-lact-0">Mleczany 0h [mmol/L]:</label>
              <input id="lab-lact-0" type="number" step="0.1" value="${labState.lact0}">
            </div>
            <div class="pharm-field">
              <label for="lab-lact-1">Mleczany kontrola [mmol/L]:</label>
              <input id="lab-lact-1" type="number" step="0.1" value="${labState.lact1}">
            </div>
          </div>
          <div class="diag-result-box">
            <strong>Klirens mleczanów:</strong> ${lactRes.clearancePct}% w czasie ${lactRes.hours}h (${lactRes.isAdequate ? "≥20% — norma" : "<20% — niedostateczny"})<br>
            <small style="color:var(--muted)">${escape(lactRes.recommendation)}</small>
          </div>
          <button type="button" id="diag-save-lact-btn" class="pharm-add-btn ${isLactRecorded ? "added" : ""}" style="margin-top:10px;">
            ${isLactRecorded ? "✓ W karcie" : "+ Dołącz mleczany do karty"}
          </button>
        </div>

        <!-- ABG & Horowitz index -->
        <div class="diag-card">
          <h4><span>4. Gazometria (ABG) & Wskaźnik Horowitza</span></h4>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-abg-ph">pH:</label>
              <input id="lab-abg-ph" type="number" step="0.01" value="${labState.abgPh}">
            </div>
            <div class="pharm-field">
              <label for="lab-abg-pco2">pCO2 [mmHg]:</label>
              <input id="lab-abg-pco2" type="number" value="${labState.abgPco2}">
            </div>
          </div>
          <div class="pharm-calc-pair">
            <div class="pharm-field">
              <label for="lab-abg-po2">pO2 [mmHg]:</label>
              <input id="lab-abg-po2" type="number" value="${labState.abgPo2}">
            </div>
            <div class="pharm-field">
              <label for="lab-abg-fio2">FiO2 (0.21 - 1.0):</label>
              <input id="lab-abg-fio2" type="number" step="0.05" value="${labState.abgFio2}">
            </div>
          </div>
          <div class="diag-result-box">
            <strong>Zaburzenie:</strong> ${escape(abgRes.disturbance)}<br>
            <strong>PaO2/FiO2:</strong> ${abgRes.pfRatio} mmHg ➔ ${escape(abgRes.ardsSeverity)}
          </div>
          <button type="button" id="diag-save-abg-btn" class="pharm-add-btn ${isAbgRecorded ? "added" : ""}" style="margin-top:10px;">
            ${isAbgRecorded ? "✓ W karcie" : "+ Dołącz gazometrię do karty"}
          </button>
        </div>
      </div>`;
  }

  // Event handlers for Diagnostics Suite
  const diagBtn = $("diagnostics-btn");
  if (diagBtn) diagBtn.onclick = () => openDiagnosticsModal();
  const wtDiagBtn = $("wt-diagnostics-btn");
  if (wtDiagBtn) wtDiagBtn.onclick = () => openDiagnosticsModal();
  const diagCloseBtn = $("diagnostics-close");
  if (diagCloseBtn) diagCloseBtn.onclick = closeDiagnosticsModal;

  const diagTabsContainer = document.querySelector(".diagnostics-tabs");
  if (diagTabsContainer) {
    diagTabsContainer.addEventListener("click", (ev) => {
      const tabBtn = ev.target.closest("[data-diag-tab]");
      if (tabBtn) {
        renderDiagnosticsModal(tabBtn.dataset.diagTab);
      }
    });
  }

  const diagPanelEl = $("diagnostics-panel");
  if (diagPanelEl) {
    diagPanelEl.addEventListener("click", (ev) => {
      const efastBtn = ev.target.closest("[data-efast-win]");
      if (efastBtn) {
        const win = efastBtn.dataset.efastWin;
        const val = efastBtn.dataset.val;
        efastState[win] = val;
        renderDiagnosticsModal("efast");
        return;
      }

      const D = (typeof window !== "undefined" && window.ClinicalDiagnostics) || (typeof globalThis !== "undefined" && globalThis.ClinicalDiagnostics);
      if (!D) return;

      if (ev.target.id === "diag-save-efast-btn") {
        const res = D.evaluateEFAST(efastState);
        addDiagnosticRecord({
          type: "POCUS",
          title: "Protokół eFAST",
          summary: res.summary,
          action: res.action,
          isPositive: res.isPositive,
          alert: res.hasTamponade || (res.isPositive && res.hasPneumothorax),
        });
        renderDiagnosticsModal("efast");
      } else if (ev.target.id === "diag-save-blue-btn") {
        const res = D.evaluateBLUE(blueState);
        addDiagnosticRecord({
          type: "POCUS",
          title: "Protokół BLUE",
          summary: res.summary,
          action: res.action,
          alert: res.alert,
        });
        renderDiagnosticsModal("blue");
      } else if (ev.target.id === "diag-save-focus-btn") {
        const res = D.evaluateFOCUS(focusState);
        addDiagnosticRecord({
          type: "POCUS",
          title: "FOCUS & DVT CUS",
          summary: res.summary,
          action: res.action,
          alert: res.alert,
        });
        renderDiagnosticsModal("focus");
      } else if (ev.target.id === "diag-save-ctn-btn") {
        const res = D.evaluateHsTroponin({
          assay: labState.cTnAssay, ctn0: labState.cTn0, ctn1: labState.cTn1, deltaHours: labState.cTnDeltaH,
        });
        addDiagnosticRecord({
          type: "LAB",
          title: `hs-cTn (${res.assay})`,
          summary: res.interpretation,
          action: res.recommendation,
          alert: res.category === "rule_in",
        });
        renderDiagnosticsModal("lab");
      } else if (ev.target.id === "diag-save-ddimer-btn") {
        const res = D.evaluateAgeAdjustedDdimer({ age: labState.dDimerAge, ddimer: labState.dDimerVal });
        addDiagnosticRecord({
          type: "LAB",
          title: "Age-adjusted D-dimer",
          summary: res.interpretation,
          action: res.recommendation,
          alert: res.isElevated,
        });
        renderDiagnosticsModal("lab");
      } else if (ev.target.id === "diag-save-lact-btn") {
        const res = D.evaluateLactateClearance({ lactate0: labState.lact0, lactate1: labState.lact1, hours: labState.lactH });
        addDiagnosticRecord({
          type: "LAB",
          title: "Klirens mleczanów",
          summary: res.interpretation,
          action: res.recommendation,
          alert: !res.isAdequate,
        });
        renderDiagnosticsModal("lab");
      } else if (ev.target.id === "diag-save-abg-btn") {
        const res = D.evaluateABG({ ph: labState.abgPh, pco2: labState.abgPco2, po2: labState.abgPo2, hco3: labState.abgHco3, be: labState.abgBe, fio2: labState.abgFio2 });
        addDiagnosticRecord({
          type: "LAB",
          title: "Gazometria (ABG)",
          summary: res.interpretation,
          action: res.ardsSeverity,
          alert: res.pfRatio <= 200,
        });
        renderDiagnosticsModal("lab");
      }
    });

    diagPanelEl.addEventListener("change", (ev) => {
      const id = ev.target.id;
      if (id === "blue-profile-select") blueState.profileType = ev.target.value;
      else if (id === "blue-sliding-chk") blueState.lungSliding = ev.target.checked;
      else if (id === "blue-lungpoint-chk") blueState.lungPoint = ev.target.checked;
      else if (id === "blue-plaps-chk") blueState.plaps = ev.target.checked;
      else if (id === "blue-dvt-chk") blueState.dvtPresent = ev.target.checked;
      else if (id === "focus-effusion-select") focusState.pericardialEffusion = ev.target.value;
      else if (id === "focus-rv-select") focusState.rvEnlargement = ev.target.value === "true";
      else if (id === "focus-lv-select") focusState.lvContractility = ev.target.value;
      else if (id === "focus-dvt-fem") focusState.dvtFemoral = ev.target.value;
      else if (id === "focus-dvt-pop") focusState.dvtPopliteal = ev.target.value;
      else if (id === "lab-ctn-assay") labState.cTnAssay = ev.target.value;
      renderDiagnosticsModal(currentDiagTab);
    });

    diagPanelEl.addEventListener("input", (ev) => {
      const id = ev.target.id;
      if (id === "focus-ivc-dia") focusState.ivcDiameterMm = parseFloat(ev.target.value) || 18;
      else if (id === "focus-ivc-col") focusState.ivcCollapsibility = parseFloat(ev.target.value) || 50;
      else if (id === "lab-ctn-0") labState.cTn0 = parseFloat(ev.target.value) || 0;
      else if (id === "lab-ctn-1") labState.cTn1 = parseFloat(ev.target.value) || 0;
      else if (id === "lab-ctn-delta") labState.cTnDeltaH = parseFloat(ev.target.value) || 1;
      else if (id === "lab-ddimer-age") labState.dDimerAge = parseFloat(ev.target.value) || 50;
      else if (id === "lab-ddimer-val") labState.dDimerVal = parseFloat(ev.target.value) || 0;
      else if (id === "lab-lact-0") labState.lact0 = parseFloat(ev.target.value) || 0;
      else if (id === "lab-lact-1") labState.lact1 = parseFloat(ev.target.value) || 0;
      else if (id === "lab-abg-ph") labState.abgPh = parseFloat(ev.target.value) || 7.4;
      else if (id === "lab-abg-pco2") labState.abgPco2 = parseFloat(ev.target.value) || 40;
      else if (id === "lab-abg-po2") labState.abgPo2 = parseFloat(ev.target.value) || 90;
      else if (id === "lab-abg-fio2") labState.abgFio2 = parseFloat(ev.target.value) || 0.21;
      renderDiagnosticsModal(currentDiagTab);
    });
  }

  const diagAddSoapBtn = $("diagnostics-add-soap-btn");
  if (diagAddSoapBtn) {
    diagAddSoapBtn.onclick = () => {
      closeDiagnosticsModal();
      openSOAPDialog();
    };
  }

  // --- Clinical Decision Support (CDS) Safety Engine & Drug-Drug Interactions (DDI) ---
  function getSafetyEngine() {
    return (
      (typeof window !== "undefined" && window.ClinicalSafety) ||
      (typeof globalThis !== "undefined" && globalThis.ClinicalSafety)
    );
  }

  function evaluateCurrentSafety() {
    const S = getSafetyEngine();
    if (!S) {
      return {
        egfrRes: { egfr: 90, stage: "G1", severity: "normal" },
        report: { alerts: [], criticalCount: 0, warningCount: 0, isSafe: true, summary: "CDS nieaktywny" },
      };
    }
    const egfrRes = S.calculateEGFR({
      creatinineMgDl: patientSafetyProfile.creatinine,
      age: patientSafetyProfile.age,
      sex: patientSafetyProfile.sex,
    });
    patientSafetyProfile.egfr = egfrRes.egfr;
    const report = S.evaluatePatientSafety({
      patientProfile: patientSafetyProfile,
      orderedDrugs: visitSession.pharmacy || [],
    });
    return { egfrRes, report };
  }

  function updateSafetyBadge() {
    const { report } = evaluateCurrentSafety();
    const badge = $("safety-badge");
    const btn = $("safety-btn");
    const wtBtn = $("wt-safety-btn");
    const hasOverrides = (visitSession.safetyOverrides || []).length > 0;

    const stateClass = report.criticalCount > 0 ? "critical" : report.warningCount > 0 ? "warning" : "safe";

    if (badge) {
      if (report.criticalCount > 0) {
        badge.textContent = report.criticalCount;
      } else if (report.warningCount > 0) {
        badge.textContent = report.warningCount;
      } else {
        badge.textContent = "✓";
      }
    }

    [btn, wtBtn].forEach((b) => {
      if (b) {
        b.classList.remove("safe", "warning", "critical");
        b.classList.add(stateClass);
        b.title = report.summary + (hasOverrides ? " (Zarejestrowano odstępstwo kliniczne)" : "");
      }
    });
  }

  function openSafetyModal() {
    const dialog = $("safety-dialog");
    if (!dialog) return;
    renderSafetyModal();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeSafetyModal() {
    const dialog = $("safety-dialog");
    if (dialog?.open) dialog.close();
  }

  function renderSafetyModal() {
    const S = getSafetyEngine();
    const { egfrRes, report } = evaluateCurrentSafety();

    const scrInput = $("safety-creatinine");
    if (scrInput) scrInput.value = patientSafetyProfile.creatinine;

    const chkPen = $("allergy-penicillin");
    if (chkPen) chkPen.checked = patientSafetyProfile.allergies.includes("penicillin_anaphylaxis");
    const chkAsp = $("allergy-aspirin");
    if (chkAsp) chkAsp.checked = patientSafetyProfile.allergies.includes("aspirin_asthma");

    const chkUlc = $("risk-ulcer");
    if (chkUlc) chkUlc.checked = patientSafetyProfile.comorbidities.includes("peptic_ulcer");
    const chkQt = $("risk-qt");
    if (chkQt) chkQt.checked = patientSafetyProfile.comorbidities.includes("prolonged_qt");
    const chkPreg = $("risk-pregnancy");
    if (chkPreg) chkPreg.checked = patientSafetyProfile.comorbidities.includes("pregnancy");

    const egfrEl = $("safety-egfr-display");
    if (egfrEl && S) {
      const crcl = S.calculateCockcroftGault({
        creatinineMgDl: patientSafetyProfile.creatinine,
        age: patientSafetyProfile.age,
        weightKg: patientSafetyProfile.weight,
        sex: patientSafetyProfile.sex,
      });
      egfrEl.className = `safety-egfr-badge ${egfrRes.severity}`;
      egfrEl.innerHTML = `eGFR: <strong>${egfrRes.egfr} ml/min/1.73m²</strong> (${escape(egfrRes.stage.split(" ")[0])})<br><small style="font-weight:normal; opacity:0.9;">CKD-EPI 2021 · CrCl: ~${crcl} ml/min</small>`;
    }

    const summaryBox = $("safety-summary-box");
    if (summaryBox) {
      summaryBox.className = `safety-summary-box ${report.criticalCount > 0 ? "critical" : report.warningCount > 0 ? "warning" : "safe"}`;
      summaryBox.innerHTML = `
        <strong>${report.criticalCount > 0 ? "⛔ KRYTYCZNE ZAGROŻENIE BEZPIECZEŃSTWA (Kat. X)" : report.warningCount > 0 ? "⚠️ OSTRZEŻENIE O INTERAKCJI (Kat. D)" : "🛡️ PLAN BEZPIECZNY (Zgodny z wytycznymi)"}</strong>
        <div>${escape(report.summary)}</div>
        ${visitSession.safetyOverrides && visitSession.safetyOverrides.length > 0 ? `<div style="margin-top:6px; font-weight:600; color:#2e7d32;">✓ Zarejestrowano ${visitSession.safetyOverrides.length} autoryzowane odstępstwo(-a) kliniczne.</div>` : ""}
      `;
    }

    const ordersEl = $("safety-orders-list");
    if (ordersEl) {
      if (!visitSession.pharmacy || visitSession.pharmacy.length === 0) {
        ordersEl.innerHTML = `<span style="color:#777; font-size:12px;">Brak zaordynowanych leków w bieżącym planie leczenia. Dodaj leki z kafelków lub leksykonu (Leki & Płyny).</span>`;
      } else {
        ordersEl.innerHTML = visitSession.pharmacy
          .map(
            (p) => `<span class="safety-order-pill">💊 ${escape(p.name)}: <b>${escape(p.dose)}</b> (${escape(p.route || "i.v.")})</span>`
          )
          .join("");
      }
    }

    const alertsEl = $("safety-alerts-container");
    if (alertsEl) {
      if (report.alerts.length === 0) {
        alertsEl.innerHTML = `
          <div class="safety-summary-box safe" style="margin:0;">
            <strong>🛡️ Brak przeciwwskazań i istotnych interakcji:</strong>
            Wszystkie zaordynowane leki są zgodne z wybranym profilem nerkowym, alergicznym i klinicznym pacjenta.
          </div>
        `;
      } else {
        alertsEl.innerHTML = report.alerts
          .map(
            (a) => `
          <div class="safety-alert-card ${a.category === "X" ? "cat-x" : "cat-d"}">
            <div class="safety-alert-header">
              <span class="safety-cat-badge ${a.category === "X" ? "cat-x" : "cat-d"}">
                ${a.category === "X" ? "KATEGORIA X — BEZWZGLĘDNIE PRZECIWWSKAZANE" : "KATEGORIA D — POWAŻNA INTERAKCJA"}
              </span>
              <strong style="font-size: 13.5px;">${escape(a.title)}</strong>
            </div>
            <div class="safety-alert-mechanism">
              <strong>Mechanizm i ryzyko:</strong> ${escape(a.mechanism)}
            </div>
            <div class="safety-alert-action">
              <strong>Zalecane postępowanie:</strong> ${escape(a.action)}
            </div>
          </div>
        `
          )
          .join("");
      }
    }
  }

  function authorizeSafetyOverride(reason) {
    if (!reason || !reason.trim()) return false;
    const { report } = evaluateCurrentSafety();
    visitSession.safetyOverrides.push({
      timestamp: Date.now(),
      reason: reason.trim(),
      alertsSnapshot: report.alerts.map((a) => ({ id: a.id, title: a.title, category: a.category })),
    });
    updateSafetyBadge();
    toast("Zarejestrowano odstępstwo kliniczne (Clinical Override).");
    return true;
  }

  const safetyBtn = $("safety-btn");
  if (safetyBtn) safetyBtn.onclick = () => openSafetyModal();
  const wtSafetyBtn = $("wt-safety-btn");
  if (wtSafetyBtn) wtSafetyBtn.onclick = () => openSafetyModal();
  const safetyCloseBtn = $("safety-close");
  if (safetyCloseBtn) safetyCloseBtn.onclick = () => closeSafetyModal();

  const safetyScrInput = $("safety-creatinine");
  if (safetyScrInput) {
    const handleScr = (ev) => {
      const val = parseFloat(ev.target.value);
      if (!isNaN(val) && val > 0) {
        patientSafetyProfile.creatinine = val;
        renderSafetyModal();
        updateSafetyBadge();
      }
    };
    safetyScrInput.addEventListener("input", handleScr);
    safetyScrInput.addEventListener("change", handleScr);
  }

  function toggleAllergy(key, isChecked) {
    if (isChecked) {
      if (!patientSafetyProfile.allergies.includes(key)) patientSafetyProfile.allergies.push(key);
    } else {
      patientSafetyProfile.allergies = patientSafetyProfile.allergies.filter((k) => k !== key);
    }
    renderSafetyModal();
    updateSafetyBadge();
  }

  function toggleComorbidity(key, isChecked) {
    if (isChecked) {
      if (!patientSafetyProfile.comorbidities.includes(key)) patientSafetyProfile.comorbidities.push(key);
    } else {
      patientSafetyProfile.comorbidities = patientSafetyProfile.comorbidities.filter((k) => k !== key);
    }
    renderSafetyModal();
    updateSafetyBadge();
  }

  const chkPen = $("allergy-penicillin");
  if (chkPen) chkPen.addEventListener("change", (e) => toggleAllergy("penicillin_anaphylaxis", e.target.checked));
  const chkAsp = $("allergy-aspirin");
  if (chkAsp) chkAsp.addEventListener("change", (e) => toggleAllergy("aspirin_asthma", e.target.checked));

  const chkUlc = $("risk-ulcer");
  if (chkUlc) chkUlc.addEventListener("change", (e) => toggleComorbidity("peptic_ulcer", e.target.checked));
  const chkQt = $("risk-qt");
  if (chkQt) chkQt.addEventListener("change", (e) => toggleComorbidity("prolonged_qt", e.target.checked));
  const chkPreg = $("risk-pregnancy");
  if (chkPreg) chkPreg.addEventListener("change", (e) => toggleComorbidity("pregnancy", e.target.checked));

  const safetyOverrideBtn = $("safety-override-btn");
  if (safetyOverrideBtn) {
    safetyOverrideBtn.onclick = () => {
      const reasonEl = $("safety-override-reason");
      const reason = reasonEl ? reasonEl.value.trim() : "";
      if (!reason) {
        toast("Wpisz uzasadnienie kliniczne przed zatwierdzeniem odstępstwa!");
        if (reasonEl) reasonEl.focus();
        return;
      }
      authorizeSafetyOverride(reason);
      if (reasonEl) reasonEl.value = "";
      renderSafetyModal();
    };
  }

  const safetySoapBtn = $("safety-view-soap-btn");
  if (safetySoapBtn) {
    safetySoapBtn.onclick = () => {
      closeSafetyModal();
      openSOAPDialog();
    };
  }

  window.ClinicalVisit = {
    session: visitSession,
    patientSafetyProfile,
    recordStep,
    generateSOAPReport,
    resetSession,
    updateSOAPBadge,
    startWalkthrough,
    exitWalkthrough,
    printPDFDossier,
    matchScoreToBranch,
    findNodeScore,
    addPrescription,
    openPharmModal,
    closePharmModal,
    findNodeContextualDrugs,
    addDiagnosticRecord,
    openDiagnosticsModal,
    closeDiagnosticsModal,
    findNodeContextualDiagnostics,
    evaluateCurrentSafety,
    updateSafetyBadge,
    openSafetyModal,
    closeSafetyModal,
    authorizeSafetyOverride,
  };

  window.addEventListener("pagehide", () => {
    if (pendingSave) persist();
  });
  new ResizeObserver(() => fit()).observe($("stage"));
  load().then(() => {
    renderNav();
    chooseModule(active);
    updateSafetyBadge();
  });
})();
