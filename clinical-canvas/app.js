"use strict";
(() => {
  const D = window.ClinicalData;
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
  const TYPES = {
    assessment: "Ocena / wywiad i badanie",
    decision: "Decyzja",
    urgent: "Pilna eskalacja",
    test: "Diagnostyka",
    outcome: "Dalsze postępowanie",
    scale: "Skala / punktacja",
    note: "Notatka",
  };
  const NS = "http://www.w3.org/2000/svg";
  let active = "chest",
    cohort = "a",
    selected = null,
    editing = false,
    query = "",
    transform = { x: 20, y: 20, k: 1 };
  let undo = [],
    redo = [],
    pendingSave,
    toastTimer,
    drag = null,
    counter = 0;
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
      Object.values(store.graphs).some((g) => g.nodes.some((n) => n.id === id))
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
  function makeGraph(m, c) {
    const spec = m[c],
      prefix = `${m.id}.${c}.`,
      src = spec.src || [];
    const n = (id, type, x, y, title, fields = {}) => ({
      id: prefix + id,
      type,
      x,
      y,
      title,
      cohort: c,
      data: {
        src,
        hy: [spec.logic],
        gem: spec.pit?.length ? [spec.pit.at(-1)] : [],
        ...fields,
      },
      custom: false,
    });
    const nodes = [
      n("start", "assessment", 260, 0, "Wywiad i badanie", {
        body:
          spec.scope ||
          "Ustal dynamikę, czynniki ryzyka i stan wyjściowy. Kliknij krok, aby rozwinąć szczegóły.",
        hx: spec.hx,
        exam: spec.exam,
        red: spec.red,
        logic: spec.logic,
      }),
      n("red", "decision", 260, 132, "Natychmiastowe zagrożenie?", {
        body: "Niestabilność ABCDE lub sytuacja wymagająca natychmiastowej interwencji: eskaluj. Pozostałe objawowe czerwone flagi sprawdź w następnej decyzji; nie każda oznacza resuscytację.",
        red: [
          "Niewydolność oddechowa, wstrząs lub ciężka hipoperfuzja, brak ochrony dróg oddechowych, utrzymujące się drgawki, szybko pogarszająca się świadomość.",
          "Stan wymagający natychmiastowej ścieżki specjalistycznej zgodnie z opisem objawu.",
        ],
        hx: spec.hx,
        exam: spec.exam,
      }),
      n("urgent", "urgent", 0, 132, "Pilna eskalacja", {
        body: spec.urgent,
        red: spec.red,
        pit: spec.pit,
      }),
      n("question", "decision", 260, 264, spec.question, {
        body: spec.logic,
        red: spec.red,
        pit: spec.pit,
      }),
      n("yes", "test", 0, 396, spec.yes.title, {
        body: spec.yes.body,
        tests: spec.yes.tests,
        pit: spec.pit,
        logic: spec.logic,
      }),
      n("no", "test", 520, 396, spec.no.title, {
        body: spec.no.body,
        tests: spec.no.tests,
        pit: spec.pit,
        logic: spec.logic,
      }),
      n("exit", "outcome", 260, 548, "Ocena wyniku i dalszy plan", {
        body: "Po badaniu lub interwencji wróć do oceny chorego. Ujemny wynik ma znaczenie tylko w populacji, dla której test jest właściwy.",
        dispo: spec.dispo,
        pit: spec.pit,
        logic: spec.logic,
      }),
    ];
    const edge = (from, to, label) => ({
      id: prefix + from + "-" + to,
      from: prefix + from,
      to: prefix + to,
      label,
    });
    // Post-test edges are intentionally unlabelled: both endpoints already imply reassessment.
    return {
      title: m.title,
      cohort: c,
      nodes,
      edges: [
        edge("start", "red", ""),
        edge("red", "urgent", "TAK"),
        edge("red", "question", "NIE"),
        edge("question", "yes", "TAK"),
        edge("question", "no", "NIE"),
        edge("yes", "exit", ""),
        edge("no", "exit", ""),
      ],
    };
  }
  function defaults() {
    const g = {};
    for (const m of D.modules)
      for (const c of ["a", "p"]) g[`${m.id}.${c}`] = makeGraph(m, c);
    return { schema_version: 2, content_revision: D.revision, graphs: g };
  }
  function validate(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      raw.schema_version !== 2 ||
      !raw.graphs ||
      Array.isArray(raw.graphs)
    )
      throw Error("Oczekiwany format Clinical Canvas v2.");
    const result = {
        schema_version: 2,
        content_revision: D.revision,
        graphs: {},
      },
      keys = Object.keys(raw.graphs);
    if (keys.length > 90) throw Error("Za dużo modułów.");
    let total = 0;
    const globalNodes = new Set(),
      globalEdges = new Set();
    for (const key of keys) {
      if (
        !/^[a-zA-Z0-9_.-]{1,100}$/.test(key) ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        throw Error("Nieprawidłowy identyfikator modułu.");
      if (
        key !== "legacy.all" &&
        !D.modules.some((m) => key === `${m.id}.a` || key === `${m.id}.p`)
      )
        throw Error(
          "Nieznany moduł. Własne elementy dodawaj do istniejących ścieżek.",
        );
      const g = raw.graphs[key];
      if (
        !g ||
        !Array.isArray(g.nodes) ||
        !Array.isArray(g.edges) ||
        g.nodes.length > 400 ||
        g.edges.length > 800
      )
        throw Error("Nieprawidłowy rozmiar grafu.");
      total += g.nodes.length;
      if (total > 2000) throw Error("Łączny limit: 2000 węzłów.");
      const ids = new Set(),
        edgeIds = new Set(),
        nodes = [];
      for (const n of g.nodes) {
        const id = ensureStr(n.id, 160);
        if (
          !id ||
          ids.has(id) ||
          globalNodes.has(id) ||
          !Object.hasOwn(TYPES, n.type)
        )
          throw Error("Duplikat ID lub nieznany typ węzła.");
        ids.add(id);
        globalNodes.add(id);
        if (
          !Number.isFinite(n.x) ||
          !Number.isFinite(n.y) ||
          Math.abs(n.x) > 50000 ||
          Math.abs(n.y) > 50000
        )
          throw Error("Nieprawidłowe współrzędne.");
        const data = {};
        if (n.data && typeof n.data === "object") {
          for (const field of ["body", "logic"])
            if (n.data[field] != null) data[field] = ensureStr(n.data[field]);
          for (const field of [
            "hx",
            "exam",
            "red",
            "tests",
            "pit",
            "hy",
            "gem",
            "dispo",
            "src",
          ]) {
            const items = list(n.data[field]);
            if (items.length > 80) throw Error("Zbyt wiele wpisów w polu.");
            data[field] = items.map((x) => ensureStr(x));
          }
        }
        nodes.push({
          id,
          title: ensureStr(n.title, 500),
          type: n.type,
          x: n.x,
          y: n.y,
          cohort: ["a", "p", "all"].includes(n.cohort) ? n.cohort : "all",
          data,
          custom: !!n.custom,
        });
      }
      const edges = g.edges.map((e) => {
        const id = ensureStr(e.id, 200);
        if (
          !id ||
          edgeIds.has(id) ||
          globalEdges.has(id) ||
          !ids.has(e.from) ||
          !ids.has(e.to) ||
          e.from === e.to
        )
          throw Error("Duplikat lub nieprawidłowe połączenie.");
        edgeIds.add(id);
        globalEdges.add(id);
        return {
          id,
          from: e.from,
          to: e.to,
          label: ensureStr(e.label || "", 300),
        };
      });
      result.graphs[key] = {
        title: ensureStr(g.title || "Moduł własny", 500),
        cohort: ["a", "p", "all"].includes(g.cohort) ? g.cohort : "all",
        nodes,
        edges,
      };
    }
    return result;
  }
  function migrate(raw) {
    if (!Array.isArray(raw?.nodes) || !Array.isArray(raw?.edges))
      throw Error("To nie jest stary eksport makiety.");
    const map = {
      phase: "assessment",
      decision: "decision",
      action: "test",
      scale: "scale",
      risk: "urgent",
      exam: "assessment",
      lab: "test",
      context: "note",
      outcome: "outcome",
    };
    const g = {
      title: "Archiwum v1 / własna makieta",
      cohort: "all",
      nodes: raw.nodes.map((n) => ({
        id: n.id,
        title: n.t,
        type: map[n.type] || "note",
        x: n.x,
        y: n.y,
        cohort: "all",
        custom: true,
        data: {
          body: n.d?.opis || "",
          logic: n.d?.logika || "",
          ...Object.fromEntries(
            ["red", "pit", "hy", "gem", "src"].map((k) => [k, list(n.d?.[k])]),
          ),
        },
      })),
      edges: raw.edges.map((e, i) => ({
        id: `legacy-edge-${i}`,
        from: e.from,
        to: e.to,
        label: e.label || "",
      })),
    };
    return validate({ schema_version: 2, graphs: { "legacy.all": g } });
  }
  function mergeWithDefaults(imported) {
    return validate({
      schema_version: 2,
      graphs: { ...defaults().graphs, ...imported.graphs },
    });
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
          isSelected = selected?.kind === "edge" && selected.id === e.id;
        const edge = S("g", { "data-edge": e.id });
        edge.append(
          S("path", { class: "edge-hit", d: r.d }),
          S("path", { class: `edge ${isSelected ? "selected" : ""}`, d: r.d }),
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
        ng.appendChild(
          S(
            "text",
            { class: "node-sub", x: 14, y: 94 },
            "Szczegóły / badania / źródła",
          ),
        );
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
  function selectNode(id) {
    selected = { kind: "node", id };
    editing = false;
    draw();
    renderPanel();
  }
  function chooseModule(id) {
    active = id;
    editing = false;
    selected = null;
    renderNav();
    renderHeading();
    const g = visibleGraphs()[0];
    if (g?.nodes[0]) selected = { kind: "node", id: g.nodes[0].id };
    draw();
    renderPanel();
    fit();
  }
  const SECTIONS = [
    ["hx", "Badanie podmiotowe"],
    ["exam", "Badanie przedmiotowe"],
    ["red", "Czerwone flagi"],
    ["tests", "Badania i interpretacja"],
    ["dispo", "Dalsze postępowanie"],
    ["pit", "Pułapki / critical aspects"],
    ["hy", "High-yield"],
    ["gem", "Hidden gems"],
  ];
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
    const { n } = info,
      d = n.data || {};
    if (editing) {
      renderEditor(n);
      return;
    }
    const calculator = ["gcs", "news2", "pews"].find(key => n.title.toLowerCase().includes(key));
    panel.innerHTML = `<div class="detail-head"><div class="kicker">${escape(TYPES[n.type])} · ${n.cohort === "a" ? "DOROŚLI" : n.cohort === "p" ? "DZIECI" : "WSPÓLNE"}</div><h2>${escape(n.title)}</h2><div class="meta">${n.custom ? "Treść własna / edytowana. Wymaga ponownej weryfikacji." : `Synteza źródeł sprawdzona: ${D.reviewed}. Nie oznacza aktualizacji wytycznej w tym dniu.`}</div><div class="detail-toolbar"><button data-action="edit">Edytuj krok</button><button data-action="child">+ Gałąź</button>${calculator ? `<button data-action="calculate" data-score="${calculator}">Oblicz ${calculator.toUpperCase()}</button>` : ""}</div></div><div class="detail-body"><p>${escape(d.body || "Brak opisu — możesz dodać własny.")}</p>${SECTIONS.map(
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
  panel.addEventListener("click", (ev) => {
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
    if (action === "delete") {
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
    if (action === "delete-edge") {
      checkpoint();
      for (const g of Object.values(store.graphs))
        g.edges = g.edges.filter((e) => e.id !== selected.id);
      selected = null;
      draw();
      renderPanel();
      schedule();
    }
  });
  $("modules").addEventListener("click", (ev) => {
    const button = ev.target.closest("[data-module]");
    if (button) chooseModule(button.dataset.module);
  });
  $("steps").addEventListener("click", (ev) => {
    const button = ev.target.closest("[data-step]");
    if (button) {
      selectNode(button.dataset.step);
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
    if (!drag) return;
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
    if (drag?.mode === "node" && drag.moved) schedule();
    drag = null;
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
      `<ul><li>Wybierz objaw i populację. Obie ścieżki można porównać, lecz nie są jednym algorytmem dawkowania.</li><li>Przeciągnij tło, zmień zoom lub dopasuj widok. Kliknij krok albo wybierz go z listy pod płótnem.</li><li>W szczegółach przejdź do edycji. Zmiana nie traci fokusu i oznacza treść jako własną.</li><li>Dodaj gałąź, skalę lub pusty węzeł. Połącz kontrolką „Połącz” w edytorze albo przeciągnij port do drugiego węzła.</li><li>Cofnij/ponów; Ctrl/Cmd+Z poza polem tekstowym. Eksport JSON to przenośna kopia.</li><li>W podglądzie zapis działa na serwerze i jest oddzielny dla odwiedzającego. SQLite i serwer są częścią środowiska podglądowego, nie usługą produkcyjną z gwarancją trwałości. Zachowuj eksporty JSON.</li><li>Wersja samodzielna zapisuje lokalnie. Brak współedycji na żywo i synchronizacji między urządzeniami. Przy konflikcie kart wyeksportuj zmiany i użyj „Wczytaj zapis”. Nie wpisuj danych pacjentów.</li><li>Import starego JSON tworzy osobne archiwum i nie zastępuje nowych ścieżek. Archiwum kliniczne wymaga ponownej weryfikacji.</li></ul>`,
    );
  $("export").onclick = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "clinical-canvas-v2.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast("Przygotowano kopię JSON.");
  };
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
  window.addEventListener("pagehide", () => {
    if (pendingSave) persist();
  });
  new ResizeObserver(() => fit()).observe($("stage"));
  load().then(() => {
    renderNav();
    chooseModule(active);
  });
})();
