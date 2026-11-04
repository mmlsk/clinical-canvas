"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const escape = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const S = window.ClinicalScores, dialog = $("calc-dialog");
  const sources = {
    gcs: [
      ["GCS Assessment Aid · oficjalna karta", "https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf"],
      ["GCS FAQ · NT i zastosowanie pediatryczne", "https://www.glasgowcomascale.org/faq/"],
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
  };
  const labels = { gcs:"GCS", news2:"NEWS2", pews:"Brighton PEWS", curb65:"CURB-65 / CRB-65", qsofa:"qSOFA", wellspe:"Wells PE (Zatorowość płucna)" };
  let active = "gcs", drafts = { gcs:{}, news2:{scale:"1"}, pews:{}, curb65:{population:"adult",variant:"curb65",ureaUnit:"mmol"}, qsofa:{population:"adult"}, wellspe:{population:"adult"} }, result = null;
  const options = (items, current) => '<option value="">Wybierz…</option>' + items.map(([v, label]) =>
    `<option value="${escape(v)}"${String(current ?? "") === String(v) ? " selected" : ""}>${escape(label)}</option>`).join("");
  function select(name, label, items, help = "") {
    return `<div class="calc-field"><label for="calc-${name}">${label}</label><select id="calc-${name}" name="${name}">${options(items, drafts[active][name])}</select>${help ? `<p class="calc-help">${help}</p>` : ""}</div>`;
  }
  function number(name, label, min, max, step = 1) {
    return `<div class="calc-field"><label for="calc-${name}">${label}</label><input id="calc-${name}" name="${name}" type="number" min="${min}" max="${max}" step="${step}" inputmode="${step === 1 ? "numeric" : "decimal"}" value="${escape(drafts[active][name] || "")}" autocomplete="off"><p class="calc-help">${min}–${max}${step === 0.1 ? "; do 0,1°C" : "; liczba całkowita"}. Zakres techniczny formularza, nie norma.</p></div>`;
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
      $("calc-description").textContent = "Rozpisanie E + V + M. Standardowa GCS, bez automatycznego zamieniania NT na 1.";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult","Osoba dorosła"],["childOver5","Dziecko >5 lat · standardowa GCS"],["young","Dziecko ≤5 lat · wymaga pGCS"],
      ]) + select("e", "E · otwieranie oczu", [
        [4,"E4 · samoistnie"],[3,"E3 · na głos"],[2,"E2 · na ucisk"],[1,"E1 · brak"],["NT","ENT · nie do oceny"],
      ], "E1 oznacza brak odpowiedzi bez czynnika zakłócającego; np. lokalna przeszkoda w otwieraniu oczu może wymagać NT.") +
      select("v", "V · odpowiedź słowna", [
        [5,"V5 · zorientowana"],[4,"V4 · splątana, lecz spójna"],[3,"V3 · pojedyncze zrozumiałe słowa"],[2,"V2 · dźwięki / jęki"],[1,"V1 · brak"],["NT","VNT · nie do oceny"],
      ], "Intubacja lub inna przeszkoda uniemożliwiająca ocenę mowy: VNT, nie V1.") +
      select("m", "M · najlepsza odpowiedź ruchowa", [
        [6,"M6 · wykonuje polecenia"],[5,"M5 · lokalizuje bodziec"],[4,"M4 · prawidłowe zgięcie / wycofanie"],[3,"M3 · nieprawidłowe zgięcie"],[2,"M2 · wyprost"],[1,"M1 · brak"],["NT","MNT · nie do oceny"],
      ], "Oceń najlepszą odpowiedź; asymetrię opisz osobno. M5: ruch ręki ponad obojczyk do bodźca na głowie/szyi. M4 i M3 wymagają odróżnienia prawidłowego od nieprawidłowego wzorca zgięcia.") +
      '<p class="calc-note">Uwzględnij sedację, blokadę nerwowo-mięśniową, uraz, bariery komunikacji i stan wyjściowy. Wynik sam nie rozstrzyga o intubacji; liczą się drożność dróg oddechowych i całe ABCDE.</p>';
    } else if (active === "news2") {
      $("calc-description").textContent = "Siedem składowych, dwie skale SpO₂ i niezależne punkty za tlen. Odpowiedź według RCP.";
      form.innerHTML = select("population", "Zakres zastosowania", [
        ["adult","Wiek ≥16 lat, bez ciąży"],["child","Wiek <16 lat"],["pregnant","Ciąża"],
      ]) + '<div class="calc-pair">' + number("rr","Oddechy / min",0,100) + number("spo2","SpO₂ · %",0,100) + "</div>" +
      select("scale", "Skala saturacji", [[1,"Skala 1 · standardowa"],[2,"Skala 2 · wyłącznie udokumentowane wskazanie"]]) +
      `<label class="calc-check" id="scale2-confirm"><input name="confirmScale2" type="checkbox"${drafts.news2.confirmScale2 ? " checked" : ""}><span>Potwierdzono hiperkapniczną niewydolność oddechową w gazometrii oraz decyzję uprawnionego klinicysty o stosowaniu skali 2 i celu SpO₂ 88–92%.</span></label>` +
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
    } else {
      $("calc-description").textContent = "Ocena prawdopodobieństwa klinicznego zatorowości płucnej (ZP/PE) u dorosłych i stratyfikacja wskazań do D-dimerów vs angio-TK (CTPA).";
      form.innerHTML = select("population", "Zakres zastosowania", [
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
      '<p class="calc-note">Interpretacja 2-poziomowa (ESC/NICE): wynik ≤4,0 pkt oznacza małe prawdopodobieństwo ZP (wskazanie do D-dimerów o wysokiej czułości; prawidłowy wynik wyklucza ZP bez tomografii). Wynik >4,0 pkt oznacza duże prawdopodobieństwo ZP (wskazanie do natychmiastowego angio-TK tętnic płucnych bez czekania na D-dimery).</p>';
    }
    form.innerHTML += '<button type="button" id="calc-reset">Wyczyść ten kalkulator</button>';
    $("calc-reset").onclick = () => {
      drafts[active] = active === "news2" ? {scale:"1"} : active === "curb65" ? {population:"adult",variant:"curb65",ureaUnit:"mmol"} : ["qsofa","wellspe"].includes(active) ? {population:"adult"} : {};
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
    } else {
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
    }
    renderResult();
  }
  function renderResult() {
    const box = $("calc-result");
    box.dataset.level = result.ok ? result.kind : "incomplete";
    $("calc-result-name").textContent = labels[active];
    $("calc-value").textContent = !result.ok ? "—" : result.total === null ? "NT" : String(result.total);
    $("calc-max").textContent = !result.ok || result.total === null ? "" : active === "gcs" ? "/ 15" : active === "pews" ? "/ 13" : active === "curb65" ? (result.max ? `/ ${result.max}` : "/ 5") : active === "qsofa" ? "/ 3" : active === "wellspe" ? "/ 12.5" : "";
    $("calc-verdict").textContent = result.ok ? result.headline : "Uzupełnij ocenę";
    $("calc-live").textContent = result.ok ? result.summary : "Brak wyniku. " + result.errors.join(" ");
    $("calc-output").innerHTML = result.ok
      ? `<table class="calc-breakdown"><caption>Punkty składowych</caption><thead><tr><th>Składowa</th><th>Ocena</th><th>Pkt</th></tr></thead><tbody>${result.parts.map(p=>`<tr${active === "news2" && p.score === 3 ? ' class="calc-three"' : ""}><th scope="row">${escape(p.label)}</th><td>${escape(p.value)}</td><td>${escape(p.score)}</td></tr>`).join("")}</tbody></table><p class="calc-response">${escape(result.action)}</p>${active === "pews" ? `<p>Domeny: <b>${result.base}/9</b>. Modyfikatory: <b>+${result.total-result.base}</b>. Nie przypisano uniwersalnej kategorii ryzyka.</p>` : ""}`
      : `<ul class="calc-errors">${result.errors.map(e=>`<li>${escape(e)}</li>`).join("")}</ul>`;
    $("calc-insert").disabled = !result.ok;
    $("calc-insert").textContent = result.ok ? `Wstaw wynik · ${targetCohort() === "p" ? "ścieżka dzieci" : "ścieżka dorosłych"}` : "Wstaw wynik do płótna";
    $("calc-references").innerHTML = sources[active].map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(name)} ↗</a>`).join("");
  }
  function targetCohort() {
    return active === "pews" || (active === "gcs" && drafts.gcs.population === "childOver5") ? "p" : "a";
  }
  function open(key = "gcs") {
    active = Object.hasOwn(labels,key) ? key : "gcs";
    renderForm();
    if (!dialog.open) dialog.showModal();
  }
  $("calculators").onclick = () => open();
  $("calc-close").onclick = () => dialog.close();
  document.querySelectorAll("[data-calculator]").forEach(b => {
    b.onclick = () => { active=b.dataset.calculator;renderForm(); };
    b.onkeydown = ev => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(ev.key)) return;
      ev.preventDefault();
      const keys=Object.keys(labels), index=keys.indexOf(active);
      active=keys[ev.key==="Home"?0:ev.key==="End"?keys.length-1:(index+(ev.key==="ArrowRight"?1:keys.length-1))%keys.length];
      renderForm();$(`calc-tab-${active}`).focus();
    };
  });
  $("calc-form").addEventListener("submit", e=>e.preventDefault());
  $("calc-form").addEventListener("input", e=>{
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
        label.textContent = isMgdl ? "U · Azot mocznikowy (BUN) · mg/dl" : "U · Stężenie mocznika we krwi · mmol/l";
      }
    }
    readAndCalculate();
  });
  $("calc-insert").onclick = () => {
    if (!result?.ok) return;
    const name=active==="pews"?"Brighton PEWS / UBC":labels[active];
    // Only this explicit action persists a calculator result to the editable graph.
    const inserted = window.dispatchEvent(new CustomEvent("clinical:score", {cancelable:true,detail:{
      targetCohort:targetCohort(),
      title:`${name} · ${result.total === null ? "NT — bez sumy" : result.total+" pkt"}`,
      type:"scale",data:{body:result.summary,logic:result.action,src:sources[active].map(([,url])=>url)},
    }}));
    if (inserted) dialog.close();
  };
  window.ClinicalCalculators = Object.freeze({open});
})();
