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
      const count = visitSession.history.length;
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
    const calculator = ["gcs", "news2", "pews"].find((key) =>
      n.title.toLowerCase().includes(key),
    );
    const outgoing = g.edges.filter((e) => e.from === n.id);

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
        <div class="branch-list">
          ${branchCardsHTML}
        </div>
      </section>`;
    } else {
      decisionCompartmentHTML = `
      <section class="decision-compartment terminal">
        <h3>Punkt końcowy schematu</h3>
        <p class="compartment-subtitle">Ten kafelek stanowi zakończenie bieżącej ścieżki decyzyjnej. Sprawdź zalecenia dyspozycyjne poniżej.</p>
      </section>`;
    }

    panel.innerHTML = `<div class="detail-head"><div class="kicker">${escape(TYPES[n.type])} · ${n.cohort === "a" ? "DOROŚLI" : n.cohort === "p" ? "DZIECI" : "WSPÓLNE"}</div><h2>${escape(n.title)}</h2><div class="meta">${n.custom ? "Treść własna / edytowana. Wymaga ponownej weryfikacji." : `Synteza źródeł sprawdzona: ${D.reviewed}. Nie oznacza aktualizacji wytycznej w tym dniu.`}</div><div class="detail-toolbar"><button data-action="edit">Edytuj krok</button><button data-action="child">+ Gałąź</button>${calculator ? `<button data-action="calculate" data-score="${calculator}">Oblicz ${calculator.toUpperCase()}</button>` : ""}</div></div><div class="detail-body"><p>${escape(d.body || "Brak opisu — możesz dodać własny.")}</p>${decisionCompartmentHTML}${SECTIONS.map(
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
    lines.push("");

    // P - Plan
    lines.push("[P] POSTĘPOWANIE, ZALECENIA I DYSPOZYCJA (PLAN)");
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
    checkedVars.clear();
    activeBranch = null;
    updateSOAPBadge();
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

  window.ClinicalVisit = {
    session: visitSession,
    recordStep,
    generateSOAPReport,
    resetSession,
    updateSOAPBadge,
  };

  window.addEventListener("pagehide", () => {
    if (pendingSave) persist();
  });
  new ResizeObserver(() => fit()).observe($("stage"));
  load().then(() => {
    renderNav();
    chooseModule(active);
  });
})();
