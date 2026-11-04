"use strict";
// Pure, deterministic scoring. No DOM, persistence, patient identity or treatment orders.
// Sources and variant names are part of the calculator UI; do not interchange PEWS variants.
(() => {
  const fail = (...errors) => ({ ok: false, errors, total: null, parts: [] });
  const finite = (v, min, max, integer = true) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max &&
    (!integer || Number.isInteger(v));
  const part = (label, value, score) => ({ label, value, score });
  function gcs(x) {
    if (!["adult", "childOver5", "young"].includes(x.population))
      return fail("Wybierz populację dla standardowej GCS.");
    if (x.population === "young")
      return fail("U dzieci do 5. roku życia włącznie użyj odpowiedniej pediatrycznej GCS. Ten kalkulator nie przelicza pGCS.");
    const defs = [["E", "Otwieranie oczu", x.e, 4], ["V", "Odpowiedź słowna", x.v, 5], ["M", "Najlepsza odpowiedź ruchowa", x.m, 6]];
    const missing = defs.filter(([, , v, max]) => v !== "NT" && !finite(v, 1, max)).map(([k]) => k);
    if (missing.length) return fail("Uzupełnij poprawnie składowe: " + missing.join(", ") + ".");
    const parts = defs.map(([k, label, v]) => part(label, `${k}${v}`, v));
    const nt = defs.some(([, , v]) => v === "NT");
    const total = nt ? null : x.e + x.v + x.m;
    const components = defs.map(([k, , v]) => `${k}${v}`).join(" ");
    return {
      ok: true, total, parts, kind: nt ? "warning" : total <= 8 ? "warning" : "neutral",
      headline: nt ? "Składowa NT: nie podawaj sumy" : "GCS · standardowa ocena",
      action: nt
        ? "Raportuj dostępne składowe i przyczynę NT. NT nie jest zerem ani jedynką; nie imputuj sumy."
        : "Raportuj E, V i M oraz ich trend, nie tylko sumę. Oceń czynniki zakłócające, asymetrię i całe ABCDE.",
      summary: `GCS standardowa (${x.population === "adult" ? "dorośli" : "dziecko >5 lat"}): ${components}${nt ? "; suma nieoznaczalna (NT)" : ` = ${total}/15`}.`,
    };
  }
  function news2(x) {
    if (x.population !== "adult") return fail(
      x.population === "child" ? "NEWS2 nie jest przeznaczony dla dzieci <16 lat. Użyj właściwej ścieżki pediatrycznej." :
      x.population === "pregnant" ? "Nie stosuj NEWS2 w ciąży. Użyj właściwego systemu wczesnego ostrzegania w położnictwie." :
      "Potwierdź zakres NEWS2: wiek ≥16 lat, bez ciąży."
    );
    const errors = [];
    for (const [key, label, min, max] of [
      ["rr", "Oddechy/min", 0, 100], ["spo2", "SpO₂ (%)", 0, 100],
      ["sbp", "Ciśnienie skurczowe (mmHg)", 0, 300], ["hr", "Tętno/min", 0, 350],
    ]) if (!finite(x[key], min, max)) errors.push(`${label}: wymagana liczba całkowita ${min}–${max}.`);
    if (!finite(x.temp, 25, 45, false) || Math.abs(x.temp * 10 - Math.round(x.temp * 10)) > 1e-6)
      errors.push("Temperatura: podaj 25,0–45,0°C z dokładnością do 0,1°C.");
    if (![1, 2].includes(x.scale)) errors.push("Wybierz skalę SpO₂ 1 lub 2.");
    if (x.scale === 2 && x.confirmScale2 !== true)
      errors.push("Skala 2 wymaga potwierdzonej hiperkapnicznej niewydolności oddechowej i udokumentowanej decyzji o celu SpO₂ 88–92%.");
    if (typeof x.oxygen !== "boolean") errors.push("Określ, czy stosowany jest dodatkowy tlen.");
    if (!["A", "C", "V", "P", "U"].includes(x.consciousness)) errors.push("Wybierz aktualną ocenę ACVPU.");
    if (errors.length) return fail(...errors);
    const rr = x.rr <= 8 ? 3 : x.rr <= 11 ? 1 : x.rr <= 20 ? 0 : x.rr <= 24 ? 2 : 3;
    const spo2 = x.scale === 1
      ? x.spo2 <= 91 ? 3 : x.spo2 <= 93 ? 2 : x.spo2 <= 95 ? 1 : 0
      : x.spo2 <= 83 ? 3 : x.spo2 <= 85 ? 2 : x.spo2 <= 87 ? 1 : x.spo2 <= 92 || !x.oxygen ? 0 : x.spo2 <= 94 ? 1 : x.spo2 <= 96 ? 2 : 3;
    const sbp = x.sbp <= 90 ? 3 : x.sbp <= 100 ? 2 : x.sbp <= 110 ? 1 : x.sbp < 220 ? 0 : 3;
    const hr = x.hr <= 40 ? 3 : x.hr <= 50 ? 1 : x.hr <= 90 ? 0 : x.hr <= 110 ? 1 : x.hr <= 130 ? 2 : 3;
    const temp = x.temp <= 35 ? 3 : x.temp <= 36 ? 1 : x.temp <= 38 ? 0 : x.temp <= 39 ? 1 : 2;
    const parts = [
      part("Oddechy", `${x.rr}/min`, rr),
      part(`SpO₂ · skala ${x.scale}`, `${x.spo2}%`, spo2),
      part("Dodatkowy tlen", x.oxygen ? "Tak" : "Nie", x.oxygen ? 2 : 0),
      part("Ciśnienie skurczowe", `${x.sbp} mmHg`, sbp),
      part("Tętno", `${x.hr}/min`, hr),
      part("ACVPU", x.consciousness, x.consciousness === "A" ? 0 : 3),
      part("Temperatura", `${x.temp.toFixed(1)}°C`, temp),
    ];
    const total = parts.reduce((s, p) => s + p.score, 0), singleThree = parts.some(p => p.score === 3);
    const response = total >= 7
      ? ["high", "Wysoki wynik · natychmiastowa ocena", "Zespół z kompetencjami intensywnej terapii; ciągłe monitorowanie parametrów. Zwykle potrzebny obszar opieki o wyższym nadzorze."]
      : total >= 5
      ? ["warning", "Wynik 5–6 · pilna ocena", "Pilna ocena kliniczna przez zespół kompetentny w ostrej chorobie; obserwacje co najmniej co godzinę do oceny i ustalenia planu."]
      : singleThree
      ? ["warning", "Pojedyncza składowa 3 · pilna ocena", "Nie traktuj sumy 3–4 jak zwykłego niskiego wyniku. Pilna ocena kliniczna; obserwacje co najmniej co godzinę do oceny i ustalenia planu."]
      : total > 0
      ? ["neutral", "Wynik 1–4 · ocena i plan obserwacji", "Ocena przez kompetentną pielęgniarkę lub równoważnego członka zespołu; standardowo obserwacje co 4–6 godzin, częściej według stanu."]
      : ["neutral", "Wynik 0 · nadal oceniaj stan kliniczny", "Standardowe minimum szpitalne: obserwacje co 12 godzin; stan kliniczny może wymagać częstszej oceny."];
    return {
      ok: true, total, parts, singleThree, kind: response[0], headline: response[1], action: response[2],
      summary: `NEWS2 = ${total}. ${parts.map(p => `${p.label}: ${p.value} → ${p.score} pkt`).join("; ")}. ${singleThree ? "Obecna składowa 3 pkt. " : ""}${response[1]}.`,
    };
  }
  function pews(x) {
    const errors = [];
    if (x.ageNorms !== true) errors.push("Potwierdź ocenę względem norm HR/RR odpowiednich dla wieku i lokalnej karty pediatrycznej.");
    for (const [key, label] of [["behaviour", "Zachowanie"], ["respiratory", "Oddychanie"], ["cardiovascular", "Krążenie"]])
      if (!finite(x[key], 0, 3)) errors.push(`Wybierz ocenę domeny: ${label}.`);
    if (typeof x.bronchodilators !== "boolean") errors.push("Oceń kryterium bronchodilatatorów co 20 minut.");
    if (typeof x.postopVomiting !== "boolean") errors.push("Oceń uporczywe wymioty po operacji.");
    if (errors.length) return fail(...errors);
    const parts = [
      part("Zachowanie", "ocena domeny", x.behaviour),
      part("Oddychanie", "ocena domeny", x.respiratory),
      part("Krążenie", "ocena domeny", x.cardiovascular),
      part("Bronchodilatatory co 20 min", x.bronchodilators ? "Tak" : "Nie", x.bronchodilators ? 2 : 0),
      part("Uporczywe wymioty po operacji", x.postopVomiting ? "Tak" : "Nie", x.postopVomiting ? 2 : 0),
    ];
    const base = x.behaviour + x.respiratory + x.cardiovascular;
    const total = parts.reduce((s, p) => s + p.score, 0);
    return {
      ok: true, total, base, parts, kind: "neutral", headline: "Brighton PEWS · wariant UBC 2024",
      action: "Suma nie wyznacza tu uniwersalnego progu interwencji. Oceniaj trend i ABCDE; eskaluj według lokalnego protokołu oraz niepokoju klinicznego, także przy niskim wyniku.",
      summary: `Brighton PEWS / UBC 31.05.2024 = ${total}/13 (domeny ${base}/9 + modyfikatory ${total - base}/4). ${parts.map(p => `${p.label}: ${p.score} pkt`).join("; ")}. Bez uniwersalnego progu eskalacji.`,
    };
  }
  function curb65(x) {
    if (x.population !== "adult") return fail("CURB-65 / CRB-65 dotyczy wyłącznie osób dorosłych (≥18 lat) z podejrzeniem lub rozpoznaniem pozaszpitalnego zapalenia płuc (CAP).");
    const variant = x.variant ?? "curb65";
    if (!["curb65", "crb65"].includes(variant)) return fail("Wybierz wariant kalkulatora: CURB-65 (ze stężeniem mocznika) lub CRB-65 (ocena pozaszpitalna).");
    const ureaUnit = x.ureaUnit ?? "mmol";
    if (!["mmol", "mgdl"].includes(ureaUnit)) return fail("Wybierz jednostkę stężenia mocznika: mmol/l lub mg/dl (BUN).");
    const errors = [];
    if (typeof x.confusion !== "boolean") errors.push("Oceń obecność nowego splątania (AMTS ≤8 lub dezorientacja w czasie/miejscu/osobie).");
    if (!finite(x.rr, 0, 100)) errors.push("Oddechy/min: wymagana liczba całkowita 0–100.");
    if (!finite(x.sbp, 0, 300)) errors.push("Ciśnienie skurczowe: wymagana liczba całkowita 0–300 mmHg.");
    if (!finite(x.dbp, 0, 200)) errors.push("Ciśnienie rozkurczowe: wymagana liczba całkowita 0–200 mmHg.");
    if (!finite(x.age, 18, 130)) errors.push("Wiek: wymagana liczba całkowita 18–130 lat.");
    if (variant === "curb65") {
      const minUrea = ureaUnit === "mgdl" ? 1 : 0.1;
      const maxUrea = ureaUnit === "mgdl" ? 300 : 100;
      if (!finite(x.urea, minUrea, maxUrea, false))
        errors.push(ureaUnit === "mgdl"
          ? "BUN: podaj stężenie 1–300 mg/dl (lub przełącz na CRB-65)."
          : "Mocznik: podaj stężenie 0,1–100,0 mmol/l (lub przełącz na CRB-65).");
    }
    if (errors.length) return fail(...errors);

    const c = x.confusion ? 1 : 0;
    const isHighUrea = ureaUnit === "mgdl" ? x.urea > 19 : x.urea > 7.0;
    const u = variant === "curb65" ? (isHighUrea ? 1 : 0) : null;
    const r = x.rr >= 30 ? 1 : 0;
    const b = (x.sbp < 90 || x.dbp <= 60) ? 1 : 0;
    const age65 = x.age >= 65 ? 1 : 0;

    const parts = [part("C · Świadomość", x.confusion ? "Nowe splątanie" : "Bez splątania", c)];
    if (variant === "curb65") {
      const unitLabel = ureaUnit === "mgdl" ? "mg/dl (BUN)" : "mmol/l";
      parts.push(part("U · Mocznik", `${x.urea} ${unitLabel}`, u));
    }
    parts.push(
      part("R · Oddechy", `${x.rr}/min`, r),
      part("B · Ciśnienie", `${x.sbp}/${x.dbp} mmHg`, b),
      part("65 · Wiek", `${x.age} lat`, age65)
    );

    const total = parts.reduce((s, p) => s + p.score, 0);
    const max = variant === "curb65" ? 5 : 4;
    const isCurb = variant === "curb65";
    const response = isCurb
      ? (total >= 3
          ? ["high", "Grupa 3 · wysokie ryzyko (3–5 pkt)", "Ciężkie zapalenie płuc, wysoka śmiertelność (15–40%). Wskazana pilna hospitalizacja; przy 4–5 pkt pilna ocena wskazań do OIT / OOM."]
          : total === 2
          ? ["warning", "Grupa 2 · umiarkowane ryzyko (2 pkt)", "Śmiertelność ~9%. Rozważ krótką hospitalizację lub leczenie ambulatoryjne z bardzo ścisłym nadzorem."]
          : ["neutral", "Grupa 1 · niskie ryzyko (0–1 pkt)", "Niska śmiertelność (<3%). Zwykle kwalifikuje się do leczenia w warunkach domowych / POZ (chyba że występują inne czynniki ryzyka)."])
      : (total >= 3
          ? ["high", "Wysokie ryzyko (3–4 pkt)", "Ciężkie zapalenie płuc, wysoka śmiertelność (>15–30%). Pilne skierowanie do szpitala; rozważ bezpośrednie przyjęcie na OIT."]
          : total >= 1
          ? ["warning", "Pośrednie ryzyko (1–2 pkt)", "Zwiększone ryzyko zgonu (1–8%). Rozważ skierowanie do szpitala, zwłaszcza przy wyniku 2 pkt lub istotnych chorobach współistniejących."]
          : ["neutral", "Bardzo niskie ryzyko (0 pkt)", "Bardzo niska śmiertelność (<1%). Zwykle bezpieczne leczenie w warunkach domowych / ambulatoryjnych."]);

    const name = isCurb ? "CURB-65" : "CRB-65";
    return {
      ok: true, total, parts, variant, max, ureaUnit, kind: response[0], headline: response[1], action: response[2],
      summary: `${name} = ${total}/${max}. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function qsofa(x) {
    if (x.population !== "adult") return fail("qSOFA jest zwalidowany dla osób dorosłych (≥18 lat) z podejrzeniem zakażenia. W pediatrii zastosuj dedykowane karty wczesnego ostrzegania (PEWS / Phoenix Sepsis).");
    const errors = [];
    if (!finite(x.rr, 0, 100)) errors.push("Częstość oddechów (RR): wymagana liczba całkowita 0–100/min.");
    if (!finite(x.sbp, 0, 300)) errors.push("Ciśnienie skurczowe (SBP): wymagana liczba całkowita 0–300 mmHg.");
    if (typeof x.alteredMentation !== "boolean") errors.push("Oceń stan świadomości: GCS 15 (przytomny) vs GCS <15 (zaburzenia świadomości).");
    if (errors.length) return fail(...errors);

    const rrScore = x.rr >= 22 ? 1 : 0;
    const sbpScore = x.sbp <= 100 ? 1 : 0;
    const mentationScore = x.alteredMentation ? 1 : 0;

    const parts = [
      part("Częstość oddechów (RR ≥22/min)", `${x.rr}/min`, rrScore),
      part("Ciśnienie skurczowe (SBP ≤100 mmHg)", `${x.sbp} mmHg`, sbpScore),
      part("Stan świadomości (GCS <15)", x.alteredMentation ? "GCS <15 / zaburzenia" : "Przytomny (GCS 15)", mentationScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const response = total >= 2
      ? ["high", "Wynik dodatni (≥2 pkt) · wysokie ryzyko sepsy", "Znacznie podwyższone ryzyko zgonu i przedłużonego pobytu na OIT. Natychmiast wdrożyć protokół sepsy (mleczany, posiewy krwi przed antybiotykiem, szybka antybiotykoterapia, resuscytacja płynowa) i rozważyć OIT/OOM."]
      : ["neutral", "Wynik ujemny (0–1 pkt) · sepsa niewykluczona", "Niski wynik qSOFA nie wyklucza sepsy ani ciężkiego zakażenia. Przy podejrzeniu klinicznym kontynuuj diagnostykę, monitoruj parametry życiowe i rozważ pełną skalę NEWS2 / SOFA."];

    return {
      ok: true, total, max: 3, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `qSOFA = ${total}/3. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function wellsPe(x) {
    if (x.population !== "adult") return fail("Skala Wellsa dla ZP (PE) jest zwalidowana wyłącznie dla osób dorosłych (≥18 lat) z podejrzeniem zatorowości płucnej.");
    const errors = [];
    if (!finite(x.hr, 0, 350)) errors.push("Tętno: wymagana liczba całkowita 0–350/min.");
    for (const [key, label] of [
      ["dvtSigns", "Objawy kliniczne ZŻG (ból palpacyjny lub obrzęk kończyny)"],
      ["peMostLikely", "Brak innego bardziej prawdopodobnego rozpoznania niż ZP"],
      ["immobilizationOrSurgery", "Unieruchomienie ≥3 dni lub operacja w ciągu 4 tyg."],
      ["previousVte", "Przebyta ZP lub ZŻG w wywiadzie"],
      ["hemoptysis", "Krwioplucie"],
      ["malignancy", "Choroba nowotworowa (aktywna lub leczona w ciągu 6 mies.)"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const hrScore = x.hr > 100 ? 1.5 : 0;
    const dvtScore = x.dvtSigns ? 3.0 : 0;
    const peLikelyScore = x.peMostLikely ? 3.0 : 0;
    const immobScore = x.immobilizationOrSurgery ? 1.5 : 0;
    const vteScore = x.previousVte ? 1.5 : 0;
    const hemoScore = x.hemoptysis ? 1.0 : 0;
    const caScore = x.malignancy ? 1.0 : 0;

    const parts = [
      part("Objawy kliniczne ZŻG (+3,0)", x.dvtSigns ? "Tak" : "Nie", dvtScore),
      part("ZP najbardziej prawdopodobna (+3,0)", x.peMostLikely ? "Tak" : "Nie", peLikelyScore),
      part("Tachykardia >100/min (+1,5)", `${x.hr}/min`, hrScore),
      part("Unieruchomienie / operacja (+1,5)", x.immobilizationOrSurgery ? "Tak" : "Nie", immobScore),
      part("Przebyta ZP lub ZŻG (+1,5)", x.previousVte ? "Tak" : "Nie", vteScore),
      part("Krwioplucie (+1,0)", x.hemoptysis ? "Tak" : "Nie", hemoScore),
      part("Choroba nowotworowa (+1,0)", x.malignancy ? "Tak" : "Nie", caScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const likely = total > 4.0;
    const response = likely
      ? ["high", "ZP prawdopodobna (>4,0 pkt)", "Pilne angio-TK tętnic płucnych (CTPA) lub scyntygrafia V/Q. Nie opóźniaj diagnostyki oczekiwaniem na D-dimery. Przy braku przeciwwskazań rozważ natychmiastowe wdrożenie pełnej antykoagulacji."]
      : ["neutral", "ZP mało prawdopodobna (≤4,0 pkt)", "Wykonaj oznaczenie D-dimerów o wysokiej czułości. Prawidłowy wynik (<500 µg/l lub u osób >50 r.ż. poniżej progu wiek × 10 µg/l) bezpiecznie wyklucza ZP. Podwyższone D-dimery wymagają wykonania angio-TK (CTPA)."];

    return {
      ok: true, total, max: 12.5, parts, likely, kind: response[0], headline: response[1], action: response[2],
      summary: `Wells PE = ${total}/12.5 pkt. ${parts.map(p => `${p.label}: ${p.score} pkt`).join("; ")}. ${response[1]}.`,
    };
  }
  globalThis.ClinicalScores = Object.freeze({ gcs, news2, pews, curb65, qsofa, wellsPe });
})();
