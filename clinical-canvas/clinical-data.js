"use strict";
// Authored synthesis. Source IDs are resolved to the primary documents below.
// "reviewed" means checked for this version, not the document publication date.
(() => {
  const reviewed = "2026-11-01";
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
      question: "Czy dziecko spełnia kryteria bezpiecznego wypisu?",
      yes: {
        title: "Wypis z planem",
        body: "Stan ogólny i nawodnienie dobre, opiekun rozumie postępowanie i ma dostęp do ponownej oceny.",
        tests: [
          "Celowane badania tylko ze wskazań. Bezpieczny wypis nie wymaga automatycznie „pełnego panelu”.",
        ],
      },
      no: {
        title: "Obserwacja / pediatra",
        body: "Niemowlę z czynnikami ryzyka, niepewne rozpoznanie, brak podaży doustnej lub niewiarygodna obserwacja domowa: niższy próg hospitalizacji.",
        tests: [
          "Lokalny PEWS i trend; progi zależą od konkretnego systemu. Nie stosuj jednej uniwersalnej sumy dla wszystkich wersji PEWS.",
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
      question: "Czy rozpoznanie łagodnego omdlenia jest pewne?",
      yes: {
        title: "Odruchowe / ortostatyczne",
        body: "Typowe okoliczności i prodromy z prawidłowym EKG/badaniem: rozważ omdlenie wazowagalne lub hipotensję ortostatyczną.",
        tests: [
          "Morfologia przy podejrzeniu krwawienia/anemii; inne badania tylko według podejrzenia.",
          "Nie wykonuj rutynowego EEG ani TK głowy w prostym omdleniu.",
        ],
      },
      no: {
        title: "Dalsza ocena kardiologiczna",
        body: "Niejasna przyczyna, arytmia w podejrzeniu: dobierz czas monitorowania EKG do częstości epizodów. Podejrzenie padaczki kieruj odpowiednią ścieżką.",
        tests: [
          "Echo przy podejrzeniu choroby strukturalnej; test wysiłkowy przy odpowiednich objawach po ocenie specjalisty.",
          "Krótki prawidłowy zapis EKG nie wyklucza arytmii napadowej.",
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

  window.ClinicalData = {
    version: 2,
    revision: "2026-11-01-r2",
    reviewed,
    modules,
    sources,
  };
})();
