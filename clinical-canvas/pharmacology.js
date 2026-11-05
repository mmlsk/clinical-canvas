// Clinical Pharmacology & Emergency Therapeutics Suite v2.1
// Polish NPOA Guidelines, ERC/ALS 2025-2026, Holliday-Segar, Adrogue-Madias
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClinicalPharmacology = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function estimatePediatricWeight(ageYears) {
    const age = parseFloat(ageYears);
    if (!Number.isFinite(age) || age < 0) return 10;
    if (age < 1) return Math.max(3.5, +(age * 6 + 3.5).toFixed(1));
    if (age <= 5) return +(age * 2 + 8).toFixed(1);
    if (age <= 12) return +(age * 3 + 7).toFixed(1);
    return Math.min(70, +(age * 3.5).toFixed(0));
  }

  function emergencyDoses(weightKg, isChild = false) {
    const w = Math.max(2, Math.min(200, parseFloat(weightKg) || (isChild ? 15 : 70)));
    const child = Boolean(isChild || w < 40);

    return {
      weight: w,
      isChild: child,
      adrenalineAnaphylaxis: {
        indication: "Wstrząs anafilaktyczny / ciężka anafilaksja",
        route: "i.m. (przednio-boczna powierzchnia uda)",
        prep: "Ampułka 1 mg / 1 ml (1:1000 nierozcieńczona)",
        doseMg: child ? Math.min(0.5, Math.max(0.05, +(w * 0.01).toFixed(2))) : 0.5,
        volumeMl: child ? Math.min(0.5, Math.max(0.05, +(w * 0.01).toFixed(2))) : 0.5,
        notes: "Powtórzyć po 5-10 min przy braku poprawy. Strzykawka tuberkulinowa 1 ml u małych dzieci.",
      },
      adrenalineCardiacArrest: {
        indication: "Zatrzymanie krążenia (RKO ALS/EPLS)",
        route: "i.v. / i.o. bolus + przepłukanie 10-20 ml 0.9% NaCl",
        prep: "1:10 000 (1 mg w 10 ml 0.9% NaCl = 0.1 mg/ml)",
        doseMg: child ? Math.min(1.0, +(w * 0.01).toFixed(2)) : 1.0,
        volumeMl: child ? Math.min(10.0, +(w * 0.1).toFixed(1)) : 10.0,
        notes: "W rytmach do defibrylacji po 3. defibrylacji; w PEA/asystolii natychmiast. Powtarzać co 3-5 min.",
      },
      amiodaroneCardiacArrest: {
        indication: "Migotanie komór / VT bez tętna oporne na defibrylację",
        route: "i.v. / i.o. bolus po 3. i 5. defibrylacji",
        prep: "Ampułka 150 mg / 3 ml (50 mg/ml)",
        doseMgFirst: child ? Math.min(300, +(w * 5).toFixed(0)) : 300,
        volumeMlFirst: child ? Math.min(6.0, +((w * 5) / 50).toFixed(1)) : 6.0,
        doseMgSecond: child ? Math.min(150, +(w * 5).toFixed(0)) : 150,
        volumeMlSecond: child ? Math.min(3.0, +((w * 5) / 50).toFixed(1)) : 3.0,
        notes: "Druga dawka po 5. defibrylacji. Rozcieńczyć w 5% Glukozie przy powolnym wlewie.",
      },
      atropineBradycardia: {
        indication: "Objawowa bradykardia (stymulacja nerwu błędnego)",
        route: "i.v. / i.o.",
        prep: "Ampułka 1 mg / 1 ml",
        doseMg: child ? Math.min(0.5, Math.max(0.1, +(w * 0.02).toFixed(2))) : 0.5,
        volumeMl: child ? Math.min(0.5, Math.max(0.1, +(w * 0.02).toFixed(2))) : 0.5,
        notes: "U dzieci dawka min. 0.1 mg (zapobieganie paradoksalnej bradykardii). U dorosłych maks. 3 mg.",
      },
      midazolamSeizures: {
        indication: "Napad drgawkowy / stan padaczkowy",
        route: "b.u.c. (na śluzówkę policzka) lub i.m.",
        prep: "Ampułka 5 mg / 1 ml lub 10 mg / 2 ml",
        doseMg: Math.min(10, +(w * 0.2).toFixed(1)),
        volumeMl: +((Math.min(10, +(w * 0.2).toFixed(1))) / 5).toFixed(2),
        notes: "Jeśli brak dostępu dożylnego. Alternatywa i.v.: 0.1-0.15 mg/kg powoli.",
      },
      diazepamSeizures: {
        indication: "Napad drgawkowy (wlewka doodbytnicza)",
        route: "p.r. (doodbytniczo)",
        prep: "Wlewki 5 mg lub 10 mg",
        doseMg: child ? (w < 15 ? 5 : 10) : 10,
        notes: "U niemowląt i dzieci <15 kg wlewka 5 mg, ≥15 kg i dorośli wlewka 10 mg.",
      },
      salbutamolNebulization: {
        indication: "Zaostrzenie astmy / obturacja oskrzeli",
        route: "Wziewnie w nebulizacji z tlenem",
        prep: "Ampułki 2.5 mg / 2.5 ml lub 5 mg / 2.5 ml",
        doseMg: child && w < 20 ? 2.5 : 5.0,
        volumeMl: 2.5,
        notes: "Podawać z przepływem tlenu 6-8 l/min. Można łączyć z bromkiem ipratropium.",
      },
      ipratropiumNebulization: {
        indication: "Ciężki skurcz oskrzeli / astma / POChP",
        route: "Wziewnie w nebulizacji",
        prep: "Ampułki 0.25 mg / 2 ml lub 0.5 mg / 2 ml",
        doseMg: child && w < 20 ? 0.25 : 0.5,
        notes: "Dodać do salbutamolu w nebulizacji co 20 min w pierwszej godzinie ciężkiego zaostrzenia.",
      },
      hydrocortisone: {
        indication: "Anafilaksja / zaostrzenie astmy / niewydolność kory nadnerczy",
        route: "i.v. powoli",
        doseMg: child ? Math.min(200, +(w * 4).toFixed(0)) : 200,
        notes: "Dzieci 4-5 mg/kg i.v. Dorośli 100-200 mg i.v.",
      },
      glucoseHypoglycemia: {
        indication: "Ciężka objawowa hipoglikemia",
        route: "i.v. powoli do dużej żyły",
        prep: child ? "Glukoza 10% (100 mg/ml)" : "Glukoza 20% lub 40%",
        doseDescription: child
          ? `${+(w * 2.5).toFixed(0)} - ${+(w * 5).toFixed(0)} ml Glukozy 10% i.v. bolus`
          : "40-50 ml Glukozy 20% i.v. (lub 20-25 ml Glukozy 40% i.v.)",
        notes: "Docelowa glikemia >70 mg/dl. Przepłukać żyłę 0.9% NaCl, monitorować wkłucie.",
      },
      fluidResuscitation: {
        indication: "Wstrząs hipowolemiczny / anafilaktyczny / septyczny",
        route: "i.v. / i.o. pod ciśnieniem",
        solution: "Płyn wieloelektrolitowy (PWE, Plasmalyte) lub 0.9% NaCl",
        doseDescription: child
          ? `${+(w * 20).toFixed(0)} ml (bolus 20 ml/kg w ciągu 10-15 min)`
          : `500 ml w bolusie w 15 min; w sepsie 30 ml/kg = ${+(w * 30).toFixed(0)} ml w ciągu pierwszych 3h`,
        notes: "U dzieci z kardiomiopatią lub ciężkim urazem głowy ostrożnie 10 ml/kg. Oceniać objawy przewodnienia (wątroba, trzeszczenia).",
      },
    };
  }

  function hollidaySegar(weightKg) {
    const w = Math.max(1, Math.min(200, parseFloat(weightKg) || 70));
    let dailyMl = 0;
    let hourlyMl = 0;

    if (w <= 10) {
      dailyMl = w * 100;
      hourlyMl = w * 4;
    } else if (w <= 20) {
      dailyMl = 1000 + (w - 10) * 50;
      hourlyMl = 40 + (w - 10) * 2;
    } else {
      dailyMl = 1500 + (w - 20) * 20;
      hourlyMl = 60 + (w - 20) * 1;
    }

    return {
      weight: w,
      dailyMl: Math.round(dailyMl),
      hourlyMl: Math.round(hourlyMl),
      dropRateMin: Math.round((hourlyMl * 20) / 60), // standard 20 drops/ml
    };
  }

  function sodiumDeficit({ weightKg, sex = "m", age = 45, serumNa = 120, targetNa = 130, infusateNa = 154 }) {
    const w = Math.max(2, parseFloat(weightKg) || 70);
    const sNa = parseFloat(serumNa) || 120;
    const tNa = parseFloat(targetNa) || 130;
    const infNa = parseFloat(infusateNa) || 154; // 154 for 0.9% NaCl, 513 for 3% NaCl

    let tbwFactor = 0.6;
    if (age < 16) tbwFactor = 0.6;
    else if (age >= 65) tbwFactor = sex === "m" ? 0.5 : 0.45;
    else tbwFactor = sex === "m" ? 0.6 : 0.5;

    const tbw = +(w * tbwFactor).toFixed(1);
    const totalDeficitMmol = +(tbw * (tNa - sNa)).toFixed(1);
    const deltaNaPerLiter = +((infNa - sNa) / (tbw + 1)).toFixed(2);
    const requiredLiters = deltaNaPerLiter > 0 ? +(Math.abs(tNa - sNa) / deltaNaPerLiter).toFixed(2) : 0;

    return {
      weight: w,
      tbw,
      serumNa: sNa,
      targetNa: tNa,
      infusateNa: infNa,
      totalDeficitMmol,
      deltaNaPerLiter,
      requiredLiters,
      maxSafe24hChange: "8-10 mmol/L / 24h",
      warning: "Nie przekraczać tempa korekty 8-10 mmol/L/24h (max 0.5 mmol/L/h) z powodu ryzyka osmotycznej mielinozy mostu (ODS).",
    };
  }

  function acidBase({ na = 140, cl = 104, hco3 = 24, alb = 4.0, weightKg = 70 }) {
    const sNa = parseFloat(na) || 140;
    const sCl = parseFloat(cl) || 104;
    const sHco3 = parseFloat(hco3) || 24;
    const sAlb = parseFloat(alb) || 4.0;
    const w = parseFloat(weightKg) || 70;

    const anionGap = +(sNa - (sCl + sHco3)).toFixed(1);
    const correctedAG = +(sAlb < 4.0 ? anionGap + 2.5 * (4.0 - sAlb) : anionGap).toFixed(1);
    const isHAGMA = correctedAG > 12.0;
    const deltaGap = +((correctedAG - 12.0) - (24.0 - sHco3)).toFixed(1);
    const bicarbDeficit = +(0.5 * w * Math.max(0, 24.0 - sHco3)).toFixed(1);

    let interpretation = "Prawidłowa luka anionowa (AG 8-12 mEq/L).";
    if (isHAGMA) {
      interpretation = "Kwasica metaboliczna z podwyższoną luką anionową (HAGMA). Przyczyny: MUDPILES (Mleczanowa, Kwasica ketonowa, Toksyny/Glikol, Mocznicowa).";
      if (deltaGap > 6) interpretation += " Współistnieje zasadowica metaboliczna (Delta Gap > +6).";
      else if (deltaGap < -6) interpretation += " Współistnieje kwasica metaboliczna z prawidłową luką anionową (Delta Gap < -6).";
    } else if (sHco3 < 22) {
      interpretation = "Kwasica metaboliczna z prawidłową luką anionową (NAGMA / hiperchloremiczna). Przyczyny: Utrata HCO3 przez przewód pokarmowy (biegunki), kwasica cewkowa, nadmierna podaż 0.9% NaCl.";
    }

    return {
      anionGap,
      correctedAG,
      isHAGMA,
      deltaGap,
      bicarbDeficitMmol: bicarbDeficit,
      interpretation,
    };
  }

  const OPIOID_FACTORS = {
    morphine_po: 1.0,
    morphine_iv: 3.0,
    morphine_sc: 3.0,
    oxycodone_po: 1.5,
    oxycodone_iv: 3.0,
    tramadol_po: 0.1,
    tramadol_iv: 0.1,
    codeine_po: 0.15,
    fentanyl_patch_mcgh: 2.4, // 25 mcg/h = 60 mg/d oral morphine (factor 2.4 per mcg/h)
  };

  function convertOpioid({ drugFrom, doseFrom, drugTo }) {
    const fFrom = OPIOID_FACTORS[drugFrom] || 1.0;
    const fTo = OPIOID_FACTORS[drugTo] || 1.0;
    const dose = parseFloat(doseFrom) || 0;

    const oralMorphineEquiv = +(dose * fFrom).toFixed(1);
    const convertedDose = +(oralMorphineEquiv / fTo).toFixed(1);
    const breakthroughDose = +(convertedDose / 6).toFixed(1);

    return {
      drugFrom,
      doseFrom: dose,
      drugTo,
      oralMorphineEquiv,
      convertedDose,
      breakthroughDose,
      breakthroughDoseRange: `${+(convertedDose / 10).toFixed(1)} - ${+(convertedDose / 6).toFixed(1)}`,
      notes: "Przy zamianie opioidów z powodu tolerancji krzyżowej zaleca się redukcję dawki wyliczonej o 25-50% i stopniowe miareczkowanie do efektu.",
    };
  }

  const ANTIBIOTICS_NPOA = [
    {
      category: "Pozaszpitalne zapalenie płuc (CAP)",
      subgroup: "Lekkie (CURB-65: 0-1 pkt, leczenie ambulatoryjne)",
      firstLine: "Amoksycylina 3x 1000 mg p.o. przez 5-7 dni",
      alternative: "W alergii nieanafilaktycznej: Cefuroksym aksetyl 2x 500 mg p.o.; w anafilaktycznej: Klarytromycyna 2x 500 mg p.o. lub Doksycyklina 1x 100-200 mg p.o.",
      notes: "NPOA 2024: Amoksycylina w monoterapii pozostaje lekiem z wyboru ze względu na doskonałą aktywność wobec S. pneumoniae.",
    },
    {
      category: "Pozaszpitalne zapalenie płuc (CAP)",
      subgroup: "Umiarkowane (CURB-65: 2 pkt, oddział chorób wewnętrznych)",
      firstLine: "Amoksycylina z kwasem klawulanowym 3x 1.2 g i.v. + Makrolid (Klarytromycyna 2x 500 mg p.o./i.v.)",
      alternative: "Cefotaksym 3x 1-2 g i.v. LUB Ceftriakson 1x 2 g i.v. + Makrolid",
      notes: "Skojarzenie beta-laktamu z makrolidem pokrywa florę atypową (Mycoplasma, Chlamydia, Legionella).",
    },
    {
      category: "Pozaszpitalne zapalenie płuc (CAP)",
      subgroup: "Ciężkie (CURB-65: ≥3 pkt, OIOK / intensywny nadzór)",
      firstLine: "Ceftriakson 1x 2 g i.v. (lub Cefotaksym 3x 2 g i.v.) + Klarytromycyna 2x 500 mg i.v. LUB Lewofloksacyna 1x 500 mg i.v.",
      alternative: "Przy ryzyku Pseudomonas (rozstrzenie, POChP): Piperacylina/tazobaktam 4x 4.5 g i.v. + Cyprofloksacyna 2x 400 mg i.v.",
      notes: "Krew na posiew przed podaniem pierwszej dawki antybiotyku; czas do podania < 1 godzina.",
    },
    {
      category: "Zakażenia układu moczowego (ZUM)",
      subgroup: "Niepowikłane zapalenie pęcherza moczowego u kobiet",
      firstLine: "Fosfomycyna trometamol 1x 3 g p.o. jednorazowo LUB Furazydyna 4x 100 mg p.o. przez 7-10 dni",
      alternative: "Kotrimoksazol 2x 960 mg p.o. przez 3 dni (jeśli lokalna oporność E. coli < 20%) LUB Cefaleksyna 3x 500 mg p.o.",
      notes: "Unikać fluorochinolonów w niepowikłanym zapaleniu pęcherza (rekomendacje EMA i NPOA ze względu na profil bezpieczeństwa).",
    },
    {
      category: "Zakażenia układu moczowego (ZUM)",
      subgroup: "Ostre odmiedniczkowe zapalenie nerek (lekkie / ambulatoryjne)",
      firstLine: "Cyprofloksacyna 2x 500 mg p.o. przez 7 dni LUB Lewofloksacyna 1x 500 mg p.o. przez 7 dni",
      alternative: "Cefuroksym aksetyl 2x 500 mg p.o. przez 10-14 dni LUB Kotrimoksazol 2x 960 mg przez 14 dni",
      notes: "Zawsze posiew moczu z antybiogramem przed rozpoczęciem leczenia.",
    },
    {
      category: "Zakażenia układu moczowego (ZUM)",
      subgroup: "Ostre odmiedniczkowe zapalenie nerek (ciężkie / hospitalizacja)",
      firstLine: "Ceftriakson 1x 1-2 g i.v. LUB Cefuroksym 3x 1.5 g i.v. LUB Cyprofloksacyna 2x 400 mg i.v.",
      alternative: "W sepsie urologicznej / wstrząsie: Piperacylina z tazobaktamem 4x 4.5 g i.v. LUB Karbapenem (Meropenem 3x 1 g)",
      notes: "Wykluczyć zastój w UKM (pilne USG nerek w poszukiwaniu wodonercza / przeszkody).",
    },
    {
      category: "Sepsa o nieznanym punkcie wyjścia",
      subgroup: "Dorosły bez immunosupresji, zakażenie pozaszpitalne",
      firstLine: "Cefotaksym 3x 2 g i.v. LUB Ceftriakson 1x 2 g i.v. + Gentamycyna 5-7 mg/kg i.v. jednorazowo",
      alternative: "Przy wstrząsie septycznym / podejrzeniu ESBL: Meropenem 3x 1-2 g i.v. + Wankomycyna 15-20 mg/kg i.v.",
      notes: "Pakiety Sepsis-6: Pobrać posiewy krwi x2, oznaczyć mleczany, podać antybiotyk i płynoterapię 30 ml/kg w pierwszej godzinie (Golden Hour).",
    },
    {
      category: "Zapalenie opon mózgowo-rdzeniowych (ZOMR)",
      subgroup: "Ropne ZOMR u dorosłych (<50 lat)",
      firstLine: "Ceftriakson 2x 2 g i.v. + Wankomycyna 15-20 mg/kg i.v. co 8-12h + Deksametazon 10 mg i.v.",
      alternative: "Dorośli ≥50 lat lub immunosupresja: Dodać Ampicylinę 6x 2 g i.v. (pokrycie Listeria monocytogenes)",
      notes: "Deksametazon podać przed lub równocześnie z pierwszą dawką antybiotyku (redukcja powikłań słuchowych i śmiertelności).",
    },
    {
      category: "Zakażenia skóry i tkanek miękkich",
      subgroup: "Róża / zapalenie tkanki łącznej (Cellulitis)",
      firstLine: "Cefazolina 3x 1-2 g i.v. LUB Kloksacylina 4x 1-2 g i.v. (p.o. Cefaleksyna 4x 500 mg)",
      alternative: "W alergii na penicyliny: Klindamycyna 3-4x 600 mg i.v./p.o.",
      notes: "W przypadku martwiczego zapalenia powięzi: natychmiastowa konsultacja chirurgiczna + Meropenem + Wankomycyna + Klindamycyna.",
    },
  ];

  return {
    estimatePediatricWeight,
    emergencyDoses,
    hollidaySegar,
    sodiumDeficit,
    acidBase,
    convertOpioid,
    antibioticsNPOA: ANTIBIOTICS_NPOA,
    opioidFactors: OPIOID_FACTORS,
  };
});
