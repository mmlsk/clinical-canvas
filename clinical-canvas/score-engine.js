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
      return fail("Wybierz populację dla oceny GCS / pGCS.");
    const isYoung = x.population === "young";
    const defs = [
      ["E", "Otwieranie oczu", x.e, 4],
      ["V", isYoung ? "Odpowiedź słowna / przedwerbalna (pGCS)" : "Odpowiedź słowna", x.v, 5],
      ["M", isYoung ? "Odpowiedź ruchowa (pGCS)" : "Najlepsza odpowiedź ruchowa", x.m, 6],
    ];
    const missing = defs.filter(([, , v, max]) => v !== "NT" && !finite(v, 1, max)).map(([k]) => k);
    if (missing.length) return fail("Uzupełnij poprawnie składowe: " + missing.join(", ") + ".");
    const parts = defs.map(([k, label, v]) => part(label, `${k}${v}`, v));
    const nt = defs.some(([, , v]) => v === "NT");
    const total = nt ? null : x.e + x.v + x.m;
    const components = defs.map(([k, , v]) => `${k}${v}`).join(" ");
    const popLabel = x.population === "adult" ? "dorośli" : isYoung ? "dziecko ≤5 lat" : "dziecko >5 lat";
    const scaleName = isYoung ? "pGCS pediatryczna" : "GCS standardowa";
    return {
      ok: true, total, parts, isPediatric: isYoung, kind: nt ? "warning" : total <= 8 ? "warning" : "neutral",
      headline: nt ? "Składowa NT: nie podawaj sumy" : isYoung ? "pGCS · pediatryczna ocena (≤5 lat)" : "GCS · standardowa ocena",
      action: nt
        ? "Raportuj dostępne składowe i przyczynę NT. NT nie jest zerem ani jedynką; nie imputuj sumy."
        : isYoung
        ? "Oceniaj w kontekście wieku rozwojowego dziecka, zachowania i całego ABCDE. Raportuj E, V i M oraz ich trend."
        : "Raportuj E, V i M oraz ich trend, nie tylko sumę. Oceń czynniki zakłócające, asymetrię i całe ABCDE.",
      summary: `${scaleName} (${popLabel}): ${components}${nt ? "; suma nieoznaczalna (NT)" : ` = ${total}/15`}.`,
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
  function perc(x) {
    if (x.population !== "adult")
      return fail("Reguła PERC jest zwalidowana wyłącznie dla osób dorosłych (≥18 lat).");
    if (x.lowPretestConfirmed !== true)
      return fail("PERC stosuje się wyłącznie u chorych z niskim wyjściowym prawdopodobieństwem klinicznym ZP (<15% / Wells ≤4 pkt). Potwierdź niskie prawdopodobieństwo przed zastosowaniem reguły.");
    const errors = [];
    if (!finite(x.age, 18, 130)) errors.push("Wiek: wymagana liczba całkowita 18–130 lat.");
    if (!finite(x.hr, 0, 350)) errors.push("Tętno (HR): wymagana liczba całkowita 0–350/min.");
    if (!finite(x.spo2, 0, 100)) errors.push("SpO₂ na powietrzu atmosferycznym: wymagana liczba całkowita 0–100%.");
    for (const [key, label] of [
      ["unilateralLegSwelling", "Jednostronny obrzęk kończyny dolnej"],
      ["hemoptysis", "Krwioplucie"],
      ["recentTraumaOrSurgery", "Niedawny uraz lub zabieg operacyjny (≤4 tyg.) wymagający hospitalizacji"],
      ["previousVte", "Przebyta ZP lub ZŻG w wywiadzie"],
      ["hormoneUse", "Stosowanie egzogennych estrogenów (OC, HTZ)"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const ageScore = x.age >= 50 ? 1 : 0;
    const hrScore = x.hr >= 100 ? 1 : 0;
    const spo2Score = x.spo2 < 95 ? 1 : 0;
    const legScore = x.unilateralLegSwelling ? 1 : 0;
    const hemoScore = x.hemoptysis ? 1 : 0;
    const surgScore = x.recentTraumaOrSurgery ? 1 : 0;
    const vteScore = x.previousVte ? 1 : 0;
    const hormScore = x.hormoneUse ? 1 : 0;

    const parts = [
      part("Wiek ≥50 lat", `${x.age} lat`, ageScore),
      part("Tętno ≥100/min", `${x.hr}/min`, hrScore),
      part("SpO₂ <95% (bez O₂)", `${x.spo2}%`, spo2Score),
      part("Jednostronny obrzęk nogi", x.unilateralLegSwelling ? "Tak" : "Nie", legScore),
      part("Krwioplucie", x.hemoptysis ? "Tak" : "Nie", hemoScore),
      part("Uraz / operacja ≤4 tyg.", x.recentTraumaOrSurgery ? "Tak" : "Nie", surgScore),
      part("Przebyta ZP lub ZŻG", x.previousVte ? "Tak" : "Nie", vteScore),
      part("Stosowanie estrogenów", x.hormoneUse ? "Tak" : "Nie", hormScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const ruledOut = total === 0;
    const response = ruledOut
      ? ["neutral", "PERC ujemny (0/8) · ZP bezpiecznie wykluczona", "Przy niskim prawdopodobieństwie klinicznym i spełnieniu 0 kryteriów PERC ryzyko ZP wynosi <1,5%. Nie ma wskazań do oznaczania D-dimerów ani wykonywania angio-TK."]
      : ["warning", `PERC dodatni (${total}/8) · nie można wykluczyć ZP samą regułą`, "Obecność ≥1 kryterium PERC uniemożliwia kliniczne wykluczenie ZP bez badań. Oznacz D-dimery o wysokiej czułości (z progiem dostosowanym do wieku u chorych >50 r.ż.)."];

    return {
      ok: true, total, max: 8, parts, ruledOut, kind: response[0], headline: response[1], action: response[2],
      summary: `PERC = ${total}/8. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function gbs(x) {
    if (x.population !== "adult")
      return fail("Skala Glasgow-Blatchford (GBS) jest zwalidowana wyłącznie dla osób dorosłych (≥16–18 lat) z ostrym krwawieniem z górnego odcinka przewodu pokarmowego (UGIB). W pediatrii oceń stan hemodynamiczny wg ścieżki CHOP.");
    const ureaUnit = x.ureaUnit ?? "mmol";
    if (!["mmol", "mgdl"].includes(ureaUnit))
      return fail("Wybierz jednostkę stężenia mocznika: mmol/l lub mg/dl (BUN).");
    const errors = [];
    if (!["male", "female"].includes(x.sex)) errors.push("Wybierz płeć biologiczną dla właściwych progów stężenia hemoglobiny.");
    const minUrea = ureaUnit === "mgdl" ? 1 : 0.1;
    const maxUrea = ureaUnit === "mgdl" ? 300 : 100;
    if (!finite(x.urea, minUrea, maxUrea, false))
      errors.push(ureaUnit === "mgdl" ? "BUN: podaj stężenie 1–300 mg/dl." : "Mocznik: podaj stężenie 0,1–100,0 mmol/l.");
    if (!finite(x.hb, 2, 25, false)) errors.push("Hemoglobina (Hb): podaj stężenie 2,0–25,0 g/dl.");
    if (!finite(x.sbp, 0, 300)) errors.push("Ciśnienie skurczowe (SBP): wymagana liczba całkowita 0–300 mmHg.");
    if (!finite(x.hr, 0, 350)) errors.push("Tętno (HR): wymagana liczba całkowita 0–350/min.");
    for (const [key, label] of [
      ["melena", "Smoliste stolce (melena)"],
      ["syncope", "Omdlenie / utrata przytomności"],
      ["hepaticDisease", "Choroba wątroby w wywiadzie lub cechy kliniczne"],
      ["cardiacFailure", "Niewydolność serca w wywiadzie lub cechy kliniczne"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const ureaMmol = ureaUnit === "mgdl" ? x.urea * 0.357 : x.urea;
    const ureaScore = ureaMmol >= 25.0 ? 6 : ureaMmol >= 10.0 ? 4 : ureaMmol >= 8.0 ? 3 : ureaMmol >= 6.5 ? 2 : 0;
    const hbScore = x.sex === "male"
      ? (x.hb < 10.0 ? 6 : x.hb < 12.0 ? 3 : x.hb < 13.0 ? 1 : 0)
      : (x.hb < 10.0 ? 6 : x.hb < 12.0 ? 1 : 0);
    const sbpScore = x.sbp < 90 ? 3 : x.sbp < 100 ? 2 : x.sbp < 110 ? 1 : 0;
    const hrScore = x.hr >= 100 ? 1 : 0;
    const melenaScore = x.melena ? 1 : 0;
    const syncopeScore = x.syncope ? 2 : 0;
    const liverScore = x.hepaticDisease ? 2 : 0;
    const hfScore = x.cardiacFailure ? 2 : 0;

    const unitLabel = ureaUnit === "mgdl" ? "mg/dl (BUN)" : "mmol/l";
    const parts = [
      part("Mocznik we krwi", `${x.urea} ${unitLabel}`, ureaScore),
      part(`Hemoglobina (${x.sex === "male" ? "M" : "K"})`, `${x.hb} g/dl`, hbScore),
      part("Ciśnienie skurczowe", `${x.sbp} mmHg`, sbpScore),
      part("Tętno ≥100/min", `${x.hr}/min`, hrScore),
      part("Smoliste stolce (melena)", x.melena ? "Tak" : "Nie", melenaScore),
      part("Omdlenie", x.syncope ? "Tak" : "Nie", syncopeScore),
      part("Choroba wątroby", x.hepaticDisease ? "Tak" : "Nie", liverScore),
      part("Niewydolność serca", x.cardiacFailure ? "Tak" : "Nie", hfScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const response = total === 0
      ? ["neutral", "Bardzo niskie ryzyko (GBS = 0) · możliwy wczesny wypis", "Według NICE CG141 przy GBS = 0 ryzyko konieczności interwencji endoskopowej lub transfuzji wynosi <1%; rozważ wczesny wypis i gastroskopię w trybie ambulatoryjnym."]
      : total === 1
      ? ["warning", "Niskie ryzyko (GBS = 1) · hospitalizacja wg NICE CG141", "Według NICE CG141 wynik >0 wskazuje na potrzebę hospitalizacji i gastroskopii w ciągu 24 h (uwaga: wytyczne ESGE 2021 dopuszczają rozważenie wypisu przy GBS 0–1 u stabilnych chorych)."]
      : total < 6
      ? ["warning", `Pośrednie ryzyko (GBS = ${total}) · hospitalizacja i endoskopia <24 h`, "Wskazane przyjęcie do szpitala, wyrównanie wolemii i wykonanie gastroskopii w ciągu 24 godzin."]
      : ["high", `Wysokie ryzyko (GBS = ${total}) · pilna interwencja (>50% ryzyka)`, "Wysokie prawdopodobieństwo konieczności przetoczenia krwi, terapii endoskopowej lub chirurgicznej. Intensywna resuscytacja płynowa, zabezpieczenie KKCz i pilna gastroskopia niezwłocznie po stabilizacji."];

    return {
      ok: true, total, max: 23, parts, ureaUnit, kind: response[0], headline: response[1], action: response[2],
      summary: `Glasgow-Blatchford (GBS) = ${total}/23 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function alvarado(x) {
    const variant = x.variant ?? "alvarado";
    if (!["alvarado", "pas"].includes(variant))
      return fail("Wybierz wariant skali wyrostka: Alvarado (dorośli / ogólna) lub PAS (Pediatric Appendicitis Score dla dzieci).");
    const isPas = variant === "pas";
    const errors = [];
    if (!finite(x.temp, 34, 43, false) || Math.abs(x.temp * 10 - Math.round(x.temp * 10)) > 1e-6)
      errors.push("Temperatura: podaj 34,0–43,0°C z dokładnością do 0,1°C.");
    for (const [key, label] of [
      ["rlqTenderness", "Tkliwość w prawym dole biodrowym (RLQ)"],
      ["leukocytosis", "Leukocytoza (WBC >10 000/µl)"],
      ["migration", "Migracja bólu do prawego dołu biodrowego"],
      ["anorexia", "Jadłowstręt (utrata apetytu / anoreksja)"],
      ["nauseaVomiting", "Nudności lub wymioty"],
      ["reboundOrHopping", isPas ? "Ból w RLQ przy kaszlu, opukiwaniu lub podskakiwaniu (PAS)" : "Objaw Blumberga / bolesność z odbicia (Alvarado)"],
      ["leftShift", "Przesunięcie obrazu w lewo / neutrofilia >75% (ANC >7500/µl)"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const tempCutoff = isPas ? 38.0 : 37.3;
    const tempScore = x.temp >= tempCutoff ? 1 : 0;
    const rlqScore = x.rlqTenderness ? 2 : 0;
    const wbcScore = x.leukocytosis ? 2 : 0;
    const migScore = x.migration ? 1 : 0;
    const anoScore = x.anorexia ? 1 : 0;
    const nvScore = x.nauseaVomiting ? 1 : 0;
    const rebScore = x.reboundOrHopping ? 1 : 0;
    const shiftScore = x.leftShift ? 1 : 0;

    const parts = [
      part("Tkliwość w RLQ (+2)", x.rlqTenderness ? "Tak" : "Nie", rlqScore),
      part("Leukocytoza >10 tys./µl (+2)", x.leukocytosis ? "Tak" : "Nie", wbcScore),
      part("Migracja bólu do RLQ (+1)", x.migration ? "Tak" : "Nie", migScore),
      part("Jadłowstręt (+1)", x.anorexia ? "Tak" : "Nie", anoScore),
      part("Nudności / wymioty (+1)", x.nauseaVomiting ? "Tak" : "Nie", nvScore),
      part(isPas ? "Ból przy kaszlu / podskakiwaniu (+1)" : "Objaw Blumberga (+1)", x.reboundOrHopping ? "Tak" : "Nie", rebScore),
      part(`Temperatura ≥${tempCutoff.toFixed(1).replace(".", ",")}°C (+1)`, `${x.temp.toFixed(1)}°C`, tempScore),
      part("Neutrofilia >75% (+1)", x.leftShift ? "Tak" : "Nie", shiftScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const name = isPas ? "PAS (Pediatric Appendicitis Score)" : "Skala Alvarado";
    const response = isPas
      ? (total >= 7
          ? ["high", `Wysokie prawdopodobieństwo (PAS ${total}/10)`, "Wysokie ryzyko ostrego zapalenia wyrostka robaczkowego u dziecka. Pilna konsultacja chirurgii dziecięcej; USG jamy brzusznej nie powinno opóźniać oceny przy jawnym zapaleniu otrzewnej."]
          : total >= 4
          ? ["warning", `Pośrednie ryzyko (PAS ${total}/10) · wskazane USG`, "Niejednoznaczny obraz kliniczny. Wykonaj USG jamy brzusznej (badanie I rzutu u dzieci), obserwuj w dynamice i rozważ konsultację chirurgiczną."]
          : ["neutral", `Niskie prawdopodobieństwo (PAS ${total}/10)`, "Małe prawdopodobieństwo ostrego zapalenia wyrostka robaczkowego. Obserwacja, nawodnienie i ponowna ocena przy utrzymywaniu się lub narastaniu bólu."])
      : (total >= 7
          ? ["high", `Wysokie prawdopodobieństwo (Alvarado ${total}/10)`, "Wysokie prawdopodobieństwo ostrego zapalenia wyrostka robaczkowego. Pilna konsultacja chirurgiczna i kwalifikacja do zabiegu lub celowanego obrazowania (USG / TK wg płci i wieku)."]
          : total >= 5
          ? ["warning", `Pośrednie ryzyko (Alvarado ${total}/10) · diagnostyka obrazowa`, "Podejrzenie zapalenia wyrostka robaczkowego. Wskazana diagnostyka obrazowa (USG jamy brzusznej / TK) oraz obserwacja chirurgiczna."]
          : ["neutral", `Małe prawdopodobieństwo (Alvarado ${total}/10)`, "Niskie prawdopodobieństwo ostrego zapalenia wyrostka robaczkowego. Rozważ alternatywne przyczyny bólu brzucha; przy wypisie przekaż jasne kryteria powrotu."]);

    return {
      ok: true, total, max: 10, variant, isPediatric: isPas, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `${name} = ${total}/10 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function heart(x) {
    if (x.population !== "adult")
      return fail("Skala HEART jest zwalidowana wyłącznie dla osób dorosłych (≥18 lat) z bólem w klatce piersiowej podejrzanym o OZW.");
    const errors = [];
    if (!finite(x.history, 0, 2)) errors.push("H · Wywiad (History): wybierz ocenę 0–2 pkt.");
    if (!finite(x.ecg, 0, 2)) errors.push("E · EKG: wybierz ocenę 0–2 pkt.");
    if (!finite(x.age, 18, 130)) errors.push("A · Wiek: wymagana liczba całkowita 18–130 lat.");
    if (!finite(x.riskFactors, 0, 2)) errors.push("R · Czynniki ryzyka: wybierz ocenę 0–2 pkt.");
    if (!finite(x.troponin, 0, 2)) errors.push("T · Troponina: wybierz ocenę 0–2 pkt.");
    if (errors.length) return fail(...errors);

    const ageScore = x.age >= 65 ? 2 : x.age >= 45 ? 1 : 0;
    const hLabels = ["Mało podejrzany (0)", "Umiarkowanie podejrzany (1)", "Wysoce podejrzany / typowy (2)"];
    const eLabels = ["Prawidłowe (0)", "Nieswoiste zaburzenia repolaryzacji / LBBB (1)", "Istotne obniżenie ST / świeże niedokrwienie (2)"];
    const rLabels = ["Brak czynników ryzyka (0)", "1–2 czynniki ryzyka (1)", "≥3 czynniki ryzyka lub znana miażdżyca/CAD (2)"];
    const tLabels = ["≤1× górnej granicy normy / 99. centyla (0)", "1–3× górnej granicy normy (1)", ">3× górnej granicy normy (2)"];

    const parts = [
      part("H · Wywiad", hLabels[x.history], x.history),
      part("E · EKG", eLabels[x.ecg], x.ecg),
      part("A · Wiek", `${x.age} lat`, ageScore),
      part("R · Czynniki ryzyka", rLabels[x.riskFactors], x.riskFactors),
      part("T · Troponina", tLabels[x.troponin], x.troponin),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const criticalFlag = x.troponin >= 1 || x.ecg === 2;
    const response = total >= 7
      ? ["high", `Wysokie ryzyko MACE (HEART ${total}/10 · ~50–65%)`, "Wysokie 6-tygodniowe ryzyko poważnych zdarzeń sercowo-naczyniowych. Pilna hospitalizacja w oddziale kardiologicznym i wczesna strategia inwazyjna."]
      : total >= 4
      ? ["warning", `Pośrednie ryzyko MACE (HEART ${total}/10 · ~12–17%)`, "Wskazana obserwacja szpitalna / OIOK, seryjne oznaczenia wysokoczułej troponiny (algorytm 0/1 h lub 0/2 h) oraz dalsza diagnostyka nieinwazyjna lub koronarografia."]
      : criticalFlag
      ? ["warning", `Niska suma (HEART ${total}/10), lecz obecny marker ostrego niedokrwienia!`, "Pomimo niskiej sumy punktowej (0–3 pkt) stwierdzono dodatnią troponinę lub istotne zmiany odcinka ST. Nie wypisuj chorego wyłącznie na podstawie sumy HEART — kontynuuj protokół OZW i seryjne oznaczenia hs-cTn."]
      : ["neutral", `Niskie ryzyko MACE (HEART ${total}/10 · <1,7%)`, "Niskie 6-tygodniowe ryzyko MACE. Przy ujemnym protokole seryjnej troponiny (np. 0/1 h lub 0/3 h) i braku nawrotu bólu chory może być bezpiecznie wypisany do dalszej opieki ambulatoryjnej."];

    return {
      ok: true, total, max: 10, criticalFlag, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `HEART Score = ${total}/10 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function cha2ds2va(x) {
    if (x.population !== "adult")
      return fail("Skala CHA₂DS₂-VA (ESC 2024) jest przeznaczona dla osób dorosłych (≥18 lat) z migotaniem przedsionków (AF) bez umiarkowanej/ciężkiej stenozy mitralnej ani mechanicznej protezy zastawkowej.");
    const errors = [];
    if (!finite(x.age, 18, 130)) errors.push("Wiek: wymagana liczba całkowita 18–130 lat.");
    for (const [key, label] of [
      ["chf", "C · Niewydolność serca (HFrEF, HFmrEF, HFpEF lub LVEF ≤40%)"],
      ["hypertension", "H · Nadciśnienie tętnicze (lub leczenie hipotensyjne)"],
      ["diabetes", "D · Cukrzyca (typ 1 lub 2)"],
      ["strokeTiaTe", "S₂ · Przebyty udar mózgu, TIA lub zatorowość obwodowa (+2 pkt)"],
      ["vascularDisease", "V · Choroba naczyniowa (przebyty zawał, PAD, blaszka w aorcie, rewaskularyzacja)"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const ageScore = x.age >= 75 ? 2 : x.age >= 65 ? 1 : 0;
    const cScore = x.chf ? 1 : 0;
    const hScore = x.hypertension ? 1 : 0;
    const dScore = x.diabetes ? 1 : 0;
    const sScore = x.strokeTiaTe ? 2 : 0;
    const vScore = x.vascularDisease ? 1 : 0;

    const parts = [
      part("C · Niewydolność serca (+1)", x.chf ? "Tak" : "Nie", cScore),
      part("H · Nadciśnienie tętnicze (+1)", x.hypertension ? "Tak" : "Nie", hScore),
      part("A · Wiek (65–74: +1; ≥75: +2)", `${x.age} lat`, ageScore),
      part("D · Cukrzyca (+1)", x.diabetes ? "Tak" : "Nie", dScore),
      part("S₂ · Udar / TIA / zatorowość (+2)", x.strokeTiaTe ? "Tak" : "Nie", sScore),
      part("V · Choroba naczyniowa (+1)", x.vascularDisease ? "Tak" : "Nie", vScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const response = total >= 2
      ? ["high", `Wysokie ryzyko zakrzepowo-zatorowe (CHA₂DS₂-VA = ${total}/8)`, "Zalecane wdrożenie doustnej antykoagulacji (zalecenie ESC 2024 Klasa I). Preferowane są NOAC/DOAC (apiksaban, dabigatran, edoksaban, rywaroksaban) względem VKA."]
      : total === 1
      ? ["warning", "Pośrednie ryzyko (CHA₂DS₂-VA = 1/8)", "Należy rozważyć wdrożenie doustnej antykoagulacji (zalecenie ESC 2024 Klasa IIa) po ocenie indywidualnego bilansu korzyści i ryzyka krwawienia oraz preferencji pacjenta."]
      : ["neutral", "Niskie ryzyko (CHA₂DS₂-VA = 0/8)", "Brak wskazań do przewlekłej terapii przeciwkrzepliwej ani przeciwpłytkowej w prewencji udaru (z wyjątkiem okresowego przygotowania do kardiowersji/ablacji)."];

    return {
      ok: true, total, max: 8, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `CHA₂DS₂-VA (ESC 2024) = ${total}/8 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function hasbled(x) {
    if (x.population !== "adult")
      return fail("Skala HAS-BLED jest przeznaczona dla osób dorosłych (≥18 lat) ocenianych pod kątem ryzyka krwawienia podczas leczenia przeciwkrzepliwego.");
    const errors = [];
    for (const [key, label] of [
      ["hypertension", "H · Niekontrolowane nadciśnienie tętnicze (SBP >160 mmHg)"],
      ["renalDisease", "A · Nieprawidłowa funkcja nerek (dializy, stan po przeszczepie, kreatynina >2,26 mg/dl / >200 µmol/l)"],
      ["liverDisease", "A · Nieprawidłowa funkcja wątroby (marskość lub bilirubina >2× GGN z AST/ALT/ALP >3× GGN)"],
      ["strokeHistory", "S · Przebyty udar mózgu w wywiadzie"],
      ["bleedingHistory", "B · Przebyte poważne krwawienie lub predyspozycja (skaza, niedokrwistość)"],
      ["labileInr", "L · Niestabilny INR (TTR <60% u leczonych VKA)"],
      ["elderly", "E · Wiek >65 lat"],
      ["drugs", "D · Leki zwiększające ryzyko krwawienia (leki przeciwpłytkowe, NLPZ)"],
      ["alcohol", "D · Nadużywanie alkoholu (≥8 jednostek/tydzień)"],
    ]) {
      if (typeof x[key] !== "boolean") errors.push(`Oceń kryterium: ${label}.`);
    }
    if (errors.length) return fail(...errors);

    const parts = [
      part("H · Nadciśnienie SBP >160 mmHg", x.hypertension ? "Tak" : "Nie", x.hypertension ? 1 : 0),
      part("A · Niewydolność nerek", x.renalDisease ? "Tak" : "Nie", x.renalDisease ? 1 : 0),
      part("A · Choroba wątroby", x.liverDisease ? "Tak" : "Nie", x.liverDisease ? 1 : 0),
      part("S · Przebyty udar mózgu", x.strokeHistory ? "Tak" : "Nie", x.strokeHistory ? 1 : 0),
      part("B · Krwawienie / predyspozycja", x.bleedingHistory ? "Tak" : "Nie", x.bleedingHistory ? 1 : 0),
      part("L · Niestabilny INR (TTR <60%)", x.labileInr ? "Tak" : "Nie", x.labileInr ? 1 : 0),
      part("E · Wiek >65 lat", x.elderly ? "Tak" : "Nie", x.elderly ? 1 : 0),
      part("D · Leki (NLPZ / przeciwpłytkowe)", x.drugs ? "Tak" : "Nie", x.drugs ? 1 : 0),
      part("D · Alkohol (≥8 j./tydz.)", x.alcohol ? "Tak" : "Nie", x.alcohol ? 1 : 0),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const response = total >= 3
      ? ["warning", `Wysokie ryzyko krwawienia (HAS-BLED = ${total}/9)`, "Zwiększone ryzyko poważnego krwawienia. UWAGA (ESC 2024): wysoki wynik HAS-BLED (≥3 pkt) sam w sobie NIE stanowi przeciwwskazania do włączenia antykoagulacji! Skoryguj odwracalne czynniki ryzyka (ciśnienie, NLPZ, alkohol, zamiana VKA na NOAC) i zaplanuj częstsze wizyty kontrolne."]
      : ["neutral", `Niskie / umiarkowane ryzyko krwawienia (HAS-BLED = ${total}/9)`, "Standardowe ryzyko krwawienia. Monitoruj czynniki modyfikowalne (funkcję nerek, ciśnienie tętnicze, unikanie zbędnych NLPZ) podczas leczenia przeciwkrzepliwego."];

    return {
      ok: true, total, max: 9, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `HAS-BLED = ${total}/9 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  function nihss(x) {
    if (x.population !== "adult")
      return fail("Standardowa skala NIHSS jest przeznaczona dla osób dorosłych (≥18 lat). W udarze dziecięcym stosuje się PedNIHSS w ośrodku specjalistycznym.");
    const defs = [
      ["ia", "1a · Poziom świadomości", 3],
      ["ib", "1b · Pytania orientacyjne (miesiąc, wiek)", 2],
      ["ic", "1c · Polecenia ruchowe (oczy, pięść)", 2],
      ["gaze", "2 · Ruchy gałek ocznych (spojrzenie)", 2],
      ["visual", "3 · Pole widzenia", 3],
      ["facial", "4 · Niedowład nerwu twarzowego", 3],
      ["motorArmL", "5a · Ruchomość kończyny górnej lewej", 4, true],
      ["motorArmR", "5b · Ruchomość kończyny górnej prawej", 4, true],
      ["motorLegL", "6a · Ruchomość kończyny dolnej lewej", 4, true],
      ["motorLegR", "6b · Ruchomość kończyny dolnej prawej", 4, true],
      ["ataxia", "7 · Ataksja kończyn", 2, true],
      ["sensory", "8 · Czucie", 2],
      ["language", "9 · Mowa (afazja)", 3],
      ["dysarthria", "10 · Dyzartria", 2, true],
      ["extinction", "11 · Wygaszanie / zespół zaniedbywania", 2],
    ];
    const errors = [];
    for (const [key, label, max, allowUn] of defs) {
      const v = x[key];
      const validUn = allowUn && v === "UN";
      if (!validUn && !finite(v, 0, max)) {
        errors.push(`Uzupełnij składową: ${label} (0–${max}${allowUn ? " lub UN" : ""}).`);
      }
    }
    if (errors.length) return fail(...errors);

    const parts = defs.map(([key, label]) => {
      const v = x[key];
      const isUn = v === "UN";
      return part(label, isUn ? "UN (nie do oceny — amputacja/usztywnienie/intubacja)" : `${v} pkt`, isUn ? 0 : v);
    });

    const total = parts.reduce((s, p) => s + p.score, 0);
    const hasUn = defs.some(([key]) => x[key] === "UN");
    const response = total >= 21
      ? ["high", `Ciężki deficyt udarowy (NIHSS = ${total}/42)`, "Ciężki udar mózgu, wysokie prawdopodobieństwo niedrożności dużego naczynia (LVO). Natychmiastowe TK + angio-TK (CTA) oraz kwalifikacja do leczenia reperfuzyjnego (tromboliza i.v. / trombektomia mechaniczna)."]
      : total >= 16
      ? ["high", `Umiarkowanie ciężki udar (NIHSS = ${total}/42)`, "Istotny deficyt neurologiczny, duże ryzyko LVO. Pilne TK + CTA i kwalifikacja do trombolizy dożylnej oraz trombektomii mechanicznej."]
      : total >= 5
      ? ["warning", `Umiarkowany udar (NIHSS = ${total}/42)`, "Pilna ścieżka udarowa: TK głowy bez kontrastu (± CTA), weryfikacja czasu zachorowania i kwalifikacja do trombolizy i.v. / trombektomii."]
      : total >= 1
      ? ["warning", `Łagodny deficyt (NIHSS = ${total}/42) · nie wyklucza udaru unieruchamiającego`, "Nawet niski wynik NIHSS (1–4 pkt) przy deficycie upośledzającym funkcjonowanie (np. izolowana afazja, niedowidzenie połowicze, niedowład ręki) stanowi wskazanie do pilnej oceny reperfuzyjnej."]
      : ["neutral", "NIHSS = 0/42 · uwaga na udar tylnego krążenia!", "Wynik 0 pkt NIE wyklucza udaru mózgu — zwłaszcza w dorzeczu kręgowo-podstawnym (zawroty głowy, ataksja tułowia, oczopląs, zaburzenia połykania). Decyduje badanie kliniczne i neuroobrazowanie."];

    return {
      ok: true, total, max: 42, hasUn, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `NIHSS = ${total}/42 pkt${hasUn ? " (zawiera składowe UN liczone jako 0)" : ""}. ${parts.map(p => `${p.label}: ${p.score} pkt`).join("; ")}. ${response[1]}.`,
    };
  }
  function abcd2(x) {
    if (x.population !== "adult")
      return fail("Skala ABCD² dotyczy osób dorosłych (≥18 lat) po przemijającym napadzie niedokrwiennym (TIA).");
    const errors = [];
    if (!finite(x.age, 18, 130)) errors.push("A · Wiek: wymagana liczba całkowita 18–130 lat.");
    if (!finite(x.sbp, 0, 300)) errors.push("B · Ciśnienie skurczowe (SBP): wymagana liczba całkowita 0–300 mmHg.");
    if (!finite(x.dbp, 0, 200)) errors.push("B · Ciśnienie rozkurczowe (DBP): wymagana liczba całkowita 0–200 mmHg.");
    if (!finite(x.clinicalFeatures, 0, 2)) errors.push("C · Obraz kliniczny epizodu: wybierz kategorię (0–2 pkt).");
    if (!finite(x.duration, 0, 2)) errors.push("D · Czas trwania objawów: wybierz kategorię (0–2 pkt).");
    if (typeof x.diabetes !== "boolean") errors.push("D · Oceń obecność cukrzycy w wywiadzie.");
    if (errors.length) return fail(...errors);

    const aScore = x.age >= 60 ? 1 : 0;
    const bScore = (x.sbp >= 140 || x.dbp >= 90) ? 1 : 0;
    const cScore = x.clinicalFeatures;
    const durScore = x.duration;
    const dmScore = x.diabetes ? 1 : 0;

    const cLabels = ["Inne objawy bez niedowładu i zaburzeń mowy (0)", "Zaburzenia mowy bez niedowładu (1)", "Jednostronny niedowład kończyny/twarzy (2)"];
    const dLabels = ["<10 minut (0)", "10–59 minut (1)", "≥60 minut (2)"];

    const parts = [
      part("A · Wiek ≥60 lat (+1)", `${x.age} lat`, aScore),
      part("B · Ciśnienie ≥140/90 mmHg (+1)", `${x.sbp}/${x.dbp} mmHg`, bScore),
      part("C · Obraz kliniczny", cLabels[cScore], cScore),
      part("D · Czas trwania objawów", dLabels[durScore], durScore),
      part("D · Cukrzyca (+1)", x.diabetes ? "Tak" : "Nie", dmScore),
    ];

    const total = parts.reduce((s, p) => s + p.score, 0);
    const response = total >= 6
      ? ["high", `Wysokie 2-dniowe ryzyko udaru (ABCD² = ${total}/7 · ~8,1%)`, "Bardzo wysokie ryzyko wczesnego udaru niedokrwiennego. Natychmiastowa konsultacja neurologiczna, obrazowanie naczyń domózgowych (USG Doppler / CTA / MRI) i wdrożenie prewencji wtórnej (np. DAPT po wykluczeniu krwawienia)."]
      : total >= 4
      ? ["warning", `Umiarkowane ryzyko udaru (ABCD² = ${total}/7 · ~4,1%)`, "Podwyższone ryzyko wczesnego udaru. Pilna diagnostyka w ciągu 24 h, wykluczenie migotania przedsionków i zwężenia tętnicy szyjnej oraz włączenie leczenia przeciwpłytkowego."]
      : ["warning", `Niska punktacja (ABCD² = ${total}/7 · ~1,0%), lecz TIA wymaga pilnej ścieżki!`, "UWAGA (NICE NG128): nie używaj niskiego wyniku ABCD² do odraczania diagnostyki TIA! Każdy pacjent z podejrzeniem TIA w ciągu ostatnich 7 dni wymaga pilnej oceny specjalistycznej w ciągu 24 h oraz natychmiastowego leczenia przeciwpłytkowego (o ile brak przeciwwskazań)."];

    return {
      ok: true, total, max: 7, parts, kind: response[0], headline: response[1], action: response[2],
      summary: `ABCD² = ${total}/7 pkt. ${parts.map(p => `${p.label}: ${p.value} (${p.score} pkt)`).join("; ")}. ${response[1]}.`,
    };
  }
  globalThis.ClinicalScores = Object.freeze({
    gcs, news2, pews, curb65, qsofa, wellsPe,
    perc, gbs, alvarado, heart, cha2ds2va, hasbled, nihss, abcd2,
  });
})();
