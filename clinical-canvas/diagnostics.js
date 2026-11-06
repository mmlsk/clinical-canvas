// Clinical Diagnostics Suite v2.1: POCUS & Acute Laboratory Medicine
// eFAST, BLUE Protocol (Lichtenstein), FOCUS Echocardiography, DVT CUS,
// ESC hs-cTn 0/1h & 0/2h Kinetics, Age-Adjusted D-Dimer, Lactate Clearance, ABG & Horowitz Index (P/F)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClinicalDiagnostics = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // --- 1. POCUS: eFAST (Extended Focused Assessment with Sonography in Trauma) ---
  function evaluateEFAST(windows = {}) {
    // Windows: ruq (Morison), luq (splenorenal), pelvic (suprapubic), pericardial (subxiphoid),
    // pleuralRight (lung sliding / fluid), pleuralLeft (lung sliding / fluid)
    const defaults = {
      ruq: "normal", // "normal" | "fluid" | "nt"
      luq: "normal",
      pelvic: "normal",
      pericardial: "normal", // "normal" | "fluid" | "tamponade" | "nt"
      pleuralRight: "normal", // "normal" | "fluid" | "pneumothorax" | "nt"
      pleuralLeft: "normal",
    };
    const w = Object.assign({}, defaults, windows);

    const fluidSites = [];
    if (w.ruq === "fluid") fluidSites.push("Zachyłek wątrobowo-nerkowy (Morisona)");
    if (w.luq === "fluid") fluidSites.push("Zachyłek śledzionowo-nerkowy");
    if (w.pelvic === "fluid") fluidSites.push("Miednica mniejsza (zachyłek Douglasa / pęcherzowo-odbytniczy)");
    if (w.pericardial === "fluid" || w.pericardial === "tamponade") {
      fluidSites.push(w.pericardial === "tamponade" ? "Worek osierdziowy z cechami tamponady" : "Worek osierdziowy");
    }
    if (w.pleuralRight === "fluid") fluidSites.push("Prawa jama opłucnowa (haemothorax)");
    if (w.pleuralLeft === "fluid") fluidSites.push("Lewa jama opłucnowa (haemothorax)");

    const ptxSites = [];
    if (w.pleuralRight === "pneumothorax") ptxSites.push("Prawa opłucna (odma opłucnowa — brak ślizgania / lung point)");
    if (w.pleuralLeft === "pneumothorax") ptxSites.push("Lewa opłucna (odma opłucnowa — brak ślizgania / lung point)");

    const isPositive = fluidSites.length > 0 || ptxSites.length > 0;
    const hasTamponade = w.pericardial === "tamponade";
    const hasPneumothorax = ptxSites.length > 0;

    let summary = "Badanie eFAST ujemne — nie uwidoczniono wolnego płynu w jamie brzusznej, osierdziu ani cech odmy opłucnowej.";
    let action = "Kontynuuj monitorowanie i diagnostykę obrazową (np. trauma-TK przy wskazaniach klinicznych).";

    if (isPositive) {
      const parts = [];
      if (fluidSites.length) parts.push(`Wolny płyn: ${fluidSites.join(", ")}`);
      if (ptxSites.length) parts.push(`Podejrzenie odmy: ${ptxSites.join(", ")}`);
      summary = `DODATNI eFAST! ${parts.join(" | ")}.`;

      if (hasTamponade) {
        action = "PILNA ESKALACJA: Tamponada serca — natychmiastowe odbarczenie (perikardiocenteza / okno osierdziowe).";
      } else if (hasPneumothorax && isPositive) {
        action = "PILNA ESKALACJA: Odma opłucnowa — rozważ drenaż opłucnej / odbarczenie igłowe przed transportem.";
      } else if (fluidSites.length) {
        action = "PILNA KONSULTACJA CHIRURGICZNA: Krwawienie do jam ciała — kwalifikacja do pilnej laparotomii / angio-embolizacji.";
      }
    }

    return {
      windows: w,
      isPositive,
      hasTamponade,
      hasPneumothorax,
      fluidSites,
      ptxSites,
      summary,
      action,
    };
  }

  // --- 2. POCUS: BLUE Protocol (Bedside Lung Ultrasound in Emergency — Lichtenstein) ---
  function evaluateBLUE({ profileType = "A", lungSliding = true, lungPoint = false, plaps = false, dvtPresent = false }) {
    // profileType: "A" | "B" | "B_prime" | "A_prime" | "C"
    let profile = profileType;
    let primaryDiagnosis = "";
    let confidence = "Wysoka (zgodnie z protokołem BLUE)";
    let action = "";
    let alert = false;

    // Automated profile normalization based on signs
    if (!lungSliding && lungPoint) {
      profile = "A_prime";
    } else if (!lungSliding && profileType === "B") {
      profile = "B_prime";
    }

    switch (profile) {
      case "B":
        primaryDiagnosis = "Kardiogenny obrzęk płuc / Zespół pęcherzykowo-śródmiąższowy";
        action = "Pilna farmakoterapia niewydolności serca: tlenoterapia / CPAP, azotany, diuretyk pętlowy (furosemid).";
        break;
      case "B_prime":
        primaryDiagnosis = "Zapalenie płuc (zespół śródmiąższowy ze zniesionym ślizganiem opłucnej)";
        action = "Wdrożenie empirycznej antybiotykoterapii (wg wytycznych NPOA) oraz tlenoterapii.";
        break;
      case "A_prime":
        primaryDiagnosis = "Odma opłucnowa (brak ślizgania + obecny punkt płucny / Lung Point)";
        action = "Pilny drenaż opłucnej lub odbarczenie igłowe w przypadku odmy prężnej. Unikać wentylacji dodatnim ciśnieniem bez drenażu.";
        alert = true;
        break;
      case "C":
        primaryDiagnosis = "Zapalenie płuc (konsolidacja miąższu podopłucnowego / bronchogram powietrzny)";
        action = "Pobrać posiewy krwi i plwociny, wdrożyć antybiotykoterapię NPOA.";
        break;
      case "A":
      default:
        if (dvtPresent) {
          primaryDiagnosis = "Zatorowość płucna (Profil A + potwierdzona zakrzepica żył głębokich DVT)";
          action = "Natychmiastowe wdrożenie antykoagulacji terapeutycznej (HDCz / niefrakcjonowana heparyna), pilne angio-TK klatki piersiowej.";
          alert = true;
        } else if (plaps) {
          primaryDiagnosis = "Zapalenie płuc z wysiękiem opłucnowym (Profil A + PLAPS)";
          action = "Antybiotykoterapia empiryczna, rozważenie nakłucia diagnostycznego płynu w opłucnej.";
        } else {
          primaryDiagnosis = "Zaostrzenie POChP lub Astmy oskrzelowej (płuca ultrasonograficznie czyste)";
          action = "Leki rozszerzające oskrzela (salbutamol + ipratropium w nebulizacji), sterydoterapia systemowa.";
        }
        break;
    }

    return {
      profile,
      lungSliding: Boolean(lungSliding),
      lungPoint: Boolean(lungPoint),
      plaps: Boolean(plaps),
      dvtPresent: Boolean(dvtPresent),
      primaryDiagnosis,
      confidence,
      action,
      alert,
      summary: `Protokół BLUE: Profil ${profile} → Podejrzenie: ${primaryDiagnosis}.`,
    };
  }

  // --- 3. POCUS: FOCUS Echocardiography & DVT CUS ---
  function evaluateFOCUS({
    pericardialEffusion = "none", // "none" | "small" | "moderate" | "tamponade"
    rvEnlargement = false, // RV > LV or McConnell's sign
    lvContractility = "normal", // "hyperdynamic" | "normal" | "mild" | "moderate" | "severe"
    ivcDiameterMm = 18,
    ivcCollapsibility = 60, // percentage >50% or <50%
    dvtFemoral = "compressible", // "compressible" | "non_compressible"
    dvtPopliteal = "compressible",
  }) {
    const hasTamponade = pericardialEffusion === "tamponade";
    const hasDVT = dvtFemoral === "non_compressible" || dvtPopliteal === "non_compressible";
    const hasRVStrain = Boolean(rvEnlargement);

    let volumeStatus = "Prawidłowa wolemia (CVP ~5-10 mmHg)";
    if (ivcDiameterMm < 15 && ivcCollapsibility >= 50) {
      volumeStatus = "Hipowolemia / puste łożysko naczyniowe (CVP 0-5 mmHg) — wysokie prawdopodobieństwo odpowiedzi na płyny";
    } else if (ivcDiameterMm > 21 && ivcCollapsibility < 50) {
      volumeStatus = "Przeciążenie objętościowe / wysokie CVP (15-20 mmHg) — ryzyko przewodnienia, ostrożnie z płynoterapią";
    }

    let summary = "FOCUS: Badanie bez cech tamponady, przeciążenia prawej komory ani cech DVT.";
    let action = "Standardowe monitorowanie hemodynamiczne.";
    let alert = false;

    if (hasTamponade) {
      summary = "PILNY ALARM: Tamponada serca (duży płyn w osierdziu z rozkurczowym zapadaniem prawych jam serca i poszerzoną IVC).";
      action = "Pilna perikardiocenteza ratunkowa pod kontrolą USG, wlew płynowy, pilna konsultacja kardiochirurgiczna.";
      alert = true;
    } else if (hasRVStrain) {
      summary = "CECHY PRZECIĄŻENIA PRAWEJ KOMORY (RV > LV / objaw McConwella) — silne podejrzenie zatorowości płucnej.";
      action = "Ocena stabilności hemodynamicznej, natychmiastowa heparyna, w niestabilności rozważenie trombolizy systemowej.";
      alert = true;
    } else if (lvContractility === "severe") {
      summary = "Ciężka dysfunkcja skurczowa lewej komory (kardiogenny spadek frakcji wyrzutowej).";
      action = "Wsparcie inotropowe (dobutamina), unikanie nadmiernej płynoterapii, pilna konsultacja kardiologiczna.";
    } else if (hasDVT) {
      summary = "DODATNI WYNIK DVT CUS: Brak zapadalności żyły pod wpływem ucisku głowicy (potwierdzona zakrzepica żył głębokich).";
      action = "Wdrożenie terapeutycznej antykoagulacji (HDCz / DOAC).";
    }

    return {
      pericardialEffusion,
      hasTamponade,
      hasRVStrain,
      lvContractility,
      ivcDiameterMm: Number(ivcDiameterMm),
      ivcCollapsibility: Number(ivcCollapsibility),
      volumeStatus,
      hasDVT,
      summary,
      action,
      alert,
    };
  }

  // --- 4. Laboratory Medicine: hs-cTn (High-Sensitivity Troponin Kinetics 0/1h & 0/2h) ---
  function evaluateHsTroponin({ assay = "hs-cTnT", ctn0 = 10, ctn1 = null, deltaHours = 1 }) {
    const val0 = parseFloat(ctn0);
    const val1 = ctn1 !== null && ctn1 !== "" ? parseFloat(ctn1) : null;
    const delta = val1 !== null ? +(val1 - val0).toFixed(1) : null;

    // ESC 2023 Guidelines for Non-ST-Segment Elevation Acute Coronary Syndromes (NSTE-ACS)
    // Cut-offs for hs-cTnT (ng/L):
    // 0h: <5 (very low) -> Rule-out if chest pain >3h
    // 0h: >=52 -> Rule-in
    // 0/1h delta: <3 ng/L and 0h <12 -> Rule-out; delta >=5 ng/L -> Rule-in
    let category = "observe";
    let interpretation = "";
    let recommendation = "";

    if (assay === "hs-cTnT") {
      if (val0 < 5 && deltaHours >= 1) {
        category = "rule_out";
        interpretation = "Bardzo niskie stężenie wyjściowe hs-cTnT (<5 ng/L) — wykluczenie OZW (Rule-out).";
        recommendation = "Niskie ryzyko zgonu wewnątrzszpitalnego (<0.5%). Możliwy wczesny wypis i diagnostyka ambulatoryjna.";
      } else if (val0 >= 52) {
        category = "rule_in";
        interpretation = "Wysokie wyjściowe stężenie hs-cTnT (≥52 ng/L) — potwierdzenie zawału serca NSTEMI (Rule-in).";
        recommendation = "PILNA KORONAROGRAFIA (<24h lub natychmiast przy niestabilności), monitorowanie na OIOK, DAPT + antykoagulacja.";
      } else if (val1 !== null) {
        if (val0 < 12 && Math.abs(delta) < 3) {
          category = "rule_out";
          interpretation = `Brak istotnej dynamiki hs-cTnT (0h: ${val0}, 1h: ${val1}, Δ: ${delta} ng/L) — Rule-out.`;
          recommendation = "Wykluczenie ostrego uszkodzenia mięśnia sercowego w algorytmie 0/1h ESC.";
        } else if (delta >= 5) {
          category = "rule_in";
          interpretation = `Istotny przyrost stężenia hs-cTnT (Δ = +${delta} ng/L ≥ 5 ng/L) — Rule-in NSTEMI.`;
          recommendation = "Pilna kwalifikacja do inwazyjnego leczenia wieńcowego, leczenie przeciwpłytkowe i przeciwkrzepliwe.";
        } else {
          category = "observe";
          interpretation = `Strefa obserwacyjna (Observe zone: 0h: ${val0}, 1h: ${val1}, Δ: ${delta} ng/L).`;
          recommendation = "Wymagana ocena stężenia w 3. godzinie (0/3h), badanie echokardiograficzne i ponowna stratyfikacja ryzyka.";
        }
      } else {
        category = "observe";
        interpretation = `Pojedynczy wynik hs-cTnT 0h: ${val0} ng/L — oczekiwanie na pobranie w 1h.`;
        recommendation = "Pobrać drugą próbkę dokładnie 60 minut po pierwszym pobraniu krwi.";
      }
    } else {
      // Generic hs-cTnI (ng/L) standard ESC
      if (val0 < 4) {
        category = "rule_out";
        interpretation = "Bardzo niskie stężenie wyjściowe hs-cTnI (<4 ng/L) — Rule-out.";
        recommendation = "Wykluczenie OZW w algorytmie 0/1h ESC.";
      } else if (val0 >= 50) {
        category = "rule_in";
        interpretation = "Wysokie wyjściowe stężenie hs-cTnI (≥50 ng/L) — Rule-in.";
        recommendation = "Pilna koronarografia, leczenie przeciwpłytkowe.";
      } else if (val1 !== null) {
        if (delta >= 6) {
          category = "rule_in";
          interpretation = `Dodatnia dynamika hs-cTnI (Δ = +${delta} ng/L) — Rule-in.`;
          recommendation = "Wczesna strategia inwazyjna (koronarografia).";
        } else if (Math.abs(delta) < 4 && val0 < 15) {
          category = "rule_out";
          interpretation = `Stabilne stężenie hs-cTnI (Δ = ${delta} ng/L) — Rule-out.`;
          recommendation = "Wykluczenie NSTEMI.";
        } else {
          category = "observe";
          interpretation = "Strefa obserwacyjna — kontrola w 3h.";
          recommendation = "Monitorowanie, echo serca, powtórzenie w 3h.";
        }
      }
    }

    return {
      assay,
      ctn0: val0,
      ctn1: val1,
      deltaHours,
      delta,
      category,
      interpretation,
      recommendation,
    };
  }

  // --- 5. Laboratory Medicine: Age-Adjusted D-Dimer (ADJUST-PE) ---
  function evaluateAgeAdjustedDdimer({ age = 65, ddimer = 650 }) {
    const a = Math.max(1, parseFloat(age) || 50);
    const d = parseFloat(ddimer) || 0;

    // Standard cutoff: 500 ug/L FEU; Age-adjusted (age > 50): age * 10 ug/L
    const isAgeAdjusted = a > 50;
    const cutoff = isAgeAdjusted ? Math.round(a * 10) : 500;
    const isElevated = d > cutoff;

    let interpretation = "";
    let recommendation = "";

    if (!isElevated) {
      interpretation = `D-dimery (${d} µg/L) PONIŻEJ progu dostosowanego do wieku (${cutoff} µg/L dla wieku ${a} lat).`;
      recommendation = "Przy niskim/pośrednim prawdopodobieństwie klinicznym (Wells ≤ 4 pkt) zatorowość płucna / DVT bezpiecznie WYKLUCZONA bez konieczności angio-TK.";
    } else {
      interpretation = `D-dimery (${d} µg/L) POWYŻEJ progu skorygowanego (${cutoff} µg/L).`;
      recommendation = "Wskazana diagnostyka obrazowa drugiego rzutu: angio-TK klatki piersiowej (TKPA) lub USG doppler żył kończyn dolnych (CUS).";
    }

    return {
      age: a,
      ddimer: d,
      cutoff,
      isAgeAdjusted,
      isElevated,
      interpretation,
      recommendation,
    };
  }

  // --- 6. Laboratory Medicine: Lactate Clearance in Sepsis/Shock ---
  function evaluateLactateClearance({ lactate0 = 4.2, lactate1 = 2.8, hours = 2 }) {
    const l0 = parseFloat(lactate0) || 0;
    const l1 = parseFloat(lactate1) || 0;
    const h = parseFloat(hours) || 2;

    const clearancePct = l0 > 0 ? +(((l0 - l1) / l0) * 100).toFixed(1) : 0;
    const isAdequate = clearancePct >= 20.0;

    let interpretation = "";
    let recommendation = "";

    if (isAdequate) {
      interpretation = `Prawidłowy klirens mleczanów: spadek o ${clearancePct}% w czasie ${h}h (cel: ≥20%).`;
      recommendation = "Wskaźnik skutecznej resuscytacji hemodynamicznej i ustępowania hipoperfuzji tkankowej. Kontynuuj bieżącą terapię.";
    } else {
      interpretation = `Niedostateczny klirens mleczanów: zmiana o ${clearancePct}% w czasie ${h}h (niespełnione kryterium ≥20%).`;
      recommendation = "Utrzymująca się hipoperfuzja tkankowa / wstrząs. Wskazana eskalacja płynoterapii, wazopresorów (noradrenalina) lub wsparcia inotropowego.";
    }

    return {
      lactate0: l0,
      lactate1: l1,
      hours: h,
      clearancePct,
      isAdequate,
      interpretation,
      recommendation,
    };
  }

  // --- 7. Laboratory Medicine: Arterial Blood Gas (ABG) & Horowitz Index ---
  function evaluateABG({ ph = 7.28, pco2 = 55, po2 = 65, hco3 = 25, be = -1, fio2 = 0.21 }) {
    const sPh = parseFloat(ph) || 7.4;
    const sPco2 = parseFloat(pco2) || 40;
    const sPo2 = parseFloat(po2) || 90;
    const sHco3 = parseFloat(hco3) || 24;
    const sBe = parseFloat(be) || 0;
    const sFio2 = parseFloat(fio2) > 1.0 ? parseFloat(fio2) / 100 : (parseFloat(fio2) || 0.21);

    // Primary disturbance
    let disturbance = "Prawidłowa równowaga kwasowo-zasadowa";
    if (sPh < 7.35) {
      if (sPco2 > 45 && sHco3 < 22) disturbance = "Kwasica mieszana (oddechowo-metaboliczna)";
      else if (sPco2 > 45) disturbance = "Kwasica oddechowa (hipowentylacja / retencja CO2)";
      else if (sHco3 < 22) disturbance = "Kwasica metaboliczna";
    } else if (sPh > 7.45) {
      if (sPco2 < 35 && sHco3 > 26) disturbance = "Zasadowica mieszana";
      else if (sPco2 < 35) disturbance = "Zasadowica oddechowa (hiperwentylacja)";
      else if (sHco3 > 26) disturbance = "Zasadowica metaboliczna";
    }

    // Horowitz index (PaO2 / FiO2) - Berlin definition of ARDS
    const pfRatio = Math.round(sPo2 / sFio2);
    let ardsSeverity = "Prawidłowe utlenowanie krwi (P/F > 300)";
    if (pfRatio <= 100) ardsSeverity = "Ciężki ARDS (P/F ≤ 100 mmHg)";
    else if (pfRatio <= 200) ardsSeverity = "Umiarkowany ARDS (P/F 101-200 mmHg)";
    else if (pfRatio <= 300) ardsSeverity = "Łagodne uszkodzenie płuc / łagodny ARDS (P/F 201-300 mmHg)";

    return {
      ph: sPh,
      pco2: sPco2,
      po2: sPo2,
      hco3: sHco3,
      be: sBe,
      fio2: sFio2,
      disturbance,
      pfRatio,
      ardsSeverity,
      interpretation: `${disturbance}. Wskaźnik oksygenacji Horowitza (PaO2/FiO2): ${pfRatio} mmHg → ${ardsSeverity}.`,
    };
  }

  return {
    evaluateEFAST,
    evaluateBLUE,
    evaluateFOCUS,
    evaluateHsTroponin,
    evaluateAgeAdjustedDdimer,
    evaluateLactateClearance,
    evaluateABG,
  };
});
