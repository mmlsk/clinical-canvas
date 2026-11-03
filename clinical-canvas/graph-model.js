"use strict";
(() => {
  const D = globalThis.ClinicalData || (typeof window !== "undefined" ? window.ClinicalData : null);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const list = (x) => (Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : []);
  const ensureStr = (x, max = 18000) => {
    if (typeof x !== "string" || x.length > max)
      throw Error("Nieprawidłowy lub zbyt długi tekst.");
    return x;
  };

  const TYPES = Object.freeze({
    assessment: "Ocena / wywiad i badanie",
    decision: "Decyzja",
    urgent: "Pilna eskalacja",
    test: "Diagnostyka",
    outcome: "Dalsze postępowanie",
    scale: "Skala / punktacja",
    note: "Notatka",
  });

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

  function defaults(modules = D?.modules, revision = D?.revision) {
    if (!modules) throw Error("Brak danych ClinicalData.");
    const g = {};
    for (const m of modules)
      for (const c of ["a", "p"]) g[`${m.id}.${c}`] = makeGraph(m, c);
    return { schema_version: 2, content_revision: revision, graphs: g };
  }

  function validate(raw, modules = D?.modules, revision = D?.revision) {
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
        content_revision: revision,
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
        modules &&
        !modules.some((m) => key === `${m.id}.a` || key === `${m.id}.p`)
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

  function mergeWithDefaults(imported, modules = D?.modules, revision = D?.revision) {
    return validate(
      {
        schema_version: 2,
        graphs: { ...defaults(modules, revision).graphs, ...imported.graphs },
      },
      modules,
      revision,
    );
  }

  globalThis.ClinicalModel = Object.freeze({
    TYPES,
    makeGraph,
    defaults,
    validate,
    migrate,
    mergeWithDefaults,
    ensureStr,
    list,
  });
})();
