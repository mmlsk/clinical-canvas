"use strict";
// Authored synthesis. Source IDs are resolved to the primary documents below.
// "reviewed" means checked for this version, not the document publication date.
(() => {
  const reviewed = "2026-11-11";
  const sources = {
    abcde: {
      name: "Resuscitation Council UK · ABCDE",
      url: "https://www.resus.org.uk/library/abcde-approach",
    },
    chest: {
      name: "NICE CG95 · Recent-onset chest pain",
      url: "https://www.nice.org.uk/guidance/CG95/chapter/recommendations",
    },
    chestP: {
      name: "RCH · Chest pain in children",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Chest_pain/",
    },
    pe: {
      name: "NICE NG158 · VTE diagnosis and management",
      url: "https://www.nice.org.uk/guidance/ng158/chapter/recommendations",
    },
    bronchio: {
      name: "RCH · Bronchiolitis",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Bronchiolitis/",
    },
    abd: {
      name: "ACR · Acute nonlocalized abdominal pain",
      url: "https://acsearch.acr.org/docs/69467/Narrative/",
    },
    abdP: {
      name: "RCH · Acute abdominal pain",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain/",
    },
    headache: {
      name: "NICE CG150 · Headaches (≥12 lat)",
      url: "https://www.nice.org.uk/guidance/cg150/chapter/Recommendations",
    },
    headacheP: {
      name: "RCH · Headache",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/headache/",
    },
    syncope: {
      name: "NICE CG109 · Transient loss of consciousness (≥16 lat)",
      url: "https://www.nice.org.uk/guidance/CG109/chapter/recommendations",
    },
    syncopeP: {
      name: "RCH · Syncope",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/syncope/",
    },
    feverP: {
      name: "NICE NG143 · Fever in under 5s",
      url: "https://www.nice.org.uk/guidance/NG143/chapter/recommendations",
    },
    sepsis: {
      name: "NICE NG253 · Suspected sepsis ≥16 lat",
      url: "https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis",
    },
    conscious: {
      name: "RCH · Altered conscious state",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Altered_conscious_state/",
    },
    stroke: {
      name: "NICE NG128 · Stroke and TIA",
      url: "https://www.nice.org.uk/guidance/NG128/chapter/recommendations",
    },
    strokeP: {
      name: "RCH · Stroke",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/stroke/",
    },
    vomitP: {
      name: "RCH · Vomiting",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/",
    },
    gastro: {
      name: "RCH · Gastroenteritis",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/gastroenteritis/",
    },
    bleed: {
      name: "NICE CG141 · Acute upper GI bleeding (≥16 lat)",
      url: "https://www.nice.org.uk/guidance/cg141/chapter/Recommendations",
    },
    bleedP: {
      name: "CHOP · Upper gastrointestinal bleed pathway",
      url: "https://www.chop.edu/clinical-pathway/upper-gastrointestinal-bleed-clinical-pathway",
    },
    back: {
      name: "NICE NG59 · Low back pain and sciatica",
      url: "https://www.nice.org.uk/guidance/ng59/chapter/Recommendations",
    },
    backP: {
      name: "ACR · Back pain, child",
      url: "https://acsearch.acr.org/docs/3099011/Narrative/",
    },
    news: {
      name: "Royal College of Physicians · NEWS2",
      url: "https://www.rcp.ac.uk/media/ctulqqbn/news2-executive-summary_0.pdf",
    },
    gcs: {
      name: "Glasgow Coma Scale · oficjalna karta oceny",
      url: "https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf",
    },
    gcsFAQ: {
      name: "Glasgow Coma Scale · NT i zakres pediatryczny",
      url: "https://www.glasgowcomascale.org/faq/",
    },
    pews: {
      name: "UBC CPD · Brighton PEWS, 31.05.2024",
      url: "https://ubccpd.ca/sites/default/files/documents/Brighton-PEWS.pdf",
    },
    rcukAna: {
      name: "Resuscitation Council UK · Anaphylaxis Guidelines",
      url: "https://www.resus.org.uk/library/2021-resuscitation-guidelines/emergency-treatment-anaphylactic-reactions",
    },
    niceAna: {
      name: "NICE CG134 · Anaphylaxis: assessment and referral",
      url: "https://www.nice.org.uk/guidance/cg134",
    },
    rchAna: {
      name: "RCH · Anaphylaxis clinical guideline",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Anaphylaxis/",
    },
    niceSeiz: {
      name: "NICE NG217 · Epilepsies: diagnosis and management",
      url: "https://www.nice.org.uk/guidance/ng217",
    },
    rchSeiz: {
      name: "RCH · Afebrile seizures & status epilepticus",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Afebrile_seizures/",
    },
    toxbase: {
      name: "UK National Poisons Information Service · TOXBASE",
      url: "https://www.toxbase.org/",
    },
    rchPois: {
      name: "RCH · Poisoning acute management",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Poisoning/",
    },
    atls: {
      name: "ACS ATLS & NICE NG39 · Major trauma assessment",
      url: "https://www.nice.org.uk/guidance/ng39",
    },
    pecarn: {
      name: "PECARN · Pediatric Head Injury Prediction Rule",
      url: "https://pecarn.org/",
    },
    ercArr: {
      name: "ERC 2021/2025 · Peri-arrest arrhythmias",
      url: "https://cprguidelines.eu/",
    },
    rchArr: {
      name: "RCH · Supraventricular tachycardia (SVT)",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Supraventricular_Tachycardia/",
    },
    jbds: {
      name: "JBDS-IP & ERC · Diabetic Ketoacidosis & Hyperkalaemia",
      url: "https://abcd.care/joint-british-diabetes-societies-jbds-inpatient-care-group",
    },
    rchDka: {
      name: "RCH · Diabetic ketoacidosis clinical guideline",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Diabetic_Ketoacidosis_DKA/",
    },
    eauUro: {
      name: "EAU Guidelines · Urological Emergencies & Renal Colic",
      url: "https://uroweb.org/guidelines",
    },
    rcogEarly: {
      name: "RCOG · Diagnosis and Management of Ectopic Pregnancy",
      url: "https://www.rcog.org.uk/",
    },
    rchScrot: {
      name: "RCH · Acute scrotal pain in children",
      url: "https://www.rch.org.au/clinicalguide/guideline_index/Acute_scrotum/",
    },
  };
  const modules = [];
  const C = (x) => x;
  function module(id, title, subtitle, a, p) {
    modules.push({ id, title, subtitle, a: C(a), p: C(p) });
  }

  module(
    "overview",
    "Od przyjęcia do wypisu",
    "Mapa nadrzędna: stabilizacja przed diagnostyką, ponowna ocena po każdej interwencji.",
    {
      hx: [
        "SAMPLE: objawy, alergie, leki, choroby i zabiegi, ostatni posiłek, okoliczności. Ustal czas początku i stan wyjściowy.",
        "W warunkach przedszpitalnych: bezpieczeństwo miejsca, wezwanie pomocy, ograniczenia diagnostyki i priorytet transportu.",
      ],
      exam: [
        "ABCDE: drogi oddechowe, oddychanie, krążenie, neurologia z glikemią, ekspozycja i temperatura.",
        "AVPU do szybkiej oceny; GCS zapisuj E/V/M, z odnotowaniem sedacji lub przeszkód w badaniu.",
      ],
      red: [
        "Brak prawidłowego oddechu, niedrożność dróg oddechowych, objawy wstrząsu, nowy deficyt neurologiczny, pogorszenie świadomości.",
      ],
      urgent:
        "Nieprzytomny i brak prawidłowego oddechu: wezwij pomoc, rozpocznij RKO/AED zgodnie z aktualnym lokalnym protokołem. Przy zachowanym oddechu: chroń drogi oddechowe, lecz zagrożenia ABCDE i monitoruj. W szpitalu aktywuj zespół resuscytacyjny; poza szpitalem 112/999 i transport zgodnie z priorytetem.",
      question: "Czy potrzebna hospitalizacja lub obserwacja?",
      yes: {
        title: "Obserwacja / przyjęcie",
        body: "Stan niepewny, narastające objawy lub potrzeba terapii/nadzoru: obserwacja, konsultacja i diagnostyka odpowiadająca hipotezie. Ustal cele i termin ponownej oceny.",
        tests: [
          "NEWS2 u odpowiednich dorosłych to narzędzie eskalacji, nie rozpoznanie. 5–6: pilna ocena; ≥7: interwencja zespołu z kompetencjami krytycznymi.",
          "Częstość monitorowania dobierz do kategorii i lokalnej karty NEWS2; nie przypisuj jednej częstości całemu zakresowi 0–4.",
        ],
      },
      no: {
        title: "Opieka ambulatoryjna",
        body: "Wypis zależy od rozpoznania i ryzyka, a nie od uniwersalnego wymogu „24 godzin prawidłowych parametrów”.",
        tests: [
          "Nie zlecaj rutynowo morfologii, CRP ani TK bez pytania klinicznego.",
        ],
      },
      subq: {
        title: "Czy NEWS2 ≥5 (lub 3 w 1 parametrze) / niewydolność narządowa?",
        body: "Oceń konieczność eskalacji nadzoru (OIT/OOM) na podstawie karty NEWS2, dynamiki parametrów życiowych oraz cech hipoperfuzji lub niewydolności oddechowej.",
        criteria: [
          "[TAK] NEWS2 ≥7 pkt lub utrzymujące się NEWS2 5–6 z pogorszeniem klinicznym",
          "[TAK] Pojedynczy parametr = 3 pkt z niestabilnością lub mleczan >2 mmol/l",
          "[NIE] NEWS2 0–4 pkt, stabilna hemodynamika i zachowana diureza",
        ],
      },
      subyes: {
        title: "Pilna eskalacja i nadzór OIT/OOM",
        type: "urgent",
        body: "Aktywuj zespół wczesnego reagowania / konsultację intensywnej terapii. Ciągłe monitorowanie kardiomonitorem, bilans płynów i leczenie celowane niewydolności narządowej.",
        tests: [
          "Gazometria z mleczanem, pełny profil narządowy i kontrola odpowiedzi na leczenie co 15–30 min.",
        ],
      },
      subno: {
        title: "Plan obserwacji oddziałowej i celowana diagnostyka",
        body: "Przyjęcie na oddział zachowawczy/zabiegowy lub do strefy obserwacji SOR. Ustal częstotliwość pomiarów wg NEWS2 i czas ponownej weryfikacji lekarskiej.",
        tests: [
          "Badania laboratoryjne i obrazowe wyłącznie ukierunkowane na wiodącą hipotezę kliniczną.",
        ],
      },
      alt: {
        title: "Bezpieczny wypis z instrukcją alarmową (Safety-netting)",
        body: "Potwierdź stabilność parametrów, zdolność do samoopieki i brak czerwonych flag. Przekaż pisemne zalecenia oraz kryteria natychmiastowego powrotu.",
        tests: [
          "Weryfikacja listy leków, ewentualna korekta dawek nerkowych i wyznaczenie terminu kontroli POZ/AOS.",
        ],
      },
      dispo: [
        "Uzgodnij leki, wyjaśnij robocze rozpoznanie i niepewność. Zaplanuj kontrolę, odbiór wyników oczekujących i objawy wymagające natychmiastowego powrotu.",
      ],
      pit: [
        "GCS ≤8 to ważny sygnał do pilnej oceny dróg oddechowych, nie automatyczny nakaz intubacji na podstawie samej sumy.",
        "Skala SpO₂ 2 NEWS2 jest dla chorych z potwierdzoną hiperkapniczną niewydolnością oddechową i zleconym celem 88–92%, nie dla każdej choroby płuc.",
      ],
      logic:
        "Najpierw usuń bezpośrednie zagrożenie. Potem ustal prawdopodobieństwo choroby i sprawdź, które badanie rzeczywiście zmieni decyzję.",
      src: ["abcde", "news"],
    },
    {
      hx: [
        "Wiek, masa ciała, stan wyjściowy, karmienie i picie, diureza, szczepienia, choroby przewlekłe. Wywiad od dziecka oraz opiekuna.",
        "Uwzględnij nagłe pogorszenie, możliwość zatrucia i bezpieczeństwo dziecka.",
      ],
      exam: [
        "ABCDE z normami parametrów dla wieku, pracą oddechową, perfuzją i stanem nawodnienia.",
        "Glukoza w zaburzeniach świadomości; pediatrycznie dostosowane składowe GCS u małych dzieci.",
      ],
      red: [
        "Bezdech, sinica, wyczerpanie oddechowe, zaburzenia perfuzji, wiotkość, trudność wybudzenia.",
        "Zaniepokojenie rodzica i personelu mimo pozornie dobrych parametrów.",
      ],
      urgent:
        "Wezwij zespół pediatryczny/resuscytacyjny. Poza szpitalem uruchom ratownictwo; w szpitalu pilne ABCDE i leczenie zagrożeń. Dawkowanie i sprzęt dobierz do masy/wieku, a nie przez zmniejszenie dawki dla dorosłego „na oko”.",
      question: "Czy potrzebna obserwacja lub konsultacja pediatryczna?",
      yes: {
        title: "Obserwacja / pediatra",
        body: "Niemowlę z czynnikami ryzyka, niepewne rozpoznanie, brak podaży doustnej lub niewiarygodna obserwacja domowa: niższy próg hospitalizacji.",
        tests: [
          "Lokalny PEWS i trend; progi zależą od konkretnego systemu. Nie stosuj jednej uniwersalnej sumy dla wszystkich wersji PEWS.",
        ],
      },
      no: {
        title: "Wypis z planem",
        body: "Stan ogólny i nawodnienie dobre, opiekun rozumie postępowanie i ma dostęp do ponownej oceny.",
        tests: [
          "Celowane badania tylko ze wskazań. Bezpieczny wypis nie wymaga automatycznie „pełnego panelu”.",
        ],
      },
      subq: {
        title: "Czy narastający wysiłek oddechowy, zaburzenia perfuzji lub wysoki PEWS?",
        body: "Oceń dynamikę Brighton PEWS (zachowanie, krążenie, oddech), tolerancję płynów i odpowiedź na wstępne leczenie.",
        criteria: [
          "[TAK] Brighton PEWS ≥4 pkt lub pojedyncza domena = 3 pkt",
          "[TAK] Nawrót hipoksemii, CRT >3 s, letarg lub całkowita odmowa picia",
          "[NIE] PEWS 0–3 pkt, dobra perfuzja i poprawa po leczeniu wstępnym",
        ],
      },
      subyes: {
        title: "Pilna eskalacja pediatryczna / OIT dziecięcy",
        type: "urgent",
        body: "Pilna konsultacja starszego pediatry / OIT dziecięcego. Tlenoterapia, wsparcie oddechowe (HFNC/CPAP wg wskazań), dostęp IV i ciągłe monitorowanie.",
        tests: [
          "Glikemia przyłóżkowa, gazometria kapilarna/żylna i celowane badania wg podejrzewanej przyczyny.",
        ],
      },
      subno: {
        title: "Krótka obserwacja pediatryczna i próba pojenia",
        body: "Obserwacja w oddziale pediatrycznym lub sali obserwacyjnej przez 4–6 h z oceną tolerancji doustnej (DPN), diurezy i trendu PEWS.",
        tests: [
          "Powtórna ocena kliniczna po obniżeniu gorączki i próbie nawodnienia doustnego.",
        ],
      },
      alt: {
        title: "Edukacja opiekuna i pisemny plan alarmowy (Safety-net)",
        body: "Upewnij się, że opiekun potrafi ocenić pracę oddechową, nawodnienie i wysypkę (test szklanki) oraz ma możliwość szybkiego powrotu.",
        tests: [
          "Przelicz dawki leków przeciwgorączkowych na aktualną masę ciała dziecka.",
        ],
      },
      dispo: [
        "Zapisz ocenę i ograniczenia. Przekaż jasny safety-net: oddech, świadomość, picie, mocz, wysypka i pogorszenie; wskaż miejsce i termin kontroli.",
      ],
      pit: [
        "Prawidłowe ciśnienie nie wyklucza wstrząsu u dziecka.",
        "NEWS2 nie zastępuje systemu pediatrycznego. Nie przenoś progów dorosłych na dzieci.",
      ],
      logic:
        "Dziecko może długo kompensować, a następnie szybko się pogorszyć. Wczesne znaczenie mają wygląd, praca oddechowa i perfuzja.",
      src: ["abcde", "conscious", "feverP"],
    },
  );

  module(
    "chest",
    "Ból w klatce piersiowej",
    "Najpierw przyczyny zagrażające życiu; u dzieci badania ze wskazań, nie rutynowy panel ACS.",
    {
      hx: [
        "Początek i czas trwania; wysiłkowy, opłucnowy, pozycyjny czy rozrywający charakter; promieniowanie.",
        "Duszność, poty, omdlenie, krwioplucie; CAD, VTE, aortopatia, kokaina, leki, ciąża/połóg.",
      ],
      exam: [
        "Parametry i perfuzja; serce, płuca, tętna obwodowe i badanie kończyn pod kątem DVT.",
        "Podejrzenie aorty: asymetria tętna/ciśnień, nowy szmer niedomykalności, objawy neurologiczne.",
      ],
      red: [
        "Niestabilność krążeniowa, hipoksemia, utrzymujący się ból, omdlenie, objawy rozwarstwienia, odmy prężnej lub masywnej PE.",
      ],
      urgent:
        "ABCDE i monitorowanie. Pilne 12-odprowadzeniowe EKG; przy STEMI lub innym stanie zagrożenia aktywuj właściwą ścieżkę bez oczekiwania na troponinę. Leczenie dostosuj do prawdopodobnej przyczyny, nie podawaj wszystkiego z „pakietu bólu w klatce”.",
      question: "Czy ACS jest klinicznie podejrzany?",
      yes: {
        title: "EKG + hs-cTn w protokole",
        body: "EKG i wysokoczuła troponina przy przyjęciu. Kolejne pobrania i progi zależą od testu i zwalidowanego lokalnego algorytmu, np. 0/1 h lub 0/2 h.",
        tests: [
          "Prawidłowe EKG nie wyklucza ACS; powtórz przy nawrocie lub utrzymywaniu się objawów.",
          "Pojedynczy ujemny wynik hs-cTn nie wyklucza bardzo wczesnego zawału bez spełnienia kryteriów algorytmu.",
        ],
      },
      no: {
        title: "Celowana diagnostyka alternatyw",
        body: "Rozważ PE, aortę, odmę, zapalenie osierdzia/mięśnia sercowego oraz przyczyny ściany klatki i przełyku.",
        tests: [
          "PE: przejdź do modułu duszności/Wells. D-dimer tylko przy właściwym prawdopodobieństwie.",
          "RTG przy podejrzeniu choroby płuc; angio-TK aorty przy uzasadnionym podejrzeniu. Nie wykonuj obu rutynowo.",
        ],
      },
      subq: {
        title: "Czy STEMI w EKG, hs-cTn Rule-in lub HEART ≥7 pkt?",
        body: "Zintegruj zapis 12-odprowadzeniowego EKG, dynamikę hs-cTn (0/1h lub 0/2h) oraz stratyfikację ryzyka w skali HEART.",
        criteria: [
          "[TAK] Uniesienie ST / ekwiwalent STEMI lub dynamiczne niedokrwienie w EKG",
          "[TAK] Dodatnia delta hs-cTn (Rule-in) lub wysokie ryzyko HEART ≥7 pkt",
          "[NIE] Strefa obserwacji hs-cTn (Observe) lub HEART 4–6 pkt / Rule-out (HEART 0–3)",
        ],
      },
      subyes: {
        title: "Pilna strategia inwazyjna (koronarografia / PPCI) + DAPT",
        type: "urgent",
        body: "Aktywuj pracownię hemodynamiki (PPCI w STEMI / NSTEMI bardzo wysokiego ryzyka) lub przyjmij na OIOK. Włącz leczenie przeciwpłytkowe i przeciwkrzepliwe wg wytycznych ESC.",
        tests: [
          "Przyłóżkowe Echo (FOCUS) w celu oceny kurczliwości odcinkowej i powikłań mechanicznych bez opóźniania reperfuzji.",
        ],
      },
      subno: {
        title: "Strefa obserwacji: hs-cTn 0/1–3h, Echo i ocena HEART",
        body: "W strefie Observe powtórz hs-cTn po 3h i wykonaj Echo. W grupie Rule-out i HEART ≤3 pkt bez nawrotu bólu rozważ bezpieczny wypis z kontrolą kardiologiczną.",
        tests: [
          "Kontrolne EKG przy każdej zmianie bólu; próba obciążeniowa lub angio-TK tętnic wieńcowych (CCTA) wg HEART.",
        ],
      },
      alt: {
        title: "Różnicowanie: ZP (Wells/PERC), zespół aortalny (CTA), odma/osierdzie",
        body: "Ukierunkuj diagnostykę na cechy kliniczne: ból opłucnowy + duszność (Wells PE / PERC), ból rozrywający z asymetrią ciśnień (CTA aorty), ból pozycyjny z tarciem osierdziowym (zapalenie osierdzia).",
        tests: [
          "D-dimer / CTPA wg skali Wellsa; POCUS (protokół BLUE/FOCUS) przy podejrzeniu odmy lub płynu w osierdziu.",
        ],
      },
      dispo: [
        "Wypis tylko po zakończeniu właściwego algorytmu i ocenie ryzyka. Ongoing pain, nieprawidłowe wyniki lub niepewna etiologia wymagają dalszej obserwacji.",
      ],
      pit: [
        "Wzrost troponiny oznacza uszkodzenie mięśnia sercowego, nie zawsze zawał typu 1.",
        "Ból odtwarzalny uciskiem zmniejsza prawdopodobieństwo ACS, ale sam go nie wyklucza.",
      ],
      logic:
        "EKG wykrywa stany wymagające natychmiastowej reperfuzji. Kinetyka hs-cTn wymaga uwzględnienia czasu początku i granic konkretnego testu.",
      src: ["chest", "pe"],
    },
    {
      hx: [
        "Wysiłek, omdlenie, kołatanie, infekcja, uraz; astma, wady serca, choroby układowe.",
        "Nagły zgon/arytmia/kardiomiopatia w rodzinie; ból po połknięciu i możliwe ciało obce.",
      ],
      exam: [
        "Witalne według wieku; praca oddechowa, osłuchiwanie, rytm/szmery i perfuzja.",
        "Tkliwość ściany klatki, cechy zapalenia, gorączka i ogólny wygląd.",
      ],
      red: [
        "Ból wysiłkowy, omdlenie, nieprawidłowe parametry lub badanie, istotna choroba serca, obciążający wywiad rodzinny.",
      ],
      urgent:
        "ABCDE i pilna ocena pediatryczna; w razie podejrzenia sercowego konsultacja kardiologiczna. Niestabilność lub hipoksemia wymagają pilnego leczenia przyczynowego.",
      question: "Czy są czynniki ryzyka sercowo-płucnego?",
      yes: {
        title: "Badania ukierunkowane",
        body: "Dobierz badania do podejrzenia: EKG przy cechach sercowych; RTG przy oddechowych; troponina przy podejrzeniu zapalenia/uszkodzenia mięśnia sercowego.",
        tests: [
          "Echo po konsultacji przy podejrzeniu choroby strukturalnej, nie jako screening każdego bólu.",
          "Nie stosuj automatycznie dorosłych HEART/Wells/algorytmów troponinowych.",
        ],
      },
      no: {
        title: "Zwykle bez rutynowych badań",
        body: "U dobrze wyglądającego dziecka z prawidłowym badaniem często przyczyna mięśniowo-szkieletowa lub samoograniczająca.",
        tests: [
          "EKG, RTG i badania krwi rezerwuj dla czynników ryzyka; sam ból nie stanowi wskazania do „panelu”.",
        ],
      },
      subq: {
        title: "Czy obecne zmiany w EKG, wzrost troponiny lub cechy myocarditis/pericarditis?",
        body: "Oceń zapis EKG (zaburzenia rytmu, przewodzenia, uniesienie ST/obniżenie PR), markery uszkodzenia mięśnia sercowego i obraz RTG klatki piersiowej.",
        criteria: [
          "[TAK] Nieprawidłowe EKG, podwyższona troponina/NT-proBNP lub tachykardia nieadekwatna do gorączki",
          "[TAK] Cechy płynu w osierdziu, kardiomegalii lub odmy opłucnowej",
          "[NIE] Prawidłowe EKG i markery przy stabilnym stanie klinicznym",
        ],
      },
      subyes: {
        title: "Pilna kardiologia dziecięca, Echo i hospitalizacja",
        type: "urgent",
        body: "Hospitalizacja na oddziale kardiologii dziecięcej lub OIT. Monitorowanie telemetryczne, pilne badanie echokardiograficzne i ostrożna płynoterapia przy podejrzeniu myocarditis.",
        tests: [
          "Echo serca, troponina, NT-proBNP, CRP/OB i diagnostyka wirusologiczna wg wskazań.",
        ],
      },
      subno: {
        title: "Obserwacja pediatryczna, kontrola EKG i zakaz wysiłku do wyjaśnienia",
        body: "Przy bólu wysiłkowym z prawidłowym wstępnym EKG i troponiną: wstrzymanie sportu i pilna ambulatoryjna diagnostyka kardiologiczna (Echo, próba wysiłkowa/Holter).",
        tests: [
          "Weryfikacja wywiadu rodzinnego w kierunku kanałopatii i kardiomiopatii przerostowej (HCM).",
        ],
      },
      alt: {
        title: "Ból mięśniowo-szkieletowy / idiopatyczny: analgezja i uspokojenie",
        body: "Wyjaśnij łagodny charakter dolegliwości (np. costochondritis, zespół precordial catch), zalecaj leczenie przeciwzapalne/przeciwbólowe i powrót do aktywności.",
        tests: [
          "Brak wskazań do oznaczania troponiny i D-dimeru u dziecka bez czerwonych flag.",
        ],
      },
      dispo: [
        "Wypis po poprawie, z wyjaśnieniem przyczyny i kontrolą. Objawy wysiłkowe lub omdlenie: powstrzymanie wysiłku do wyjaśnienia i właściwa konsultacja.",
      ],
      pit: [
        "„U dzieci to zawsze ból mięśni” jest błędem; aktywnie zbierz wywiad rodzinny.",
        "Troponina nie jest badaniem przesiewowym wszystkich pediatrycznych bólów w klatce.",
      ],
      logic:
        "Niska częstość choroby serca uzasadnia selektywne testowanie, ale red flags istotnie zmieniają prawdopodobieństwo przedtestowe.",
      src: ["chestP"],
    },
  );

  module(
    "dyspnea",
    "Duszność",
    "Wysiłek oddechowy i perfuzja przed wynikiem saturacji; odrębna logika VTE i pediatrii.",
    {
      hx: [
        "Nagła czy narastająca; spoczynek/wysiłek, ortopnoë, kaszel, gorączka, ból opłucnowy, krwioplucie.",
        "VTE, unieruchomienie/operacja, nowotwór, hormony, ciąża; astma/POChP, niewydolność serca, leki i ekspozycje.",
      ],
      exam: [
        "RR, SpO₂, wysiłek i mowa, świadomość; osłuchanie i symetria, obrzęki, szyjne żyły, perfuzja.",
        "Ciężka duszność: gazometria według wskazań; hiperkapnia może występować przy pozornie dobrej SpO₂.",
      ],
      red: [
        "Cicha klatka z wyczerpaniem, stridor, narastająca hiperkapnia/kwasica, zaburzenia świadomości, wstrząs, podejrzenie odmy prężnej.",
      ],
      urgent:
        "ABCDE; tlen i wsparcie wentylacji według wskazań i docelowej saturacji. Pilne leczenie przyczynowe; rozpoznanie odmy prężnej jest kliniczne, nie czekaj na TK.",
      question: "Czy podejrzenie PE jest uzasadnione?",
      yes: {
        title: "Prawdopodobieństwo → badanie",
        body: "Dorosły: jeśli podejrzenie bardzo małe i PERC właściwy dla populacji, rozważ wykluczenie bez D-dimeru. W przeciwnym razie 2-poziomowy Wells: >4 PE likely → CTPA; ≤4 → D-dimer.",
        tests: [
          "Przy ujemnym D-dimerze w odpowiedniej grupie zakończ diagnostykę PE; dodatni → CTPA. Rozważ próg skorygowany o wiek >50 lat zgodnie z testem/jednostkami.",
          "Gdy CTPA niewłaściwe, rozważ V/Q zgodnie ze wskazaniami. Opóźnienie diagnostyki: tymczasowa antykoagulacja terapeutyczna tylko po ocenie przeciwwskazań według protokołu.",
        ],
      },
      no: {
        title: "Kieruj się fenotypem",
        body: "Świsty, zastój, infekcja, anemia lub zaburzenia metaboliczne: każde podejrzenie wymaga innego zestawu badań.",
        tests: [
          "RTG przy podejrzeniu pneumonii, zastoju lub odmy. EKG przy możliwej przyczynie sercowej.",
          "Morfologia przy podejrzeniu anemii; elektrolity/gazometria przy podejrzeniu zaburzeń metabolicznych. Nie wykonuj D-dimeru jako screeningu duszności.",
        ],
      },
      subq: {
        title: "Czy Wells PE >4 pkt lub dodatni D-dimer (skorygowany o wiek)?",
        body: "Przy małym prawdopodobieństwie klinicznym i PERC = 0/8 zakończ diagnostykę. Przy Wells ≤4 oznacz D-dimer (próg wiek × 10 µg/l powyżej 50 r.ż.); przy Wells >4 wykonaj bezpośrednio angio-TK.",
        criteria: [
          "[TAK] Skala Wellsa dla PE >4 pkt (zatorowość prawdopodobna)",
          "[TAK] Skala Wellsa ≤4 pkt oraz dodatni D-dimer powyżej progu dla wieku",
          "[NIE] PERC = 0 pkt (przy małym ryzyku) lub ujemny D-dimer przy Wells ≤4 pkt",
        ],
      },
      subyes: {
        title: "Pilne angio-TK (CTPA) i antykoagulacja terapeutyczna",
        type: "urgent",
        body: "Zleć pilne CTPA (lub scyntygrafię V/Q przy przeciwwskazaniach) oraz włącz antykoagulację terapeutyczną (NOAC / HDCz) po wykluczeniu aktywnego krwawienia.",
        tests: [
          "Oceń przeciążenie prawej komory (Echo/CTPA, troponina, NT-proBNP) do stratyfikacji ryzyka ZP.",
        ],
      },
      subno: {
        title: "Wykluczenie ZP (PERC 0/8 lub ujemny D-dimer) — szukaj innej przyczyny",
        body: "Zatorowość płucna bezpiecznie wykluczona bez konieczności ekspozycji na promieniowanie i kontrast. Przeprowadź ocenę alternatywnych przyczyn duszności.",
        tests: [
          "Rozważ POCUS płuc (protokół BLUE), RTG klatki piersiowej lub spirometrię/gazometrię wg obrazu klinicznego.",
        ],
      },
      alt: {
        title: "Fenotyp POCUS BLUE: obrzęk płuc vs POChP/astma vs CAP (CURB-65)",
        body: "Dopasuj terapię do fenotypu: profil B obustronny (diuretyk pętlowy IV + azotany + NIV w obrzęku płuc), obturacja (SABA + SAMA + steroid ogólnoustrojowy), zapalenie płuc (antybiotyk wg NPOA i ocena CURB-65).",
        tests: [
          "Gazometria tętnicza przy ryzyku hiperkapnii (cel SpO₂ 88–92% w POChP), ocena skali CURB-65 w pozaszpitalnym zapaleniu płuc.",
        ],
      },
      dispo: [
        "Reasessuj po leczeniu: RR, mowa, wysiłek, saturacja i zapotrzebowanie na tlen. Nie wypisuj na podstawie samej poprawy SpO₂.",
      ],
      pit: [
        "PERC/Wells i dorosłe progi D-dimeru nie są automatycznym algorytmem dla ciężarnych i dzieci.",
        "Ujemny D-dimer przy wysokim prawdopodobieństwie nie zastępuje obrazowania.",
      ],
      logic:
        "Im wyższe prawdopodobieństwo PE, tym mniejsza wartość wykluczająca D-dimeru i większy sens bezpośredniego obrazowania.",
      src: ["pe", "abcde"],
    },
    {
      hx: [
        "Wiek, początek, karmienie, epizod krztuszenia, infekcja, astma, wcześniejsze bezdechy i wcześniactwo.",
      ],
      exam: [
        "Zaciąganie, stękanie, tachypnoë według wieku, stridor/świsty, bezdech, saturacja i nawodnienie.",
        "Asymetria i nagły początek: myśl o ciele obcym lub odmie.",
      ],
      red: [
        "Bezdech, sinica, wyczerpanie, malejąca aktywność oddechowa, słaba odpowiedź, odwodnienie lub niemożność karmienia.",
      ],
      urgent:
        "Wezwij pomoc pediatryczną, udrożnij drogi, wesprzyj utlenowanie/wentylację. Przy krztuszeniu, stridorze lub asymetrii aktywuj adekwatną ścieżkę zamiast zakładać infekcję.",
      question: "Czy obraz typowy dla bronchiolitis?",
      yes: {
        title: "Rozpoznanie kliniczne",
        body: "Typowe bronchiolitis u niemowlęcia: ocena ciężkości, nawodnienia i potrzeby tlenu; leczenie wspierające.",
        tests: [
          "Bez rutynowego RTG, badań krwi i testów wirusowych zmieniających tylko etykietę.",
          "Salbutamol, steroidy i antybiotyk nie są rutynowym leczeniem typowego bronchiolitis.",
        ],
      },
      no: {
        title: "Astma / krup / ciało obce / inne",
        body: "Różnicuj według wieku, początku i osłuchiwania. Przypadek nietypowy lub ciężki wymaga oceny seniora.",
        tests: [
          "RTG/gazometria/badania zakaźne tylko przy wskazaniach, nietypowym przebiegu lub pogorszeniu.",
          "Nie stosuj dorosłych reguł PE do wykluczania zatorowości u dziecka.",
        ],
      },
      subq: {
        title: "Czy ciężkie bronchiolitis (bezdechy, SpO₂ <90–92%, karmienie <50%)?",
        body: "Oceń wysiłek oddechowy, obecność bezdechów, saturację na powietrzu atmosferycznym, tolerancję karmienia oraz czynniki ryzyka (wiek <6 tyg., wcześniactwo, wady serca).",
        criteria: [
          "[TAK] Obserwowane lub zgłaszane bezdechy, SpO₂ <90–92% lub znaczne zaciąganie/stękanie",
          "[TAK] Przyjmowanie płynów <50% normy dobowej lub wiek <6 tygodni",
          "[NIE] SpO₂ ≥92%, łagodny wysiłek oddechowy i zachowane karmienie (>50–75% normy)",
        ],
      },
      subyes: {
        title: "Tlenoterapia / HFNC i nawodnienie przez zgłębnik NG lub IV",
        type: "urgent",
        body: "Hospitalizacja. Tlenoterapia bierna lub wysokoprzepływowa (HFNC) przy narastającym wysiłku oddechowym. Nawadnianie przez zgłębnik nosowo-żołądkowy (NG) lub dożylnie płynem izotonicznym.",
        tests: [
          "Monitorowanie pulsoksymetrii i PEWS; gazometria kapilarna przy podejrzeniu zmęczenia mięśni oddechowych.",
        ],
      },
      subno: {
        title: "Łagodne/umiarkowane bronchiolitis: leczenie wspierające i obserwacja",
        body: "Częste karmienie mniejszymi porcjami, udrażnianie nosa w razie blokady. Wypis do domu po potwierdzeniu bezpiecznego karmienia i edukacji rodziców (szczyt objawów w 3.–5. dobie).",
        tests: [
          "Nie podawaj rutynowo salbutamolu, adrenaliny, glikokortykosteroidów ani antybiotyków.",
        ],
      },
      alt: {
        title: "Różnicowanie: krup (deksametazon), astma (SABA + steroid) lub ciało obce",
        body: "Stridor i szczekający kaszel (krup): deksametazon 0,15–0,6 mg/kg p.o. ± adrenalina w nebulizacji. Obturacja/astma: salbutamol + ipratropium przez spejser + steroid p.o./IV. Nagły początek z asymetrią: pilna bronchoskopia.",
        tests: [
          "RTG klatki piersiowej przy asymetrii osłuchowej, podejrzeniu aspiracji ciała obcego lub braku poprawy.",
        ],
      },
      dispo: [
        "Obserwuj karmienie i wysiłek oddechowy; próg przyjęcia niższy w najmłodszym wieku, wcześniactwie i chorobach współistniejących.",
      ],
      pit: [
        "Prawidłowa saturacja nie wyklucza narastającego wyczerpania.",
        "Obraz RTG bronchiolitis może prowadzić do niepotrzebnych antybiotyków.",
      ],
      logic:
        "W typowym bronchiolitis badania zwykle nie zmieniają postępowania; rozpoznanie i decyzja o przyjęciu są kliniczne.",
      src: ["bronchio", "abcde"],
    },
  );

  module(
    "abdomen",
    "Ból brzucha",
    "Lokalizacja, dynamika i objawy otrzewnowe; diagnostyka obrazowa dobrana do pytania.",
    {
      hx: [
        "Początek, migracja, lokalizacja, promieniowanie i stosunek do posiłków; stolec, wymioty, krew, objawy moczowe.",
        "Operacje, leki przeciwkrzepliwe/NLPZ, alkohol, naczyniowe czynniki ryzyka. Możliwość ciąży i objawy ginekologiczne.",
      ],
      exam: [
        "Parametry, perfuzja, nawodnienie; brzuch z oceną obrony, przepuklin, rozdęcia; układ krążenia i płuca.",
        "Badanie genitaliów/miednicy lub per rectum tylko według wskazań i za zgodą.",
      ],
      red: [
        "Wstrząs, obrona/deskowaty brzuch, ból nieproporcjonalny do badania, pulsujący guz, krwawienie, ciąża z bólem/omdleniem.",
      ],
      urgent:
        "ABCDE, analgezja i pilna konsultacja chirurgiczna/odpowiednia specjalistyczna. Podejrzenie krwotoku, niedokrwienia lub perforacji: nie opóźniaj działania, aby uzyskać „pełny panel”.",
      question: "Czy etiologia wymaga obrazowania?",
      yes: {
        title: "USG lub TK według hipotezy",
        body: "USG przy podejrzeniu dróg żółciowych/patologii miednicy. Ostry nieswoisty ból z gorączką lub podejrzeniem poważnej patologii wewnątrzbrzusznej: TK z IV kontrastem bywa badaniem właściwym.",
        tests: [
          "Morfologia/CRP przy infekcji; lipaza przy podejrzeniu pancreatitis; mocz przy przyczynie moczowej; β-hCG przy możliwości ciąży.",
          "Mleczan przy niedokrwieniu/wstrząsie: prawidłowy wynik nie wyklucza wczesnego niedokrwienia.",
          "Wybór kontrastu/protokołu i alternatywy w ciąży ustal z radiologiem.",
        ],
      },
      no: {
        title: "Obserwacja i ponowne badanie",
        body: "Stabilny chory bez czerwonych flag: leczenie objawowe i reasessment, zamiast rutynowego TK.",
        tests: [
          "Nie zlecaj TK „żeby niczego nie przeoczyć”. Narastanie lub zmiana lokalizacji jest wskazaniem do rewizji hipotezy.",
        ],
      },
      subq: {
        title: "Czy potwierdzono ostre zapalenie wyrostka (Alvarado ≥7 / USG / TK) lub ostry brzuch?",
        body: "Połącz wynik skali Alvarado, badania fizykalnego oraz obrazowania (USG / TK jamy brzusznej z kontrastem) w celu kwalifikacji chirurgicznej.",
        criteria: [
          "[TAK] Skala Alvarado ≥7 pkt lub potwierdzenie ostrego zapalenia wyrostka / perforacji / niedrożności w USG/TK",
          "[TAK] Ostre zapalenie pęcherzyka żółciowego lub niedokrwienie krezki wymagające interwencji",
          "[NIE] Alvarado 4–6 pkt z niejednoznacznym obrazowaniem lub niepowikłana patologia zachowawcza",
        ],
      },
      subyes: {
        title: "Pilna interwencja chirurgiczna, antybiotykoterapia i przygotowanie",
        type: "urgent",
        body: "Pilna konsultacja chirurgiczna i kwalifikacja do zabiegu (appendektomia / cholecystektomia / laparotomia). Włącz empiryczną antybiotykoterapię IV wg NPOA, wyrównaj płyny i zapewnij analgezję.",
        tests: [
          "Grupa krwi, koagulologia, kreatynina i elektrolity przed zabiegiem operacyjnym.",
        ],
      },
      subno: {
        title: "Obserwacja szpitalna, nawodnienie, analgezja i seryjne badanie brzucha",
        body: "Przy pośrednim prawdopodobieństwie (Alvarado 5–6) lub zapaleniu trzustki / uchyłków bez perforacji: płynoterapia krystaloidem, kontrola bólu i powtórne badanie brzucha co 4–6 h.",
        tests: [
          "Kontrola parametrów zapalnych i ponowne USG/TK w razie progresji objawów miejscowych.",
        ],
      },
      alt: {
        title: "Postępowanie zachowawcze, próba doustna i kryteria pilnego powrotu",
        body: "Niskie ryzyko (Alvarado ≤4), ustąpienie bólu i dobra tolerancja płynów doustnych: wypis z zaleceniem diety lekkostrawnej i pisemną instrukcją alarmową.",
        tests: [
          "Weryfikacja wyniku badania ogólnego moczu i β-hCG przed wypisem.",
        ],
      },
      dispo: [
        "Wypis przy wiarygodnej obserwacji, kontroli bólu i tolerancji doustnej. Wskaż powrót przy narastaniu bólu, krwi, omdleniu, gorączce lub uporczywych wymiotach.",
      ],
      pit: [
        "Wczesne zapalenie wyrostka, niedokrwienie i ciąża ektopowa mogą mieć skąpe badanie.",
        "Analgezja nie jest powodem odkładania badania; zbadaj ponownie po jej podaniu.",
      ],
      logic:
        "Jedno badanie nie odpowiada na wszystkie przyczyny bólu brzucha. Wybór obrazowania wynika z lokalizacji i mechanizmu.",
      src: ["abd", "abdP"],
    },
    {
      hx: [
        "Epizody napadowe czy stały ból; kolejność wymiotów i bólu, kolor wymiotów, stolec i krew, gorączka, diureza.",
        "Kaszel/duszność, plamica, uraz; u nastolatka wywiad o ciąży i genitaliach w odpowiednich warunkach.",
      ],
      exam: [
        "Obserwuj ruch i chód, nawodnienie, brzuch; ponowne badanie w czasie. Oceń pachwiny i mosznę przy wskazaniach.",
        "Nie przeocz pneumonii, DKA, wgłobienia i skrętu jądra jako pozabrzusznych/atypowych przyczyn.",
      ],
      red: [
        "Ciemnozielone wymioty, obrona, wstrząs, rozdęcie z brakiem stolca, ból moszny; napadowy ból z bladością/apatycznością.",
      ],
      urgent:
        "Pilna pediatryczna/chirurgiczna ocena. Przy podejrzeniu skrętu jądra nie opóźniaj konsultacji chirurgicznej, oczekując na USG.",
      question: "Czy jest konkretne podejrzenie organiczne?",
      yes: {
        title: "Celowane badania; USG selektywnie",
        body: "USG przy podejrzeniu wgłobienia; ukierunkowane USG/ścieżka wyrostka zależna od badania. Część dzieci wymaga obserwacji i ponownego badania.",
        tests: [
          "Mocz przy podejrzeniu UTI; glukoza/ketony przy DKA; β-hCG przy możliwości ciąży; inne badania według obrazu klinicznego.",
          "Nie wykonuj rutynowego RTG do rozpoznania zaparcia. Nie zlecaj USG każdego bólu brzucha.",
        ],
      },
      no: {
        title: "Bez rutynowego panelu",
        body: "Dziecko w dobrym stanie, bez istotnych objawów i z prawidłowym badaniem może nie potrzebować badań.",
        tests: [
          "Wczesny wyrostek może być nieswoisty. Obserwacja z ponownym badaniem jest aktywnym postępowaniem diagnostycznym.",
        ],
      },
      subq: {
        title: "Czy PAS ≥7 pkt lub w USG cechy zapalenia wyrostka / wgłobienia?",
        body: "Oceń dziecko w skali PAS (Pediatric Appendicitis Score) oraz zinterpretuj celowane USG jamy brzusznej (objaw tarczy strzelniczej we wgłobieniu, niepodatny wyrostek >6 mm).",
        criteria: [
          "[TAK] Skala PAS ≥7 pkt lub dodatni obraz USG (ostre zapalenie wyrostka / wgłobienie jelita)",
          "[TAK] Objawy otrzewnowe w prawym dole biodrowym przy bólu podczas podskakiwania/kaszlu",
          "[NIE] PAS 4–6 pkt z niediagnostycznym USG lub brak cech chirurgicznych (PAS ≤3 pkt)",
        ],
      },
      subyes: {
        title: "Pilna chirurgia dziecięca / redukcja wgłobienia",
        type: "urgent",
        body: "Konsultacja chirurgii dziecięcej. W ostrym zapaleniu wyrostka: nawodnienie IV, analgezja i antybiotykoterapia okołozabiegowa. We wgłobieniu bez perforacji: pilna redukcja hydrostatyczna lub pneumatyczna.",
        tests: [
          "Zabezpieczenie dostępu dożylnego, morfologia i wyrównanie odwodnienia przed zabiegiem.",
        ],
      },
      subno: {
        title: "Aktywna obserwacja 4–6h, nawodnienie i powtórne badanie brzucha",
        body: "W grupie pośredniego ryzyka (PAS 4–6) bez uwidocznionego wyrostka w USG: obserwacja na oddziale, nawodnienie, leczenie przeciwbólowe i powtórne badanie przez doświadczonego klinicystę.",
        tests: [
          "Powtórne USG brzucha lub konsultacja chirurgiczna przy utrzymywaniu się tkliwości w RLQ.",
        ],
      },
      alt: {
        title: "Wykluczenie ZUM / zaparcia / adenitis mesenterica i zalecenia domowe",
        body: "Po wykluczeniu ZUM i przyczyn chirurgicznych (PAS ≤3): próba pojenia doustnego, ewentualne leczenie zaparcia (makrogole) i instrukcja ponownej oceny w razie migracji bólu do RLQ.",
        tests: [
          "Badanie ogólne moczu u gorączkujących dzieci z bólem brzucha bez jawnego ogniska.",
        ],
      },
      dispo: [
        "Wypis z planem kontroli i ostrzeżeniami: zmiana charakteru/lokalizacji, zielone wymioty, nasilanie bólu, brak picia lub pogorszenie stanu.",
      ],
      pit: [
        "U małych dzieci appendicitis bywa nietypowe. Negatywne/niediagnostyczne USG nie zamyka diagnostyki.",
        "Skręt jądra może objawiać się tylko bólem brzucha.",
      ],
      logic:
        "Różnicowanie zależy od wieku, a badanie w dynamice bywa cenniejsze niż jednorazowy panel laboratoryjny.",
      src: ["abdP", "vomitP"],
    },
  );

  module(
    "headache",
    "Ból głowy",
    "Oddziel przyczyny wtórne od pierwotnych; nie używaj reguł urazowych do nieurazowego bólu głowy.",
    {
      hx: [
        "Czas do szczytu (thunderclap?), pierwszy/najgorszy ból, zmiana dotychczasowego wzorca, wysiłek/Valsalva/pozycja.",
        "Gorączka, nowotwór/immunosupresja, ciąża/połóg, uraz, leki przeciwkrzepliwe i nadużywanie analgetyków.",
      ],
      exam: [
        "Witalne, pełne badanie neurologiczne, objawy oponowe; dno oka, jeśli możliwe i potrzebne.",
        "Oceń ostrość widzenia/oko przy bólu ocznym; rozważ zapalenie tętnicy olbrzymiokomórkowej przy odpowiednim wieku/obrazie.",
      ],
      red: [
        "Nagły szczyt bólu, nowy deficyt, zaburzenia świadomości, gorączka z objawami oponowymi, immunosupresja, nowotwór, zmiana wzorca.",
      ],
      urgent:
        "Pilna diagnostyka wtórnego bólu: podejrzenie SAH, infekcji OUN, zakrzepicy żylnej, jaskry lub krwawienia wymaga odpowiedniej ścieżki. Nie opóźniaj leczenia zakażenia przy wskazaniach.",
      question: "Czy obecne cechy wtórnego bólu głowy?",
      yes: {
        title: "Obrazowanie / LP ze wskazań",
        body: "Dobierz TK/MR i ewentualne badanie naczyń do podejrzenia; przy podejrzeniu SAH postępuj według lokalnego protokołu zależnego od czasu i wyniku obrazowania.",
        tests: [
          "LP nie jest „kolejnym rutynowym krokiem” u każdego; oceń wskazania i przeciwwskazania.",
          "Wynik TK nie wyklucza każdej wtórnej przyczyny bólu głowy.",
        ],
      },
      no: {
        title: "Rozpoznaj klinicznie ból pierwotny",
        body: "Typowy wzorzec migreny/napięciowego bólu przy prawidłowym badaniu i bez red flags: rozpoznanie kliniczne, dzienniczek bólu i leczenie zależne od typu.",
        tests: [
          "Nie wykonuj neuroobrazowania wyłącznie dla uspokojenia chorego przy ustalonym pierwotnym bólu.",
          "Zbierz liczbę dni z analgetykiem; rozważ medication-overuse headache.",
        ],
      },
      subq: {
        title: "Czy TK głowy dodatnie (SAH / masa) lub ujemne TK >6h od bólu piorunującego?",
        body: "Zinterpretuj wynik TK bez kontrastu względem czasu od początku bólu piorunującego (thunderclap) oraz oceń wskazania do LP, CTA/MRV lub diagnostyki zapalenia tętnicy olbrzymiokomórkowej (GCA).",
        criteria: [
          "[TAK] Krwawienie podpajęczynówkowe (SAH), krwiak lub efekt masy w TK głowy",
          "[TAK] Ból piorunujący z ujemnym TK wykonanym >6 h od początku (wymagana LP / CTA)",
          "[NIE] Ujemne TK <6 h bez podejrzenia tętniaka — skieruj na ścieżkę infekcji OUN, CVST lub GCA",
        ],
      },
      subyes: {
        title: "Pilna neurochirurgia / CTA lub LP (ksantochromia) wg czasu od początku",
        type: "urgent",
        body: "Przy dodatnim TK: pilna konsultacja neurochirurgiczna, CTA naczyń mózgowych, kontrola ciśnienia tętniczego i nimodypina w SAH. Przy ujemnym TK >6h od thunderclap: LP (>12h na spektrofotometrię ksantochromii) lub CTA.",
        tests: [
          "Koagulologia i natychmiastowe odwrócenie antykoagulacji w razie krwawienia wewnątrzczaszkowego.",
        ],
      },
      subno: {
        title: "Diagnostyka zakażenia OUN (ATB + LP), zakrzepicy żylnej (MRV) lub GCA",
        body: "Gorączka/objawy oponowe: posiewy krwi, deksametazon + ceftriakson IV i LP po wykluczeniu przeciwwskazań. Ciąża/połóg/trombofilia: MRV/CTV (zakrzepica zatok). Wiek >50 lat z chromaniem żuchwy/zaburzeniami widzenia: pilny steroid w podejrzeniu GCA.",
        tests: [
          "OB/CRP i pilna konsultacja okulistyczna/reumatologiczna przy podejrzeniu GCA; badanie ogólne i PCR PMR w neuroinfekcji.",
        ],
      },
      alt: {
        title: "Leczenie przerywające napad migreny i ocena bólu z nadużywania leków (MOH)",
        body: "Zastosuj tryptan / NLPZ + lek przeciwwymiotny (metoklopramid/prochlorperazyna) i nawodnienie; unikaj opioidów w leczeniu migreny. Oceń kryteria bólu głowy z nadużywania leków (≥10–15 dni/mies.).",
        tests: [
          "Dzienniczek bólu głowy i kwalifikacja do leczenia profilaktycznego przy częstych napadach.",
        ],
      },
      dispo: [
        "Wypis z instrukcją ponownej oceny przy zmianie wzorca, gorączce, deficycie lub nagłym nasileniu. Ustal plan leczenia i kontroli.",
      ],
      pit: [
        "Canadian CT Head Rule dotyczy określonej populacji po urazie, nie bólu samoistnego.",
        "Migrena w wywiadzie nie chroni przed nową wtórną przyczyną.",
      ],
      logic:
        "Neuroobrazowanie ma wysoką wartość przy czerwonych flagach, a małą przy typowym stabilnym bólu pierwotnym.",
      src: ["headache"],
    },
    {
      hx: [
        "Wiek, poranne/nocne bóle, budzenie ze snu, wymioty bez innego wyjaśnienia, narastanie i zmiana zachowania.",
        "Objawy infekcji, uraz, zaburzenia widzenia i szkolne; wywiad rodzinny, leki.",
      ],
      exam: [
        "Witalne w tym ciśnienie, stan świadomości, chód/koordynacja, badanie nerwów i objawy oponowe.",
        "Dno oka i objawy wzrostu ciśnienia śródczaszkowego w odpowiednich warunkach.",
      ],
      red: [
        "Mały wiek, ból progresywny, rano/z wybudzaniem, deficyt, drgawki, zaburzenia świadomości, objawy wzrostu ICP lub infekcji.",
      ],
      urgent:
        "Pilna konsultacja seniora/pediatry i odpowiednie obrazowanie. Podejrzenie infekcji OUN: leczenie bez nieuzasadnionej zwłoki; LP po ocenie bezpieczeństwa.",
      question: "Czy obecne czerwone flagi wtórnej przyczyny?",
      yes: {
        title: "Senior + rozważ obrazowanie",
        body: "MR/TK dobieraj do pilności i pytania klinicznego. Nietypowy lub progresywny przebieg wymaga rewizji rozpoznania.",
        tests: [
          "Nie używaj dorosłej reguły urazu głowy jako narzędzia wykluczania przyczyn nieurazowych.",
          "Badania krwi i LP tylko przy wskazaniach, nie automatycznie.",
        ],
      },
      no: {
        title: "Bez rutynowych badań",
        body: "Przy prawidłowym badaniu i braku red flags zwykle nie ma potrzeby badań. Rozważ migrenę/napięciowy ból oraz czynniki stylu życia.",
        tests: [
          "Dzienniczek bólu, sen, posiłki, nawodnienie i odpowiednia kontrola kliniczna.",
        ],
      },
      subq: {
        title: "Czy obecne cechy wzrostu ICP, obrzęku tarczy n. II lub zmiany ogniskowej w MR/TK?",
        body: "Zweryfikuj objawy nadciśnienia śródczaszkowego (triada Cushinga, poranne wymioty, ataksja, porażenie n. VI) i wynik pilnego neuroobrazowania.",
        criteria: [
          "[TAK] Guz tylnego dołu czaszki, wodogłowie, krwawienie lub kliniczne cechy wgłobienia/wzrostu ICP",
          "[NIE] Brak efektu masy i cech wzrostu ICP — podejrzenie neuroinfekcji, nadciśnienia tętniczego lub IIH",
        ],
      },
      subyes: {
        title: "Pilna neurochirurgia / neurologia dziecięca (bezwzględny zakaz LP!)",
        type: "urgent",
        body: "Stabilizacja ABCDE, uniesienie wezgłowia 30°, neuroprotekcja (3% NaCl lub mannitol przy cechach wgłobienia) i natychmiastowy kontakt z neurochirurgią dziecięcą. Nie wykonuj nakłucia lędźwiowego.",
        tests: [
          "Pilne MR mózgowia (lub TK w trybie ratunkowym) i monitorowanie na OIT dziecięcym.",
        ],
      },
      subno: {
        title: "Diagnostyka zakażenia OUN lub nadciśnienia śródczaszkowego po ocenie bezpieczeństwa",
        body: "Przy podejrzeniu zapalenia opon/mózgu bez przeciwwskazań: posiewy, antybiotykoterapia empiryczna IV (± acyklowir) i bezpieczna LP. Oceń ciśnienie tętnicze w siatkach centylowych.",
        tests: [
          "Badanie dna oka (idiopatyczne nadciśnienie śródczaszkowe — IIH) oraz badanie PMR z pomiarem ciśnienia otwarcia.",
        ],
      },
      alt: {
        title: "Leczenie migreny/bólu napięciowego, dzienniczek bólu i higiena snu",
        body: "Wczesna podaż ibuprofenu lub paracetamolu w dawce należnej dla masy ciała, odpoczynek w zaciemnionym pomieszczeniu, odpowiednie nawodnienie i redukcja ekspozycji na ekrany.",
        tests: [
          "Prowadzenie dzienniczka bólu głowy i kontrola ostrości wzroku przy bólach szkolnych.",
        ],
      },
      dispo: [
        "Zorganizuj dalszą kontrolę; edukuj opiekuna o progresji, porannych wymiotach, zaburzeniach chodu i świadomości.",
      ],
      pit: [
        "Zaburzenia zachowania i pogorszenie szkolne mogą być częścią obrazu organicznego.",
        "Bezpieczeństwo LP ocenia się klinicznie, nie wyłącznie na podstawie prawidłowego TK.",
      ],
      logic:
        "Dziecko może nie umieć opisać bólu. Wzorzec czasowy, zachowanie i badanie neurologiczne mają szczególne znaczenie.",
      src: ["headacheP", "conscious"],
    },
  );

  module(
    "syncope",
    "Omdlenie / przemijająca utrata przytomności",
    "Wywiad od świadka, EKG i badanie ortostatyczne; nie każda utrata przytomności to padaczka.",
    {
      hx: [
        "Od świadka: pozycja, wysiłek, prodromy, bladość/sinica, czas utraty kontaktu i powrotu, ruchy, uraz, przygryzienie języka.",
        "Kołatanie, ból, duszność; choroba serca, leki, zgony nagłe w rodzinie.",
      ],
      exam: [
        "Witalne, układ sercowo-naczyniowy i neurologiczny, 12-odprowadzeniowe EKG.",
        "Ciśnienie w leżeniu i po wstaniu przy podejrzeniu hipotensji ortostatycznej; glikemia przy wskazaniach.",
      ],
      red: [
        "Podczas wysiłku, cechy niewydolności serca, nowy szmer, nieprawidłowe EKG, rodzinny nagły zgon <40 lat, nowa niewyjaśniona duszność.",
      ],
      urgent:
        "Podejrzenie przyczyny sercowej wymaga pilnej oceny specjalistycznej i odpowiedniego monitorowania. Z utrzymującym się zaburzeniem świadomości przejdź do ścieżki ABCDE, nie traktuj jako prostego omdlenia.",
      question: "Czy podejrzewana jest przyczyna kardiogenna lub niejasna etiologia?",
      yes: {
        title: "Dalsza ocena kardiologiczna",
        body: "Niejasna przyczyna, arytmia w podejrzeniu: dobierz czas monitorowania EKG do częstości epizodów. Podejrzenie padaczki kieruj odpowiednią ścieżką.",
        tests: [
          "Echo przy podejrzeniu choroby strukturalnej; test wysiłkowy przy odpowiednich objawach po ocenie specjalisty.",
          "Krótki prawidłowy zapis EKG nie wyklucza arytmii napadowej.",
        ],
      },
      no: {
        title: "Odruchowe / ortostatyczne",
        body: "Typowe okoliczności i prodromy z prawidłowym EKG/badaniem: rozważ omdlenie wazowagalne lub hipotensję ortostatyczną.",
        tests: [
          "Morfologia przy podejrzeniu krwawienia/anemii; inne badania tylko według podejrzenia.",
          "Nie wykonuj rutynowego EEG ani TK głowy w prostym omdleniu.",
        ],
      },
      subq: {
        title: "Czy stwierdzono arytmię (AF / blok / VT), chorobę strukturalną lub cechy wysokiego ryzyka?",
        body: "Oceń 12-odprowadzeniowe EKG (blok AV II° Mobitz II / III°, pauzy >3s, VT, migotanie przedsionków, długie QTc, Brugada), cechy stenozy aortalnej/HCM oraz ryzyko zakrzepowo-zatorowe (CHA₂DS₂-VA).",
        criteria: [
          "[TAK] Groźna brady-/tachyarytmia w EKG, omdlenie wysiłkowe/w pozycji leżącej lub strukturalna choroba serca",
          "[TAK] Nowo rozpoznane migotanie przedsionków wymagające oceny CHA₂DS₂-VA i HAS-BLED",
          "[NIE] Nawracające omdlenia o niejasnej przyczynie bez bezpośrednich cech zagrożenia w EKG",
        ],
      },
      subyes: {
        title: "Hospitalizacja, telemetria, Echo i kwalifikacja do stymulatora/ICD lub OAC (CHA₂DS₂-VA)",
        type: "urgent",
        body: "Przyjęcie na oddział kardiologii z ciągłym monitorowaniem EKG. Pilne Echo serca, kwalifikacja do stymulacji/ICD lub włączenie antykoagulacji wg skali CHA₂DS₂-VA (z oceną HAS-BLED) w migotaniu przedsionków.",
        tests: [
          "Echo serca przezklatkowe, elektrolity (K+, Mg2+), troponina/NT-proBNP tylko przy klinicznym podejrzeniu ACS/HF.",
        ],
      },
      subno: {
        title: "Diagnostyka przyspieszona: Holter EKG, próba ortostatyczna / tilt-test",
        body: "Skieruj do pilnej diagnostyki ambulatoryjnej lub krótkiej obserwacji: przedłużone monitorowanie EKG (Holter / rejestrator zdarzeń / ILR) dobrane do częstości epizodów.",
        tests: [
          "Próba wysiłkowa przy objawach powysiłkowych; ocena neurologiczna tylko przy cechach napadu padaczkowego.",
        ],
      },
      alt: {
        title: "Postępowanie w omdleniu odruchowym/ortostatycznym: nawodnienie, manewry, korekta leków",
        body: "Wyjaśnij mechanizm omdlenia, naucz rozpoznawania prodromów i manewrów przeciwciśnieniowych (krzyżowanie nóg, napinanie mięśni). Zrewiduj leki hipotensyjne/diuretyki u chorych z hipotensją ortostatyczną.",
        tests: [
          "Pomiar RR i HR w pozycji leżącej oraz po 1 i 3 min pionizacji (spadek SBP ≥20 lub DBP ≥10 mmHg).",
        ],
      },
      dispo: [
        "Przekaż ryzyko nawrotu, zasady bezpieczeństwa i wskazania do powrotu. Ograniczenia prowadzenia pojazdów zależą od przyczyny i lokalnego prawa.",
      ],
      pit: [
        "Krótkie mioklonie mogą wystąpić w omdleniu i same nie rozpoznają padaczki.",
        "Długi stan splątania lub utrzymujący się deficyt nie pasują do prostego omdlenia.",
      ],
      logic:
        "Kluczowe jest ustalenie, czy zdarzenie było TLoC i czy ma cechy przyczyny sercowej. Testy potwierdzają hipotezę z wywiadu.",
      src: ["syncope"],
    },
    {
      hx: [
        "Wysiłek, pozycja, emocje, odwodnienie i objawy prodromalne; czas powrotu.",
        "Wrodzona choroba serca; rodzinny nagły zgon, arytmia lub kardiomiopatia.",
      ],
      exam: [
        "Parametry według wieku, badanie serca i neurologiczne, ortostatyczne tętno/ciśnienie w odpowiednim przypadku.",
        "EKG u każdego dziecka przynajmniej raz; wcześniejsze prawidłowe badanie można uwzględnić, jeśli nie ma nowego niepokoju.",
      ],
      red: [
        "Omdlenie wysiłkowe, bez prodromów, z bólem/kołataniem, nieprawidłowe EKG lub obciążony wywiad rodzinny.",
      ],
      urgent:
        "Pilna ocena pediatryczna/kardiologiczna przy cechach sercowych. Utrzymujące się objawy lub grupowanie epizodów zwiększają potrzebę monitorowania.",
      question: "Czy objawy przemawiają za przyczyną sercową?",
      yes: {
        title: "Kardiolog i dalsze badania",
        body: "Konsultacja, monitorowanie i echo zależnie od podejrzenia; unikaj wysiłku do wyjaśnienia objawów wysiłkowych.",
        tests: [
          "Morfologia jeśli podejrzenie anemii, glukoza blisko zdarzenia; test ciążowy przy wskazaniach.",
        ],
      },
      no: {
        title: "Odruchowe / ortostatyczne",
        body: "Typowy prodrom, prowokacja i szybki pełny powrót: edukacja, nawodnienie, rozpoznawanie prodromów.",
        tests: [
          "Nie stosuj rutynowego TK/EEG przy typowym omdleniu i prawidłowym badaniu.",
        ],
      },
      subq: {
        title: "Czy EKG wykazuje cechy kanałopatii (LQTS, Brugada, WPW) lub omdlenie podczas wysiłku?",
        body: "Dokładnie oceń QTc (wzór Bazetta), kształt załamków T, preekscytację (fala delta), cechy przerostu LK oraz okoliczności zdarzenia (bieg, pływanie, hałas/bodziec akustyczny).",
        criteria: [
          "[TAK] Wydłużone QTc, zespół WPW/Brugada, blok AV lub omdlenie w trakcie wysiłku fizycznego / pływania",
          "[TAK] Wywiad rodzinny nagłego zgonu sercowego <40 r.ż. lub wrodzona wada serca",
          "[NIE] Prawidłowe EKG i brak cech kanałopatii przy nietypowych okolicznościach wymagających obserwacji",
        ],
      },
      subyes: {
        title: "Ścisły zakaz wysiłku fizycznego, pilna kardiologia dziecięca, Echo i badanie rodzinne",
        type: "urgent",
        body: "Hospitalizacja i monitorowanie EKG. Bezwzględny zakaz sportu do zakończenia diagnostyki kardiologicznej (Echo serca, próba wysiłkowa, Holter EKG, badania genetyczne/rodzinne).",
        tests: [
          "Echo serca, 24h Holter EKG, elektrolity i przegląd leków wydłużających odstęp QT.",
        ],
      },
      subno: {
        title: "Obserwacja pediatryczna, kontrola ortostazy i wykluczenie anemii/hipoglikemii",
        body: "Krótka obserwacja kliniczna, pomiar ciśnienia ortostatycznego oraz celowane badania laboratoryjne w zależności od wywiadu (np. obfite miesiączki u nastolatek, niedostateczna podaż płynów).",
        tests: [
          "Glikemia, morfologia krwi przy podejrzeniu niedokrwistości, test ciążowy u nastolatek wg wskazań.",
        ],
      },
      alt: {
        title: "Edukacja pacjenta i rodziców: rozpoznawanie prodromów, podaż płynów i manewry izometryczne",
        body: "Uspokój dziecko i opiekunów. Zaleć regularne nawodnienie, unikanie długiego stania w dusznych pomieszczeniach oraz natychmiastowe przyjęcie pozycji leżącej z uniesieniem nóg przy mroczkach/zawrotach.",
        tests: [
          "Brak wskazań do neuroobrazowania i EEG w typowym omdleniu wazowagalnym.",
        ],
      },
      dispo: [
        "Wypis, gdy określono najbardziej prawdopodobną przyczynę i zorganizowano kontrolę. Nawrót z cechami sercowymi: pilna ponowna ocena.",
      ],
      pit: [
        "„Nastolatek, więc wazowagalne” nie zastępuje EKG i wywiadu rodzinnego.",
        "Prawidłowe ciśnienie spoczynkowe nie odpowiada na pytanie o ortostazę.",
      ],
      logic:
        "Omdlenia odruchowe są częste, ale EKG i wywiad mogą ujawnić rzadkie, groźne przyczyny.",
      src: ["syncopeP"],
    },
  );

  module(
    "fever",
    "Gorączka / podejrzenie zakażenia",
    "Gorączka ≠ sepsa; ryzyko wynika ze stanu chorego, wieku i cech dysfunkcji narządowej.",
    {
      hx: [
        "Czas i źródło zakażenia; antybiotyki, podróż, ekspozycje, zabiegi, cewniki.",
        "Immunosupresja/neutropenia, protezy, leki, ciąża/połóg; stan wyjściowy i nagła zmiana sprawności.",
      ],
      exam: [
        "Witalne i trend; świadomość, perfuzja, diureza, skóra, oddech oraz poszukiwanie źródła.",
        "NEWS2 w odpowiedniej populacji; ciężarne/niedawno ciężarne wymagają odrębnej ścieżki.",
      ],
      red: [
        "Objawy wstrząsu, zaburzenia świadomości, hipoperfuzja, narastająca potrzeba tlenu, skąpomocz; infekcja z wysokim NEWS2 lub inną poważną obawą kliniczną.",
      ],
      urgent:
        "NICE NG253, wysokie ryzyko: antybiotyk IV w ciągu 1 h od oceny NEWS2. Posiewy, jeśli nie opóźnią leczenia. Płyny, jeśli wskazane i bez przeciwwskazań: początkowo 250 ml krystaloidu przez 10–15 min, ponowna ocena po każdym bolusie. Nie utożsamiaj tej ścieżki z automatycznym 30 ml/kg u każdego gorączkującego.",
      question: "Czy zakażenie z istotnym ryzykiem sepsy?",
      yes: {
        title: "Ścieżka sepsy + źródło",
        body: "NICE NG253: zakażenie i NEWS2 ≥7: wysokie ryzyko; 5–6: umiarkowane, z możliwością eskalacji klinicznej. Hipoperfuzja, np. mleczan >2 mmol/l lub AKI, przy ryzyku umiarkowanym nakazuje postępowanie jak w wysokim.",
        tests: [
          "Badania według ryzyka i źródła: morfologia, elektrolity/kreatynina, gazometria z mleczanem, koagulologia i posiewy, jeżeli wskazane.",
          "Przy umiarkowanym ryzyku kompetentny klinicysta może rozważyć diagnostykę przed ATB do 3 h; to maksymalna granica, nie cel opóźnienia leczenia.",
          "Obrazowanie w poszukiwaniu źródła wymagającego kontroli. Nie używaj qSOFA jako jedynego testu wykluczającego.",
        ],
      },
      no: {
        title: "Diagnostyka ogniska zakażenia",
        body: "Dobry stan i brak dysfunkcji: postępuj zgodnie z ogniskiem, czasem trwania i czynnikami ryzyka.",
        tests: [
          "Mocz/posiew przy podejrzeniu UTI; RTG przy podejrzeniu pneumonii; inne badania ze wskazań.",
          "Brak wskazań do automatycznych hemokultur lub szerokospektralnego antybiotyku w każdej gorączce.",
        ],
      },
      subq: {
        title: "Czy obecny wstrząs septyczny, mleczany >2 mmol/l lub NEWS2 ≥7 pkt?",
        body: "Stratyfikuj ryzyko wg NICE NG253 (NEWS2, mleczan, AKI, zaburzenia świadomości, qSOFA) w celu rozstrzygnięcia natychmiastowej ścieżki 1-godzinnej vs 3-godzinnej.",
        criteria: [
          "[TAK] NEWS2 ≥7 pkt, wstrząs septyczny, mleczan >2 mmol/l lub ostre uszkodzenie nerek (AKI)",
          "[NIE] NEWS2 5–6 pkt bez cech hipoperfuzji i bez kwasicy mleczanowej",
        ],
      },
      subyes: {
        title: "Pakiet sepsy 1h: posiewy, antybiotyk IV <1h, bolusy krystaloidu, noradrenalina",
        type: "urgent",
        body: "Pobierz 2 komplety posiewów krwi (bez opóźniania terapii), podaj szerokospektralny antybiotyk IV wg NPOA w ciągu <1h, przetocz bolusy 250 ml krystaloidu z oceną odpowiedzi i włącz noradrenalinę dla MAP ≥65 mmHg.",
        tests: [
          "Kontrola klirensu mleczanów po 2 h, bilans diurezy godzinowej i pilna kontrola chirurgiczna źródła zakażenia.",
        ],
      },
      subno: {
        title: "Ryzyko umiarkowane (NEWS2 5–6): pilna weryfikacja ogniska i ATB wg dynamiki (<3h)",
        body: "Pilna ocena przez doświadczonego klinicystę w ciągu 1h. Wyjaśnij ognisko zakażenia i włącz celowaną antybiotykoterapię maksymalnie w ciągu 3h (natychmiast w razie pogorszenia).",
        tests: [
          "Morfologia, CRP/PCT, kreatynina, bilirubina, gazometria z mleczanem i obrazowanie źródła.",
        ],
      },
      alt: {
        title: "Leczenie celowane ogniska: CAP (wg CURB-65 i NPOA) lub ZUM bez eskalacji septycznej",
        body: "W pozaszpitalnym zapaleniu płuc (CAP) oceń CURB-65 (0–1 pkt: rozważ leczenie ambulatoryjne amoksycyliną wg NPOA). W niepowikłanym ZUM lub infekcji wirusowej unikaj zbędnej hospitalizacji i szerokospektralnych antybiotyków.",
        tests: [
          "Skala CURB-65 w zapaleniu płuc; badanie ogólne i posiew moczu w ZUM.",
        ],
      },
      dispo: [
        "Obserwacja/wypis zależnie od ryzyka. Wyjaśnij objawy alarmowe, termin kontroli i sposób kontaktu po dodatnim posiewie.",
      ],
      pit: [
        "Sepsa może przebiegać bez gorączki, zwłaszcza u starszych i immunosupresyjnych.",
        "Niski CRP wcześnie nie wyklucza poważnego zakażenia.",
      ],
      logic:
        "Najpierw ryzyko i dysfunkcja, następnie źródło. Wynik punktowy wspomaga, lecz nie zastępuje oceny klinicznej.",
      src: ["sepsis", "news"],
    },
    {
      scope:
        "Progi traffic-light poniżej odnoszą się do <5 lat; starsze dzieci wymagają oceny odpowiedniej do wieku i lokalnej ścieżki.",
      hx: [
        "Dokładny wiek, czas gorączki, picie i diureza, szczepienia, kontakt zakaźny, podróż.",
        "Zachowanie między epizodami gorączki, oddychanie, wysypka, objawy moczowe, choroby przewlekłe.",
      ],
      exam: [
        "Wygląd, reakcja społeczna/wybudzanie, wysiłek oddechowy, perfuzja, nawodnienie, skóra i ognisko.",
        "Traffic-light NICE u <5 lat; u starszych dzieci nie przenoś progów automatycznie.",
      ],
      red: [
        "<3 miesiące i ≥38°C: wysokie ryzyko. 3–6 miesięcy i ≥39°C: co najmniej ryzyko pośrednie.",
        "Trudne wybudzenie, wysypka nieblednąca, zaburzenia perfuzji, stękanie, objawy oponowe lub odwodnienie.",
      ],
      urgent:
        "Najmłodsze niemowlę lub cechy czerwone: pilna pediatryczna ścieżka poważnego zakażenia. Badania/LP według wieku, stanu i bezpieczeństwa, nie według samej wartości temperatury.",
      question: "Czy są cechy amber/red lub najmłodszy wiek?",
      yes: {
        title: "Badania zależne od wieku i ryzyka",
        body: "Dobór morfologii/CRP, posiewów, moczu, ewentualnej LP i RTG zależy od wieku i cech klinicznych.",
        tests: [
          "U <3 miesięcy gorączka wymaga specjalistycznej oceny; nie stosuj wypisu jak w typowej infekcji starszego dziecka.",
          "Sprawdź mocz przy niewyjaśnionej gorączce; nie pomijaj UTI tylko dlatego, że gardło jest czerwone.",
        ],
      },
      no: {
        title: "Green: bez rutynowej krwi i RTG",
        body: "U <5 lat z brakiem cech poważnej choroby nie wykonuj rutynowych badań krwi ani RTG. Oceń potrzebę badania moczu i cechy pneumonii.",
        tests: [
          "Odpowiedź temperatury na lek przeciwgorączkowy nie rozróżnia infekcji łagodnej i poważnej.",
        ],
      },
      subq: {
        title: "Czy wiek <3 mies. (temp. ≥38°C) lub obecne cechy wysokiego ryzyka (Red NICE)?",
        body: "Oceń dziecko wg sygnalizacji świetlnej NICE NG143 (Red vs Amber) oraz wieku skorygowanego i stanu uodpornienia.",
        criteria: [
          "[TAK] Wiek <3 miesięcy z gorączką ≥38,0°C lub obecność dowolnej cechy czerwonej (Red traffic-light)",
          "[TAK] Wysypka nieblednąca pod uciskiem, stękanie oddechowe, trudność wybudzenia lub wysokie PEWS",
          "[NIE] Wyłącznie cechy pośredniego ryzyka (Amber) u dziecka ≥3 mies. bez cech wstrząsu i neuroinfekcji",
        ],
      },
      subyes: {
        title: "Posiewy krwi/moczu ± LP i natychmiastowa empiryczna antybiotykoterapia IV",
        type: "urgent",
        body: "Hospitalizacja. Pobierz posiew krwi, badanie/posiew moczu oraz wykonaj LP (u <1 mies. zawsze, u 1–3 mies. gdy chore lub leukocytoza/leukopenia, o ile brak przeciwwskazań). Włącz cefotaksym/ceftriakson IV (+ ampicylina u <3 mies. na Listeria).",
        tests: [
          "Morfologia z rozmazem, CRP/PCT, glikemia, gazometria i badanie PMR przed lub tuż po ATB.",
        ],
      },
      subno: {
        title: "Pośrednie ryzyko (Amber): celowane badanie moczu i obserwacja pediatryczna",
        body: "Gdy brak jasnego ogniska: pobierz mocz (metodą czystą), rozważ morfologię/CRP/posiew krwi. Obserwuj dziecko w oddziale lub ustal pewną kontrolę lekarską i oceniaj gorączkę ≥5 dni pod kątem choroby Kawasaki.",
        tests: [
          "Badanie ogólne i posiew moczu; RTG klatki tylko przy klinicznych cechach zapalenia płuc.",
        ],
      },
      alt: {
        title: "Niskie ryzyko (Green): badanie moczu przy gorączce bez ogniska i pisemny safety-net",
        body: "Nawadnianie doustne, leki przeciwgorączkowe dla komfortu dziecka (paracetamol/ibuprofen wg masy ciała) i przekazanie rodzicom pisemnej instrukcji alarmowej (test szklanki, ocena oddechu i diurezy).",
        tests: [
          "Badanie moczu przy gorączce bez uchwytnego źródła trwającej >24–48 h.",
        ],
      },
      dispo: [
        "Zalecenia dotyczące picia, obserwacji i alarmów. Gorączka ≥5 dni wymaga ponownej oceny, w tym rozważenia choroby Kawasaki.",
      ],
      pit: [
        "Antypiretyk nie jest testem diagnostycznym.",
        "Wiek w tygodniach ma kluczowe znaczenie; „niemowlę” to zbyt szeroka kategoria do decyzji.",
      ],
      logic:
        "Najmłodszy wiek i objawy kliniczne zmieniają próg badań oraz hospitalizacji, nawet przy podobnej temperaturze.",
      src: ["feverP"],
    },
  );

  module(
    "consciousness",
    "Zaburzenia świadomości",
    "Glikemia natychmiast; równolegle przyczyny odwracalne, ogniskowe i toksyczno-metaboliczne.",
    {
      hx: [
        "Stan wyjściowy i czas zmiany od bliskich; uraz, drgawki, gorączka, toksyny, leki, alkohol.",
        "Cukrzyca, niewydolność nerek/wątroby, immunosupresja; ostatni czas bez objawów.",
      ],
      exam: [
        "ABCDE, glikemia przyłóżkowa, temperatura, AVPU/GCS ze składowymi.",
        "Źrenice, deficyt ogniskowy, objawy oponowe i urazu; utlenowanie i wentylacja.",
      ],
      red: [
        "Brak ochrony dróg oddechowych, nieprawidłowy oddech, spadający GCS, asymetria/deficyt, stan drgawkowy, podejrzenie infekcji OUN.",
      ],
      urgent:
        "Koryguj odwracalne zagrożenia w ABCDE, w tym hipoglikemię. Nie opóźniaj glukozy z powodu oczekiwania na tiaminę. Podejrzenie udaru, urazu lub zakażenia OUN: pilna odpowiednia ścieżka.",
      question: "Czy cechy ogniskowe, uraz lub podejrzenie ICP?",
      yes: {
        title: "Pilne neuroobrazowanie",
        body: "TK/MR według podejrzenia i dostępności po wstępnym zabezpieczeniu; CTA w odpowiedniej ścieżce udarowej.",
        tests: [
          "LP po ocenie wskazań i przeciwwskazań; nie opóźniaj potrzebnego leczenia zakażenia.",
          "Prawidłowe TK nie oznacza automatycznie bezpiecznej LP.",
        ],
      },
      no: {
        title: "Toksyny / metabolizm / infekcja",
        body: "Hipoksja/hiperkapnia, glukoza, elektrolity, zakażenie, leki, zatrucie i napad/drgawki niekonwulsyjne.",
        tests: [
          "Elektrolity, kreatynina, gazometria i inne badania w zależności od obrazu; toksykologia tylko gdy wynik będzie użyteczny.",
          "EEG przy podejrzeniu stanu niekonwulsyjnego; nie przypisuj splątania automatycznie otępieniu.",
        ],
      },
      subq: {
        title: "Czy w TK krwawienie / efekt masy / obrzęk mózgu lub GCS ≤8 z zagrożeniem dróg?",
        body: "Oceń składowe GCS (E/V/M), odruchy obronne dróg oddechowych oraz wynik pilnego TK głowy bez kontrastu.",
        criteria: [
          "[TAK] Krwotok śródczaszkowy, efekt masy/przesunięcie linii środkowej lub cechy wgłobienia w TK",
          "[TAK] Spadek GCS ≤8 pkt lub utrata drożności/ochrony dróg oddechowych",
          "[NIE] Brak efektu masy w TK i stabilne drogi oddechowe — podejrzenie zapalenia OUN lub stanu padaczkowego",
        ],
      },
      subyes: {
        title: "Zabezpieczenie dróg oddechowych (RSI), neuroprotekcja, pilna neurochirurgia/OIT",
        type: "urgent",
        body: "Zabezpiecz drogi oddechowe (RSI), utrzymuj normokapnię (PaCO₂ 35–40 mmHg) i normotensję, unieś wezgłowie o 30°, podaj osmoterapię (mannitol / 3% NaCl) w razie wgłobienia i odwróć antykoagulację. Bezwzględny zakaz LP.",
        tests: [
          "Pilna konsultacja neurochirurgiczna/OIT, CTA w razie podejrzenia krwawienia naczyniowego lub LVO.",
        ],
      },
      subno: {
        title: "Ścieżka zapalenia OUN (ATB IV + deksametazon + LP) lub stanu padaczkowego (EEG)",
        body: "Przy podejrzeniu neuroinfekcji: posiewy krwi, deksametazon + ceftriakson (± wankomycyna/ampicylina/acyklowir) IV oraz bezpieczna LP. Przy przetrwałym zaburzeniu świadomości po drgawkach wyklucz niekonwulsyjny stan padaczkowy (NCSE).",
        tests: [
          "Badanie ogólne, posiew i panel PCR płynu mózgowo-rdzeniowego; pilne EEG w podejrzeniu NCSE.",
        ],
      },
      alt: {
        title: "Korekcja odwracalnych przyczyn: glukoza/tiamina, nalokson, hiponatremia, encefalopatia",
        body: "Wyrównaj hipoglikemię (glukoza IV + tiamina 100–200 mg IV u niedożywionych/uzależnionych), podaj nalokson przy tokskydromie opioidowym z hipowentylacją, koryguj ciężką hiponatremię wg wzoru Adrogué-Madias (≤8–10 mmol/l/24h).",
        tests: [
          "Gazometria tętnicza (hiperkapnia, COHb), Na+, K+, Ca2+, mocznik, amoniak, TSH i celowany przegląd leków.",
        ],
      },
      dispo: [
        "Seryjna ocena świadomości po leczeniu i porównanie do bazowej. Niewyjaśnione lub utrzymujące się zaburzenie wymaga obserwacji/hospitalizacji.",
      ],
      pit: [
        "„Po alkoholu” nie wyklucza urazu, hipoglikemii i udaru.",
        "Poprawa po leczeniu nie wyjaśnia automatycznie przyczyny nawrotu.",
      ],
      logic:
        "To ścieżka oceny wstępnej oparta na ABCDE i wskazaniach narządowych; nie jeden kompletny protokół każdej encefalopatii.",
      src: ["abcde", "stroke"],
    },
    {
      hx: [
        "Wywiad od opiekuna: stan bazowy, dynamika, leki w domu i dostęp do toksyn, uraz, infekcja, napad.",
        "U małych dzieci: karmienie, epizod bezdechu, możliwe przypadkowe/nieprzypadkowe obrażenia.",
      ],
      exam: [
        "ABCDE, glukoza, temperatura; pediatryczne GCS, źrenice, objawy oponowe i ogniskowe.",
        "Oceń perfuzję, nawodnienie, skórę, ciemiączko w odpowiednim wieku i objawy urazu.",
      ],
      red: [
        "Trudność wybudzenia, napad/stale zmieniona świadomość, deficyt, objawy ICP, infekcja OUN, niewydolność oddechowa.",
      ],
      urgent:
        "Pilna ocena pediatryczna, leczenie hipoglikemii/napadu/zagrożeń ABCDE. Badania nie mogą opóźnić stabilizacji ani koniecznych antybiotyków.",
      question: "Czy podejrzenie urazu, udaru lub wzrostu ICP?",
      yes: {
        title: "TK/MR po stabilizacji",
        body: "Celowane pilne obrazowanie i konsultacja. Ogranicz transport niestabilnego dziecka bez zabezpieczenia.",
        tests: [
          "Odrocz LP w obniżonej świadomości z niepokojącymi cechami lub innymi przeciwwskazaniami.",
          "Prawidłowe TK nie wyklucza wzrostu ICP i nie daje samoistnej zgody na LP.",
        ],
      },
      no: {
        title: "Przyczyny metaboliczne/toksyczne",
        body: "Celowane badania zależnie od wieku i podejrzenia; zakażenie, hipoglikemia, zaburzenia elektrolitowe i zatrucie.",
        tests: [
          "Glikemia zawsze wcześnie; elektrolity/gazometria, posiewy i toksykologia tylko odpowiednio do sytuacji.",
        ],
      },
      subq: {
        title: "Czy pGCS ≤8 lub kliniczne/obrazowe cechy wgłobienia i wzrostu ICP?",
        body: "Oceń pediatryczną skalę Glasgow (pGCS), symetrię i reaktywność źrenic, napięcie ciemiączka, triadę Cushinga oraz wynik pilnego TK/MR.",
        criteria: [
          "[TAK] Pediatryczne GCS (pGCS) ≤8 pkt, anizokoria, bradykardia z nadciśnieniem lub krwawienie/obrzęk w TK",
          "[NIE] pGCS >8 bez cech wgłobienia i bez efektu masy — podejrzenie neuroinfekcji lub stanu po napadzie",
        ],
      },
      subyes: {
        title: "Zabezpieczenie dróg oddechowych, neuroprotekcja i pilny OIT dziecięcy (odrocz LP!)",
        type: "urgent",
        body: "Intubacja i wentylacja normokapniczna przez doświadczony zespół, 3% NaCl (2–5 ml/kg IV) lub mannitol przy wgłobieniu, pilna neurochirurgia i OIT dziecięcy. Uwzględnij możliwość urazu nieprzypadkowego (NHT).",
        tests: [
          "Pilne TK głowy, koagulologia, morfologia i zabezpieczenie przed hipoksją oraz hipotensją.",
        ],
      },
      subno: {
        title: "Podejrzenie neuroinfekcji (ceftriakson + acyklowir IV) lub stanu drgawkowego",
        body: "Nie opóźniaj podania ceftriaksonu/cefotaksymu IV i acyklowiru (przy podejrzeniu HSE) u dziecka z encefalopatią gorączkową. W stanie drgawkowym zastosuj protokół benzodiazepin i leku II rzutu (lewetiracetam / fenytoina / walproinian).",
        tests: [
          "Posiew krwi, PCR z krwi/PMR (po stabilizacji i wykluczeniu przeciwwskazań do LP), EEG.",
        ],
      },
      alt: {
        title: "Weryfikacja hipoglikemii (10% glukoza 2,5–5 ml/kg), zatrucia, DKA lub wgłobienia",
        body: "W hipoglikemii podaj bolus 10% glukozy 2,5–5 ml/kg IV. U małych dzieci napadowy letarg/bladość może być jedynym objawem wgłobienia jelita! Oceń także kwasicę ketonową (DKA), wrodzone wady metabolizmu (amoniak) i zatrucia domowe.",
        tests: [
          "Glikemia i ketonemia, gazometria z luką anionową, elektrolity, amoniak oraz USG brzucha przy podejrzeniu wgłobienia.",
        ],
      },
      dispo: [
        "Niewyjaśnione zaburzenie lub brak powrotu do bazowego stanu: konsultacja i hospitalizacja. Wypis po ustaleniu bezpiecznego planu i przyczyny.",
      ],
      pit: [
        "Hipoaktywne dziecko nie musi być po prostu senne.",
        "Nie przenoś słownych kryteriów dorosłego GCS na dziecko przed rozwojem mowy.",
      ],
      logic:
        "W pediatrii wywiad środowiskowy i toksykologiczny jest równie ważny jak neurologia.",
      src: ["conscious"],
    },
  );

  module(
    "neurology",
    "Nagły deficyt neurologiczny",
    "Czas ostatnio bez objawów, glikemia i pilne obrazowanie; oddzielny kod udarowy u dzieci.",
    {
      hx: [
        "Last known well, charakter i lateralizacja, leki przeciwkrzepliwe, uraz, drgawki, migrena.",
        "Wahanie/ustąpienie objawów, wcześniejsza samodzielność i przeciwwskazania leczenia.",
      ],
      exam: [
        "FAST/pełne badanie neurologiczne, glukoza, RR i parametry. NIHSS opisuje ciężkość, nie wyklucza udaru tylnego krążenia.",
        "Mowa, widzenie, pola widzenia, chód i koordynacja, o ile bezpieczne.",
      ],
      red: [
        "Nowy utrzymujący się deficyt, zaburzenia świadomości, silny nagły ból głowy, antykoagulacja, postępujące/fluktuujące objawy.",
      ],
      urgent:
        "Aktywuj kod udar. Odróżnij hipoglikemię bez opóźniania ścieżki. TK bez kontrastu pilnie, CTA gdy wskazana ocena LVO i ewentualna trombektomia.",
      question: "Czy deficyt nadal obecny / udar podejrzany?",
      yes: {
        title: "TK ± CTA; kwalifikacja do reperfuzji",
        body: "Wyklucz krwawienie i oceń naczynia/perfuzję według czasu i wskazań. Trombektomia do 24 h dotyczy wybranych chorych z potwierdzoną LVO i kryteriami obrazowymi.",
        tests: [
          "Badania laboratoryjne dostosowane do leczenia; nie czekaj na niepotrzebny panel przed obrazowaniem.",
          "Niski NIHSS lub ujemny FAST nie wyklucza udaru.",
        ],
      },
      no: {
        title: "Podejrzenie TIA",
        body: "Objawy ustąpiły: pilna specjalistyczna ocena TIA; nie traktuj ustąpienia jako dowodu bezpieczeństwa.",
        tests: [
          "Nie rutynowe TK dla każdego TIA, jeśli brak podejrzenia alternatywnej patologii wymagającej TK. MRI według specjalistycznej oceny.",
          "ABCD2 nie powinno określać pilności skierowania według NICE.",
        ],
      },
      subq: {
        title: "Czy wykluczono krwawienie w TK i chory spełnia kryteria reperfuzji (IVT / MT)?",
        body: "Oceń czas od Last Known Well, ciężkość deficytu w skali NIHSS, brak krwawienia w TK bez kontrastu oraz obecność niedrożności dużego naczynia (LVO) w CTA.",
        criteria: [
          "[TAK] Udar niedokrwienny w oknie trombolizy dożylnej (≤4,5 h lub wg perfuzji) i/lub LVO do trombektomii (≤24 h)",
          "[NIE] Krwotok śródmózgowy w TK lub udar niedokrwienny poza wskazaniami/oknem do leczenia reperfuzyjnego",
        ],
      },
      subyes: {
        title: "Leczenie reperfuzyjne (rt-PA / tenekteplaza ± trombektomia) i Oddział Udarowy",
        type: "urgent",
        body: "Oblicz i utrzymuj RR <180/105 mmHg przed i po trombolizie dożylnej. Przekaż chorego z LVO bezpośrednio do pracowni neuroradiologii interwencyjnej (bez opóźniania MT przez oczekiwanie na efekt IVT) i przyjmij na Oddział Udarowy.",
        tests: [
          "Seryjna ocena neurologiczna (NIHSS), kontrola RR co 15 min oraz kontrolne TK po 24h przed włączeniem leków przeciwpłytkowych.",
        ],
      },
      subno: {
        title: "Krwotok śródmózgowy (odwrócenie OAC, RR) lub udar poza oknem (ASA, OUM)",
        body: "W krwotoku śródmózgowym (ICH): natychmiast odwróć działanie leków przeciwkrzepliwych (4F-PCC + wit. K / idarucizumab / andeksanet), koryguj RR wg protokołu i skonsultuj neurochirurgicznie. W udarze niedokrwiennym bez IVT: podaj ASA 300 mg i przyjmij na OUM.",
        tests: [
          "Ocena połykania (screening dysfagii przed podaniem leków/płynów p.o.), Holter EKG i USG doppler tętnic szyjnych.",
        ],
      },
      alt: {
        title: "Ścieżka TIA (ABCD²): natychmiastowe leczenie przeciwpłytkowe, obrazowanie szyjnych i EKG",
        body: "Po wykluczeniu krwawienia/mimics włącz natychmiast ASA 300 mg (lub DAPT: ASA + klopidogrel przez 21 dni w TIA wysokiego ryzyka ABCD² ≥4 / minor stroke), statynę i skieruj do pilnej oceny specjalistycznej <24h.",
        tests: [
          "12-odprowadzeniowe EKG / Holter (poszukiwanie AF — skala CHA₂DS₂-VA), USG/CTA tętnic szyjnych oraz MR głowy z DWI.",
        ],
      },
      dispo: [
        "Pacjent z udarem wymaga właściwej jednostki. TIA: szybka ocena i prewencja wtórna. Zapisz dokładny czas i deficyty.",
      ],
      pit: [
        "Okno czasowe nie jest jedynym kryterium leczenia; nie kwalifikuj do reperfuzji samą skalą.",
        "Drgawki na początku nie zamykają automatycznie diagnostyki udaru.",
      ],
      logic:
        "Obrazowanie rozstrzyga krwawienie/niedokrwienie i kwalifikację do interwencji; klinika wyznacza pilność.",
      src: ["stroke"],
    },
    {
      hx: [
        "Dokładny początek i last known well, napad, ból głowy/szyi, uraz, infekcja i odwodnienie.",
        "Wada serca, anemia sierpowata, zaburzenia krzepnięcia; nagła zmiana chodu/mowy u małego dziecka.",
      ],
      exam: [
        "ABCDE, glukoza; deficyt ogniskowy, asymetria, mowa, chód/ataksja, zaburzenia widzenia i napady.",
      ],
      red: [
        "Nagły niedowład, afazja, zaburzenie widzenia/ataksja lub napad z utrzymującym się deficytem.",
      ],
      urgent:
        "Natychmiastowa ocena neurologiczna/pediatryczna i pilne neuroobrazowanie. Skontaktuj ośrodek mający doświadczenie w udarze dziecięcym.",
      question: "Czy klinicznie możliwy udar dziecięcy?",
      yes: {
        title: "Pilne MRI/MRA lub CT/CTA",
        body: "RCH: podejrzenie niedokrwienia → pilne MRI/MRA; podejrzenie krwawienia → TK bez kontrastu. Gdy pilne MRI nie jest możliwe w ciągu 30 min, rozważ CT z CTA. Decyzje terapeutyczne z neurologiem pediatrycznym.",
        tests: [
          "Do kwalifikacji stosowana bywa Pediatric NIH Stroke Scale. Nie stosuj dorosłego progu NIHSS, trombolizy ani okien jako samodzielnego algorytmu pediatrycznego.",
        ],
      },
      no: {
        title: "Mimics wymagają wyjaśnienia",
        body: "Migrena, napad/Todd, hipoglikemia, zakażenie i inne przyczyny; część nadal wymaga pilnego obrazowania.",
        tests: [
          "Podejrzenie mimica nie powinno opóźniać obrazowania, jeśli udar nadal możliwy.",
        ],
      },
      subq: {
        title: "Czy MRI/MRA lub CT/CTA potwierdza udar niedokrwienny (AIS) lub zakrzepicę zatok (CVST)?",
        body: "Oceń wynik pilnego neuroobrazowania naczyniowego wspólnie z zespołem neurologii dziecięcej / Pediatric Stroke.",
        criteria: [
          "[TAK] Potwierdzony dziecięcy udar niedokrwienny (AIS), arteriopatia/rozwarstwienie lub zakrzepica zatok żylnych (CVST)",
          "[NIE] Krwotok śródczaszkowy u dziecka (AVM, tętniak, koagulopatia) wymagający ścieżki neurochirurgicznej",
        ],
      },
      subyes: {
        title: "Konsylium Pediatric Stroke: leczenie przeciwkrzepliwe/reperfuzyjne i OIT/neurologia",
        type: "urgent",
        body: "Utrzymuj normotermię, normoglikemię i normotensję. Decyzja o antykoagulacji (HDCz/HNF), leczeniu przeciwpłytkowym lub interwencji wewnątrznaczyniowej w ośrodku referencyjnym. W anemii sierpowatej: pilna transfuzja wymienna.",
        tests: [
          "Echo serca (przeciek P-L / skrzeplina), badania trombofilii, ocena arteriopatii powirusowej (np. po VZV).",
        ],
      },
      subno: {
        title: "Krwotok śródczaszkowy u dziecka: korekcja koagulopatii, kontrola ICP i neurochirurgia",
        type: "urgent",
        body: "Pilna konsultacja neurochirurgii dziecięcej i hematologii. Wyrównaj niedobory czynników krzepnięcia / witaminy K / małopłytkowość, zabezpiecz przed wzrostem ICP i monitoruj na OIT dziecięcym.",
        tests: [
          "Morfologia z płytkami, APTT, PT/INR, fibrynogen, czynniki krzepnięcia i angio-MR/CTA.",
        ],
      },
      alt: {
        title: "Różnicowanie i obserwacja stroke mimics: porażenie Todda, migrena połowicza, ataksja",
        body: "Ustal przyczynę przemijającego lub nieudarowego deficytu: porażenie ponapadowe Todda, migrena hemiplegiczna, ostre zapalenie móżdżku,ADEM lub guz OUN. Obserwuj do pełnego ustąpienia objawów.",
        tests: [
          "EEG przy podejrzeniu stanu ponapadowego; MRI mózgowia w trybie pilnym przy pierwszym epizodzie ogniskowym.",
        ],
      },
      dispo: [
        "Pilna ścieżka specjalistyczna przy utrzymującym się deficycie; ustąpienie objawów wymaga wyjaśnienia, nie automatycznego wypisu.",
      ],
      pit: [
        "U dzieci udar istnieje i bywa rozpoznawany późno.",
        "Objawy mogą być nietypowe lub zdominowane przez napad.",
      ],
      logic:
        "Niski bazowy odsetek udaru nie uzasadnia odraczania diagnostyki nagłego deficytu.",
      src: ["strokeP"],
    },
  );

  module(
    "vomiting",
    "Wymioty / odwodnienie",
    "Niedrożność, DKA, ciąża, infekcja i OUN; u dzieci kolor wymiotów zmienia pilność.",
    {
      hx: [
        "Czas i częstość, domieszka krwi/żółci, ból, biegunka, stolec/gazy, leki, toksyny, alkohol.",
        "Możliwość ciąży, cukrzyca, operacje jamy brzusznej; ból głowy i objawy neurologiczne.",
      ],
      exam: [
        "Witalne, ortostaza/perfuzja, nawodnienie, brzuch, neurologia przy wskazaniach.",
        "Diureza i przyjmowanie płynów; glukoza/ketony przy podejrzeniu DKA.",
      ],
      red: [
        "Wstrząs, krwawienie, obrona/rozdęcie z niedrożnością, zaburzenia świadomości, ciężkie zaburzenia elektrolitowe, DKA.",
      ],
      urgent:
        "ABCDE i pilna ścieżka przyczynowa: niedrożność/chirurgia, krwawienie, DKA lub OUN. Dobierz drogę uzupełniania płynów do ciężkości i możliwości podaży doustnej.",
      question: "Czy są wskazania do badań/terapii IV?",
      yes: {
        title: "Elektrolity i celowane badania",
        body: "Przy istotnym odwodnieniu, przedłużaniu objawów lub chorobach współistniejących rozważ elektrolity/kreatyninę; kolejne badania według hipotezy.",
        tests: [
          "β-hCG przy możliwości ciąży; glukoza/ketony/gazometria przy DKA.",
          "Obrazowanie przy podejrzeniu niedrożności/ostrego brzucha, nie przy każdym epizodzie.",
        ],
      },
      no: {
        title: "Nawodnienie i obserwacja",
        body: "Chory stabilny, toleruje płyny i brak red flags: doustne nawodnienie, odpowiednie leczenie objawowe i reassessment.",
        tests: ["Brak automatycznego wskazania do TK lub posiewu stolca."],
      },
      subq: {
        title: "Czy stwierdzono DKA, ostrą niedrożność przewodu pokarmowego lub ciężkie AKI/dyselektrolitemię?",
        body: "Oceń równowagę kwasowo-zasadową (pH, HCO₃⁻, luka anionowa, ketony), stężenie Na+/K+/kreatyniny oraz cechy mechanicznej niedrożności jelit.",
        criteria: [
          "[TAK] Kwasica ketonowa (DKA / EDKA), mechaniczna niedrożność jelit lub przełom nadnerczowy",
          "[TAK] Ciężka hipo-/hiperkaliemia, ciężka hiponatremia lub ostre uszkodzenie nerek (AKI) z oligurią",
          "[NIE] Niepowikłane odwodnienie i umiarkowane zaburzenia elektrolitowe bez przyczyny chirurgicznej",
        ],
      },
      subyes: {
        title: "Protokół DKA (0,9% NaCl, insulina, K+) lub dekompresja NG i pilna chirurgia",
        type: "urgent",
        body: "W DKA: resuscytacja płynami (0,9% NaCl), weryfikacja K+ przed wlewem insuliny i korekta luki anionowej. W niedrożności: NPO, odbarczenie zgłębnikiem nosowo-żołądkowym (NG), wyrównanie płynów i pilna konsultacja chirurgiczna.",
        tests: [
          "Kontrola glikemii, K+, pH i luki anionowej co 1–2 h w DKA; TK jamy brzusznej w niedrożności.",
        ],
      },
      subno: {
        title: "Nawodnienie dożylne krystaloidem, wyrównanie elektrolitów i antyemetyk",
        body: "Przetocz zbilansowany krystaloid IV (lub 0,9% NaCl z KCl w zasadowicy hipochloremicznej po wymiotach), podaj lek przeciwwymiotny (ondansetron z uwzględnieniem QTc lub metoklopramid) i przeprowadź próbę pojenia doustnego.",
        tests: [
          "Kontrolny jonogram i kreatynina po wyrównaniu płynów; EKG przy ryzyku wydłużenia QTc.",
        ],
      },
      alt: {
        title: "Nawodnienie doustne, korekta leków i wykluczenie przyczyn pozabrzusznych",
        body: "Zalecaj nawadnianie doustne małymi porcjami płynów glukozowo-elektrolitowych. Zweryfikuj leki mogące wywoływać wymioty (NLPZ, opioidy, digoksyna, metformina) i czasowo wstrzymaj leki nefrotoksyczne („sick day rules”).",
        tests: [
          "Test ciążowy (β-hCG) u kobiet w wieku rozrodczym oraz ocena błędnikowa przy współistniejących zawrotach głowy.",
        ],
      },
      dispo: [
        "Kontrola tolerancji doustnej, diurezy i objawów przed wypisem; powrót przy krwi, nasileniu bólu, braku moczu lub pogorszeniu.",
      ],
      pit: [
        "Wymioty nie oznaczają automatycznie gastroenteritis.",
        "Poprawa po leku przeciwwymiotnym nie wyklucza chirurgicznej przyczyny.",
      ],
      logic:
        "To orientacyjna synteza wstępnej oceny dorosłego na podstawie ABCDE i ostrego brzucha, nie odrębna wytyczna leczenia każdej przyczyny.",
      src: ["abcde", "abd"],
    },
    {
      hx: [
        "Kolor: ciemnozielony, nie żółty; początek, karmienie, przyrost masy, biegunka, diureza.",
        "Ból, napadowość, uraz, możliwe zatrucie, ból głowy i cukrzyca.",
      ],
      exam: [
        "Nawodnienie, perfuzja, brzuch, stan świadomości; masa i bilans.",
        "Glukoza/ketony przy wskazaniach: zwłaszcza małe dziecko, letarg, przedłużone niejedzenie lub podejrzenie DKA.",
      ],
      red: [
        "Ciemnozielone wymioty: niedrożność do wykluczenia; krwawienie, obrona, letarg, uwypuklone ciemiączko, objawy oponowe, zahamowanie wzrastania.",
      ],
      urgent:
        "Ciemnozielone wymioty → pilna konsultacja chirurgiczna. Leczenie hipoglikemii i innych zagrożeń nie może czekać na planowy panel badań.",
      question: "Czy dziecko chore / istotnie odwodnione?",
      yes: {
        title: "Celowana diagnostyka",
        body: "Podejrzenie DKA, niedrożności, zakażenia lub OUN: odpowiednia ścieżka i konsultacja.",
        tests: [
          "Elektrolity/glukoza przy istotnym odwodnieniu lub potrzebie IV; badania obrazowe przy konkretnym podejrzeniu.",
          "Badania stolca nie rutynowo; rozważ m.in. ciężki stan/krwistą biegunkę i odpowiedni kontekst.",
        ],
      },
      no: {
        title: "Zwykle bez innych badań",
        body: "Większość dzieci w dobrym stanie z izolowanymi wymiotami nie wymaga badań dodatkowych.",
        tests: [
          "Próba doustnego nawodnienia, obserwacja i ponowna ocena; brak biegunki powinien poszerzać różnicowanie.",
        ],
      },
      subq: {
        title: "Czy odwodnienie ciężkie, zawiodło DPN lub podejrzewana przyczyna chirurgiczna?",
        body: "Oceń stopień odwodnienia klinicznie (letarg, zapadnięte gałki oczne, brak łez, CRT >2–3s, tachykardia), tolerancję DPN oraz cechy pylorostenozy (wymioty chlustające u niemowlęcia 2–8 tyg.) lub wgłobienia.",
        criteria: [
          "[TAK] Ciężkie odwodnienie (≥10%), wstrząs, zaburzenia świadomości lub niepowodzenie nawadniania DPN/NG",
          "[TAK] Wymioty żółciowe (ciemnozielone), podejrzenie wgłobienia, pylorostenozy lub DKA",
          "[NIE] Odwodnienie łagodne/umiarkowane bez czerwonych flag chirurgicznych",
        ],
      },
      subyes: {
        title: "Płynoterapia IV (bolus 20 ml/kg 0,9% NaCl + Holliday-Segar) i pilne USG / chirurgia",
        type: "urgent",
        body: "Wstrząs/ciężkie odwodnienie: bolus 20 ml/kg 0,9% NaCl IV, następnie pokrycie deficytu i zapotrzebowania podstawowego wg reguły Holliday-Segar (4-2-1) roztworem izotonicznym z glukozą. W DKA stosuj dedykowany protokół bez szybkich bolusów (poza wstrząsem).",
        tests: [
          "Glikemia, gazometria, Na+, K+, Cl- (zasadowica hipochloremiczna w pylorostenozie) oraz pilne USG brzucha.",
        ],
      },
      subno: {
        title: "Odwodnienie łagodne/umiarkowane: pojenie doustnym płynem nawadniającym (DPN) ± ondansetron",
        body: "Nawadniaj doustnym płynem nawadniającym (DPN 50 ml/kg w ciągu 4h) podawanym często małymi porcjami (np. 5 ml co 1–2 min strzykawką/łyżeczką) lub przez zgłębnik NG. Rozważ pojedynczą dawkę ondansetronu p.o. u dzieci >6 mies.",
        tests: [
          "Ocena masy ciała, diurezy i stanu klinicznego po 2–4 godzinach nawadniania DPN.",
        ],
      },
      alt: {
        title: "Kontynuacja żywienia i DPN w domu z instrukcją kontroli diurezy i koloru wymiotów",
        body: "Po udanej próbie pojenia zaleć kontynuację DPN (uzupełnianie strat 10 ml/kg na każdy wodnisty stolec / wymiot), wczesny powrót do normalnej diety odpowiedniej dla wieku i unikanie słodzonych soków/napojów gazowanych.",
        tests: [
          "Edukacja opiekuna: natychmiastowy powrót przy zielonych wymiotach, bezmoczu >6–8h lub apatii.",
        ],
      },
      dispo: [
        "Wypis po tolerowaniu płynów i przy wiarygodnej obserwacji. Powrót przy zielonych/krwistych wymiotach, bólu, letargu lub zmniejszeniu moczu.",
      ],
      pit: [
        "Ondansetron i ustąpienie wymiotów nie dowodzą braku poważnej przyczyny.",
        "Żółty i ciemnozielony kolor nie są diagnostycznie równoważne; pokaż rodzinie wzorzec koloru.",
      ],
      logic:
        "Kolor, wiek i stan ogólny określają pilność skuteczniej niż sama liczba wymiotów.",
      src: ["vomitP", "gastro"],
    },
  );

  module(
    "bleeding",
    "Krwawienie z przewodu pokarmowego",
    "Hemodynamika i aktywność krwawienia przed skalą; oddzielne źródła dla dzieci.",
    {
      hx: [
        "Krwawe/fusowate wymioty, melena lub świeża krew; ilość, omdlenie, leki przeciwkrzepliwe/NLPZ.",
        "Choroba wątroby/żylaki, wrzody, alkohol, wcześniejsze krwawienia.",
      ],
      exam: [
        "Parametry, perfuzja i świadomość; brzuch, cechy marskości; per rectum przy wskazaniach.",
        "Hemoglobina początkowo może nie oddawać wielkości ostrej utraty krwi.",
      ],
      red: [
        "Niestabilność, aktywne masywne krwawienie, omdlenie, cechy wstrząsu lub podejrzenie krwawienia żylakowego.",
      ],
      urgent:
        "ABCDE, dostęp dożylny, grupa/próba zgodności i resuscytacja; wezwanie endoskopisty. Niestabilny z ciężkim UGIB: endoskopia niezwłocznie po resuscytacji.",
      question: "Czy to podejrzenie górnego krwawienia?",
      yes: {
        title: "GBS + endoskopia wg ryzyka",
        body: "Oblicz Glasgow-Blatchford przed endoskopią; NICE CG141 rozważa wczesny wypis przy GBS=0. Pozostali zwykle endoskopia w ciągu 24 h, po właściwej stabilizacji.",
        tests: [
          "Morfologia, mocznik/kreatynina, koagulologia i próba zgodności według ciężkości.",
          "Pełny Rockall dopiero po endoskopii; wynik skali nie zastępuje oceny krążenia.",
        ],
      },
      no: {
        title: "Dolne źródło / inna przyczyna",
        body: "Świeża krew może pochodzić z dolnego odcinka, lecz masywne krwawienie górne też tak się objawia.",
        tests: [
          "Wybór kolonoskopii/CTA zależy od aktywności krwawienia i stanu, zgodnie ze ścieżką specjalistyczną.",
          "Nie stosuj GBS do kwalifikacji wypisu w krwawieniu dolnym.",
        ],
      },
      subq: {
        title: "Czy GBS ≥1 pkt, cechy krwawienia żylakowego (marskość) lub niestabilność?",
        body: "Oblicz skalę Glasgow-Blatchford (GBS) oraz oceń ryzyko nadciśnienia wrotnego/marskości wątroby i przyjmowanie leków przeciwkrzepliwych.",
        criteria: [
          "[TAK] Skala Glasgow-Blatchford (GBS) ≥1 pkt (lub >1 pkt wg ESGE) wymagająca hospitalizacji i endoskopii",
          "[TAK] Podejrzenie krwawienia z żylaków przełyku/dna żołądka lub aktywne krwawienie na OAC",
          "[NIE] Bardzo niskie ryzyko: GBS = 0 pkt (NICE CG141), stabilna hemodynamika, brak marskości",
        ],
      },
      subyes: {
        title: "Resuscytacja, IPP (lub terlipresyna + ATB w żylakach), odwrócenie OAC i gastroskopia <24h",
        type: "urgent",
        body: "Restrykcyjna strategia przetoczeń KKCz (próg Hb <7 g/dl, lub <8–9 g/dl w chorobie wieńcowej). W podejrzeniu krwawienia żylakowego: natychmiast terlipresyna/oktreotyd + profilaktyczny antybiotyk IV (ceftriakson) i gastroskopia <12h. W nieżylakowym UGIB: gastroskopia <24h i IPP IV.",
        tests: [
          "Grupa krwi i próba krzyżowa, morfologia co 4–6h, INR/APTT, mocznik, kreatynina i mleczany.",
        ],
      },
      subno: {
        title: "Bardzo niskie ryzyko (NICE CG141: GBS = 0): wczesny wypis i pilna gastroskopia ambulatoryjna",
        body: "Pacjent stabilny hemodynamicznie z GBS = 0 pkt bez chorób obciążających może zostać wypisany z SOR z zaplanowaną pilną gastroskopią ambulatoryjną i leczeniem IPP p.o.",
        tests: [
          "Weryfikacja leków (odstawienie NLPZ, ocena wskazań do gastroprotekcji) i pisemna instrukcja powrotu.",
        ],
      },
      alt: {
        title: "Krwawienie z dolnego odcinka PP: angio-TK przy aktywnym krwawieniu lub kolonoskopia",
        body: "Przy niestabilności lub aktywnym krwawieniu świeżą krwią z odbytu wyklucz masywne źródło górne i wykonaj pilne angio-TK (CTA) z kwalifikacją do embolizacji/endoskopii. U chorych stabilnych: przygotowanie i kolonoskopia.",
        tests: [
          "Badanie per rectum, morfologia, koagulologia oraz ocena bilansu korzyści/ryzyka czasowego wstrzymania OAC/DAPT.",
        ],
      },
      dispo: [
        "Decyzja o nadzorze i wypisie po ocenie ryzyka i konsultacji; określ kontrolę, leki i odpowiedzialność za wyniki.",
      ],
      pit: [
        "GBS 0 oraz 0–1 pochodzą z różnych zaleceń; tu jawnie stosowany próg NICE=0.",
        "Nie przenoś algorytmu UGIB na każde krwawienie z odbytu.",
      ],
      logic:
        "Resuscytacja i endoskopia mają pierwszeństwo. Skale wspierają decyzję o ryzyku, nie decydują za klinicystę.",
      src: ["bleed"],
    },
    {
      hx: [
        "Rzeczywista krew czy pokarm/barwnik; połknięta krew z nosa/jamy ustnej; ilość i nawracanie.",
        "Wiek, ból, wymioty, choroby wątroby, leki, zaburzenia krzepnięcia; możliwa bateria/ciało obce.",
      ],
      exam: [
        "Witalne dla wieku, perfuzja i stan ogólny; jama ustna/nos, brzuch, cechy hepatosplenomegalii.",
        "Poszukuj przyczyny krwawienia i oceń, czy występują cechy istotnej utraty krwi.",
      ],
      red: [
        "Niestabilność, duża/aktywna utrata, niedokrwistość z objawami, choroba wątroby/żylaki, podejrzenie połknięcia baterii.",
      ],
      urgent:
        "Pilna resuscytacja i konsultacja pediatryczna/GI; NPO, dostęp i badania zgodnie z ciężkością. Podejrzenie baterii uruchamia odrębny pilny protokół.",
      question: "Czy krwawienie znaczące lub aktywne?",
      yes: {
        title: "Morfologia / koagulologia / GI",
        body: "Ocena anemii i krzepnięcia, próba zgodności przy ryzyku transfuzji; endoskopia/obrazowanie po ocenie specjalistycznej.",
        tests: [
          "Ścieżka zależy od stabilności i potencjalnego źródła; nie wystarczy dorosła punktacja GBS.",
        ],
      },
      no: {
        title: "Wyjaśnij małe krwawienie",
        body: "W dobrym stanie i przy małej ilości krwi oceń źródło miejscowe/połkniętą krew i potrzebę dalszych badań.",
        tests: [
          "Nie pomijaj ponownej oceny przy nawrocie. Brak początkowej anemii nie wyklucza ostrego krwotoku.",
        ],
      },
      subq: {
        title: "Czy występuje spadek Hb, nadciśnienie wrotne lub podejrzenie połknięcia baterii/ciała obcego?",
        body: "Oceń stabilność krążeniową (tachykardia jest wczesnym objawem hipowolemii u dzieci!), dynamikę Hb, obecność splenomegalii oraz możliwość połknięcia baterii guzikowej.",
        criteria: [
          "[TAK] Połknięcie baterii guzikowej, niestabilność hemodynamiczna, spadek Hb >2 g/dl lub podejrzenie żylaków",
          "[NIE] Stabilne krążenie i umiarkowane krwawienie śluzówkowe bez ciała obcego",
        ],
      },
      subyes: {
        title: "Pilna endoskopia w znieczuleniu ogólnym (bateria: natychmiast!), IPP IV / oktreotyd i KKCz",
        type: "urgent",
        body: "Bateria guzikowa w przełyku wymaga natychmiastowego usunięcia endoskopowego (<2h)! W masywnym krwawieniu: przetoczenie KKCz (10–15 ml/kg), IPP IV, oktreotyd + antybiotyk przy nadciśnieniu wrotnym i pilna endoskopia.",
        tests: [
          "RTG szyi/klatki/brzucha przy podejrzeniu baterii/ciała obcego; grupa krwi, morfologia, koagulologia, próby wątrobowe.",
        ],
      },
      subno: {
        title: "Stabilne dziecko z umiarkowanym krwawieniem: hospitalizacja, IPP, kontrola morfologii",
        body: "Przyjęcie do oddziału gastroenterologii dziecięcej/pediatrii, wstrzymanie podaży doustnej (NPO) na czas decyzji o gastroskopii, włączenie IPP IV i seryjna kontrola parametrów życiowych oraz morfologii.",
        tests: [
          "Kontrolna morfologia po 6–12 h, USG jamy brzusznej z oceną układu wrotnego lub scyntygrafia w kierunku uchyłka Meckela (przy bezbolesnym krwawieniu dolnym).",
        ],
      },
      alt: {
        title: "Weryfikacja rzekomego krwawienia (połknięta krew), szczeliny odbytu, alergii (CMPA) lub polipa",
        body: "U niemowląt w dobrym stanie wyklucz połkniętą krew matki (z popękanych brodawek) lub krwawienie z nosa/gardła. W krwawieniu z dolnego odcinka u niemowląt rozważ alergię na białka mleka krowiego (CMPA) lub szczelinę odbytu.",
        tests: [
          "Dokładne badanie jamy ustnej, nosogardła oraz okolicy odbytu (szczelina odbytu).",
        ],
      },
      dispo: [
        "Kontrola i instrukcje powrotu przy nawrocie, bladości, osłabieniu, bólu lub smolistym stolcu; niski próg konsultacji u niemowląt.",
      ],
      pit: [
        "GBS i Rockall nie są automatycznymi narzędziami wypisu dzieci.",
        "Krew w wymiotach może być połknięta, ale nie zakładaj tego bez oceny.",
      ],
      logic:
        "Pediatryczne postępowanie opiera się na nasileniu krwawienia i stanie dziecka; źródłem jest ścieżka CHOP dla górnego odcinka.",
      src: ["bleedP"],
    },
  );

  module(
    "back",
    "Ból pleców / kręgosłupa",
    "Bez czerwonych flag nie rutynowe obrazowanie; z deficytem lub objawami zwieraczowymi pilna ścieżka.",
    {
      hx: [
        "Czas, uraz, promieniowanie, nocny ból; gorączka, nowotwór, immunosupresja, steroidy i ryzyko złamania.",
        "Nowe zaburzenia mikcji/defekacji, czucia siodłowego i siły kończyn; objawy naczyniowe/brzuszne.",
      ],
      exam: [
        "Chód, siła, czucie i odruchy; badanie kręgosłupa, brzucha i naczyń zależnie od podejrzenia.",
        "Przy podejrzeniu CES pilna pełna ocena neurologiczna i ścieżka obrazowa; pojedynczy ujemny objaw nie zamyka diagnostyki.",
      ],
      red: [
        "Nowe objawy zwieraczowe, czucie siodłowe, postępujący deficyt, gorączka z ryzykiem infekcji, uraz/złamanie, podejrzenie nowotworu lub aorty.",
      ],
      urgent:
        "Podejrzenie CES, infekcji, złamania, nowotworu lub patologii naczyniowej: pilna ścieżka i badanie właściwe dla hipotezy; MR przy podejrzeniu ucisku nerwowego według protokołu.",
      question: "Czy obrazowanie zmieni postępowanie?",
      yes: {
        title: "Diagnostyka specjalistyczna",
        body: "Wybór MR/TK/RTG zależy od podejrzenia, nie od samego czasu bólu. Badania zapalne przy ryzyku infekcji, inne celowane.",
        tests: [
          "NICE NG59 dotyczy nieswoistego bólu/rwy; poważne przyczyny wymagają odrębnych ścieżek.",
          "W opiece specjalistycznej obrazuj tylko, jeśli wynik prawdopodobnie zmieni leczenie.",
        ],
      },
      no: {
        title: "Bez rutynowego RTG / MR",
        body: "Nieswoisty ból bez red flags: wyjaśnienie, aktywność i leczenie zachowawcze dobrane klinicznie.",
        tests: [
          "Nie wykonuj rutynowego obrazowania w opiece niespecjalistycznej.",
          "Zmiany degeneracyjne w MR nie muszą wyjaśniać objawu.",
        ],
      },
      subq: {
        title: "Czy pilny MR potwierdza zespół ogona końskiego (CES), ucisk rdzenia lub niestabilne złamanie?",
        body: "Oceń wynik pilnego MR kręgosłupa (lub TK w urazie), zaleganie moczu w pęcherzu po mikcji (PVR w POCUS) oraz dynamikę niedowładu.",
        criteria: [
          "[TAK] Zespół ogona końskiego (CES), złośliwy ucisk rdzenia kręgowego (MSCC), krwiak nadtwardówkowy lub niestabilne złamanie",
          "[NIE] Brak ostrego ucisku wymagającego natychmiastowej operacji — podejrzenie spondylodiscitis, złamania osteoporotycznego lub przyczyny pozakręgosłupowej",
        ],
      },
      subyes: {
        title: "Natychmiastowa dekompresja neurochirurgiczna / ortopedyczna (i deksametazon w MSCC)",
        type: "urgent",
        body: "Pilny transfer i odbarczenie chirurgiczne. W nowotworowym ucisku rdzenia (MSCC): unieruchomienie, deksametazon 16 mg IV i pilna konsultacja neurochirurgiczna/radioterapeutyczna.",
        tests: [
          "Koagulologia, grupa krwi i przygotowanie przedoperacyjne; cewnikowanie pęcherza przy zatrzymaniu moczu.",
        ],
      },
      subno: {
        title: "Diagnostyka spondylodiscitis / ropnia (posiewy, ATB IV) lub patologii aorty/nerki",
        body: "Przy podejrzeniu spondylodiscitis bez deficytu neurologicznego: pobierz 2–3 komplety posiewów krwi, rozważ biopsję celowaną przed ATB (jeśli pacjent stabilny bez sepsy) lub włącz celowaną terapię IV. Wyklucz AAA i kamicę nerkową.",
        tests: [
          "Posiewy krwi, OB/CRP, POCUS aorty brzusznej i nerek / TK bez kontrastu w kolce nerkowej.",
        ],
      },
      alt: {
        title: "Zachowawcze leczenie nieswoistego bólu krzyża: wczesna aktywność i bezpieczna analgezja",
        body: "Zachęcaj do utrzymania normalnej aktywności fizycznej i unikania leżenia w łóżku. Zastosuj NLPZ w najniższej skutecznej dawce (po weryfikacji eGFR, ryzyka GI i sercowo-naczyniowego w strażniku nerkowym) oraz fizjoterapię.",
        tests: [
          "Ocena czynników psychospołecznych chronifikacji bólu (żółte flagi) i kontrola w razie braku poprawy.",
        ],
      },
      dispo: [
        "Kontrola przy braku poprawy i natychmiastowy powrót przy deficycie, zaburzeniach zwieraczy, gorączce lub gwałtownym pogorszeniu.",
      ],
      pit: [
        "Brak jednego objawu CES nie wyklucza zespołu.",
        "Ból pleców z hipotensją/bólem brzucha nie jest zwykłą rwą.",
      ],
      logic:
        "Przypadkowe zmiany obrazowe są częste. Test ma służyć decyzji, a nie jedynie nazwać zmianę anatomiczną.",
      src: ["back"],
    },
    {
      hx: [
        "Czas, przeciążenie, uraz, nocny ból, promieniowanie i ograniczenie aktywności.",
        "Gorączka, chudnięcie, sztywność, deficyt i zmiana chodu; wiek i choroby współistniejące.",
      ],
      exam: [
        "Chód, krzywizny, lokalizacja, ruchomość, pełne badanie neurologiczne; objawy systemowe.",
      ],
      red: [
        "Nocny/progresywny ból, nieprawidłowy chód, deficyt, gorączka/chudnięcie, ból utrzymujący się >4 tygodni i inne cechy kliniczne.",
      ],
      urgent:
        "Ostry deficyt, zaburzenia zwieraczy lub podejrzenie infekcji/ucisku: pilna pediatryczna/specjalistyczna ocena i właściwe obrazowanie.",
      question: "Czy są czerwone flagi pediatryczne?",
      yes: {
        title: "Obrazowanie zgodne z wariantem ACR",
        body: "Dobierz region i metodę do objawów. Deficyt lub podejrzenie infekcji/nowotworu mogą wymagać MR.",
        tests: [
          "Nie zlecaj automatycznie całego kręgosłupa. Zakres i kontrast zależą od pytania.",
          "Badania zapalne/morfologia w objawach systemowych zgodnie z kliniką.",
        ],
      },
      no: {
        title: "Zwykle bez wstępnego obrazowania",
        body: "ACR: przy braku red flags początkowe obrazowanie zwykle niewłaściwe. Obserwacja i kontrola zależnie od przebiegu.",
        tests: [
          "Przedłużanie objawów lub nowa czerwona flaga zmienia decyzję.",
        ],
      },
      subq: {
        title: "Czy obrazowanie (MR/RTG) wykazuje ucisk rdzenia, nowotwór lub spondylodiscitis/osteomyelitis?",
        body: "Zinterpretuj wynik obrazowania i markerów zapalnych (OB, CRP, morfologia z rozmazem) u dziecka z czerwonymi flagami.",
        criteria: [
          "[TAK] Guz kanału kręgowego/kręgosłupa, białaczka/chłoniak, ropień nadtwardówkowy lub spondylodiscitis",
          "[NIE] Spondyloliza / kręgozmyk (spondylolisteza), choroba Scheuermanna lub skolioza bez patologii kanału kręgowego",
        ],
      },
      subyes: {
        title: "Pilna hospitalizacja: neurochirurgia / onkologia dziecięca lub antybiotykoterapia IV",
        type: "urgent",
        body: "Przyjęcie do szpitala. W ucisku rdzenia lub guzie: pilna neurochirurgia/onkologia dziecięca. W spondylodiscitis / osteomyelitis kręgosłupa: posiew krwi, unieruchomienie gorsetem i celowana antybiotykoterapia dożylna.",
        tests: [
          "Posiewy krwi, MR z kontrastem, morfologia z rozmazem ręcznym, LDH i kwas moczowy przy podejrzeniu rozrostu.",
        ],
      },
      subno: {
        title: "Spondyloliza / kręgozmyk lub choroba Scheuermanna: odciążenie, ortopedia i rehabilitacja",
        body: "W spondylolizie (częstej u młodych sportowców z bólem przy przeproście): czasowe wstrzymanie treningów obciążających, fizjoterapia stabilizacji centralnej i opieka ortopedy dziecięcego.",
        tests: [
          "Celowane RTG/MR bez wykonywania powtarzanych badań TK obciążających promieniowaniem.",
        ],
      },
      alt: {
        title: "Ból przeciążeniowy bez czerwonych flag: modyfikacja aktywności, fizjoterapia i kontrola za 2–4 tyg.",
        body: "Zaleć ergonomię (odpowiednia masa plecaka, higiena postawy), ćwiczenia rozciągające i wzmacniające oraz kontrolę lekarską za 2–4 tygodnie. Pojawienie się bólu nocnego lub utykania wymaga pilnej rewizji.",
        tests: [
          "Brak wskazań do wstępnego RTG i badań krwi przy niepowikłanym bólu przeciążeniowym.",
        ],
      },
      dispo: [
        "Plan kontroli i ograniczenia adekwatne do podejrzenia; powrót przy gorączce, nocnym bólu, chudnięciu lub objawach neurologicznych.",
      ],
      pit: [
        "Nie zakładaj, że każdy ból pleców dziecka jest przeciążeniowy.",
        "Dorosłe zwyrodnienia i progi nie opisują dobrze ryzyka pediatrycznego.",
      ],
      logic:
        "ACR porządkuje wskazania obrazowe według czerwonych flag, a nie samego zgłoszenia bólu.",
      src: ["backP"],
    },
  );

  module(
    "anaphylaxis",
    "Anafilaksja",
    "Natychmiastowa adrenalina i.m., ocena ABCDE i różnicowanie z obrzękiem bradykininowym (HAE).",
    {
      hx: [
        "Nagły początek (minuty/godziny), ekspozycja na alergen (leki np. NLPZ/beta-laktamy, pokarm, użądlenie owada, kontrast radiologiczny).",
        "Szybki rozwój objawów skórnych, oddechowych lub sercowo-naczyniowych; przebyte epizody anafilaksji i astma.",
      ],
      exam: [
        "ABCDE: obrzęk krtani/języka, stridor, chrypka (Airway); świsty, duszność, sinica (Breathing); hipotensja, tachykardia, omdlenie, zapaść (Circulation).",
        "Pokrzywka, świąd, rumień, obrzęk naczynioruchowy (Disability/Exposure); uwaga: u 10-20% chorych objawy skórne mogą być nieobecne!",
      ],
      red: [
        "Zaburzenia drożności dróg oddechowych (stridor), niewydolność oddechowa (ciężki skurcz oskrzeli), zapaść krążeniowa / wstrząs anafilaktyczny, brak poprawy po I dawce adrenaliny.",
      ],
      urgent:
        "Ułóż pacjenta płasko z uniesionymi nogami (NIE siadaj gwałtownie!). Natychmiast podaj Adrenalinę 0,5 mg i.m. (1:1000) w przednio-boczną powierzchnię uda. Wysokoprzepływowy tlen 15 l/min przez maskę z rezerwuarem. Zabezpiecz dostęp IV i przetocz bolus 500-1000 ml krystaloidu.",
      question: "Czy reakcja spełnia kryteria anafilaksji (zagrożenie A, B lub C)?",
      yes: {
        title: "Ścieżka anafilaksji: adrenalina i.m. + płynoterapia",
        body: "Potwierdź podanie adrenaliny i.m. Powtórz dawkę 0,5 mg i.m. po 5 minutach przy braku poprawy. Podaj krystaloid IV w bolusach. Leki II rzutu (przeciwhistaminowe, hydrokortyzon) nie zastępują adrenaliny.",
        tests: [
          "Tryptaza mastocytarna: pobierz I próbkę jak najszybciej po resuscytacji, II próbkę po 1-2h od początku, III po 24h (stan wyjściowy).",
        ],
      },
      no: {
        title: "Łagodna reakcja alergiczna / izolowana pokrzywka",
        body: "Izolowane zmiany skórne (pokrzywka, świąd) bez objawów ze strony dróg oddechowych, oddychania i krążenia nie wymagają adrenaliny. Zastosuj lek przeciwhistaminowy H1 II generacji p.o.",
        tests: [
          "Wyklucz cechy obrzęku głośni i skurczu oskrzeli przed decyzją o wypisie.",
        ],
      },
      subq: {
        title: "Czy występuje anafilaksja oporna na adrenalinę i.m. lub podejrzenie HAE?",
        body: "Brak poprawy po ≥2 dawkach adrenaliny i.m. i płynoterapii (anafilaksja oporna) LUB obrzęk naczynioruchowy bez świądu/pokrzywki (bradykininowy: ACE-I lub wrodzony HAE — adrenalina nieskuteczna!).",
        criteria: [
          "[TAK] Utrzymująca się hipotensja, wstrząs lub narastający stridor po 2 dawkach adrenaliny i.m. (wskazany wlew IV adrenaliny)",
          "[TAK] Obrzęk naczynioruchowy związany z ACE-I lub HAE (wskazany inhibitor C1 / ikatybant)",
          "[NIE] Stabilizacja parametrów i ustąpienie objawów oddechowych/krążeniowych po adrenalinie i.m.",
        ],
      },
      subyes: {
        title: "Wlew ciągły adrenaliny IV / koncentrat C1-INH / OIT",
        type: "urgent",
        body: "W opornej anafilaksji: ciągły wlew dożylny adrenaliny (start 0,05-0,1 µg/kg/min) pod ścisłym monitorowaniem kardiomonitorem i przygotowanie do trudnej intubacji. W HAE/ACE-I: koncentrat C1-esterazy (Berinert) 20 j./kg IV lub ikatybant (Firazyr) 30 mg s.c.",
        tests: [
          "Ciągłe monitorowanie EKG, ciśnienia tętniczego i saturacji na stanowisku intensywnego nadzoru.",
        ],
      },
      subno: {
        title: "Obserwacja w kierunku reakcji dwufazowej (min. 6-8h)",
        body: "Reakcja dwufazowa może wystąpić po kilku godzinach. Obserwuj pacjenta przez minimum 6-8 h (lub 12-24 h przy ciężkim wstrząsie, astmie lub powolnym ustępowaniu objawów).",
        tests: [
          "Pomiar parametrów życiowych co 15-30 min w pierwszej fazie, ocena ustępowania obrzęków.",
        ],
      },
      alt: {
        title: "Leki przeciwhistaminowe H1 p.o. i recepta na autostrzykawkę (AAI)",
        body: "Wypisz leki przeciwhistaminowe (cetyryzyna/bilastyna p.o.). Każdy pacjent po anafilaksji musi otrzymać receptę na 2 autostrzykawki z adrenaliną (AAI 300 µg), pisemny plan postępowania i skierowanie do poradni alergologicznej.",
        tests: [
          "Edukacja pacjenta i technika podania autostrzykawki z trenażerem.",
        ],
      },
      dispo: [
        "Wypis po min. 6-8h od ustąpienia objawów. Recepta na 2 ampułkostrzykawki z adrenaliną, pisemny plan anafilaksji i skierowanie do alergologa.",
      ],
      pit: [
        "Pionizacja chorego we wstrząsie anafilaktycznym może wywołać nagły zgon (zespół pustej komory).",
        "Glikokortykosteroidy i leki przeciwhistaminowe nie działają natychmiast i nie ratują życia w ostrej anafilaksji.",
      ],
      logic:
        "Adrenalina domięśniowa podana jak najszybciej jest lekiem z wyboru ratującym życie. Oporność na dawki i.m. wymaga wlewu ciągłego IV.",
      src: ["rcukAna", "niceAna", "abcde"],
    },
    {
      hx: [
        "Pokarm (mleko, jajko, orzeszki), leki, użądlenie owada. Nagła zmiana zachowania, płaczliwość, wymioty, obrzęk warg/języka, kaszel, świszczący oddech.",
        "Przebyte epizody anafilaksji, wywiad astmy oskrzelowej (czynnik ryzyka zgonu w anafilaksji).",
      ],
      exam: [
        "ABCDE z normami wieku: stridor, zaciąganie międzyżebrzy, hipotensja (późny objaw!), CRT >2-3s, bladość/marmurkowatość, pokrzywka, świąd.",
        "Ocena masy ciała dziecka do precyzyjnego dawkowania adrenaliny i płynów.",
      ],
      red: [
        "Świst krtaniowy (stridor), sinica, wiotkość, trudność wybudzenia, hipotensja dla wieku, brak poprawy po adrenalinie.",
      ],
      urgent:
        "Adrenalina i.m. natychmiast: 0,01 mg/kg (0,01 ml/kg roztworu 1:1000, max 0,5 mg) w przednio-boczną powierzchnię uda. Tlen 15 l/min przez maskę z rezerwuarem. Bolus płynowy 20 ml/kg 0,9% NaCl / Plasmalyte IV/IO pod ciśnieniem.",
      question: "Czy u dziecka występują cechy anafilaksji (objawy oddechowe/krążeniowe)?",
      yes: {
        title: "Pediatryczna ścieżka anafilaksji: adrenalina i.m. + bolus płynowy",
        body: "Potwierdź dawkę adrenaliny wg masy: <6 lat: 0,15 mg; 6-12 lat: 0,3 mg; >12 lat: 0,5 mg. Powtórz po 5 min przy braku reakcji. Dostęp IV/IO i szybki bolus 20 ml/kg.",
        tests: [
          "Glikemia przyłóżkowa (hipotermia/wstrząs sprzyja hipoglikemii u niemowląt), tryptaza mastocytarna.",
        ],
      },
      no: {
        title: "Łagodna reakcja pokarmowa / skórna",
        body: "Izolowane wykwity skórne lub świąd bez pracy oddechowej i z prawidłową perfuzją. Leki przeciwhistaminowe doustnie, obserwacja 2-4h.",
        tests: [
          "Dokładne osłuchanie płuc i ocena stridoru przy próbie płaczu/karmienia.",
        ],
      },
      subq: {
        title: "Czy dziecko nie reaguje na ≥2 dawki adrenaliny i.m. lub ma cechy wyczerpania?",
        body: "Utrzymująca się duszność, stridor, zaburzenia świadomości lub hipotensja po dwóch dawkach adrenaliny i.m. i 40 ml/kg krystaloidów.",
        criteria: [
          "[TAK] Oporny wstrząs anafilaktyczny lub obturacja krtani wymagająca wlewu adrenaliny IV i pilnej intubacji",
          "[NIE] Stabilizacja kliniczna, ustąpienie stridoru i dobra perfuzja obwodowa",
        ],
      },
      subyes: {
        title: "Pediatryczny wlew ciągły adrenaliny IV/IO i kontakt z OIT dziecięcym",
        type: "urgent",
        body: "Wlew adrenaliny IV/IO (start 0,05-0,1 µg/kg/min miareczkowany do efektu). Wezwij starszego pediatrę/anestezjologa dziecięcego do zabezpieczenia dróg oddechowych (mniejsza rurka o 0,5-1 mm z powodu obrzęku).",
        tests: [
          "Ciągłe monitorowanie saturacji, EKG, ciśnienia tętniczego i bilansu płynów.",
        ],
      },
      subno: {
        title: "Obserwacja szpitalna min. 8-12h i próba pojenia",
        body: "Hospitalizacja na oddziale pediatrycznym. Czas obserwacji minimum 8-12 h ze względu na ryzyko reakcji dwufazowej. Ocena tolerancji doustnej przed wypisem.",
        tests: [
          "Seryjna ocena skali PEWS i pracy oddechowej co 30 min.",
        ],
      },
      alt: {
        title: "Recepta na autostrzykawkę dziecięcą (AAI 150/300 µg) i edukacja rodziców",
        body: "Dzieci 7,5-25 kg: AAI 150 µg; dzieci >25-30 kg: AAI 300 µg (recepta na 2 sztuki). Pisemny plan anafilaksji dla przedszkola/szkoły i instruktaż z trenażerem.",
        tests: [
          "Przeszkolenie opiekunów w rozpoznawaniu wczesnych objawów anafilaksji.",
        ],
      },
      dispo: [
        "Wypis po min. 8-12h stabilności. Recepta na 2 autostrzykawki, szkolenie opiekunów, plan szkolny i pilna poradnia alergologii dziecięcej.",
      ],
      pit: [
        "Dawkowanie adrenaliny u dzieci wymaga przeliczenia na masę ciała lub wieku (<6 lat: 0,15 mg, 6-12 lat: 0,3 mg, >12 lat: 0,5 mg).",
        "Nie pionizuj dziecka na siłę przy duszności i zapaści.",
      ],
      logic:
        "W pediatrii szybkie podanie adrenaliny i.m. w udo decyduje o przeżyciu. Hipotensja jest objawem bardzo późnym.",
      src: ["rchAna", "rcukAna", "abcde"],
    },
  );

  module(
    "seizures",
    "Drgawki / stan padaczkowy",
    "Kontrola czasu napadu, algorytm status epilepticus (BZD → leki II rzutu) oraz różnicowanie z rzucawką i drgawkami gorączkowymi.",
    {
      hx: [
        "Czas trwania napadu (krytyczny punkt t1=5 min: stan padaczkowy!), wywiad padaczkowy, odstawienie leków przeciwpadaczkowych, alkohol/zespół odstawienny, uraz głowy, zakażenie OUN, możliwość ciąży (rzucawka >20 hbd!).",
      ],
      exam: [
        "ABCDE: drożność dróg oddechowych, saturacja, symetria źrenic, glikemia przyłóżkowa natychmiast, temperatura, uraz języka, deficyt ogniskowy (porażenie Todda).",
      ],
      red: [
        "Napad uogólniony trwający >5 min (stan padaczkowy wczesny), napady gromadne bez odzyskania przytomności, hipoksja, sinica, uraz głowy, gorączka z objawami oponowymi, ciąża.",
      ],
      urgent:
        "Zabezpiecz drogi oddechowe i podaj tlen. Natychmiast zbadaj glukozę. Jeśli napad trwa >5 min: podaj Midazolam 10 mg i.m./b.u.c. (lub Diazepam 10 mg i.v. powoli / Klonazepam 1 mg i.v.). Przy podejrzeniu rzucawki (ciąża/połóg): Siarczan magnezu 4 g i.v. w 10 min!",
      question: "Czy napad ustał w ciągu 5-10 min od pierwszej dawki BZD?",
      yes: {
        title: "Napad przerwany — diagnostyka przyczynowa",
        body: "Ułóż w pozycji bezpiecznej, monitoruj parametry i stan świadomości. U pacjentów z padaczką zweryfikuj stężenia leków w surowicy i czynniki wyzwalające (infekcja, brak snu, alkohol).",
        tests: [
          "Elektrolity (Na+, Ca2+, Mg2+), gazometria (kwasica mleczanowa ponapadowa), morfologia, stężenia leków p/padaczkowych.",
        ],
      },
      no: {
        title: "Ustalony stan padaczkowy (Established Status >10-15 min)",
        body: "Powtórz dawkę BZD jednokrotnie (po 5-10 min od pierwszej) i natychmiast włącz lek przeciwpadaczkowy drugiego rzutu drogą dożylną.",
        tests: [
          "Przygotowanie do leczenia II rzutu i powiadomienie OIT.",
        ],
      },
      subq: {
        title: "Czy napad oporny na leki II rzutu (Refractory Status >30 min) / neuroinfekcja?",
        body: "Trwanie napadu mimo podania BZD i leku II rzutu (lewetiracetam / walproinian / fenytoina) LUB podejrzenie krwotoku wewnątrzczaszkowego / zapalenia mózgu.",
        criteria: [
          "[TAK] Stan padaczkowy oporny (Refractory Status Epilepticus) wymagający RSI i anestezji ogólnej na OIT",
          "[TAK] Podejrzenie neuroinfekcji lub ostrego krwawienia w TK głowy",
          "[NIE] Skuteczne przerwanie napadu po leku II rzutu i stopniowy powrót świadomości",
        ],
      },
      subyes: {
        title: "Znieczulenie ogólne (RSI z propofolem/midazolamem), OIT i ciągłe EEG",
        type: "urgent",
        body: "Intubacja dotchawicza w protokole RSI. Wlew ciągły propofolu, midazolamu lub tiopentalu z celem wygaszenia bioelektrycznego mózgu (burst suppression). Ciągłe monitorowanie cEEG na OIT.",
        tests: [
          "Pilne TK głowy z kontrastem, nakłucie lędźwiowe (po wykluczeniu przeciwskazań) i ciągłe EEG.",
        ],
      },
      subno: {
        title: "Wlew leku II rzutu (Lewetiracetam 60 mg/kg lub Walproinian 40 mg/kg)",
        body: "Lewetiracetam (Keppra) 4000 mg i.v. w 10 min LUB Walproinian sodu (Depakine) 40 mg/kg i.v. (max 3000 mg; uwaga: przeciwwskazany w ciąży!) LUB Fenytoina 20 mg/kg i.v. z kontrolą EKG.",
        tests: [
          "Kontrola ciśnienia tętniczego i EKG (ryzyko arytmii i hipotensji przy fenytoinie).",
        ],
      },
      alt: {
        title: "Ocena pierwszego napadu w życiu vs napad objawowy (alkohol/hiponatremia)",
        body: "Pierwszy napad w życiu wymaga neuroobrazowania (TK/MR mózgowia) i konsultacji neurologicznej. Drgawki alkoholowe: diazepam p.o./i.v., tiamina 100-200 mg i.v. Hiponatremia: 3% NaCl 100-150 ml w 10 min.",
        tests: [
          "TK głowy bez kontrastu, badanie neurologiczne po ustąpieniu stanu ponapadowego.",
        ],
      },
      dispo: [
        "Hospitalizacja przy stanie padaczkowym, pierwszym napadzie w życiu lub braku pełnego powrotu do stanu wyjściowego. Wypis tylko u stabilnych chorych ze znaną padaczką po konsultacji.",
      ],
      pit: [
        "Podanie kolejnych dawek BZD bez włączenia leku II rzutu prowadzi do depresji oddechowej i zapaści krążeniowej bez przerwania napadu.",
        "Nie zapominaj o glikemii i siarczanie magnezu u ciężarnych (rzucawka).",
      ],
      logic:
        "Czas to mózg: t1 (5 min) wymaga BZD; t2 (30 min) grozi trwałym uszkodzeniem neuronów i wymaga natychmiastowej eskalacji.",
      src: ["niceSeiz", "abcde"],
    },
    {
      hx: [
        "Wiek dziecka, gorączka (drgawki gorączkowe zwykle 6 mies. – 5 lat), czas trwania napadu, cechy ogniskowe, wcześniejsze napady, uraz, leki w domu, wymioty/biegunka (odwodnienie, zaburzenia elektrolitowe).",
      ],
      exam: [
        "ABCDE, glukoza przyłóżkowa, temperatura, napięcie ciemiączka, objawy oponowe, wybroczyny na skórze, symetria odruchów i źrenic.",
      ],
      red: [
        "Napad trwający >5 min, drgawki gorączkowe złożone (ogniskowe, >15 min lub nawracające w ciągu 24h), wiek <6 mies., brak odzyskania świadomości po 1h, wybroczyny.",
      ],
      urgent:
        "Udrożnij drogi oddechowe, podaj tlen 100%. Sprawdź glukozę (hipoglikemia: 10% glukoza 2,5-5 ml/kg IV!). Jeśli napad trwa >5 min: Midazolam na śluzówkę policzka 0,2 mg/kg (lub Diazepam wlewka p.r. 0,5 mg/kg; niemowlęta 5 mg, starsze 10 mg).",
      question: "Czy napad ustąpił po pierwszej dawce leku przeciwdrgawkowego?",
      yes: {
        title: "Drgawki przerwane: proste gorączkowe vs objawowe",
        body: "Po ustąpieniu napadu oceń źródło gorączki. Proste drgawki gorączkowe (uogólnione, <15 min, 1 raz na 24h u dziecka 6 mies. – 5 lat) mają doskonałe rokowanie i nie wymagają rutynowego EEG ani neuroobrazowania.",
        tests: [
          "Badanie ogólne moczu, ocena ogniska zakażenia wg wytycznych NICE NG143.",
        ],
      },
      no: {
        title: "Dziecięcy stan padaczkowy (>10 min)",
        body: "Powtórz dawkę BZD po 5-10 min (maksymalnie 2 dawki benzodiazepin łącznie). Natychmiast wezwij zespół anestezjologiczny/OIT i przygotuj lek II rzutu.",
        tests: [
          "Zabezpieczenie dostępu IV/IO i gazometria.",
        ],
      },
      subq: {
        title: "Czy stan padaczkowy trwa >20 min / cechy neuroinfekcji u niemowlęcia?",
        body: "Napad nieustępujący po leku II rzutu (lewetiracetam / fenytoina) LUB podejrzenie ropnego zapalenia opon mózgowo-rdzeniowych / opryszczkowego zapalenia mózgu.",
        criteria: [
          "[TAK] Utrzymujące się drgawki wymagające intubacji, tiopentalu/propofolu na OIT dziecięcym",
          "[TAK] Napięte ciemiączko, wybroczyny lub encefalopatia gorączkowa (pilny antybiotyk + acyklowir IV)",
          "[NIE] Ustąpienie drgwek po lewetiracetamie i stabilizacja parametrów życiowych",
        ],
      },
      subyes: {
        title: "Zabezpieczenie dróg oddechowych (RSI), leki znieczulenia ogólnego i OIT dziecięcy",
        type: "urgent",
        body: "RSI i intubacja przez doświadczony zespół pediatryczny. Wlew ciągły midazolamu (0,1-0,3 mg/kg/h) lub tiopentalu (bolus 3-5 mg/kg, potem wlew). Pilna empiryczna terapia neuroinfekcji: Cefotaksym/Ceftriakson + Acyklowir IV.",
        tests: [
          "Morfologia, CRP, posiew krwi, pilne USG przezciemiączkowe / MR mózgowia.",
        ],
      },
      subno: {
        title: "Wlew leku II rzutu: Lewetiracetam (Keppra) 50 mg/kg IV w 10 min",
        body: "Podaj Lewetiracetam 50 mg/kg IV (max 3000 mg) w ciągu 10 min LUB Fenytoinę 20 mg/kg IV pod kontrolą kardiomonitora LUB Walproinian 40 mg/kg IV.",
        tests: [
          "Monitorowanie saturacji, rytmu serca i ciśnienia tętniczego.",
        ],
      },
      alt: {
        title: "Edukacja opiekunów w drgawkach gorączkowych i recepta na wlewkę p.r.",
        body: "Wyjaśnij rodzicom mechanizm drgawek gorączkowych, uspokój co do braku trwałego uszkodzenia mózgu. Przepisz receptę na wlewkę doodbytniczą z diazepamu (Relsed 5 mg) lub midazolam do stosowania przy napadzie >5 min.",
        tests: [
          "Instruktaż ułożenia w pozycji bezpiecznej i pomiaru temperatury.",
        ],
      },
      dispo: [
        "Wypis po prostych drgawkach gorączkowych i pełnym wybudzeniu przy stabilnym ognisku. Hospitalizacja przy napadzie złożonym, wieku <12 mies. lub niepewnym stanie ogólnym.",
      ],
      pit: [
        "Agresywne schładzanie dziecka nie zapobiega drgawkom gorączkowym.",
        "U niemowląt <6 mies. drgawki z gorączką są zakażeniem OUN do czasu wykluczenia.",
      ],
      logic:
        "U dzieci większość krótkich napadów z gorączką to drgawki gorączkowe. Brak ustąpienia po 5 min wymaga natychmiastowego protokołu stanu padaczkowego.",
      src: ["rchSeiz", "niceSeiz", "abcde"],
    },
  );

  module(
    "poisoning",
    "Zatrucia / toksydromy",
    "Rozpoznanie toksydromu, celowane odtrutki (NAC, nalokson, NaHCO₃, emulsja tłuszczowa) oraz eliminacja trucizny.",
    {
      hx: [
        "Dokładna substancja, postać, dawka przyjęta, czas od spożycia, alkohol, leki stałe, cel (przypadkowe vs intencjonalne/samobójcze). Dostęp do opakowań/listów.",
      ],
      exam: [
        "ABCDE i identyfikacja toksydromu: opioidowy (szpilkowate źrenice, depresja oddechu), antycholinergiczny (szerokie źrenice, suchość, tachykardia, retencja), cholinergiczny (SLUDGE: ślinotok, poty, zwężone źrenice), sympatykomimetyczny (tachykardia, poty, pobudzenie), sedatywno-nasenny.",
      ],
      red: [
        "Niewydolność oddechowa (oddechy <8/min), śpiączka (GCS ≤8), poszerzenie QRS >100-120 ms lub wydłużenie QTc, złośliwa hipertermia (>39°C), kwasica metaboliczna z wysoką luką anionową, niestabilność hemodynamiczna.",
      ],
      urgent:
        "Zabezpiecz drogi oddechowe i wentylację. Natychmiast podaj tlen i zbadaj glukozę. Wykonaj 12-odprowadzeniowe EKG. W depresji oddechowej po opioidach: Nalokson 0,4 mg i.v./i.m. W poszerzeniu QRS w EKG (TLPD/leki blokujące kanał sodowy): Wodorowęglan sodu 8,4% 1-2 mmol/kg i.v. bolus!",
      question: "Czy pacjent przyjął paracetamol LUB występuje specyficzny toksydrom z odtrutką?",
      yes: {
        title: "Protokół specyficznej odtrutki i dekontaminacji",
        body: "W zatruciu paracetamolem (dawka toksyczna ≥75-100 mg/kg lub >4 g): włącz Acetylocysteinę (NAC) natychmiast, jeśli minęło >8h lub stężenie we krwi przekracza linię nomogramu Rumacka-Matthew. Węgiel aktywowany 50 g p.o., jeśli czas od spożycia <1-2h.",
        tests: [
          "Stężenie paracetamolu w surowicy po 4h od zażycia, gazometria, mleczany, AspAT/AlAT, INR, kreatynina.",
        ],
      },
      no: {
        title: "Leczenie podtrzymujące i monitorowanie",
        body: "Większość zatruć nie ma swoistej odtrutki. Kluczem jest intensywne leczenie podtrzymujące ABCDE, nawodnienie, kontrola temperatury i obserwacja.",
        tests: [
          "EKG (monitoring rytmu i przewodzenia), jonogram, luka osmolarna i anionowa w gazometrii.",
        ],
      },
      subq: {
        title: "Czy obecne kardiotoksyczność w EKG, ciężka kwasica metaboliczna lub zatrucie toksycznym alkoholem?",
        body: "Poszerzenie QRS >120 ms (blokada Na+), zaburzenia rytmu komorowe, niestabilność na lekach kardiologicznych (beta-blokery, blokery Ca2+) lub podejrzenie metanolu/glikolu (luka osmolarna >10-15 mOsm/kg, kwasica z wysoką luką anionową).",
        criteria: [
          "[TAK] Toksyczność kardiologiczna: wlew NaHCO₃, glukagon, terapia wysokimi dawkami insuliny (HIET) lub 20% emulsja lipidowa (ILE)",
          "[TAK] Toksyczne alkohole (metanol/glikol): Fomepizol / etanol + pilna hemodializa",
          "[NIE] Stabilne parametry i brak cech uszkodzenia narządowego — kontynuacja obserwacji i protokołu NAC",
        ],
      },
      subyes: {
        title: "Specjalistyczne odtrutki ratunkowe, hemodializa i konsultacja Ośrodka Ostrych Zatruć",
        type: "urgent",
        body: "Skontaktuj się natychmiast z regionalnym Ośrodkiem Informacji Toksykologicznej. W zatruciu blokerami Ca²⁺/beta-blokerami: Glukonian wapnia + protokół HIET (Insulina 1 j./kg bolus + wlew 0,5-1 j./kg/h + 20% Glukoza). W zapaści krążeniowej po lekach lipofilnych: 20% emulsja tłuszczowa (Intralipid 1,5 ml/kg bolus). W metanolu/glikolu: Etanol/Fomepizol i pilna dializoterapia.",
        tests: [
          "Ciągły zapis EKG, stężenia toksyn, koagulologia i wskaźniki uszkodzenia wątroby i nerek.",
        ],
      },
      subno: {
        title: "Wlew Acetylocysteiny (NAC) w protokole 2-workowym (lub klasycznym 3-workowym)",
        body: "W zatruciu paracetamolem podaj NAC IV wg aktualnego protokołu (np. SNAP: 100 mg/kg w 2h, potem 200 mg/kg w 10h) i kontynuuj do normalizacji INR i aminotransferaz oraz spadku paracetamolu <10 mg/l.",
        tests: [
          "Kontrola AlAT, INR i paracetamolu przed zakończeniem wlewu NAC.",
        ],
      },
      alt: {
        title: "Wypis po min. 6-12h obserwacji i obowiązkowa konsultacja psychiatryczna",
        body: "Zatrucia celowe / próby samobójcze wymagają bezwzględnej konsultacji psychiatrycznej przed opuszczeniem oddziału oraz zapewnienia bezpieczeństwa na sali (usunięcie niebezpiecznych przedmiotów, nadzór).",
        tests: [
          "Ocena gotowości do samouszkodzenia i formalna ocena ryzyka samobójczego.",
        ],
      },
      dispo: [
        "Wypis dopiero po wykluczeniu opóźnionej toksyczności (np. preparaty o zmodyfikowanym uwalnianiu), normalizacji laboratoryjnej i kwalifikacji psychiatrycznej.",
      ],
      pit: [
        "Paracetamol we wczesnej fazie przebiega całkowicie bezobjawowo mimo śmiertelnego uszkodzenia wątroby.",
        "Podanie węgla aktywowanego pacjentowi z zaburzeniami świadomości bez intubacji grozi śmiertelnym zachłystowym zapaleniem płuc.",
      ],
      logic:
        "Identyfikuj toksydrom i chroń funkcje życiowe. Czas od zażycia determinuje skuteczność dekontaminacji i odtrutek.",
      src: ["toxbase", "abcde"],
    },
    {
      hx: [
        "Przypadkowe spożycie chemii domowej (kapsułki do prania, żrące środki do rur/WC), leków dziadków (beta-blokery, leki hipotensyjne, żelazo, paracetamol), baterii guzikowej, magnesów lub nikotyny (e-papierosy). Dokładna masa ciała dziecka!",
      ],
      exam: [
        "Ślinotok, oparzenia chemiczne jamy ustnej, zapach z ust, wielkość źrenic, praca oddechowa, tętno, ciśnienie dla wieku, poziom aktywności.",
      ],
      red: [
        "Wymioty fusowate/krwawe, stridor i ślinotok po substancji żrącej (bezwzględny zakaz prowokowania wymiotów!), połykanie baterii guzikowej (pilne RTG!), letarg, drgawki, zaburzenia rytmu serca.",
      ],
      urgent:
        "Zabezpiecz ABCDE. W połknięciu substancji żrącej: NIE prowokuj wymiotów, NIE podawaj węgla ani środków zobojętniających! W podejrzeniu połknięcia baterii guzikowej: natychmiastowe RTG od szyi do miednicy i pilna gastroskopia <2h!",
      question: "Czy spożyto toksyczną dawkę leku (np. paracetamol ≥150 mg/kg, ibuprofen >400 mg/kg, 'one pill can kill')?",
      yes: {
        title: "Weryfikacja dawki toksycznej i leczenie celowane",
        body: "Ustal dawkę na kg masy ciała. Uwaga na leki, w których nawet 1 tabletka może zabić małe dziecko ('one pill can kill': blokery kanału wapniowego, beta-blokery, sulfonylomoczniki, opioidy, leki przeciwmalaryczne). W paracetamolu >150 mg/kg włącz NAC.",
        tests: [
          "Stężenie paracetamolu po 4h, glukoza, gazometria, EKG.",
        ],
      },
      no: {
        title: "Spożycie nietoksyczne / małe ryzyko",
        body: "Substancje nietoksyczne (kreda, małe ilości pasty do zębów, żel krzemionkowy) lub dawki podprogowe: dokładny wywiad, zbadanie dziecka i edukacja rodziców w zakresie zabezpieczenia leków w domu.",
        tests: [
          "Ocena jamy ustnej i zachowania dziecka.",
        ],
      },
      subq: {
        title: "Czy dziecko wykazuje zaburzenia hemodynamiczne, hipoglikemię lub drgawki?",
        body: "Hipotensja, bradykardia (blokery Ca²⁺/beta-blokery), głęboka hipoglikemia (pochodne sulfonylomocznika/alkohol) lub drgawki toksyczne.",
        criteria: [
          "[TAK] Wstrząs toksyczny, zaburzenia przewodzenia w EKG lub oporna hipoglikemia (wskazany OIT dziecięcy)",
          "[NIE] Stabilne parametry, brak objawów systemowych po okresie obserwacji",
        ],
      },
      subyes: {
        title: "Intensywna terapia toksykologiczna i pilna konsultacja OIT dziecięcego",
        type: "urgent",
        body: "Agresywna resuscytacja płynowa i farmakologiczna. W hipoglikemii po doustnych lekach przeciwcukrzycowych: oktreotyd 1-2 µg/kg s.c. W żelazie (Fe >500 µg/dl): deferoksamina IV. Wezwij anestezjologa dziecięcego.",
        tests: [
          "Ciągłe monitorowanie glikemii co 30-60 min, gazometria, elektrolity.",
        ],
      },
      subno: {
        title: "Wlew Acetylocysteiny (NAC) u dziecka wg masy ciała",
        body: "Zastosuj dożylną acetylocysteinę wg schematu pediatrycznego, ze szczególnym uwzględnieniem objętości rozcieńczalnika (5% Glukoza), aby zapobiec przewodnieniu hipoosmotycznemu i hiponatremii u małych dzieci.",
        tests: [
          "Ścisła kontrola bilansu płynów i stężenia sodu podczas wlewu.",
        ],
      },
      alt: {
        title: "Obserwacja min. 6-12h i edukacja 'Safe Kids at Home'",
        body: "Obserwacja w szpitalu przez czas zależny od kinetyki substancji. Przekaż rodzicom zalecenia dotyczące przechowywania leków i chemii w zamkniętych szafkach na wysokości poza zasięgiem dzieci.",
        tests: [
          "Ocena bezpieczeństwa domowego przed wypisem dziecka.",
        ],
      },
      dispo: [
        "Wypis po upływie okresu latencji toksycznej i pełnym powrocie prawidłowej aktywności. Pisemne zalecenia i kontakt do Ośrodka Toksykologicznego.",
      ],
      pit: [
        "Kapsułki do prania u małych dzieci wywołują ciężkie oparzenia chemiczne dróg oddechowych i obrzęk krtani.",
        "Nawet 1 tabletka leku nasercowego dziadków może być śmiertelna dla rocznego dziecka.",
      ],
      logic:
        "U dzieci większość zatruć jest przypadkowa i dotyczy małych dawek, ale wybrane leki ('one pill can kill') wymagają bezwzględnej hospitalizacji.",
      src: ["rchPois", "toxbase", "abcde"],
    },
  );

  module(
    "trauma",
    "Uraz / uraz głowy",
    "Protokół cABCDE, kontrola krwotoków (TXA, hemostaza), selekcja obrazowania głowy wg reguł NICE i PECARN.",
    {
      hx: [
        "Mechanizm urazu (wypadek komunikacyjny, upadek z wysokości, potrącenie, uraz tępy vs penetrujący), utrata przytomności, amnezja wsteczna/następcza, leki przeciwkrzepliwe (VKA, NOAC, przeciwpłytkowe), alkohol.",
      ],
      exam: [
        "Badanie wg ATLS: <c>ABCDE: krwotoki zewnętrzne, drogi oddechowe z unieruchomieniem kręgosłupa szyjnego, odma/klatka piersiowa (POCUS eFAST), miednica i brzuch, GCS/źrenice, ekspozycja i zapobieganie hipotermii.",
      ],
      red: [
        "Wstrząs krwotoczny (SBP <90 mmHg, shock index >1), GCS <13 (lub spadek o ≥2 pkt), objawy złamania podstawy czaszki (krwiaki okularowe, objaw Battle'a, wyciek płynu z nosa/ucha), niestabilna miednica, uraz penetrujący tułowia.",
      ],
      urgent:
        "Zatamuj masywne krwotoki zewnętrzne (staza taktyczna / opatrunek hemostatyczny). Zastosuj Kwas traneksamowy (TXA) 1 g i.v. w ciągu pierwszych 3h od urazu! Załóż pas miednicowy przy podejrzeniu złamania miednicy. W odmie prężnej: natychmiastowe odbarczenie igłowe/torakostomia!",
      question: "Czy pacjent wymaga pilnego TK głowy wg kryteriów NICE Head Injury?",
      yes: {
        title: "Pilne TK głowy (<1h) / Whole Body CT (Politrauma)",
        body: "NICE CG176: TK głowy w ciągu 1h przy: GCS <13 przy wstępnej ocenie, GCS <15 po 2h, podejrzeniu złamania otwartego/podstawy czaszki, drgawkach pourazowych, deficycie ogniskowym lub >1 epizodzie wymiotów. U chorych na lekach przeciwkrzepliwych z urazem głowy: TK zawsze w ciągu 8h.",
        tests: [
          "Pilne TK głowy bez kontrastu, eFAST (jama brzuszna, opłucna, osierdzie).",
        ],
      },
      no: {
        title: "Łagodny uraz głowy / brak wskazań do natychmiastowego TK",
        body: "Pacjent stabilny, GCS 15, bez czerwonych flag NICE, bez antykoagulacji. Obserwacja kliniczna, badanie neurologiczne i ewentualne zaopatrzenie ran powierzchownych.",
        tests: [
          "Ocena bólu głowy, nudności i pamięci zdarzenia.",
        ],
      },
      subq: {
        title: "Czy w TK krwotok wewnątrzczaszkowy LUB wstrząs krwotoczny w eFAST/urazie miednicy?",
        body: "Krwiak przymózgowy (podtwardówkowy/nadtwardówkowy), krwotok podpajęczynówkowy LUB wolny płyn w jamie brzusznej w eFAST i niestabilność krążeniowa.",
        criteria: [
          "[TAK] Krwotok wewnątrzczaszkowy wymagający pilnej neurochirurgii i odwrócenia antykoagulacji",
          "[TAK] Wstrząs krwotoczny z krwawieniem do jamy brzusznej/miednicy (aktywacja MTP i pilna laparotomia/embolizacja)",
          "[NIE] Prawidłowe TK głowy i stabilne narządy w badaniu urazowym"
        ],
      },
      subyes: {
        title: "Masywny protokół transfuzji (MTP 1:1:1), pilna operacja / neurochirurgia",
        type: "urgent",
        body: "Wstrząs krwotoczny: aktywuj protokół masywnej transfuzji (MTP: KKCz, FFP, KKP w stosunku 1:1:1), kontynuuj TXA (1 g wlew w 8h), utrzymuj normotermię i docelowe SBP 80-90 mmHg (hipotensja permisywna, chyba że towarzyszy uraz mózgu — wtedy SBP ≥100-110). W krwawieniu OUN: natychmiastowe odwrócenie antykoagulacji (PCC/idarucizumab).",
        tests: [
          "Morfologia, gazometria z mleczanem i BE, koagulologia (INR, fibrynogen >1,5-2 g/l), grupa krwi i próba zgodności.",
        ],
      },
      subno: {
        title: "Obserwacja na oddziale chirurgicznym / strefie urazowej",
        body: "Przy wstrząśnieniu mózgu lub drobnych stłuczeniach: obserwacja neurologiczna (seryjna karta GCS co 30-60 min), leczenie przeciwbólowe (paracetamol; unikaj NLPZ w ostrej fazie krwawienia) i kontrola rany.",
        tests: [
          "Kontrolne badanie neurologiczne i weryfikacja pionizacji.",
        ],
      },
      alt: {
        title: "Bezpieczny wypis z pisemną instrukcją urazu głowy (Head Injury Advice Sheet)",
        body: "Wypis do domu wyłącznie pod opiekę dorosłej osoby na co najmniej 24 h. Pisemna instrukcja objawów alarmowych: nasilający się ból głowy, uporczywe wymioty, senność, asymetria źrenic, wyciek płynu z nosa/ucha.",
        tests: [
          "Zapewnienie zrozumienia zaleceń przez pacjenta i osobę towarzyszącą.",
        ],
      },
      dispo: [
        "Wypis po łagodnym urazie z pisemną kartą powrotu. Hospitalizacja przy jakimkolwiek krwawieniu w TK, GCS <15, braku opieki domowej lub urazie wielomiejscowym.",
      ],
      pit: [
        "U pacjenta przyjmującego leki przeciwkrzepliwe (NOAC/VKA) nawet błahy uraz głowy bez utraty przytomności może wywołać śmiertelny powolny krwiak podtwardówkowy.",
        "Unieruchomienie kręgosłupa szyjnego musi trwać do czasu formalnego wykluczenia urazu (Nexus / Canadian C-Spine Rule).",
      ],
      logic:
        "Najpierw zatamuj krwotok zagrażający życiu i zabezpiecz drogi oddechowe. Reguły NICE precyzyjnie selekcjonują chorych do pilnego TK głowy.",
      src: ["atls", "niceSeiz", "abcde"],
    },
    {
      hx: [
        "Wysokość upadku (>0,9 m u dzieci <2 lat lub >1,5 m u starszych = mechanizm ciężki), uderzenie twardym przedmiotem, wypadek komunikacyjny, utrata przytomności (czas), epizod bezdechu, wymioty, drażliwość, zmiana zachowania, możliwość urazu nieprzypadkowego (NAT / zespół dziecka maltretowanego).",
      ],
      exam: [
        "Badanie ABCDE, pediatryczne GCS (pGCS), wyczuwalny krwiak podczepcowy (zwłaszcza potyliczny/ciemieniowy/skroniowy u niemowląt), napięcie ciemiączka, źrenice, ocena całego ciała w poszukiwaniu nietypowych siniaków (TEN-4-FACES).",
      ],
      red: [
        "pGCS <14 (lub <15 u dzieci <2 lat), wyczuwalne wgniecenie kości czaszki, objawy złamania podstawy czaszki, duży krwiak podczepcowy u niemowlęcia, napad drgawkowy, podejrzenie przemocy fizycznej (NAT).",
      ],
      urgent:
        "Zabezpiecz oddech i kręgosłup szyjny. Natychmiast wezwij chirurga dziecięcego i anestezjologa. U niemowląt z krwotokiem podczepcowym lub wstrząsem: pilne przetoczenie płynów (bolus 20 ml/kg) i KKCz (niemowlę może wykrwawić się do przestrzeni podczepcowej!).",
      question: "Czy dziecko spełnia kryteria wysokiego lub pośredniego ryzyka wg reguły PECARN?",
      yes: {
        title: "PECARN: Wskazanie do TK głowy vs aktywna obserwacja",
        body: "Reguła PECARN (ryzyko ciTBI - klinicznie istotnego urazu mózgu): Wiek <2 lat: GCS <15, wyczuwalne złamanie lub zmiana zachowania → pilne TK (<1h). Duży krwiak potyliczny/skroniowy, upadek >0,9 m lub utrata przytomności >5 s → obserwacja 4-6h lub TK wg decyzji lekarza i rodziców. Wiek ≥2 lat: GCS <15, objawy złamania podstawy → pilne TK. Upadek >1,5 m, utrata przytomności, wymioty, silny ból głowy → obserwacja vs TK.",
        tests: [
          "TK głowy niskodawkowe (low-dose pediatric protocol) lub dedykowana obserwacja kliniczna na oddziale.",
        ],
      },
      no: {
        title: "PECARN bardzo niskie ryzyko (ciTBI <0,05%) — bez TK",
        body: "Brak kryteriów PECARN oznacza ryzyko powikłań <0,02-0,05%. Ryzyko nowotworu indukowanego promieniowaniem z TK głowy znacznie przewyższa ryzyko urazu. TK jest niewskazane.",
        tests: [
          "Brak wskazań do rutynowego RTG czaszki (RTG nie wyklucza krwawienia wewnątrzczaszkowego).",
        ],
      },
      subq: {
        title: "Czy TK wykazuje złamanie kości / krwotok LUB stan dziecka pogarsza się w obserwacji?",
        body: "Potwierdzenie krwiaka nadtwardówkowego/podtwardówkowego, stłuczenia mózgu lub wgniecenia czaszki LUB narastające wymioty, senność i spadek pGCS.",
        criteria: [
          "[TAK] Zmiana pourazowa w TK lub pogorszenie pGCS wymagające pilnej neurochirurgii dziecięcej",
          "[NIE] Prawidłowy obraz TK lub całkowite ustąpienie objawów podczas 4-6h obserwacji szpitalnej",
        ],
      },
      subyes: {
        title: "Pilna neurochirurgia dziecięca, neuroprotekcja i transport do centrum urazowego",
        type: "urgent",
        body: "Natychmiastowy kontakt z referencyjnym ośrodkiem neurochirurgii dziecięcej. Uniesienie głowy 30°, utrzymanie prawidłowego utlenowania i normotensji. W razie objawów wzrostu ICP/wgłobienia: bolus 3% NaCl (2-5 ml/kg IV) lub mannitol.",
        tests: [
          "Pilna kwalifikacja do ewakuacji krwiaka / kraniotomii odbarczającej.",
        ],
      },
      subno: {
        title: "Zakończenie pomyślnej obserwacji szpitalnej (4-6h)",
        body: "Dziecko aktywne, pije płyny, nie wymiotuje, pGCS 15. Możliwy bezpieczny wypis do domu pod warunkiem wiarygodnej opieki rodziców.",
        tests: [
          "Próba pojenia i kontrola neurologiczna przed wypisem.",
        ],
      },
      alt: {
        title: "Edukacja rodziców i pediatryczna karta alarmowa po urazie głowy",
        body: "Wydaj pisemną kartę obserwacji domowej: budzenie dziecka 2-3 razy w nocy w celu sprawdzenia reaktywności, natychmiastowy powrót przy: wymiotach >1 raz, trudności w wybudzeniu, nietypowym płaczu, wiotkości lub wycieku płynu z nosa/ucha.",
        tests: [
          "Sprawdzenie zrozumienia objawów alarmowych przez opiekunów.",
        ],
      },
      dispo: [
        "Wypis po wykluczeniu ciTBI wg PECARN i min. 4-6h bezobjawowej obserwacji. Każde podejrzenie urazu nieprzypadkowego (NAT) wymaga zatrzymania dziecka w szpitalu i zgłoszenia.",
      ],
      pit: [
        "Promieniowanie jonizujące z TK głowy u małych dzieci wiąże się ze statystycznym ryzykiem nowotworów OUN; stosuj regułę PECARN, aby unikać niepotrzebnych badań.",
        "RTG czaszki nie wykrywa krwiaków śródczaszkowych i nie powinno zastępować obserwacji klinicznej ani TK.",
      ],
      logic:
        "Reguła PECARN pozwala bezpiecznie zrezygnować z TK u dzieci z grupy bardzo niskiego ryzyka, identyfikując jednocześnie pacjentów wymagających natychmiastowej interwencji.",
      src: ["pecarn", "atls", "abcde"],
    },
  );

  module(
    "arrhythmia",
    "Zaburzenia rytmu / kołatanie serca",
    "Algorytmy peri-arrest ERC/RCUK: kardiowersja elektryczna w niestabilności, wąski vs szeroki QRS, manewry wagalne i adenozyna.",
    {
      hx: [
        "Nagłe kołatanie serca, duszność, zawroty głowy, ból w klatce piersiowej, omdlenie. Wywiad kardiologiczny (zawał, niewydolność serca, wady zastawek), leki antyarytmiczne, leki wydłużające QT, używki (kofeina, amfetamina, kokaina).",
      ],
      exam: [
        "ABCDE, 12-odprowadzeniowe EKG natychmiast: cechy niestabilności (wstrząs, omdlenie, niedokrwienie, obrzęk płuc), częstość rytmu, szerokość QRS (wąski <120 ms vs szeroki ≥120 ms), miarowość.",
      ],
      red: [
        "Wstrząs, omdlenie, ból w klatce piersiowej, obrzęk płuc, VT bez tętna (natychmiastowy protokół defibrylacji RKO), bradykardia z pauzami >3 s lub blokiem AV II° Mobitz II / III°.",
      ],
      urgent:
        "W obecności objawów niepokojących (wstrząs, omdlenie, niedokrwienie, obrzęk płuc): w tachyarytmii wykonaj natychmiastową Kardiowersję Elektryczną zsynchronizowaną (w sedacji/analgezji; 70-120 J w wąskim, 120-150 J w szerokim QRS); w bradyarytmii podaj Atropinę 0,5 mg i.v. lub włącz stymulację przezskórną (TCP)!",
      question: "Czy pacjent jest stabilny hemodynamicznie (brak 4 objawów niepokojących ERC)?",
      yes: {
        title: "Algorytm tachy-/bradyarytmii u pacjenta stabilnego",
        body: "Wąski miarowy QRS (SVT): manewr Valsalvy (zmodyfikowany REVERT) → Adenozyna 6 mg i.v. szybki bolus (+20 ml NaCl) → 12 mg i.v. → 12 mg i.v. Wąski niemiarowy QRS (AF/AFL): kontrola częstości (beta-bloker) + ocena CHA₂DS₂-VA i HAS-BLED. Szeroki miarowy QRS (VT): Amiodaron 300 mg i.v. w 20-60 min.",
        tests: [
          "12-odprowadzeniowe EKG, troponina, elektrolity (K+, Mg2+, Ca2+), gazometria, TSH.",
        ],
      },
      no: {
        title: "Kardiowersja elektryczna / Stymulacja przezskórna",
        body: "Niestabilność hemodynamiczna wymaga natychmiastowej interwencji elektrycznej. Przygotuj defibrylator w trybie synchronicznym (SYNC), leki do sedacji (midazolam/fentanyl/etomidat) i wykonaj do 3 prób kardiowersji.",
        tests: [
          "Potwierdzenie znacznika SYNC na załamkach R defibrylatora przed wyładowaniem.",
        ],
      },
      subq: {
        title: "Czy tachyarytmia oporna na kardiowersję LUB podejrzenie AF z preekscytacją (WPW)?",
        body: "Nawracający częstoskurcz komorowy (burza elektryczna), migotanie przedsionków z przewodzeniem przez drogę dodatkową (szerokie niemiarowe QRS w AF z WPW — bezwzględny zakaz leków blokujących węzeł AV: adenozyny, beta-blokerów, digoksyny, werapamilu!).",
        criteria: [
          "[TAK] AF z WPW lub oporna tachyarytmia komorowa (pilna kardiowersja / Amiodaron / konsultacja elektrofizjologa)",
          "[TAK] Blok serca wysokiego stopnia wymagający elektrody endokawitarnej / stałego rozrusznika",
          "[NIE] Skuteczna kardiowersja farmakologiczna/elektryczna i powrót rytmu zatokowego",
        ],
      },
      subyes: {
        title: "Pilna konsultacja elektrofizjologiczna, OIOK i czasowa stymulacja / ablacja",
        type: "urgent",
        body: "Przyjęcie na Oddział Intensywnej Opieki Kardiologicznej (OIOK). W AF z WPW lekiem z wyboru jest kardiowersja elektryczna (lub ibutylid). W objawowej bradykardii opornej na atropinę: wlew adrenaliny (2-10 µg/min) lub izoprenaliny i czasowa stymulacja endokawitarna (TVP).",
        tests: [
          "Ciągły zapis telemetrii EKG, Echo serca, ocena powikłań zatorowych.",
        ],
      },
      subno: {
        title: "Włączenie antykoagulacji wg CHA₂DS₂-VA i kontrola rytmu/częstości",
        body: "W nowo rozpoznanym migotaniu przedsionków: oceń skale CHA₂DS₂-VA i HAS-BLED. Włącz NOAC/DOAC przy wskazaniach. Nie wykonuj kardiowersji po >48h od początku AF bez wcześniejszego wykluczenia skrzepliny w uszku lewego przedsionka (Echo przezprzełykowe TEE) lub 3-tygodniowej skutecznej antykoagulacji!",
        tests: [
          "Ocena czasu trwania epizodu AF (<48h vs ≥48h / czas nieznany), TEE przed planowaną kardiowersją.",
        ],
      },
      alt: {
        title: "Plan diagnostyki ambulatoryjnej: Holter EKG, próba wysiłkowa i poradnia zaburzeń rytmu",
        body: "Pacjent stabilny po przerwaniu napadu SVT lub z łagodnymi zaburzeniami rytmu (np. dodatkowe pobudzenia komorowe/nadkomorowe): skierowanie do planowej diagnostyki (Holter EKG 24-48h, Echo, próba wysiłkowa) i kwalifikacji do ablacji RF.",
        tests: [
          "Nauka samodzielnego wykonywania manewru Valsalvy w razie nawrotu SVT.",
        ],
      },
      dispo: [
        "Hospitalizacja w arytmiach komorowych, niestabilności, nowym AF wymagającym diagnostyki lub bradykardii wysokiego stopnia. Wypis po niepowikłanym przerwaniu napadowego SVT.",
      ],
      pit: [
        "Podanie adenozyny, beta-blokerów lub blokerów kanału wapniowego w AF z zespołem WPW może wywołać migotanie komór (VF) i zatrzymanie krążenia!",
        "Niewłączenie trybu SYNC podczas kardiowersji częstoskurczu grozi wyładowaniem na załamek T (zjawisko R-na-T) i indukcją VF.",
      ],
      logic:
        "Obecność objawów niepokojących nakazuje natychmiastową terapię elektryczną. U stabilnych chorych decyduje szerokość i miarowość zespołu QRS.",
      src: ["ercArr", "chest", "abcde"],
    },
    {
      hx: [
        "Niemowlę z niepokojem, trudnościami w karmieniu, bladością, tachypnoë LUB starsze dziecko zgłaszające nagłe kołatanie serca („serce bije jak u ptaszka”), zawroty głowy, ból w klatce piersiowej. Wrodzona wada serca, gorączka, leki.",
      ],
      exam: [
        "HR w spoczynku dla wieku (u niemowląt SVT to zwykle HR >220/min, u starszych dzieci >180/min, stała sztywna częstość bez zmienności oddechowej!). Cechy niewydolności krążenia: CRT >3s, hepatomegalia, chłodne kończyny, obniżone ciśnienie.",
      ],
      red: [
        "Niewydolność krążenia / wstrząs kardiogenny (wąskie tętno, CRT >3-4s, wiotkość, kwasica), szeroki zespół QRS (>90 ms u małych dzieci, >120 ms u starszych), utrata przytomności.",
      ],
      urgent:
        "W niestabilnym SVT z zaburzeniami perfuzji: wykonaj natychmiastową Kardiowersję Elektryczną zsynchronizowaną: 1 J/kg (w razie nieskuteczności 2 J/kg)! W stabilnym SVT: natychmiastowe manewry wagalne (u niemowląt: okład z lodu na twarz na 10-15 s; u starszych dzieci: dmuchanie do strzykawki)!",
      question: "Czy manewry wagalne przerwały częstoskurcz nadkomorowy (SVT)?",
      yes: {
        title: "Rytm zatokowy przywrócony — diagnostyka WPW i monitoring",
        body: "Wykonaj pełne 12-odprowadzeniowe EKG po powrocie rytmu zatokowego w poszukiwaniu cech preekscytacji (fala delta, krótki PR w zespole WPW). Monitoruj dziecko kardiomonitorem.",
        tests: [
          "12-odprowadzeniowe EKG, gazometria, glikemia, elektrolity.",
        ],
      },
      no: {
        title: "Podanie Adenozyny w szybkim bolusie IV/IO",
        body: "Zabezpiecz dostęp IV jak najbliżej serca (najlepiej żyły dołu łokciowego). Podaj Adenozynę w szybkim bolusie metodą dwóch strzykawek: I dawka 0,1 mg/kg (max 6 mg) + natychmiast 5-10 ml 0,9% NaCl. Przy braku efektu po 1-2 min: II dawka 0,2 mg/kg (max 12 mg).",
        tests: [
          "Ciągły zapis paska EKG w trakcie podawania adenozyny.",
        ],
      },
      subq: {
        title: "Czy SVT oporne na adenozynę LUB szeroki zespół QRS (VT)?",
        body: "Brak konwersji do rytmu zatokowego po 2 dawkach adenozyny LUB częstoskurcz z szerokimi zespołami QRS (VT / SVT z aberracją).",
        criteria: [
          "[TAK] Oporny częstoskurcz lub VT wymagający pilnej kardiologii dziecięcej, Amiodaronu lub kardiowersji",
          "[NIE] Skuteczna kardiowersja farmakologiczna adenozyną i stabilny rytm zatokowy",
        ],
      },
      subyes: {
        title: "Kardiowersja zsynchronizowana (1-2 J/kg) / Amiodaron IV i kontakt z kardiologią dziecięcą",
        type: "urgent",
        body: "Przy narastającej niewydolności krążenia: kardiowersja zsynchronizowana 1-2 J/kg w sedacji. Przy zachowanej stabilności: Amiodaron 5 mg/kg IV we wlewie przez 20-60 min. Pilna konsultacja z referencyjnym ośrodkiem kardiologii dziecięcej.",
        tests: [
          "Echo serca w celu wykluczenia wady wrodzonej serca i kardiomiopatii.",
        ],
      },
      subno: {
        title: "Obserwacja kardiologiczna i telemetria na oddziale pediatrycznym",
        body: "Hospitalizacja dziecka na sali wzmożonego nadzoru z telemetrią. Wyjaśnij rodzinie charakter schorzenia i wdrożenie przewlekłego leczenia przeciwarytmicznego (np. propranolol u niemowląt).",
        tests: [
          "Konsultacja kardiologa dziecięcego i planowe badanie echokardiograficzne.",
        ],
      },
      alt: {
        title: "Edukacja rodziców w rozpoznawaniu SVT i manewrach wagalnych",
        body: "Naucz rodziców prawidłowego pomiaru tętna oraz techniki okładu z lodu (worek z lodem owinięty wilgotną gazą przyłożony do czoła i nasady nosa dziecka na 10-15 sekund z zabezpieczeniem dróg oddechowych; NIE uciski gałek ocznych!).",
        tests: [
          "Wydanie pisemnego planu postępowania w razie nawrotu tachyarytmii.",
        ],
      },
      dispo: [
        "Każdy pierwszy epizod SVT u dziecka wymaga hospitalizacji i oceny kardiologicznej. Wypis tylko u dzieci z ustalonym rozpoznaniem po krótkim, opanowanym epizodzie.",
      ],
      pit: [
        "Niemowlę z częstoskurczem nadkomorowym może manifestować objawy jako 'sepsa' lub 'kolka' z powodu postępującej niewydolności serca i hepatomegalii.",
        "Uciskanie gałek ocznych u dzieci jest bezwzględnie przeciwwskazane (ryzyko odwarstwienia siatkówki!).",
      ],
      logic:
        "Sztywna tachykardia >220/min u niemowlęcia to niemal zawsze SVT. Szybkie manewry wagalne z lodem lub adenozyna przerywają pętlę reentry.",
      src: ["rchArr", "ercArr", "abcde"],
    },
  );

  module(
    "metabolic",
    "Stany nagłe metaboliczno-elektrolitowe",
    "Postępowanie w zagrażającej życiu hiperkaliemii, kwasicy ketonowej (DKA/HHS), przełomie nadnerczowym i ostrej hiponatremii.",
    {
      hx: [
        "Cukrzyca typu 1 lub 2 (brak insuliny, infekcja, pompa), przewlekła choroba nerek (pominięta dializa, leki: ACE-I/ARB, spironolakton), choroba Addisona / przewlekła sterydoterapia, polidypsja, wymioty/biegunka, diuretyki.",
      ],
      exam: [
        "ABCDE: Hiperkaliemia (osłabienie mięśniowe, bradykardia, wysokie spiczaste załamki T, fala sinusoidalna); DKA/HHS (oddech Kussmaula, zapach acetonu, odwodnienie, kwasica); Przełom nadnerczowy (oporny wstrząs, hipoglikemia, hiponatremia z hiperkaliemią).",
      ],
      red: [
        "Zmiany w EKG w hiperkaliemii (poszerzenie QRS, fala sinusoidalna — stan przedzatrzymaniowy!), ciężka kwasica (pH <7,0, HCO₃⁻ <5 mmol/l), wstrząs oporny na płynoterapię, osmolalność osocza >320 mOsm/kg z zaburzeniami świadomości w HHS.",
      ],
      urgent:
        "W hiperkaliemii ze zmianami w EKG: natychmiast Glukonian wapnia 10% 10-20 ml i.v. powoli (ochrona serca)! W przełomie nadnerczowym: Hydrokortyzon 100 mg i.v. bolus + 1000 ml 0,9% NaCl! W DKA: natychmiastowa resuscytacja płynowa 1000 ml 0,9% NaCl w 1h (NIE podawaj bolusa insuliny przed nawodnieniem i sprawdzeniem K+!).",
      question: "Czy wiodącym problemem jest ciężka hiperkaliemia (K⁺ ≥6,5 mmol/l lub zmiany w EKG)?",
      yes: {
        title: "Protokół ratunkowy hiperkaliemii (ERC / Renal Association)",
        body: "1. Stabilizacja błony: Glukonian wapnia 10% 10 ml i.v. w 5 min (powtórz po 5-10 min przy braku poprawy w EKG). 2. Przesunięcie K⁺ do komórek: Insulina krótzkodziałająca 10 j. w 50 ml 20% Glukozy i.v. w 15-30 min ORAZ Salbutamol 10-20 mg w nebulizacji. 3. Eliminacja K⁺ z ustroju: Furosemid 40-80 mg i.v. lub pilna hemodializa.",
        tests: [
          "Seryjna kontrola gazometrii, jonogramu i 12-odprowadzeniowego EKG co 30-60 min.",
        ],
      },
      no: {
        title: "Ścieżka DKA / HHS / Przełom nadnerczowy",
        body: "DKA: pH <7,3, HCO₃⁻ <15, ketonemia >3,0 mmol/l → nawadnianie 0,9% NaCl + wlew insuliny 0,1 j./kg/h (po weryfikacji K+ >3,5 mmol/l!). HHS: glikemia >30 mmol/l, osmolalność >320 mOsm/kg → ostrożna rehydratacja i HDCz. Przełom nadnerczowy: Hydrokortyzon 100 mg i.v. co 6h + wlew 0,9% NaCl z glukozą.",
        tests: [
          "Gazometria tętnicza/żylna, ketonemia z krwi włośniczkowej, luka anionowa, elektrolity, mocznik, kreatynina.",
        ],
      },
      subq: {
        title: "Czy występuje oporna hiperkaliemia (wskazanie do dializy) LUB obrzęk mózgu / zapaść w DKA/HHS?",
        body: "Hiperkaliemia oporna na farmakoterapię u pacjenta bezmoczem/schyłkową niewydolnością nerek LUB nagłe pogorszenie neurologiczne w trakcie leczenia DKA (ból głowy, bradykardia, spadek GCS — obrzęk mózgu!).",
        criteria: [
          "[TAK] Bezwzględne wskazanie do pilnej hemodializy w hiperkaliemii (stacja dializ / OIT)",
          "[TAK] Objawy obrzęku mózgu w DKA (natychmiast 3% NaCl 200-300 ml lub mannitol)",
          "[NIE] Stabilna redukcja glikemii/potasu i zamykanie luki anionowej w protokole oddziałowym",
        ],
      },
      subyes: {
        title: "Pilna hemodializa / Terapia obrzęku mózgu na OIT",
        type: "urgent",
        body: "Pilny kontakt ze stacją dializ i nefrologiem w celu kaniulacji naczyniowej i hemodializy ratunkowej. W podejrzeniu obrzęku mózgu w DKA: unieś głowę 30°, zmniejsz tempo płynów o połowę i podaj hipertoniczny NaCl (3% 200 ml w 20 min) lub Mannitol (0,5-1 g/kg IV).",
        tests: [
          "Pilna gazometria, elektrolity i konsultacja anestezjologiczna.",
        ],
      },
      subno: {
        title: "Kontynuacja protokołu DKA/HHS: suplementacja K⁺ i wyrównywanie luki",
        body: "Dodaj KCl do płynów infuzyjnych (cel K⁺ 4,0-5,0 mmol/l; podawanie insuliny gwałtownie obniża potas!). Gdy glikemia spadnie <14 mmol/l (<250 mg/dl), dołącz 5% lub 10% Glukozę do płynoterapii, aby umożliwić kontynuację wlewu insuliny aż do ustąpienia kwasicy (HCO₃⁻ >18, pH >7,3, ketony <0,6).",
        tests: [
          "Glikemia co 1h, jonogram, gazometria i luka anionowa co 2-4h.",
        ],
      },
      alt: {
        title: "Leczenie ciężkiej hiponatremii (reguła Adrogué-Madias i limit 8-10 mmol/l/24h)",
        body: "Objawowa ostra hiponatremia z drgawkami/śpiączką: bolus 100-150 ml 3% NaCl w 10 min (podniesienie sodu o 4-6 mmol/l w celu opanowania obrzęku mózgu). W przewlekłej hiponatremii: ścisły limit korekty ≤8-10 mmol/l na 24h, aby zapobiec mielinolizie pośrodkowej mostu (ODS)!",
        tests: [
          "Jonogram co 2h przy ostrym wyrównywaniu, kontrola wzoru Adrogué-Madias.",
        ],
      },
      dispo: [
        "Wszystkie ciężkie zaburzenia metaboliczne (DKA, HHS, K ≥6,5, przełom nadnerczowy) wymagają hospitalizacji na OIT lub sali intensywnego nadzoru internistycznego.",
      ],
      pit: [
        "Podanie insuliny przed podaniem wapnia w hiperkaliemii ze zmianami w EKG może doprowadzić do nagłego zatrzymania krążenia w mechanizmie asystolii lub VF.",
        "Zbyt szybka korekta przewlekłej hiponatremii (>10-12 mmol/l/24h) powoduje nieodwracalny zespół demielinizacji osmotycznej (mielinolizę mostu).",
      ],
      logic:
        "Wapń ratuje serce w hiperkaliemii, ale nie usuwa potasu z organizmu. W DKA kluczem jest nawodnienie i potas, a nie sam spadek poziomu glukozy.",
      src: ["jbds", "abcde"],
    },
    {
      hx: [
        "Nowo rozpoznana cukrzyca u dziecka (polidypsja, poliuria, moczenie nocne, chudnięcie), znana cukrzyca (pominięte dawki, awaria pompy), wrodzony przerost nadnerczy (WPN / CAH: wymioty, utrata soli u noworodka), odwodnienie, leki.",
      ],
      exam: [
        "ABCDE z normami wieku: oddech kwasiczy Kussmaula, zapach acetonu, odwodnienie (zapadnięte ciemiączko, suche śluzówki, CRT >3s), tachykardia, senność, letarg.",
      ],
      red: [
        "Zaburzenia świadomości (pGCS <14, letarg), ból głowy i wymioty w trakcie leczenia DKA (ostry obrzęk mózgu!), hiperkaliemia ze zmianami w EKG, wiek niemowlęcy z niewyjaśnionym wstrząsem (podejrzenie kryzysu solnego w WPN).",
      ],
      urgent:
        "W kwasicy ketonowej u dziecka: rozpocznij powolną, ostrożną rehydratację roztworem izotonicznym (0,9% NaCl / Plasmalyte) 10-20 ml/kg w 1-2h (UNIKAJ szybkich bolusów, jeśli brak wstrząsu — ryzyko obrzęku mózgu!). Wlew insuliny 0,05-0,1 j./kg/h rozpocznij dopiero po 1-2h nawadniania i po potwierdzeniu K+! W podejrzeniu WPN: Hydrokortyzon 25-50 mg IV!",
      question: "Czy u dziecka z DKA występują wczesne objawy obrzęku mózgu (ból głowy, bradykardia, senność)?",
      yes: {
        title: "Protokół leczenia obrzęku mózgu w pediatrycznym DKA (ISPAD / RCH)",
        body: "Obrzęk mózgu jest główną przyczyną zgonu dzieci w DKA (ryzyko największe przy zbyt szybkim spadku osmolalności i nadmiernej płynoterapii). Natychmiast: 1. Zmniejsz tempo płynów infuzyjnych o 30-50%. 2. Podaj 3% NaCl 3-5 ml/kg IV w 10-15 min (lub Mannitol 0,5-1 g/kg IV w 20 min). 3. Unieś wezgłowie o 30° i wezwij OIT dziecięcy.",
        tests: [
          "Pilna gazometria, jonogram, ocena neurologiczna (źrenice, pGCS) co 15 min.",
        ],
      },
      no: {
        title: "Standardowy pediatryczny protokół DKA (ISPAD)",
        body: "Oblicz zapotrzebowanie płynowe: deficyt płynowy (szacowany na 5-10%) wyrównuj równomiernie przez 48 godzin (nigdy szybciej!) łącznie z zapotrzebowaniem podstawowym wg Holliday-Segar. Wlew insuliny 0,05-0,1 j./kg/h bez bolusa wstępnego.",
        tests: [
          "Glikemia co 1h, gazometria kapilarna, K+, Na+, Ca2+, mocznik co 2-4h.",
        ],
      },
      subq: {
        title: "Czy spadek glikemii <14-17 mmol/l (250-300 mg/dl) LUB hipokaliemia <3,5 mmol/l?",
        body: "Gdy glikemia spadnie do ~250 mg/dl, należy natychmiast dodać glukozę do płynów, aby zapobiec gwałtownemu spadkowi osmolalności osocza i hipoglikemii, utrzymując jednocześnie stały wlew insuliny.",
        criteria: [
          "[TAK] Glikemia <14-17 mmol/l: zmiana płynu na 0,9% NaCl z 5% lub 10% Glukozą i suplementacja KCl",
          "[NIE] Glikemia >17 mmol/l: kontynuacja roztworu izotonicznego z potasem (20-40 mmol/l KCl)",
        ],
      },
      subyes: {
        title: "Włączenie roztworu glukozowo-solnego (tzw. technika dwóch worków)",
        body: "Dołącz 5% lub 10% glukozę do wlewu płynów izotonicznych. Utrzymuj glikemię w granicach 150-200 mg/dl (8-12 mmol/l), nie przerywając wlewu insuliny, dopóki gazometria nie wykaże ustąpienia kwasicy (HCO₃⁻ >15 mmol/l, pH >7,30).",
        tests: [
          "Glikemia godzinowa, kontrola luki anionowej.",
        ],
      },
      subno: {
        title: "Kontynuacja wyrównywania deficytu i monitorowanie parametrów życiowych",
        body: "Ścisły nadzór na oddziale intensywnej opieki pediatrycznej / sali wzmożonego nadzoru. Regularna ocena odruchów neurologicznych, bilansu płynów i diurezy.",
        tests: [
          "Ciągły zapis kardiomonitora i pulsoksymetrii.",
        ],
      },
      alt: {
        title: "Kryzys solny u noworodka (WPN) / wrodzone wady metabolizmu",
        body: "Noworodek w 1.-3. tygodniu życia z wymiotami, wiotkością, hiponatremią i hiperkaliemią: natychmiastowe podejrzenie zespołu utraty soli w przebiegu wrodzonego przerostu nadnerczy (WPN). Resuscytacja 0,9% NaCl + glukoza i Hydrokortyzon.",
        tests: [
          "Gazometria, 17-OH-progesteron, renina, elektrolity, konsultacja endokrynologa dziecięcego.",
        ],
      },
      dispo: [
        "Dziecięce DKA i ciężkie zaburzenia metaboliczne bezwzględnie wymagają hospitalizacji na oddziale pediatrycznym z możliwością intensywnego nadzoru.",
      ],
      pit: [
        "Szybkie wlewy hipotonicznych płynów lub bolusy insuliny u dzieci z DKA są bezpośrednią przyczyną śmiertelnego obrzęku mózgu.",
        "Nigdy nie podawaj wodorowęglanu sodu (NaHCO₃) w dziecięcym DKA (zwiększa ryzyko obrzęku mózgu i kwasicy wewnątrzkomórkowej OUN!).",
      ],
      logic:
        "W dziecięcym DKA nadrzędnym celem jest zapobieganie obrzękowi mózgu poprzez powolne, 48-godzinne wyrównywanie płynów roztworami izotonicznymi.",
      src: ["rchDka", "jbds", "abcde"],
    },
  );

  module(
    "urogyn",
    "Ostre stany urologiczno-ginekologiczne",
    "Różnicowanie kolki nerkowej z urosepsą, ostrego zatrzymania moczu, skrętu jądra/jajnika oraz krwawień we wczesnej ciąży (ciąża ektopowa).",
    {
      hx: [
        "Ból okolicy lędźwiowej promieniujący do pachwiny (kolka), gorączka/dreszcze, trudności w oddawaniu moczu / zatrzymanie moczu, ból podbrzusza u kobiet, data ostatniej miesiączki (LMP), krwawienie z dróg rodnych, omdlenie, nagły ból moszny u mężczyzn.",
      ],
      exam: [
        "ABCDE: objaw Goldflama, objawy otrzewnowe, badanie pęcherza moczowego; test ciążowy (β-hCG) u KAŻDEJ kobiety w wieku rozrodczym z bólem brzucha/omdleniem!; badanie moszny (uniesienie jądra, brak odruchu mięśnia dźwigacza w skręcie).",
      ],
      red: [
        "Kolka nerkowa z gorączką/dreszczami (zakażone wodonercze — stan zagrożenia sepsą wymagający pilnego odbarczenia!), dodatni test ciążowy z bólem brzucha/wstrząsem (pęknięta ciąża ektopowa), nagły asymetryczny ból jądra (okno niedokrwienia 4-6h!), ostre zatrzymanie moczu z powikłaniem AKI.",
      ],
      urgent:
        "Przy podejrzeniu pękniętej ciąży ektopowej: natychmiast 2 grube kaniule IV, płynoterapia, grupa krwi i pilna laparoskopia ginekologiczna! W skręcie jądra: pilna konsultacja urologiczna i eksploracja moszny <6h (nie opóźniaj operacji oczekiwaniem na USG Doppler!). W kolce z gorączką i zastojem w nerce: pilne odbarczenie (DJ / nefrostomia) i antybiotykoterapia sepsy!",
      question: "Czy pacjentka w wieku rozrodczym z dodatnim testem ciążowym (β-hCG) LUB podejrzenie skrętu jądra?",
      yes: {
        title: "Pilna ścieżka chirurgiczna: ciąża ektopowa / skręt jądra",
        body: "Test ciążowy z moczu natychmiast u każdej kobiety w wieku 12-55 lat z bólem brzucha. Przy dodatnim wyniku i braku ciąży wewnątrzmacicznej w USG: podejrzenie ciąży pozamacicznej. U mężczyzn z nagłym bólem moszny: natychmiastowe wezwanie urologa do zabiegu operacyjnego.",
        tests: [
          "Ilościowe β-hCG z krwi, pilne USG przezpochwowe (TVUS) lub USG Doppler moszny (tylko jeśli nie opóźnia zabiegu).",
        ],
      },
      no: {
        title: "Kolka nerkowa / Zatrzymanie moczu / ZUM",
        body: "Różnicuj pomiędzy niepowikłaną kolką nerkową a zakażonym wodonerczem. W ostrym zatrzymaniu moczu: natychmiastowe założenie cewnika Foleya i odbarczenie pęcherza.",
        tests: [
          "Badanie ogólne moczu, kreatynina, mocznik, morfologia, CRP, POCUS pęcherza i nerek.",
        ],
      },
      subq: {
        title: "Czy kolka nerkowa powikłana (gorączka, jedyna nerka, anuria, złóg >10 mm) LUB urosepsa?",
        body: "Obecność gorączki >38°C, wstrząsu, cech zastoju w USG (poszerzenie UKM) lub brak poprawy po analgezji (NLPZ IV: ketoprofen 100 mg / metamizol / opioidy).",
        criteria: [
          "[TAK] Zakażone wodonercze / urosepsa (pilne odbarczenie dróg moczowych: cewnik DJ lub nefrostomia przezskórna + ceftriakson/gentamycyna IV)",
          "[TAK] Ciężka retencja moczu z wodonerczem lub kamica jedynej czynnej nerki",
          "[NIE] Niepowikłana kolka nerkowa z dobrą odpowiedzią na analgezję i prawidłową funkcją nerek",
        ],
      },
      subyes: {
        title: "Pilna urologia: odbarczenie zastoju (cewnik DJ/nefrostomia) i antybiotykoterapia IV",
        type: "urgent",
        body: "Pilna konsultacja urologiczna. Zakażenie powyżej przeszkody w moczowodzie jest wskazaniem do natychmiastowego drenażu chirurgicznego — sama antybiotykoterapia nie dotrze do zablokowanego UKM! Włącz empirię sepsy moczowej wg NPOA.",
        tests: [
          "TK jamy brzusznej bez kontrastu (low-dose CT stone protocol), posiewy krwi i moczu.",
        ],
      },
      subno: {
        title: "Leczenie przeciwbólowe kolki nerkowej (NLPZ lekiem z wyboru) i terapia wydalająca",
        body: "Wytyczne EAU: NLPZ (Ketoprofen 100 mg i.v. lub Diklofenak 75 mg i.v.) są skuteczniejsze od opioidów w kolce nerkowej (zmniejszają ciśnienie w moczowodzie). W kamicy dystalnej 5-10 mm rozważ tamsulozynę 0,4 mg/d (MET) i nawodnienie.",
        tests: [
          "Ocena wielkości złogu w badaniu obrazowym i kontrola eGFR przed NLPZ.",
        ],
      },
      alt: {
        title: "Odbarczenie ostrego zatrzymania moczu i wypis z cewnikiem / poradnia urologiczna",
        body: "Załóż cewnik Foleya (odnotuj objętość początkową; przy retencji >1000 ml monitoruj diurezę pod kątem wielomoczu poodbarczeniowego). Zastosuj alfa-bloker (tamsulozyna) i skieruj do planowej opieki urologicznej.",
        tests: [
          "Badanie per rectum (ocena gruczołu krokowego), kontrola kreatyniny.",
        ],
      },
      dispo: [
        "Wypis po niepowikłanej kolce nerkowej z opanowanym bólem i zaleconym sitkiem do moczu (złapanie złogu do analizy). Hospitalizacja w sepsie, braku kontroli bólu, złogach >10 mm lub powikłaniach ginekologicznych.",
      ],
      pit: [
        "Zaniechanie wykonania testu ciążowego u młodej kobiety z bólem brzucha lub omdleniem może doprowadzić do przeoczenia śmiertelnego krwotoku z pękniętej ciąży pozamacicznej.",
        "Antybiotyk bez odbarczenia zablokowanego zakażonego moczowodu nie zapobiegnie wstrząsowi uroseptycznemu.",
      ],
      logic:
        "Wyklucz ciążę ektopową i skręt jądra. W kolce nerkowej gorączka oznacza stan zagrożenia życia wymagający natychmiastowego drenażu urologicznego.",
      src: ["eauUro", "rcogEarly", "abcde"],
    },
    {
      hx: [
        "Chłopcy: nagły ból moszny, obrzęk, nudności, ból brzucha (skręt jądra!). Dziewczynki: nagły ostry ból podbrzusza (skręt jajnika). Niemowlęta i małe dzieci: gorączka bez ogniska, drażliwość, nieprzyjemny zapach moczu, dysuria, moczenie wtórne (ZUM).",
      ],
      exam: [
        "ABCDE, badanie narządów płciowych u KAŻDEGO dziecka z bólem brzucha/pachwiny! Moszna: uniesienie jądra, poziome ułożenie, brak odruchu mięśnia dźwigacza (cremasteric reflex), tkliwość, obrzęk. Objaw 'blue dot' (skręt przyczepka).",
      ],
      red: [
        "Nagły silny ból moszny (krytyczne okno niedokrwienia jądra 4-6h!), skręt przydatków u dziewczynki, gorączkowy ZUM u niemowlęcia (ostre odmiedniczkowe zapalenie nerek — ryzyko bliznowacenia nerek i urosepsy).",
      ],
      urgent:
        "Ostry ból moszny: natychmiastowa konsultacja chirurgii/urologii dziecięcej i przygotowanie do eksploracji operacyjnej (okno ratowania jądra wynosi 4-6 h — NIE opóźniaj zabiegu oczekiwaniem na badanie USG!). U niemowlęcia z gorączkowym ZUM i wymiotami: hospitalizacja i antybiotykoterapia IV!",
      question: "Czy występuje ostry ból moszny / podejrzenie skrętu jądra lub jajnika?",
      yes: {
        title: "Pilna chirurgia dziecięca: operacyjna eksploracja moszny / laparoskopia",
        body: "Każdy ostry ból moszny u dziecka jest skrętem jądra do czasu wykluczenia operacyjnego. Czas od początku objawów do odkręcenia determinuje przeżywalność gonady (>90% przed 6h, <10% po 24h). Obustronna orchidopeksja.",
        tests: [
          "Zabezpieczenie dostępu naczyniowego, stan NPO (na czczo), koagulologia, próba zgodności.",
        ],
      },
      no: {
        title: "Pediatryczny ZUM / Gorączka z układu moczowego",
        body: "ZUM jest najczęstszym poważnym zakażeniem bakteryjnym u małych dzieci. Prawidłowe pobranie moczu jest kluczowe (u niemowląt metoda czystego łapania 'clean catch' lub cewnikowanie; unikaj woreczków przyklejanych ze względu na 80% fałszywie dodatnich wyników!).",
        tests: [
          "Badanie ogólne moczu (leukocyturia, azotyny) + obowiązkowy posiew moczu przed antybiotykiem.",
        ],
      },
      subq: {
        title: "Czy niemowlę <3 mies., cechy urosepsy lub brak tolerancji doustnej w ZUM?",
        body: "Wiek <3 miesięcy, wysoka gorączka, odwodnienie, wymioty uniemożliwiające leczenie doustne lub cechy odmiedniczkowego zapalenia nerek (APN).",
        criteria: [
          "[TAK] Wskazanie do hospitalizacji i antybiotykoterapii dożylnej (Cefotaksym/Ceftriakson IV + Ampicylina u noworodków)",
          "[NIE] Dziecko starsze w dobrym stanie z niepowikłanym ZUM: leczenie doustne (Cefalosporyna p.o. / Furazydyna) i kontrola",
        ],
      },
      subyes: {
        title: "Hospitalizacja pediatryczna, antybiotykoterapia IV i USG dróg moczowych",
        type: "urgent",
        body: "Przyjęcie na oddział pediatryczny. Antybiotykoterapia empiryczna IV (Ceftriakson 50-75 mg/kg 1x dz. lub Cefotaksym). USG nerek i dróg moczowych w trakcie hospitalizacji w celu wykluczenia wad układu moczowego (odpływ pęcherzowo-moczowodowy VUR, wodonercze).",
        tests: [
          "USG układu moczowego, kontrola kreatyniny i wskaźników stanu zapalnego.",
        ],
      },
      subno: {
        title: "Leczenie doustne ZUM (NPOA) i nadzór ambulatoryjny",
        body: "U stabilnych dzieci >3 mies. z niepowikłanym zakażeniem dolnych dróg moczowych: Cefalosporyna II/III gen p.o. (np. Cefuroksym aksetyl) lub Amoksycylina z kwasem klawulanowym przez 7-10 dni (w zapaleniu pęcherza 3-5 dni). Zapewnij obfite nawodnienie.",
        tests: [
          "Weryfikacja wyniku posiewu moczu i antybiogramu po 48h.",
        ],
      },
      alt: {
        title: "Skręt przyczepka jądra (Appendiceal torsion) / zapalenie jądra i najądrza",
        body: "Przy potwierdzonym skręcie przyczepka (obecny objaw sinej kropki 'blue dot sign', zachowany prawidłowy przepływ w jądrze): leczenie zachowawcze (odpoczynek, uniesienie moszny, paracetamol/ibuprofen). Zwykle ustępuje samoistnie w ciągu 5-7 dni.",
        tests: [
          "USG Doppler moszny potwierdzające prawidłowy symetryczny przepływ w obu jądrach.",
        ],
      },
      dispo: [
        "Wypis po ZUM z zaleceniem kontroli posiewu i terminem USG nerek (każde małe dziecko po pierwszym gorączkowym ZUM wymaga USG!). Skręt jądra wymaga natychmiastowej operacji.",
      ],
      pit: [
        "Ból brzucha u małego chłopca może być jedynym objawem skrętu jądra; badanie moszny jest obowiązkowe!",
        "Woreczki do zbiórki moczu u niemowląt mają ogromny odsetek zanieczyszczeń; dodatni wynik wymaga weryfikacji.",
      ],
      logic:
        "Czas to jądro: 6 godzin decyduje o przeżyciu gonady. W gorączce bez ogniska u niemowląt zawsze zbadaj mocz.",
      src: ["rchScrot", "eauUro", "feverP"],
    },
  );

  window.ClinicalData = {
    version: 2,
    revision: "2026-11-11-r4",
    reviewed,
    modules,
    sources,
  };
})();
