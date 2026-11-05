// Clinical Decision Support (CDS) Safety Engine & Drug-Drug Interactions (DDI) v2.1
// CKD-EPI 2021 eGFR, Cockcroft-Gault, Critical Emergency DDIs & Contraindication Rules
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClinicalSafety = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // --- 1. Renal Function: CKD-EPI 2021 Formula (without race factor) ---
  function calculateEGFR({ creatinineMgDl = 1.0, age = 45, sex = "m" }) {
    const scr = Math.max(0.1, parseFloat(creatinineMgDl) || 1.0);
    const a = Math.max(18, parseFloat(age) || 45);
    const isFemale = sex.toLowerCase() === "f" || sex.toLowerCase() === "k";

    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const minVal = Math.min(scr / kappa, 1);
    const maxVal = Math.max(scr / kappa, 1);
    const genderMult = isFemale ? 1.012 : 1.0;

    // eGFR = 142 * (min(Scr/kappa, 1)^alpha) * (max(Scr/kappa, 1)^-1.200) * (0.9938^Age) * genderMult
    const egfr = Math.round(
      142 *
        Math.pow(minVal, alpha) *
        Math.pow(maxVal, -1.2) *
        Math.pow(0.9938, a) *
        genderMult
    );

    let stage = "G1 (Prawidłowa lub wysoka filtracja: ≥90)";
    let severity = "normal";
    if (egfr < 15) {
      stage = "G5 (Schyłkowa niewydolność nerek: <15 ml/min/1.73m²)";
      severity = "critical";
    } else if (egfr < 30) {
      stage = "G4 (Ciężkie upośledzenie filtracji: 15-29 ml/min/1.73m²)";
      severity = "critical";
    } else if (egfr < 45) {
      stage = "G3b (Umiarkowane do ciężkiego upośledzenie: 30-44 ml/min/1.73m²)";
      severity = "warning";
    } else if (egfr < 60) {
      stage = "G3a (Łagodne do umiarkowanego upośledzenie: 45-59 ml/min/1.73m²)";
      severity = "warning";
    } else if (egfr < 90) {
      stage = "G2 (Wczesne/łagodne obniżenie filtracji: 60-89 ml/min/1.73m²)";
      severity = "normal";
    }

    return {
      creatinineMgDl: scr,
      age: a,
      sex: isFemale ? "f" : "m",
      egfr,
      stage,
      severity,
    };
  }

  // --- 2. Renal Clearance: Cockcroft-Gault Equation ---
  function calculateCockcroftGault({ creatinineMgDl = 1.0, age = 45, weightKg = 70, sex = "m" }) {
    const scr = Math.max(0.1, parseFloat(creatinineMgDl) || 1.0);
    const a = Math.max(18, parseFloat(age) || 45);
    const w = Math.max(20, parseFloat(weightKg) || 70);
    const isFemale = sex.toLowerCase() === "f" || sex.toLowerCase() === "k";

    // CrCl = ((140 - Age) * Weight) / (72 * Scr) * (0.85 if female)
    let crcl = ((140 - a) * w) / (72 * scr);
    if (isFemale) crcl *= 0.85;

    return +(crcl.toFixed(1));
  }

  // --- 3. Drug-Drug Interactions (DDI) & Clinical Safety Engine ---
  // Categories:
  // "X" - Bezwzględne przeciwwskazanie / zagrażające życiu (Critical Red Alert)
  // "D" - Poważna interakcja / wymagana pilna modyfikacja lub monitorowanie (Amber Warning)
  // "C" - Istotna klinicznie interakcja / wymagana ostrożność

  function normalizeDrugTokens(text) {
    if (!text) return "";
    return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function evaluatePatientSafety({
    patientProfile = {},
    orderedDrugs = [],
  }) {
    const p = Object.assign(
      {
        creatinine: 1.0,
        egfr: 90,
        age: 45,
        sex: "m",
        weight: 70,
        allergies: [], // "penicillin_anaphylaxis", "penicillin_rash", "aspirin_asthma", "nsaid", "contrast"
        comorbidities: [], // "ckd_advanced", "peptic_ulcer", "prolonged_qt", "asthma", "pregnancy", "active_bleed"
      },
      patientProfile
    );

    // Calculate eGFR if not directly provided
    if (!p.egfr && p.creatinine) {
      p.egfr = calculateEGFR({ creatinineMgDl: p.creatinine, age: p.age, sex: p.sex }).egfr;
    }

    const drugTokens = orderedDrugs.map((d) => normalizeDrugTokens(typeof d === "string" ? d : d.name + " " + (d.dose || "")));
    const alerts = [];

    function hasDrug(pattern) {
      return drugTokens.some((t) => pattern.test(t));
    }
    function hasAllergy(key) {
      return (p.allergies || []).includes(key);
    }
    function hasComorbidity(key) {
      return (p.comorbidities || []).includes(key);
    }

    // --- Rule 1: QTc Prolongation & Torsades de Pointes (TdP) ---
    const qtDrugs = [
      { pattern: /amiodaron/, name: "Amiodaron" },
      { pattern: /klarytromycyn|azytromycyn|makrolid/, name: "Makrolid" },
      { pattern: /cyprofloksacyn|lewofloksacyn|chinolon/, name: "Fluorochinolon" },
      { pattern: /ondansetron/, name: "Ondansetron" },
      { pattern: /haloperidol/, name: "Haloperidol" },
    ];
    const matchedQt = qtDrugs.filter((q) => hasDrug(q.pattern)).map((q) => q.name);

    if (matchedQt.length >= 2 || (matchedQt.length >= 1 && hasComorbidity("prolonged_qt"))) {
      alerts.push({
        id: "DDI_QT_PROLONGATION",
        category: "X",
        title: "Krytyczne ryzyko wydłużenia QTc i komorowych zaburzeń rytmu (Torsades de Pointes / VF)",
        mechanism: `Równoczesne podanie leków wydłużających odstęp QT (${matchedQt.join(" + ")})${hasComorbidity("prolonged_qt") ? " u pacjenta z wyjściowo wydłużonym QTc" : ""}.`,
        action: "Ciągłe monitorowanie EKG kardiomonitorem, wyrównanie hipokaliemii (K+ ≥ 4.5 mmol/L) i hipomagnezemii (Mg2+ ≥ 1.0 mmol/L). W razie możliwości zamiana antybiotyku na beta-laktam.",
        drugsInvolved: matchedQt,
      });
    }

    // --- Rule 2: Renal Failure & "Triple Whammy" (NSAIDs + CKD / ACEI / Diuretics) ---
    const hasNsaid = hasDrug(/ketoprofen|ibuprofen|diklofenak|aspiryn|nlp|kwas acetylosalicylow/);
    const hasAceiArb = hasDrug(/ramipryl|peryndopryl|enalapryl|walsartan|losartan|kandestartan/);
    const hasDiuretic = hasDrug(/furosemid|torasemid|spironolakton|hydrochlorotiazyd/);
    const isSevereCKD = p.egfr < 30 || hasComorbidity("ckd_advanced");

    if (hasNsaid && isSevereCKD) {
      alerts.push({
        id: "CONTRA_NSAID_CKD",
        category: "X",
        title: "Bezwzględne przeciwwskazanie: NLPZ w ciężkiej niewydolności nerek (eGFR < 30 ml/min/1.73m²)",
        mechanism: `NLPZ hamują prostaglandynową autoregulację przepływu w kłębuszkach (skurcz tętniczki doprowadzającej), wywołując ostrą martwicę cewek i anurię u pacjenta z eGFR ${p.egfr} ml/min.`,
        action: "Natychmiast wycofaj NLPZ. Jako lek przeciwbólowy I rzutu zastosuj Paracetamol (do 3-4g/d) lub Metamizol, a przy silnym bólu miareczkowaną dożylną Morfinę/Oksykodon.",
        drugsInvolved: ["NLPZ"],
      });
    } else if (hasNsaid && hasAceiArb && hasDiuretic) {
      alerts.push({
        id: "DDI_TRIPLE_WHAMMY",
        category: "D",
        title: "Zespół 'Triple Whammy': Drastyczny spadek filtracji kłębuszkowej i ostre uszkodzenie nerek (AKI)",
        mechanism: "Skojarzenie NLPZ (zwężenie tętniczki doprowadzającej) + ACEI/ARB (rozszerzenie tętniczki odprowadzającej) + Diuretyk (hipowolemia).",
        action: "Odstaw NLPZ na rzecz bezpiecznego analgetyku (Paracetamol). Monitoruj diurezę godzinową i kontroluj stężenie kreatyniny i potasu.",
        drugsInvolved: ["NLPZ", "ACEI/ARB", "Diuretyk"],
      });
    }

    // Aminoglycosides in Renal Failure
    if (hasDrug(/gentamycyn|amikacyn|tobramycyn/) && p.egfr < 50) {
      alerts.push({
        id: "CONTRA_AMINOGLYCOSIDE_CKD",
        category: "D",
        title: "Ryzyko ostrej nefrotoksyczności i ototoksyczności aminoglikozydu przy eGFR < 50 ml/min",
        mechanism: `Akumulacja leku w korze nerek i uchu wewnętrznym z powodu obniżonego klirensu nerkowego (${p.egfr} ml/min).`,
        action: "Wydłuż odstęp między dawkami (np. co 36-48h zamiast co 24h), oznaczaj stężenie minimalne (Cmin < 1 mg/L) przed kolejną dawką.",
        drugsInvolved: ["Aminoglikozyd"],
      });
    }

    // --- Rule 3: Bleeding Risk & Anticoagulant + DAPT + NSAID ---
    const hasAnticoagulant = hasDrug(/heparyn|enoksaparyn|fondaparynuks|rywaroksaban|apiksaban|dabigatran/);
    const hasAntiplatelet = hasDrug(/klopidogrel|tikagrelor|prasugrel|aspiryn/);
    const hasUlcerRisk = hasComorbidity("peptic_ulcer") || hasComorbidity("active_bleed");

    if (hasNsaid && hasAnticoagulant && hasAntiplatelet) {
      alerts.push({
        id: "DDI_TRIPLE_BLEEDING",
        category: "X",
        title: "Krytyczne ryzyko masywnego krwawienia z przewodu pokarmowego / śródczaszkowego",
        mechanism: "Równoczesna pełna antykoagulacja + lek przeciwpłytkowy + uszkodzenie błony śluzowej i hamowanie COX-1 przez NLPZ.",
        action: "Bezwzględnie odstaw NLPZ. Zastosuj osłonę inhibitorem pompy protonowej (Pantoprazol 40 mg i.v.). Do uśmierzenia bólu użyj Paracetamolu lub opioidów.",
        drugsInvolved: ["NLPZ", "Antykoagulant", "Lek przeciwpłytkowy"],
      });
    } else if (hasNsaid && hasUlcerRisk) {
      alerts.push({
        id: "CONTRA_NSAID_ULCER",
        category: "X",
        title: "Przeciwwskazanie do NLPZ: Czynne lub przebyte krwawienie z górnego odcinka przewodu pokarmowego",
        mechanism: "Miejscowe uszkodzenie błony śluzowej żołądka i upośledzenie hemostazy płytkowej.",
        action: "Odstaw NLPZ, włącz dożylny IPP (Pantoprazol 40 mg). Analgezja alternatywna: Paracetamol / Opioidy.",
        drugsInvolved: ["NLPZ"],
      });
    }

    // --- Rule 4: Allergies & Cross-Reactivity ---
    const hasPenicillin = hasDrug(/amoksycylin|augmentin|ampicylin|piperacylin|penicylin/);
    const hasCephalosporin = hasDrug(/ceftriakson|cefuroksym|cefotaksym|cefazolin|cefaleksyn/);

    if (hasAllergy("penicillin_anaphylaxis") && hasPenicillin) {
      alerts.push({
        id: "ALLERGY_PENICILLIN_ANAPHYLAXIS",
        category: "X",
        title: "BEZWZGLĘDNE PRZECIWWSKAZANIE: Ciężka anafilaksja na penicyliny w wywiadzie",
        mechanism: "Reakcja nadwrażliwości typu I zależna od IgE — bezpośrednie zagrożenie wstrząsem anafilaktycznym i zgonem.",
        action: "NATYCHMIAST WYCOFAJ PENICYLINY. Jako terapię alternatywną zastosuj Fluorochinolon (Ciprofloksacyna / Lewofloksacyna), Makrolid lub Aztreonam / Wankomycynę.",
        drugsInvolved: ["Penicylina"],
      });
    } else if (hasAllergy("penicillin_anaphylaxis") && hasCephalosporin) {
      alerts.push({
        id: "ALLERGY_CROSS_CEPHALOSPORIN",
        category: "D",
        title: "Ostrzeżenie: Ryzyko reakcji krzyżowej cefalosporyny przy anafilaksji na penicylinę",
        mechanism: "Podobieństwo łańcuchów bocznych pierścienia beta-laktamowego (ryzyko reakcji krzyżowej wynosi 1-3% dla cefalosporyn III generacji).",
        action: "Ceftriakson i Cefotaksym mają odmienny łańcuch boczny i mogą być podane wyłącznie w warunkach ścisłego nadzoru anestezjologicznego z przygotowaną Adrenaliną.",
        drugsInvolved: ["Cefalosporyna"],
      });
    }

    if (hasAllergy("aspirin_asthma") && hasNsaid) {
      alerts.push({
        id: "ALLERGY_SAMTER_TRIAD",
        category: "X",
        title: "Zagrażający życiu skurcz oskrzeli: Triada Widal-Samtera (Astma aspirynowa)",
        mechanism: "Zablokowanie COX-1 powoduje gwałtowny przesunięcie metabolizmu kwasu arachidonowego na szlak lipooksygenazy i masową produkcję leukotrienów kurczących oskrzela.",
        action: "BEZWZGLĘDNY ZAKAZ PODAWANIA NLPZ I ASPIRYNY. Zastosuj Paracetamol w dawce ≤500 mg lub Metamizol / Morfinę.",
        drugsInvolved: ["NLPZ / Kwas acetylosalicylowy"],
      });
    }

    // --- Rule 5: CNS & Respiratory Depression (Opioids + Benzodiazepines) ---
    const hasOpioid = hasDrug(/morfin|oksykodon|fentanyl|tramadol|buprenorfin/);
    const hasBzd = hasDrug(/midazolam|diazepam|lorazepam|klonazepam/);

    if (hasOpioid && hasBzd) {
      alerts.push({
        id: "DDI_RESPIRATORY_DEPRESSION",
        category: "D",
        title: "Głęboka depresja ośrodka oddechowego i sedacja (Opioid + Benzodiazepina)",
        mechanism: "Synergistyczne hamowanie napędu oddechowego w pniu mózgu.",
        action: "Konieczny ciągły monitoring kapnografią (EtCO2) i pulsoksymetrią. Zabezpiecz ampułkę Naloksonu (0.4 mg) oraz Flumazenilu (0.5 mg) przy łóżku pacjenta.",
        drugsInvolved: ["Opioid", "Benzodiazepina"],
      });
    }

    // --- Rule 6: Cardiovascular Collapse ---
    const hasNitrate = hasDrug(/nitrogliceryn|monoazotan|diazotan|azotan/);
    const hasPde5 = hasDrug(/sildenafil|tadalafil|wardenafil/);

    if (hasNitrate && hasPde5) {
      alerts.push({
        id: "DDI_NITRATE_PDE5",
        category: "X",
        title: "Krytyczna zapaść naczyniowa i oporna na płyny hipotensja (Azotan + Inhibitor PDE-5)",
        mechanism: "Masywne nagromadzenie cGMP w mięśniówce gładkiej naczyń krwionośnych prowadzące do nieodwracalnej wazodylatacji.",
        action: "BEZWZGLĘDNY ZAKAZ PODANIA AZOTANÓW w ciągu 24h od zażycia sildenafilu (48h dla tadalafilu). W razie spadku ciśnienia wdrożyć płynoterapię i wazopresory (Noradrenalina).",
        drugsInvolved: ["Azotan", "Inhibitor PDE-5"],
      });
    }

    // --- Rule 7: Pregnancy & Teratogenicity ---
    if (hasComorbidity("pregnancy")) {
      const teratogenicDrugs = [
        { pattern: /doksycyklin|tetracyklin/, name: "Doksycyklina (uszkodzenie kośćca i zębów)" },
        { pattern: /cyprofloksacyn|lewofloksacyn/, name: "Fluorochinolon (artropatia chrząstek wzrostowych)" },
        { pattern: /ketoprofen|ibuprofen/, name: "NLPZ w III trymestrze (przedwczesne zamknięcie przewodu Botalla)" },
        { pattern: /ramipryl|peryndopryl|enalapryl/, name: "ACEI (teratogenność, hipoplazja nerek płodu)" },
      ];
      teratogenicDrugs.forEach((td) => {
        if (hasDrug(td.pattern)) {
          alerts.push({
            id: "CONTRA_PREGNANCY",
            category: "X",
            title: `Bezwzględne przeciwwskazanie w ciąży: ${td.name}`,
            mechanism: "Potwierdzone działanie embriotoksyczne, teratogenne lub zagrażające krążeniu płodowemu.",
            action: "Wycofaj lek. Zastosuj leki bezpieczne w ciąży (kategoria B FDA: amoksycylina, paracetamol, cefalosporyny).",
            drugsInvolved: [td.name],
          });
        }
      });
    }

    const criticalCount = alerts.filter((a) => a.category === "X").length;
    const warningCount = alerts.filter((a) => a.category === "D").length;
    const isSafe = criticalCount === 0;

    let summary = "Audyt bezpieczeństwa CDS: Brak zidentyfikowanych krytycznych interakcji i przeciwwskazań.";
    if (criticalCount > 0) {
      summary = `AUDYT BEZPIECZEŃSTWA: Wykryto ${criticalCount} krytycznych przeciwwskazań (Kategoria X)! Wymagana natychmiastowa weryfikacja.`;
    } else if (warningCount > 0) {
      summary = `Audyt bezpieczeństwa: Wykryto ${warningCount} poważnych interakcji (Kategoria D) wymagających nadzoru.`;
    }

    return {
      patientProfile: p,
      orderedDrugs,
      alerts,
      criticalCount,
      warningCount,
      isSafe,
      summary,
    };
  }

  return {
    calculateEGFR,
    calculateCockcroftGault,
    evaluatePatientSafety,
  };
});
