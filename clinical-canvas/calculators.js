"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const escape = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const S = window.ClinicalScores, dialog = $("calc-dialog");
  const sources = {
    gcs: [
      ["GCS Assessment Aid · oficjalna karta", "https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf"],
      ["GCS FAQ · NT i zastosowanie pediatryczne", "https://www.glasgowcomascale.org/faq/"],
      ["RCH · Glasgow Coma Scale (Pediatric GCS)", "https://www.rch.org.au/clinicalguide/guideline_index/Coma/"],
    ],
    news2: [["Royal College of Physicians · NEWS2, 2017", "https://www.rcp.ac.uk/media/ctulqqbn/news2-executive-summary_0.pdf"]],
    pews: [["UBC CPD · Brighton PEWS, 31.05.2024", "https://ubccpd.ca/sites/default/files/documents/Brighton-PEWS.pdf"]],
    curb65: [
      ["BTS Guidelines for the Management of CAP in Adults (2009 update)", "https://www.brit-thoracic.org.uk/quality-improvement/guidelines/pneumonia-adults/"],
      ["NICE NG138 · Pneumonia (community-acquired)", "https://www.nice.org.uk/guidance/ng138"],
    ],
    qsofa: [
      ["Sepsis-3 Consensus Definitions (JAMA 2016)", "https://jamanetwork.com/journals/jama/fullarticle/2492881"],
      ["Surviving Sepsis Campaign Guidelines 2021", "https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-2021"],
    ],
    wellspe: [
      ["Wells PS et al. · Thromb Haemost 2000 (Oryginalna publikacja skali)", "https://pubmed.ncbi.nlm.nih.gov/10744147/"],
      ["ESC Guidelines for Acute Pulmonary Embolism (2019)", "https://academic.oup.com/eurheartj/article/41/4/543/5556136"],
      ["NICE NG158 · Venous thromboembolic diseases (2020)", "https://www.nice.org.uk/guidance/ng158"],
    ],
    perc: [
      ["Kline JA et al. · J Thromb Haemost 2004 (Oryginalna reguła PERC)", "https://pubmed.ncbi.nlm.nih.gov/15304025/"],
      ["PROPER Trial · JAMA 2018 (Walidacja PERC w SOR)", "https://pubmed.ncbi.nlm.nih.gov/29450523/"],
      ["NICE NG158 · Venous thromboembolic diseases (2020)", "https://www.nice.org.uk/guidance/ng158"],
    ],
    heart: [
      ["Six AJ et al. · Neth Heart J 2008 (Oryginalna publikacja HEART Score)", "https://pubmed.ncbi.nlm.nih.gov/18665203/"],
      ["ESC Guidelines for the management of Acute Coronary Syndromes (2023)", "https://academic.oup.com/eurheartj/article/44/38/3720/7243210"],
    ],
    gbs: [
      ["Blatchford O et al. · Lancet 2000 (Oryginalna skala Glasgow-Blatchford)", "https://pubmed.ncbi.nlm.nih.gov/11073021/"],
      ["NICE CG141 · Acute upper gastrointestinal bleeding in over 16s", "https://www.nice.org.uk/guidance/cg141/chapter/Recommendations"],
      ["ESGE Guideline · Nonvariceal upper gastrointestinal hemorrhage (2021)", "https://pubmed.ncbi.nlm.nih.gov/33567467/"],
    ],
    alvarado: [
      ["Alvarado A · Ann Emerg Med 1986 (Skala Alvarado)", "https://pubmed.ncbi.nlm.nih.gov/3963537/"],
      ["Samuel M · J Pediatr Surg 2002 (Pediatric Appendicitis Score — PAS)", "https://pubmed.ncbi.nlm.nih.gov/12037754/"],
      ["WSES Jerusalem Guidelines for Diagnosis and Treatment of Acute Appendicitis (2020)", "https://pubmed.ncbi.nlm.nih.gov/32295644/"],
    ],
    pas: [
      ["Samuel M · J Pediatr Surg 2002 (Pediatric Appendicitis Score — PAS)", "https://pubmed.ncbi.nlm.nih.gov/12037754/"],
      ["RCH · Abdominal pain — acute in children", "https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain/"],
    ],
    cha2ds2va: [
      ["2024 ESC Guidelines for the management of atrial fibrillation (CHA₂DS₂-VA)", "https://academic.oup.com/eurheartj/article/45/36/3314/7738779"],
    ],
    hasbled: [
      ["Pisters R et al. · Chest 2010 (Oryginalna skala HAS-BLED)", "https://pubmed.ncbi.nlm.nih.gov/20299623/"],
      ["2024 ESC Guidelines for the management of atrial fibrillation", "https://academic.oup.com/eurheartj/article/45/36/3314/7738779"],
    ],
    nihss: [
      ["Brott T et al. · Stroke 1989 (National Institutes of Health Stroke Scale)", "https://pubmed.ncbi.nlm.nih.gov/2749846/"],
      ["NICE NG128 · Stroke and transient ischaemic attack in over 16s", "https://www.nice.org.uk/guidance/ng128/chapter/recommendations"],
    ],
    abcd2: [
      ["Johnston SC et al. · Lancet 2007 (Oryginalna walidacja skali ABCD²)", "https://pubmed.ncbi.nlm.nih.gov/17258668/"],
      ["NICE NG128 · Stroke and transient ischaemic attack in over 16s", "https://www.nice.org.uk/guidance/ng128/chapter/recommendations"],
    ],
  };
  const labels = {
    gcs: "GCS / pGCS",
    news2: "NEWS2",
    pews: "Brighton PEWS",
    curb65: "CURB-65 / CRB-65",
    qsofa: "qSOFA",
    wellspe: "Wells PE (Zatorowość płucna)",
    perc: "PERC (Wykluczenie ZP)",
    heart: "HEART Score (OZW / Ból w klatce)",
    gbs: "Glasgow-Blatchford (GBS · UGIB)",
    alvarado: "Alvarado / PAS (Wyrostek)",
    pas: "PAS (Wyrostek · dzieci)",
    cha2ds2va: "CHA₂DS₂-VA (ESC 2024 · AF)",
    hasbled: "HAS-BLED (Ryzyko krwawienia)",
    nihss: "NIHSS (Skala udarowa)",
    abcd2: "ABCD² (Ryzyko po TIA)",
  };
  const defaultDrafts = () => ({
    gcs: {},
    news2: { scale: "1" },
    pews: {},
    curb65: { population: "adult", variant: "curb65", ureaUnit: "mmol" },
    qsofa: { population: "adult" },
    wellspe: { population: "adult", mode: "wellspe" },
    perc: { population: "adult", mode: "perc" },
    heart: { population: "adult" },
    gbs: { population: "adult", ureaUnit: "mmol" },
    alvarado: { variant: "alvarado" },
    pas: { variant: "pas" },
    cha2ds2va: { population: "adult", mode: "cha2ds2va" },
    hasbled: { population: "adult", mode: "hasbled" },
    nihss: { population: "adult", mode: "nihss" },
    abcd2: { population: "adult", mode: "abcd2" },
  });
  let active = "gcs", drafts = defaultDrafts(), result = null;
  const options = (items, current) => '<option value="">Wybierz…</option>' + items.map(([v, label]) =>
    `<option value="${escape(v)}"${String(current ?? "") === String(v) ? " selected" : ""}>${escape(label)}</option>`).join("");
  function select(name, label, items, help = "") {
    return `<div class="calc-field"><label for="calc-${name}">${label}</label><select id="calc-${name}" name="${name}">${options(items, drafts[active][name])}</select>${help ? `<p class="calc-help">${help}</p>` : ""}</div>`;
  }
  function number(name, label, min, max, step = 1) {
    return `<div class="calc-field"><label for="calc-${name}">${label}</label><input id="calc-${name}" name="${name}" type="number" min="${min}" max="${max}" step="${step}" inputmode="${step === 1 ? "numeric" : "decimal"}" value="${escape(drafts[active][name] || "")}" autocomplete="off"><p class="calc-help">${min}–${max}${step === 0.1 ? "; do 0,1" : "; liczba całkowita"}. Zakres techniczny formularza, nie norma.</p></div>`;
  }
  function yesNo(name, label) {
    return select(name, label, [["no","Nie"],["yes","Tak"]]);
  }
  const criteria = {
    behaviour: [
      ["0 · zachowanie odpowiednie", "Zabawa lub zachowanie odpowiednie do sytuacji i rozwoju."],
      ["1 · śpi", "Sen. W tym wariancie jest oceniany na 1 pkt; sam w sobie nie oznacza zaburzenia świadomości."],
      ["2 · drażliwe", "Drażliwość."],
      ["3 · letarg / splątanie / osłabiona reakcja", "Letarg i/lub splątanie, i/lub osłabiona odpowiedź na bodziec bólowy."],
    ],
    respiratory: [
      ["0 · prawidłowe oddychanie", "RR w normie wieku; bez wciągania klatki piersiowej i dołka nadmostkowego."],
      ["1 · pierwsze odchylenia / O₂", "RR o 10/min powyżej normy, z pracą dodatkowych mięśni; i/lub FiO₂ ≥30%, lub przepływ O₂ ≥4 l/min."],
      ["2 · nasilone odchylenia / FiO₂ ≥40%", "RR >20/min powyżej normy, z wciąganiem klatki/dołka nadmostkowego; i/lub FiO₂ ≥40%. Karta UBC nie podaje tu osobnego progu l/min."],
      ["3 · bradypnoe z wysiłkiem / duże O₂", "RR o 5/min poniżej normy, z wciąganiem mostka/klatki, dołka nadmostkowego lub stękaniem; i/lub FiO₂ 50%, lub przepływ O₂ ≥8 l/min."],
    ],
    cardiovascular: [
      ["0 · różowe / CRT 1–2 s", "Różowe zabarwienie i/lub nawrót kapilarny 1–2 s."],
      ["1 · blade / CRT 3 s", "Bladość i/lub nawrót kapilarny 3 s."],
      ["2 · szare / CRT 4 s / tachykardia +20", "Szare zabarwienie i/lub nawrót kapilarny 4 s; tachykardia o 20/min powyżej normy wieku."],
      ["3 · marmurkowate / CRT ≥5 s / HR", "Szare i marmurkowate zabarwienie lub nawrót kapilarny ≥5 s; albo tachykardia o 30/min powyżej normy, albo bradykardia."],
    ],
  };
  function domain(name, title) {
    return `<fieldset class="calc-domain"><legend>${title}</legend>${select(name, "Ocena domeny", criteria[name].map(([label], i) => [i,label]))}
      <p class="calc-selected-criterion" id="criterion-${name}">Wybierz kategorię po ocenie klinicznej.</p>
      <details><summary>Porównaj kryteria 0–3</summary><ol start="0">${criteria[name].map(([label, text]) => `<li><b>${escape(label)}</b>: ${escape(text)}</li>`).join("")}</ol></details></fieldset>`;
  }
  function renderForm() {
    const form = $("calc-form");
    $("calc-panel").setAttribute("aria-labelledby", `calc-tab-${active}`);
    document.querySelectorAll("[data-calculator]").forEach(b => {
      const selected = b.dataset.calculator === active;
      b.setAttribute("aria-selected", String(selected)); b.tabIndex = selected ? 0 : -1;
    });
    if (active === "gcs") {
      const isYoung = drafts.gcs.population === "young";
      $("calc-description").textContent = isYoung
        ? "Pediatryczna skala Glasgow (pGCS) dla dzieci ≤5 lat. Rozpisanie E + V (przedwerbalna) + M, z obsługą NT."
        : "Rozpisanie E + V + M. Standardowa GCS (oraz przełącznik pGCS ≤5 lat), bez automatycznego zamieniania NT na 1.";
      form.innerHTML = select("population", "Zakres zastosowania / wariant", [
        ["adult","Osoba dorosła · standardowa GCS"],["childOver5","Dziecko >5 lat · standardowa GCS"],["young","Dziecko ≤5 lat · pediatryczna pGCS"],
      ]) + select("e", "E · otwieranie oczu", [
        [4,"E4 · samoistnie"],[3,"E3 · na głos / dźwięk"],[2,"E2 · na ucisk / bodziec bólowy"],[1,"E1 · brak"],["NT","ENT · nie do oceny"],
      ], "E1 oznacza brak odpowiedzi bez czynnika zakłócającego; np. lokalny obrzęk powiek może wymagać NT.") +
      select("v", isYoung ? "V · odpowiedź przedwerbalna / słowna (pGCS)" : "V · odpowiedź słowna", isYoung ? [
        [5,"V5 · gaworzy, uśmiecha się, śledzi wzrokiem, odpowiednie słowa"],
        [4,"V4 · płacze / drażliwe, ale daje się utulić"],
        [3,"V3 · nieutulony płacz lub krzyk na ból"],
        [2,"V2 · pojękiwanie na ból / niepokój ruchowy"],
        [1,"V1 · brak odpowiedzi głosowej"],
        ["NT","VNT · nie do oceny (np. intubacja)"],
      ] : [
        [5,"V5 · zorientowana"],[4,"V4 · splątana, lecz spójna"],[3,"V3 · pojedyncze zrozumiałe słowa"],[2,"V2 · dźwięki / jęki"],[1,"V1 · brak"],["NT","VNT · nie do oceny"],
      ], "Intubacja lub inna przeszkoda uniemożliwiająca ocenę mowy/wokalizacji: VNT, nie V1.") +
      select("m", isYoung ? "M · najlepsza odpowiedź ruchowa (pGCS)" : "M · najlepsza odpowiedź ruchowa", isYoung ? [
        [6,"M6 · prawidłowe ruchy spontaniczne i celowe"],
        [5,"M5 · lokalizuje ból lub wycofuje na dotyk"],
        [4,"M4 · prawidłowe zgięcie / wycofanie na ból"],
        [3,"M3 · nieprawidłowe zgięcie (odkorowanie)"],
        [2,"M2 · wyprost (odmóżdżenie)"],
        [1,"M1 · brak odpowiedzi ruchowej"],
        ["NT","MNT · nie do oceny (np. zwiotczenie)"],
      ] : [
        [6,"M6 · wykonuje polecenia"],[5,"M5 · lokalizuje bodziec"],[4,"M4 · prawidłowe zgięcie / wycofanie"],[3,"M3 · nieprawidłowe zgięcie"],[2,"M2 · wyprost"],[1,"M1 · brak"],["NT","MNT · nie do oceny"],
      ], "Oceń najlepszą odpowiedź; asymetrię opisz osobno. M4 i M3 wymagają odróżnienia prawidłowego od nieprawidłowego wzorca zgięcia.") +
      '<p class="calc-note">Uwzględnij sedację, blokadę nerwowo-mięśniową, uraz, wiek rozwojowy i stan wyjściowy. Wynik sam nie rozstrzyga o intubacji; liczą się drożność dróg oddechowych i całe ABCDE.</p>';
    } else if (active === "news2") {
      $("calc-description").textContent = "Siedem składowych, dwie skale SpO₂ i niezależne punkty za tlen. Odpowiedź według RCP.";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult","Wiek ≥16 lat, bez ciąży"],["child","Wiek <16 lat"],["pregnant","Ciąża"],
      ]) + '<div class="calc-pair">' + number("rr","Oddechy / min",0,100) + number("spo2","SpO₂ · %",0,100) + "</div>" +
      select("scale", "Skala saturacji", [[1,"Skala 1 · standardowa"],[2,"Skala 2 · wyłącznie udokumentowane wskazanie"]]) +
      `<label class="calc-check" id="scale2-confirm"><input name="confirmScale2" type="checkbox"${drafts.news2.confirmScale2 ? " checked" : ""}><span>Potwierdzono hiperkapniczną niewydolności oddechową w gazometrii oraz decyzję uprawnionego klinicysty o stosowaniu skali 2 i celu SpO₂ 88–92%.</span></label>` +
      yesNo("oxygen","Dodatkowy tlen w chwili pomiaru") +
      '<div class="calc-pair">' + number("sbp","Ciśnienie skurczowe · mmHg",0,300) + number("hr","Tętno / min",0,350) + "</div>" +
      '<div class="calc-pair">' + number("temp","Temperatura · °C",25,45,0.1) +
      select("consciousness","ACVPU",[
        ["A","A · przytomny, bez nowego splątania"],["C","C · nowe splątanie"],["V","V · reaguje na głos"],["P","P · reaguje na ból"],["U","U · nie reaguje"],
      ]) + "</div>" +
      '<p class="calc-note">Samo POChP nie kwalifikuje do skali 2. Jeśli nie wiadomo, czy splątanie jest nowe, traktuj je jako nowe do wyjaśnienia. NEWS2 może być niewiarygodny przy wysokim uszkodzeniu rdzenia. Niepokój kliniczny ma pierwszeństwo przed niską sumą.</p>';
    } else if (active === "pews") {
      $("calc-description").textContent = "Brighton PEWS według karty UBC z 31.05.2024. Domeny 0–9 + modyfikatory 0–4, razem 0–13.";
      form.innerHTML = '<p class="calc-note">To określony wariant Brighton, nie NHS National PEWS ani Bedside PEWS. Kategorie HR/RR dobierz według norm wieku i lokalnej karty; formularz nie przelicza automatycznie surowego tętna i oddechów. Przy kilku pasujących kategoriach wybierz najwyższą.</p>' +
      `<label class="calc-check"><input name="ageNorms" type="checkbox"${drafts.pews.ageNorms ? " checked" : ""}><span>Oceniono HR/RR względem norm wieku oraz stan dziecka według właściwej lokalnej karty pediatrycznej.</span></label>` +
      domain("behaviour","Zachowanie") + domain("respiratory","Oddychanie") + domain("cardiovascular","Krążenie") +
      '<fieldset class="calc-domain"><legend>Modyfikatory · po +2 pkt</legend>' +
      yesNo("bronchodilators","Leki rozszerzające oskrzela co 20 minut") +
      yesNo("postopVomiting","Uporczywe wymioty po operacji") + "</fieldset>" +
      '<p class="calc-note">Nie utożsamiaj przepływu l/min ze stałą FiO₂: zależy ona od urządzenia, szczelności i wentylacji. Zachowano kryteria wskazanego wariantu, bez mieszania z innymi tabelami PEWS.</p>';
    } else if (active === "curb65") {
      $("calc-description").textContent = "Ocena ciężkości pozaszpitalnego zapalenia płuc (CAP) u dorosłych: CURB-65 (ze stężeniem mocznika / BUN) lub CRB-65 (ocena pozaszpitalna).";
      const isCrb = drafts.curb65.variant === "crb65";
      const isMgdl = drafts.curb65.ureaUnit === "mgdl";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult","Osoba dorosła (≥18 lat) z zapaleniem płuc"],["child","Dziecko <18 lat (nie dotyczy)"],
      ]) +
      select("variant", "Wariant skali", [
        ["curb65","CURB-65 · szpital / z wynikiem mocznika"],
        ["crb65","CRB-65 · ocena pozaszpitalna (bez mocznika)"],
      ]) +
      yesNo("confusion", "C · Nowo powstałe splątanie (AMTS ≤8 lub dezorientacja)") +
      `<div class="calc-field" id="curb-urea-wrap"${isCrb ? ' style="display:none"' : ""}>` +
      select("ureaUnit", "Jednostka stężenia mocznika", [
        ["mmol", "mmol/l · stężenie mocznika (próg >7,0)"],
        ["mgdl", "mg/dl · azot mocznikowy BUN (próg >19)"],
      ]) +
      number("urea", isMgdl ? "U · Azot mocznikowy (BUN) · mg/dl" : "U · Stężenie mocznika we krwi · mmol/l", isMgdl ? 1 : 0.1, isMgdl ? 300 : 100, isMgdl ? 1 : 0.1) +
      `</div>` +
      '<div class="calc-pair">' +
      number("rr", "R · Częstość oddechów / min", 0, 100) +
      number("age", "65 · Wiek pacjenta · lata", 18, 130) +
      '</div>' +
      '<div class="calc-pair">' +
      number("sbp", "B · Ciśnienie skurczowe · mmHg", 0, 300) +
      number("dbp", "B · Ciśnienie rozkurczowe · mmHg", 0, 200) +
      '</div>' +
      '<p class="calc-note">Kryteria punktowane (po 1 pkt): C (splątanie), U (mocznik >7 mmol/l lub BUN >19 mg/dl), R (oddechy ≥30/min), B (ciśnienie: SBP <90 mmHg lub DBP ≤60 mmHg), 65 (wiek ≥65 lat). Skala służy stratyfikacji ryzyka zgonu w pozaszpitalnym zapaleniu płuc u dorosłych, nie zastępuje oceny klinicznej.</p>';
    } else if (active === "qsofa") {
      $("calc-description").textContent = "Szybka przyłóżkowa ocena ryzyka sepsy (Sepsis-3) u dorosłych poza OIT. Wynik ≥2 pkt wskazuje na wysokie ryzyko zgonu i powikłań.";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z podejrzeniem zakażenia"],
        ["child", "Dziecko <18 lat (nie dotyczy · użyj PEWS / Phoenix)"],
      ]) +
      '<div class="calc-pair">' +
      number("rr", "Częstość oddechów (RR) · /min", 0, 100) +
      number("sbp", "Ciśnienie skurczowe (SBP) · mmHg", 0, 300) +
      '</div>' +
      select("alteredMentation", "Ocena stanu świadomości", [
        ["no", "Przytomny / stan wyjściowy (GCS 15)"],
        ["yes", "Zaburzenia świadomości / spadek GCS (GCS <15)"],
      ], "Punkt przyznawany przy jakimkolwiek ostrym zaburzeniu świadomości lub GCS <15.") +
      '<p class="calc-note">Kryteria qSOFA (po 1 pkt): RR ≥22/min, SBP ≤100 mmHg, GCS <15. Wynik ≥2 pkt wymaga natychmiastowego wdrożenia protokołu sepsy. Wynik 0–1 pkt nie wyklucza sepsy przy podejrzeniu klinicznym.</p>';
    } else if (active === "wellspe") {
      $("calc-description").textContent = "Ocena prawdopodobieństwa klinicznego zatorowości płucnej (ZP/PE) u dorosłych i stratyfikacja wskazań do D-dimerów vs angio-TK (CTPA).";
      form.innerHTML = select("mode", "Narzędzie ścieżki ZP (PE)", [
        ["wellspe", "Skala Wellsa dla ZP · prawdopodobieństwo kliniczne"],
        ["perc", "Reguła PERC · wykluczenie bez D-dimerów przy małym ryzyku"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z podejrzeniem ZP"],
        ["child", "Dziecko <18 lat (nie dotyczy · wymaga dedykowanej ścieżki)"],
      ]) +
      yesNo("dvtSigns", "Kliniczne objawy ZŻG · +3,0 pkt (obrzęk kończyny i bolesność uciskowa żył głębokich)") +
      yesNo("peMostLikely", "ZP najbardziej prawdopodobna · +3,0 pkt (inne rozpoznanie jest mniej prawdopodobne niż ZP)") +
      number("hr", "Tętno / min (tachykardia >100/min daje +1,5 pkt)", 0, 350) +
      yesNo("immobilizationOrSurgery", "Unieruchomienie lub operacja · +1,5 pkt (unieruchomienie ≥3 dni lub zabieg w ciągu 4 tyg.)") +
      yesNo("previousVte", "Przebyta ZP lub ZŻG · +1,5 pkt (obiektywnie potwierdzony epizod w wywiadzie)") +
      yesNo("hemoptysis", "Krwioplucie · +1,0 pkt") +
      yesNo("malignancy", "Choroba nowotworowa · +1,0 pkt (aktywna, leczona w ciągu ostatnich 6 mies. lub paliatywna)") +
      '<p class="calc-note">Interpretacja 2-poziomowa (ESC/NICE): wynik ≤4,0 pkt oznacza małe prawdopodobieństwo ZP (wskazanie do D-dimerów o wysokiej czułości lub oceny PERC przy niskim ryzyku wyjściowym). Wynik >4,0 pkt oznacza duże prawdopodobieństwo ZP (wskazanie do natychmiastowego angio-TK tętnic płucnych).</p>';
    } else if (active === "perc") {
      $("calc-description").textContent = "Reguła PERC (Pulmonary Embolism Rule-out Criteria): kliniczne wykluczenie ZP bez oznaczania D-dimerów wyłącznie u chorych z niskim prawdopodobieństwem wyjściowym (<15%).";
      form.innerHTML = select("mode", "Narzędzie ścieżki ZP (PE)", [
        ["perc", "Reguła PERC · wykluczenie bez D-dimerów przy małym ryzyku"],
        ["wellspe", "Skala Wellsa dla ZP · prawdopodobieństwo kliniczne"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z niskim prawdopodobieństwem ZP"],
        ["child", "Dziecko <18 lat (nie dotyczy)"],
      ]) +
      `<label class="calc-check"><input name="lowPretestConfirmed" type="checkbox"${drafts.perc.lowPretestConfirmed ? " checked" : ""}><span>Potwierdzono niskie wyjściowe prawdopodobieństwo kliniczne ZP (<15% / Wells PE ≤4 pkt w ocenie lekarza). Nie stosuj PERC przy pośrednim ani wysokim podejrzeniu!</span></label>` +
      '<div class="calc-pair">' +
      number("age", "Wiek pacjenta · lata (próg ≥50 lat)", 18, 130) +
      number("hr", "Tętno (HR) · /min (próg ≥100/min)", 0, 350) +
      '</div>' +
      number("spo2", "SpO₂ na powietrzu atmosferycznym · % (próg <95%)", 0, 100) +
      yesNo("unilateralLegSwelling", "Jednostronny obrzęk kończyny dolnej (+1)") +
      yesNo("hemoptysis", "Krwioplucie (+1)") +
      yesNo("recentTraumaOrSurgery", "Niedawny uraz lub zabieg operacyjny ≤4 tyg. wymagający hospitalizacji (+1)") +
      yesNo("previousVte", "Przebyta ZP lub ZŻG w wywiadzie (+1)") +
      yesNo("hormoneUse", "Stosowanie egzogennych estrogenów / antykoncepcji lub HTZ (+1)") +
      '<p class="calc-note">Aby bezpiecznie wykluczyć ZP regułą PERC (0/8), wszystkie 8 kryteriów musi być ujemnych (wiek <50 lat, HR <100/min, SpO₂ ≥95% bez tlenu, brak pozostałych 5 czynników). Dodatni wynik (≥1) wymaga oznaczenia D-dimerów.</p>';
    } else if (active === "heart") {
      $("calc-description").textContent = "Skala HEART (0–10 pkt): stratyfikacja 6-tygodniowego ryzyka MACE u dorosłych z bólem w klatce piersiowej w SOR.";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z bólem w klatce piersiowej"],
        ["child", "Dziecko <18 lat (nie dotyczy)"],
      ]) +
      select("history", "H · Wywiad (History)", [
        [0, "0 pkt · Mało podejrzany (brak typowych cech dławicowych)"],
        [1, "1 pkt · Umiarkowanie podejrzany (zarówno cechy typowe, jak i nietypowe)"],
        [2, "2 pkt · Wysoce podejrzany (typowy ból zamostkowy, wysiłkowy, z potami/promieniowaniem)"],
      ]) +
      select("ecg", "E · zapis EKG", [
        [0, "0 pkt · Prawidłowe lub niespecyficzne zmiany bez zaburzeń repolaryzacji"],
        [1, "1 pkt · Nieswoiste zaburzenia repolaryzacji, LBBB, rytm ze stymulatora, LVH, digoksyna"],
        [2, "2 pkt · Istotne obniżenie odcinka ST lub nowe cechy niedokrwienia (bez STEMI)"],
      ], "Przy uniesieniu ST (STEMI) aktywuj natychmiastową ścieżkę pracowni hemodynamiki — nie czekaj na kalkulator.") +
      number("age", "A · Wiek pacjenta · lata (<45: 0 pkt; 45–64: 1 pkt; ≥65: 2 pkt)", 18, 130) +
      select("riskFactors", "R · Czynniki ryzyka miażdżycy", [
        [0, "0 pkt · Brak znanych czynników ryzyka"],
        [1, "1 pkt · 1–2 czynniki ryzyka (HTN, cukrzyca, palenie, hipercholesterolemia, otyłość, wywiad rodzinny)"],
        [2, "2 pkt · ≥3 czynniki ryzyka LUB rozpoznana choroba miażdżycowa (CAD, przebyty MI/PCI/CABG, TIA/udar, PAD)"],
      ]) +
      select("troponin", "T · Troponina sercowa", [
        [0, "0 pkt · ≤1× górnej granicy normy (99. centyla)"],
        [1, "1 pkt · 1–3× górnej granicy normy"],
        [2, "2 pkt · >3× górnej granicy normy"],
      ]) +
      '<p class="calc-note">HEART 0–3 pkt oznacza niskie ryzyko MACE (<1,7%), lecz bezpieczny wypis wymaga również spełnienia kryteriów protokołu seryjnej troponiny (0/1 h lub 0/2 h) oraz braku dodatniej troponiny i świeżego niedokrwienia w EKG.</p>';
    } else if (active === "gbs") {
      $("calc-description").textContent = "Skala Glasgow-Blatchford (GBS, 0–23 pkt): ocena przedendoskopowa ryzyka interwencji i kwalifikacja do wczesnego wypisu w krwawieniu z górnego odcinka PP (UGIB).";
      const isMgdl = drafts.gbs.ureaUnit === "mgdl";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥16–18 lat) z podejrzeniem krwawienia górnego (UGIB)"],
        ["child", "Dziecko <16 lat (nie dotyczy · użyj ścieżki pediatrycznej CHOP)"],
      ]) +
      select("sex", "Płeć biologiczna (progi stężenia hemoglobiny)", [
        ["male", "Mężczyzna (progi Hb: <13, <12, <10 g/dl)"],
        ["female", "Kobieta (progi Hb: <12, <10 g/dl)"],
      ]) +
      select("ureaUnit", "Jednostka stężenia mocznika", [
        ["mmol", "mmol/l · mocznik we krwi (progi ≥6,5; ≥8,0; ≥10,0; ≥25,0)"],
        ["mgdl", "mg/dl · azot mocznikowy BUN (przelicznik kliniczny)"],
      ]) +
      '<div class="calc-pair">' +
      number("urea", isMgdl ? "Azot mocznikowy (BUN) · mg/dl" : "Mocznik we krwi · mmol/l", isMgdl ? 1 : 0.1, isMgdl ? 300 : 100, isMgdl ? 1 : 0.1) +
      number("hb", "Stężenie hemoglobiny (Hb) · g/dl", 2, 25, 0.1) +
      '</div>' +
      '<div class="calc-pair">' +
      number("sbp", "Ciśnienie skurczowe (SBP) · mmHg", 0, 300) +
      number("hr", "Tętno (HR) · /min (próg ≥100/min)", 0, 350) +
      '</div>' +
      yesNo("melena", "Smoliste stolce (melena) w wywiadzie lub badaniu (+1 pkt)") +
      yesNo("syncope", "Omdlenie / utrata przytomności (+2 pkt)") +
      yesNo("hepaticDisease", "Choroba wątroby w wywiadzie lub cechy marskości (+2 pkt)") +
      yesNo("cardiacFailure", "Niewydolność serca w wywiadzie lub cechy kliniczne (+2 pkt)") +
      '<p class="calc-note">NICE CG141 zaleca rozważenie wczesnego wypisu i endoskopii ambulatoryjnej przy wyniku GBS = 0 (wytyczne ESGE 2021 dopuszczają próg 0–1 u stabilnych chorych). GBS nie służy do oceny krwawienia z dolnego odcinka PP.</p>';
    } else if (active === "alvarado" || active === "pas") {
      const isPas = active === "pas" || drafts[active].variant === "pas";
      $("calc-description").textContent = isPas
        ? "Pediatric Appendicitis Score (PAS, Samuel 2002 · 0–10 pkt): ocena prawdopodobieństwa ostrego zapalenia wyrostka robaczkowego u dzieci."
        : "Skala Alvarado (MANTRELS · 0–10 pkt): ocena prawdopodobieństwa ostrego zapalenia wyrostka robaczkowego u dorosłych (z przełącznikiem na pediatryczny PAS).";
      form.innerHTML = select("variant", "Wariant skali i populacja", [
        ["alvarado", "Skala Alvarado · dorośli (gorączka ≥37,3°C, objaw Blumberga)"],
        ["pas", "Skala PAS (Samuel 2002) · dzieci (gorączka ≥38,0°C, ból przy kaszlu/podskakiwaniu)"],
      ]) +
      yesNo("rlqTenderness", "Tkliwość uciskowa w prawym dole biodrowym (RLQ) · +2 pkt") +
      yesNo("leukocytosis", "Leukocytoza (WBC >10 000/µl) · +2 pkt") +
      yesNo("migration", "Migracja bólu z nadbrzusza / okolicy pępka do RLQ · +1 pkt") +
      yesNo("anorexia", "Jadłowstręt (utrata apetytu / anoreksja) · +1 pkt") +
      yesNo("nauseaVomiting", "Nudności lub wymioty · +1 pkt") +
      yesNo("reboundOrHopping", isPas
        ? "Ból w RLQ przy kaszlu, opukiwaniu lub podskakiwaniu (PAS) · +1 pkt"
        : "Objaw Blumberga (bolesność z odbicia w RLQ) · +1 pkt") +
      number("temp", `Temperatura ciała · °C (próg +1 pkt: ${isPas ? "≥38,0°C w PAS" : "≥37,3°C w Alvarado"})`, 34, 43, 0.1) +
      yesNo("leftShift", "Przesunięcie obrazu w lewo / neutrofilia >75% (ANC >7500/µl) · +1 pkt") +
      '<p class="calc-note">Alvarado: 0–4 pkt małe ryzyko, 5–6 pkt pośrednie (obrazowanie), 7–10 pkt wysokie ryzyko. PAS u dzieci: 0–3 pkt niskie ryzyko, 4–6 pkt pośrednie (wskazane USG brzucha), 7–10 pkt wysokie ryzyko (pilna konsultacja chirurgii dziecięcej).</p>';
    } else if (active === "cha2ds2va") {
      $("calc-description").textContent = "Skala CHA₂DS₂-VA (wytyczne ESC 2024 · 0–8 pkt): ocena ryzyka udaru i zatorowości obwodowej w migotaniu przedsionków (bez kryterium płci).";
      form.innerHTML = select("mode", "Skala w migotaniu przedsionków (AF)", [
        ["cha2ds2va", "CHA₂DS₂-VA (ESC 2024) · ryzyko zakrzepowo-zatorowe i wskazania do OAC"],
        ["hasbled", "HAS-BLED · ocena ryzyka krwawienia i czynników modyfikowalnych"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z niezastawkowym migotaniem przedsionków"],
        ["child", "Dziecko <18 lat (nie dotyczy)"],
      ]) +
      number("age", "A · Wiek pacjenta · lata (<65: 0 pkt; 65–74: +1 pkt; ≥75: +2 pkt)", 18, 130) +
      yesNo("chf", "C · Niewydolność serca (HFrEF, HFmrEF, HFpEF lub LVEF ≤40%) · +1 pkt") +
      yesNo("hypertension", "H · Nadciśnienie tętnicze (spoczynkowe >140/90 mmHg lub leczenie hipotensyjne) · +1 pkt") +
      yesNo("diabetes", "D · Cukrzyca (typ 1 lub 2) · +1 pkt") +
      yesNo("strokeTiaTe", "S₂ · Przebyty udar mózgu, TIA lub zatorowość obwodowa · +2 pkt") +
      yesNo("vascularDisease", "V · Choroba naczyniowa (CAD, przebyty MI, PAD, blaszka miażdżycowa w aorcie) · +1 pkt") +
      '<p class="calc-note">Wytyczne ESC 2024 zastąpiły CHA₂DS₂-VASc skalą CHA₂DS₂-VA (płeć żeńska jest modyfikatorem ryzyka u osób starszych, lecz uproszczono próg decyzyjny dla obu płci): ≥2 pkt → zalecana antykoagulacja (Klasa I); 1 pkt → rozważ antykoagulację (Klasa IIa); 0 pkt → brak wskazań.</p>';
    } else if (active === "hasbled") {
      $("calc-description").textContent = "Skala HAS-BLED (0–9 pkt): ocena ryzyka poważnego krwawienia u dorosłych kwalifikowanych do lub leczonych lekami przeciwkrzepliwymi.";
      form.innerHTML = select("mode", "Skala w migotaniu przedsionków (AF)", [
        ["hasbled", "HAS-BLED · ocena ryzyka krwawienia i czynników modyfikowalnych"],
        ["cha2ds2va", "CHA₂DS₂-VA (ESC 2024) · ryzyko zakrzepowo-zatorowe i wskazania do OAC"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) oceniana pod kątem antykoagulacji"],
        ["child", "Dziecko <18 lat (nie dotyczy)"],
      ]) +
      yesNo("hypertension", "H · Niekontrolowane nadciśnienie tętnicze (SBP >160 mmHg) · +1 pkt") +
      yesNo("renalDisease", "A · Nieprawidłowa funkcja nerek (dializy, przeszczep, kreatynina >2,26 mg/dl / >200 µmol/l) · +1 pkt") +
      yesNo("liverDisease", "A · Nieprawidłowa funkcja wątroby (marskość lub bilirubina >2× GGN z AST/ALT/ALP >3× GGN) · +1 pkt") +
      yesNo("strokeHistory", "S · Przebyty udar mózgu w wywiadzie · +1 pkt") +
      yesNo("bleedingHistory", "B · Przebyte poważne krwawienie lub predyspozycja (skaza, niedokrwistość) · +1 pkt") +
      yesNo("labileInr", "L · Niestabilny INR (TTR <60% u leczonych VKA; 0 pkt jeśli NOAC/DOAC) · +1 pkt") +
      yesNo("elderly", "E · Wiek >65 lat · +1 pkt") +
      yesNo("drugs", "D · Leki zwiększające ryzyko krwawienia (leki przeciwpłytkowe, NLPZ) · +1 pkt") +
      yesNo("alcohol", "D · Nadużywanie alkoholu (≥8 jednostek/tydzień) · +1 pkt") +
      '<p class="calc-note">Wynik ≥3 pkt oznacza wysokie ryzyko krwawienia i nakazuje korektę odwracalnych czynników (kontrola RR, odstawienie zbędnych NLPZ/ASA, ograniczenie alkoholu, zamiana VKA na NOAC). Zgodnie z ESC 2024 sam wynik HAS-BLED ≥3 pkt nie jest powodem do wstrzymania antykoagulacji!</p>';
    } else if (active === "nihss") {
      $("calc-description").textContent = "Skala udarowa NIHSS (National Institutes of Health Stroke Scale · 0–42 pkt): ilościowa ocena deficytu neurologicznego w ostrym udarze mózgu.";
      form.innerHTML = select("mode", "Narzędzie w nagłym deficycie neurologicznym", [
        ["nihss", "NIHSS (0–42 pkt) · ocena ciężkości udaru mózgu"],
        ["abcd2", "ABCD² (0–7 pkt) · ocena wczesnego ryzyka udaru po TIA"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) z podejrzeniem ostrego udaru"],
        ["child", "Dziecko <18 lat (wymaga PedNIHSS w ośrodku specjalistycznym)"],
      ]) +
      '<fieldset class="calc-domain"><legend>1. Świadomość i orientacja</legend>' +
      select("ia", "1a · Poziom świadomości", [
        [0, "0 · Przytomny, żywo reaguje"],
        [1, "1 · Podsypiający, ale wybudza się przy niewielkiej stymulacji"],
        [2, "2 · Wymaga powtarzanej lub bolesnej stymulacji do reakcji"],
        [3, "3 · Śpiączka — brak reakcji lub wyłącznie reakcje odruchowe"],
      ]) +
      select("ib", "1b · Pytania orientacyjne (bieżący miesiąc i wiek)", [
        [0, "0 · Odpowiada poprawnie na oba pytania"],
        [1, "1 · Odpowiada poprawnie na jedno pytanie (lub intubacja / bariera językowa)"],
        [2, "2 · Nie odpowiada poprawnie na żadne pytanie (lub afazja / stupor)"],
      ]) +
      select("ic", "1c · Polecenia (zamknij/otwórz oczy, zaciśnij/rozluźnij zdrową dłoń)", [
        [0, "0 · Wykonuje oba polecenia poprawnie"],
        [1, "1 · Wykonuje jedno polecenie poprawnie"],
        [2, "2 · Nie wykonuje żadnego polecenia"],
      ]) +
      '</fieldset><fieldset class="calc-domain"><legend>2–4. Nerwy czaszkowe i widzenie</legend>' +
      select("gaze", "2 · Ruchy gałek ocznych w poziomie (spojrzenie)", [
        [0, "0 · Prawidłowe"],
        [1, "1 · Częściowe porażenie spojrzenia (lub izolowane porażenie nerwu III/IV/VI)"],
        [2, "2 · Przymusowe zbaczanie gałek ocznych lub całkowite porażenie spojrzenia"],
      ]) +
      select("visual", "3 · Pole widzenia", [
        [0, "0 · Bez ubytków pola widzenia"],
        [1, "1 · Częściowe niedowidzenie połowicze (kwadrantowe / wygaszanie wzrokowe)"],
        [2, "2 · Całkowite niedowidzenie połowicze (hemianopsja)"],
        [3, "3 · Obustronna ślepota (w tym ślepota korowa)"],
      ]) +
      select("facial", "4 · Niedowład nerwu twarzowego", [
        [0, "0 · Ruchy symetryczne, prawidłowe"],
        [1, "1 · Niewielki niedowład (wygładzenie fałdu nosowo-wargowego, asymetria uśmiechu)"],
        [2, "2 · Częściowy niedowład (całkowity lub prawie całkowity dolnej połowy twarzy)"],
        [3, "3 · Całkowite porażenie jedno- lub obustronne (brak ruchów górnej i dolnej części twarzy)"],
      ]) +
      '</fieldset><fieldset class="calc-domain"><legend>5–6. Funkcje ruchowe kończyn</legend>' +
      select("motorArmL", "5a · Kończyna górna lewa (utrzymanie przez 10 s)", [
        [0, "0 · Utrzymuje pozycję przez 10 s bez opadania"],
        [1, "1 · Opada przed upływem 10 s, ale nie dotyka podłoża"],
        [2, "2 · Pewien opór przeciw sile ciężkości, ale opada na podłoże przed 10 s"],
        [3, "3 · Brak ruchu przeciw sile ciężkości (kończyna od razu opada)"],
        [4, "4 · Brak jakiegokolwiek ruchu (plegia)"],
        ["UN", "UN · Nie do oceny (amputacja lub usztywnienie stawu barkowego — 0 pkt)"],
      ]) +
      select("motorArmR", "5b · Kończyna górna prawa (utrzymanie przez 10 s)", [
        [0, "0 · Utrzymuje pozycję przez 10 s bez opadania"],
        [1, "1 · Opada przed upływem 10 s, ale nie dotyka podłoża"],
        [2, "2 · Pewien opór przeciw sile ciężkości, ale opada na podłoże przed 10 s"],
        [3, "3 · Brak ruchu przeciw sile ciężkości (kończyna od razu opada)"],
        [4, "4 · Brak jakiegokolwiek ruchu (plegia)"],
        ["UN", "UN · Nie do oceny (amputacja lub usztywnienie stawu barkowego — 0 pkt)"],
      ]) +
      select("motorLegL", "6a · Kończyna dolna lewa (utrzymanie pod kątem 30° przez 5 s)", [
        [0, "0 · Utrzymuje pozycję przez 5 s bez opadania"],
        [1, "1 · Opada przed upływem 5 s, ale nie dotyka podłoża"],
        [2, "2 · Pewien opór przeciw sile ciężkości, ale opada na podłoże przed 5 s"],
        [3, "3 · Brak ruchu przeciw sile ciężkości (kończyna od razu opada)"],
        [4, "4 · Brak jakiegokolwiek ruchu (plegia)"],
        ["UN", "UN · Nie do oceny (amputacja lub usztywnienie stawu biodrowego — 0 pkt)"],
      ]) +
      select("motorLegR", "6b · Kończyna dolna prawa (utrzymanie pod kątem 30° przez 5 s)", [
        [0, "0 · Utrzymuje pozycję przez 5 s bez opadania"],
        [1, "1 · Opada przed upływem 5 s, ale nie dotyka podłoża"],
        [2, "2 · Pewien opór przeciw sile ciężkości, ale opada na podłoże przed 5 s"],
        [3, "3 · Brak ruchu przeciw sile ciężkości (kończyna od razu opada)"],
        [4, "4 · Brak jakiegokolwiek ruchu (plegia)"],
        ["UN", "UN · Nie do oceny (amputacja lub usztywnienie stawu biodrowego — 0 pkt)"],
      ]) +
      '</fieldset><fieldset class="calc-domain"><legend>7–11. Koordynacja, czucie, mowa i zaniedbywanie</legend>' +
      select("ataxia", "7 · Ataksja kończyn (próba palec–nos i pięta–kolano)", [
        [0, "0 · Nieobecna (lub chory nie rozumie / kończyna porażona)"],
        [1, "1 · Obecna w jednej kończynie"],
        [2, "2 · Obecna w dwóch kończynach (po jednej stronie)"],
        ["UN", "UN · Nie do oceny (amputacja lub usztywnienie stawu — 0 pkt)"],
      ]) +
      select("sensory", "8 · Czucie (ukłucie szpilką)", [
        [0, "0 · Prawidłowe, bez utraty czucia"],
        [1, "1 · Łagodna lub umiarkowana niedoczulica (czuje dotyk jako mniej ostry)"],
        [2, "2 · Ciężka lub całkowita utrata czucia (lub śpiączka / obustronne zaburzenia)"],
      ]) +
      select("language", "9 · Najlepsza mowa (afazja)", [
        [0, "0 · Prawidłowa, bez afazji"],
        [1, "1 · Łagodna lub umiarkowana afazja (utrudniona płynność lub rozumienie)"],
        [2, "2 · Ciężka afazja (komunikacja fragmentaryczna, konieczne domyślanie się)"],
        [3, "3 · Mutyzm, afazja całkowita (globalna) lub śpiączka"],
      ]) +
      select("dysarthria", "10 · Dyzartria (artykulacja)", [
        [0, "0 · Prawidłowa wymowa"],
        [1, "1 · Łagodna lub umiarkowana dyzartria (zamazuje niektóre słowa, lecz zrozumiały)"],
        [2, "2 · Ciężka dyzartria (mowa niezrozumiała lub anartria / mutyzm)"],
        ["UN", "UN · Nie do oceny (intubacja lub inna mechaniczna przeszkoda — 0 pkt)"],
      ]) +
      select("extinction", "11 · Wygaszanie i nieuwaga (zespół zaniedbywania / neglect)", [
        [0, "0 · Brak zaburzeń"],
        [1, "1 · Wygaszanie wzrokowe, dotykowe, słuchowe lub przestrzenne w 1 modalności"],
        [2, "2 · Głęboka hemi-nieuwaga (neglect) lub wygaszanie w >1 modalności"],
      ]) +
      '</fieldset><p class="calc-note">NIHSS służy ocenie ciężkości deficytu i monitorowaniu dynamiki, nie wyklucza jednak udaru: wynik 0 pkt może występować w udarze tylnego krążenia (zawroty głowy, oczopląs, ataksja tułowia).</p>';
    } else if (active === "abcd2") {
      $("calc-description").textContent = "Skala ABCD² (0–7 pkt): ocena krótkoterminowego ryzyka udaru niedokrwiennego po przemijającym napadzie niedokrwiennym (TIA).";
      form.innerHTML = select("mode", "Narzędzie w nagłym deficycie neurologicznym", [
        ["abcd2", "ABCD² (0–7 pkt) · ocena wczesnego ryzyka udaru po TIA"],
        ["nihss", "NIHSS (0–42 pkt) · ocena ciężkości udaru mózgu"],
      ]) +
      select("population", "Zakres zastosowania", [
        ["adult", "Osoba dorosła (≥18 lat) po ustąpieniu objawów TIA"],
        ["child", "Dziecko <18 lat (nie dotyczy)"],
      ]) +
      number("age", "A · Wiek pacjenta · lata (≥60 lat daje +1 pkt)", 18, 130) +
      '<div class="calc-pair">' +
      number("sbp", "B · Ciśnienie skurczowe · mmHg (≥140 daje +1)", 0, 300) +
      number("dbp", "B · Ciśnienie rozkurczowe · mmHg (≥90 daje +1)", 0, 200) +
      '</div>' +
      select("clinicalFeatures", "C · Obraz kliniczny epizodu TIA", [
        [0, "0 pkt · Inne objawy (np. izolowane zaburzenia czucia, widzenia, zawroty)"],
        [1, "1 pkt · Zaburzenia mowy (afazja / dyzartria) bez niedowładu"],
        [2, "2 pkt · Jednostronny niedowład kończyny lub twarzy"],
      ]) +
      select("duration", "D · Czas trwania objawów", [
        [0, "0 pkt · <10 minut"],
        [1, "1 pkt · 10–59 minut"],
        [2, "2 pkt · ≥60 minut"],
      ]) +
      yesNo("diabetes", "D · Cukrzyca w wywiadzie (+1 pkt)") +
      '<p class="calc-note">UWAGA KLINICZNA (NICE NG128): nie stosuj niskiego wyniku ABCD² (0–3 pkt) do odraczania diagnostyki TIA. Każdy pacjent z podejrzeniem TIA wymaga pilnego włączenia leczenia przeciwpłytkowego i oceny specjalistycznej w ciągu 24 h.</p>';
    }
    form.innerHTML += '<button type="button" id="calc-reset">Wyczyść ten kalkulator</button>';
    $("calc-reset").onclick = () => {
      const fresh = defaultDrafts();
      drafts[active] = fresh[active] || {};
      renderForm();
      form.querySelector("select,input")?.focus();
    };
    readAndCalculate();
  }
  function readAndCalculate() {
    const form = $("calc-form"), values = {};
    form.querySelectorAll("[name]").forEach(el => { values[el.name] = el.type === "checkbox" ? el.checked : el.value; });
    drafts[active] = values;
    const numeric = key => values[key] === "" || values[key] == null ? null : Number(values[key]);
    const boolean = key => values[key] === "yes" ? true : values[key] === "no" ? false : null;
    if (active === "gcs") {
      result = S.gcs({population:values.population,...Object.fromEntries(["e","v","m"].map(k=>[k,values[k] === "NT" ? "NT" : numeric(k)]))});
    } else if (active === "news2") {
      $("scale2-confirm").hidden = values.scale !== "2";
      result = S.news2({
        population:values.population, ...Object.fromEntries(["rr","spo2","sbp","hr","temp","scale"].map(k=>[k,numeric(k)])),
        oxygen:boolean("oxygen"), consciousness:values.consciousness, confirmScale2:values.confirmScale2,
      });
    } else if (active === "pews") {
      for (const name of ["behaviour","respiratory","cardiovascular"]) {
        const n = numeric(name);
        $(`criterion-${name}`).textContent = n === null ? "Wybierz kategorię po ocenie klinicznej." : criteria[name][n][1];
      }
      result = S.pews({
        ...Object.fromEntries(["behaviour","respiratory","cardiovascular"].map(k=>[k,numeric(k)])),
        ageNorms:values.ageNorms, bronchodilators:boolean("bronchodilators"), postopVomiting:boolean("postopVomiting"),
      });
    } else if (active === "curb65") {
      $("curb-urea-wrap")?.style.setProperty("display", values.variant === "crb65" ? "none" : "");
      result = S.curb65({
        population: values.population,
        variant: values.variant,
        ureaUnit: values.ureaUnit,
        confusion: boolean("confusion"),
        urea: numeric("urea"),
        rr: numeric("rr"),
        sbp: numeric("sbp"),
        dbp: numeric("dbp"),
        age: numeric("age"),
      });
    } else if (active === "qsofa") {
      result = S.qsofa({
        population: values.population,
        rr: numeric("rr"),
        sbp: numeric("sbp"),
        alteredMentation: boolean("alteredMentation"),
      });
    } else if (active === "wellspe") {
      result = S.wellsPe({
        population: values.population,
        hr: numeric("hr"),
        dvtSigns: boolean("dvtSigns"),
        peMostLikely: boolean("peMostLikely"),
        immobilizationOrSurgery: boolean("immobilizationOrSurgery"),
        previousVte: boolean("previousVte"),
        hemoptysis: boolean("hemoptysis"),
        malignancy: boolean("malignancy"),
      });
    } else if (active === "perc") {
      result = S.perc({
        population: values.population,
        lowPretestConfirmed: values.lowPretestConfirmed,
        age: numeric("age"),
        hr: numeric("hr"),
        spo2: numeric("spo2"),
        unilateralLegSwelling: boolean("unilateralLegSwelling"),
        hemoptysis: boolean("hemoptysis"),
        recentTraumaOrSurgery: boolean("recentTraumaOrSurgery"),
        previousVte: boolean("previousVte"),
        hormoneUse: boolean("hormoneUse"),
      });
    } else if (active === "heart") {
      result = S.heart({
        population: values.population,
        history: numeric("history"),
        ecg: numeric("ecg"),
        age: numeric("age"),
        riskFactors: numeric("riskFactors"),
        troponin: numeric("troponin"),
      });
    } else if (active === "gbs") {
      result = S.gbs({
        population: values.population,
        sex: values.sex,
        ureaUnit: values.ureaUnit,
        urea: numeric("urea"),
        hb: numeric("hb"),
        sbp: numeric("sbp"),
        hr: numeric("hr"),
        melena: boolean("melena"),
        syncope: boolean("syncope"),
        hepaticDisease: boolean("hepaticDisease"),
        cardiacFailure: boolean("cardiacFailure"),
      });
    } else if (active === "alvarado" || active === "pas") {
      result = S.alvarado({
        variant: values.variant || (active === "pas" ? "pas" : "alvarado"),
        rlqTenderness: boolean("rlqTenderness"),
        leukocytosis: boolean("leukocytosis"),
        migration: boolean("migration"),
        anorexia: boolean("anorexia"),
        nauseaVomiting: boolean("nauseaVomiting"),
        reboundOrHopping: boolean("reboundOrHopping"),
        temp: numeric("temp"),
        leftShift: boolean("leftShift"),
      });
    } else if (active === "cha2ds2va") {
      result = S.cha2ds2va({
        population: values.population,
        age: numeric("age"),
        chf: boolean("chf"),
        hypertension: boolean("hypertension"),
        diabetes: boolean("diabetes"),
        strokeTiaTe: boolean("strokeTiaTe"),
        vascularDisease: boolean("vascularDisease"),
      });
    } else if (active === "hasbled") {
      result = S.hasbled({
        population: values.population,
        hypertension: boolean("hypertension"),
        renalDisease: boolean("renalDisease"),
        liverDisease: boolean("liverDisease"),
        strokeHistory: boolean("strokeHistory"),
        bleedingHistory: boolean("bleedingHistory"),
        labileInr: boolean("labileInr"),
        elderly: boolean("elderly"),
        drugs: boolean("drugs"),
        alcohol: boolean("alcohol"),
      });
    } else if (active === "nihss") {
      const nihssKeys = ["ia","ib","ic","gaze","visual","facial","motorArmL","motorArmR","motorLegL","motorLegR","ataxia","sensory","language","dysarthria","extinction"];
      result = S.nihss({
        population: values.population,
        ...Object.fromEntries(nihssKeys.map(k => [k, values[k] === "UN" ? "UN" : numeric(k)])),
      });
    } else if (active === "abcd2") {
      result = S.abcd2({
        population: values.population,
        age: numeric("age"),
        sbp: numeric("sbp"),
        dbp: numeric("dbp"),
        clinicalFeatures: numeric("clinicalFeatures"),
        duration: numeric("duration"),
        diabetes: boolean("diabetes"),
      });
    }
    renderResult();
  }
  function renderResult() {
    const box = $("calc-result");
    box.dataset.level = result.ok ? result.kind : "incomplete";
    $("calc-result-name").textContent = labels[active];
    $("calc-value").textContent = !result.ok ? "—" : result.total === null ? "NT" : String(result.total);
    const maxMap = { gcs: 15, pews: 13, curb65: result.max || 5, qsofa: 3, wellspe: 12.5, perc: 8, heart: 10, gbs: 23, alvarado: 10, pas: 10, cha2ds2va: 8, hasbled: 9, nihss: 42, abcd2: 7 };
    $("calc-max").textContent = !result.ok || result.total === null ? "" : maxMap[active] ? `/ ${maxMap[active]}` : "";
    $("calc-verdict").textContent = result.ok ? result.headline : "Uzupełnij ocenę";
    $("calc-live").textContent = result.ok ? result.summary : "Brak wyniku. " + result.errors.join(" ");
    $("calc-output").innerHTML = result.ok
      ? `<table class="calc-breakdown"><caption>Punkty składowych</caption><thead><tr><th>Składowa</th><th>Ocena</th><th>Pkt</th></tr></thead><tbody>${result.parts.map(p=>`<tr${active === "news2" && p.score === 3 ? ' class="calc-three"' : ""}><th scope="row">${escape(p.label)}</th><td>${escape(p.value)}</td><td>${escape(p.score)}</td></tr>`).join("")}</tbody></table><p class="calc-response">${escape(result.action)}</p>${active === "pews" ? `<p>Domeny: <b>${result.base}/9</b>. Modyfikatory: <b>+${result.total-result.base}</b>. Nie przypisano uniwersalnej kategorii ryzyka.</p>` : ""}`
      : `<ul class="calc-errors">${result.errors.map(e=>`<li>${escape(e)}</li>`).join("")}</ul>`;
    $("calc-insert").disabled = !result.ok;
    $("calc-insert").textContent = result.ok ? `Wstaw wynik · ${targetCohort() === "p" ? "ścieżka dzieci" : "ścieżka dorosłych"}` : "Wstaw wynik do płótna";
    $("calc-references").innerHTML = (sources[active] || []).map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(name)} ↗</a>`).join("");
    if (result.ok) {
      window.dispatchEvent(
        new CustomEvent("clinical:score-evaluated", {
          detail: {
            key: active,
            name: labels[active],
            total: result.total,
            max: $("calc-max").textContent.replace("/ ", ""),
            headline: result.headline,
            action: result.action,
            parts: result.parts,
            timestamp: Date.now(),
          },
        }),
      );
    }
  }
  function targetCohort() {
    if (active === "pews" || active === "pas") return "p";
    if (active === "alvarado" && drafts.alvarado.variant === "pas") return "p";
    if (active === "gcs" && ["childOver5", "young"].includes(drafts.gcs.population)) return "p";
    return "a";
  }
  function open(key = "gcs") {
    if (key === "pgcs") {
      active = "gcs";
      drafts.gcs.population = "young";
    } else {
      active = Object.hasOwn(labels,key) ? key : "gcs";
    }
    renderForm();
    if (!dialog.open) dialog.showModal();
  }
  $("calculators").onclick = () => open();
  $("calc-close").onclick = () => dialog.close();
  document.querySelectorAll("[data-calculator]").forEach(b => {
    b.onclick = () => {
      active = b.dataset.calculator;
      if (active === "pas") drafts.pas.variant = "pas";
      if (active === "alvarado" && !drafts.alvarado.variant) drafts.alvarado.variant = "alvarado";
      renderForm();
    };
    b.onkeydown = ev => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(ev.key)) return;
      ev.preventDefault();
      const keys=Object.keys(labels), index=keys.indexOf(active);
      active=keys[ev.key==="Home"?0:ev.key==="End"?keys.length-1:(index+(ev.key==="ArrowRight"?1:keys.length-1))%keys.length];
      renderForm();$(`calc-tab-${active}`)?.focus();
    };
  });
  $("calc-form").addEventListener("submit", e=>e.preventDefault());
  $("calc-form").addEventListener("input", e=>{
    if (e.target.name === "mode" && Object.hasOwn(labels, e.target.value)) {
      active = e.target.value;
      renderForm();
      return;
    }
    if (active === "gcs" && e.target.name === "population") {
      drafts.gcs.population = e.target.value;
      renderForm();
      return;
    }
    if ((active === "alvarado" || active === "pas") && e.target.name === "variant") {
      const targetTab = e.target.value === "pas" ? "pas" : "alvarado";
      drafts[targetTab] = { ...drafts[active], variant: e.target.value };
      active = targetTab;
      renderForm();
      return;
    }
    if(e.target.name==="scale"){
      $("calc-form").elements.confirmScale2.checked=false;
    }
    if(e.target.name==="ureaUnit"){
      const isMgdl = e.target.value === "mgdl";
      const input = $("calc-urea");
      const label = input?.closest(".calc-field")?.querySelector("label");
      if (input) {
        input.min = isMgdl ? "1" : "0.1";
        input.max = isMgdl ? "300" : "100";
        input.step = isMgdl ? "1" : "0.1";
        input.inputMode = isMgdl ? "numeric" : "decimal";
      }
      if (label) {
        label.textContent = active === "gbs"
          ? (isMgdl ? "Azot mocznikowy (BUN) · mg/dl" : "Mocznik we krwi · mmol/l")
          : (isMgdl ? "U · Azot mocznikowy (BUN) · mg/dl" : "U · Stężenie mocznika we krwi · mmol/l");
      }
    }
    readAndCalculate();
  });
  $("calc-insert").onclick = () => {
    if (!result?.ok) return;
    const name = active === "pews"
      ? "Brighton PEWS / UBC"
      : active === "gcs" && drafts.gcs.population === "young"
      ? "pGCS (≤5 lat)"
      : labels[active];
    // Only this explicit action persists a calculator result to the editable graph.
    const inserted = window.dispatchEvent(new CustomEvent("clinical:score", {cancelable:true,detail:{
      targetCohort:targetCohort(),
      title:`${name} · ${result.total === null ? "NT — bez sumy" : result.total+" pkt"}`,
      type:"scale",data:{body:result.summary,logic:result.action,src:(sources[active] || []).map(([,url])=>url)},
    }}));
    if (inserted) dialog.close();
  };
  window.ClinicalCalculators = Object.freeze({open});
})();
