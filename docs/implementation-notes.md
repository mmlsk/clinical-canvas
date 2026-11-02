# Clinical Canvas v2: rozbudowa i audyt

Makieta obejmuje teraz 11 modułów głównych objawów, oddzielne ścieżki dorosłych i dzieci oraz mapę od przyjęcia do wypisu. Zakres audytu dotyczy funkcjonalności aplikacji, kodu, dostępności i jakości logiki klinicznej; nie obejmuje marketingu, konkurencji ani kampanii SEO.

## Uzupełnienie v2.1: kalkulatory

- **GCS:** osobne E/V/M, zakres 3–15, NT zamiast imputacji punktów i brak sumy przy nieoznaczalnej składowej. Standardowa GCS dla dorosłych i dzieci >5 lat; dla młodszych dzieci wynik jest zablokowany i potrzebna jest osobna pGCS ([karta GCS](https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf), [GCS FAQ](https://www.glasgowcomascale.org/faq/)).
- **NEWS2:** punktacja składowych, skale SpO₂ 1/2, niezależne punkty za tlen, ACVPU i hierarchia odpowiedzi obejmująca pojedynczą składową 3, sumę 5–6 oraz ≥7 według RCP ([NEWS2 RCP](https://www.rcp.ac.uk/media/ctulqqbn/news2-executive-summary_0.pdf)). Formularz wymaga potwierdzenia wskazania do skali 2 i nie daje wyniku dla dzieci <16 lat ani ciąży ([NEWS2 RCP](https://www.rcp.ac.uk/media/ctulqqbn/news2-executive-summary_0.pdf)).
- **Brighton PEWS / UBC 31.05.2024:** trzy domeny po 0–3, bronchodilatatory co 20 min +2 i uporczywe wymioty po operacji +2, łącznie 0–13 ([karta UBC](https://ubccpd.ca/sites/default/files/documents/Brighton-PEWS.pdf)). Wdrożono sumowanie ręcznie ocenionych kategorii, nie automatyczny przelicznik HR/RR z norm wieku. Wymagane jest potwierdzenie właściwych norm i lokalnej karty; nie przypisano uniwersalnych progów eskalacji ani nie zmieszano wariantów PEWS.
- **Obsługa:** przycisk „Kalkulatory”, zakładki, rozpisanie punktów, linki źródłowe, reset pojedynczego formularza i otwieranie właściwego kalkulatora z węzła danej skali. Świadome wstawienie wyniku tworzy własny węzeł w bieżącym module i odpowiedniej populacji, z edycją, undo/redo, zapisem i eksportem. Same formularze nie zapisują się automatycznie.
- **Kod:** czysty silnik `score-engine.js`, osobny interfejs `calculators.js`. Bez zmian schematu SQLite i formatu istniejących grafów. Wersja samodzielna zawiera te same kalkulatory.
- **Testy obliczeń:** 13 grup `node --test tests/clinical-scores.test.cjs`, wszystkie zaliczone; obejmują 120 kombinacji E/V/M, 256 kombinacji PEWS, granice parametrów NEWS2, priorytety odpowiedzi oraz niepoprawne dane.
- **Testy UI:** GCS 15/NT, wyłączenie małych dzieci, NEWS2 0/3/5/20, ponowne potwierdzanie skali 2, PEWS 13/brak norm wieku, szkice między zakładkami, reset, klawiatura i otwarcie źródła. Samo wypełnianie formularzy wygenerowało zero żądań zapisu.
- **Regresja:** 12 modułów w obu populacjach, porównanie, wyszukiwanie, 26 źródeł, edycja z zachowaniem fokusu, gałęzie/łączenie, usuwanie i undo/redo, eksport/import, anulowanie resetu oraz odtworzenie dodanego wyniku po przeładowaniu. Obejrzano desktop, 375 px i motyw ciemny; brak poziomego przepełnienia i błędów JavaScript w tych scenariuszach.
- **Wdrożenie v2.1:** na dokładnie wdrożonym artefakcie potwierdzono GCS 15, NEWS2 3 z właściwym ostrzeżeniem i Brighton PEWS 13, rzeczywiste otwarcie źródła, zapis notatki do ścieżki dzieci, eksport 24 grafów oraz odtworzenie notatki po przeładowaniu. Własną notatkę testową następnie usunięto przez interfejs i potwierdzono zapis usunięcia; nie resetowano danych użytkownika. Ponownie sprawdzono wyszukiwanie, inny moduł oraz szerokość 375 px bez poziomego przepełnienia.

## Zakres kliniczny

- **Objawy:** ból w klatce, duszność, ból brzucha, ból głowy, omdlenie, gorączka, zaburzenia świadomości, nagły deficyt neurologiczny, wymioty/odwodnienie, krwawienie z przewodu pokarmowego i ból pleców.
- **Populacje:** 22 ścieżki objawowe oraz dwie mapy ogólne, łącznie 24 grafy bazowe i 168 edytowalnych kroków. Przełącznik „Obie ścieżki” umożliwia porównanie, ale nie łączy kryteriów pediatrycznych z dorosłymi.
- **Treść kroków:** badanie podmiotowe i przedmiotowe, czerwone flagi, pytania decyzyjne TAK/NIE, wskazania do badań, interpretacja, dalsze postępowanie, pułapki, high-yield, hidden gems, wyjaśnienie logiki i odsyłacze.
- **Skale:** kalkulatory GCS, NEWS2 i Brighton PEWS oraz opisy zastosowania pozostałych skal, m.in. AVPU/ACVPU, Wells/PERC, NIHSS/FAST, Glasgow-Blatchford/Rockall i traffic-light NICE. Nie jest to pełna biblioteka wszystkich skal medycznych.
- **Granice:** to synteza edukacyjna głównych decyzji, nie kompletny protokół leczenia wszystkich chorób, atlas dawkowania ani walidowany wyrób medyczny. Część ścieżek jest orientacyjną syntezą kilku dokumentów; wskazano to w ich logice i źródłach.

## Ważne korekty kliniczne

- **Badania w bólu w klatce u dzieci:** ograniczono rutynowe EKG, RTG i troponinę do sytuacji z czynnikami ryzyka i odpowiednim podejrzeniem; nie przeniesiono dorosłej ścieżki ACS na całą pediatrię ([RCH Chest pain](https://www.rch.org.au/clinicalguide/guideline_index/Chest_pain/)).
- **PE u dorosłych:** rozdzielono niskie podejrzenie/PERC, dwupoziomowy Wells, D-dimer i CTPA; progi dotyczą odpowiedniej populacji i nie są automatyczną regułą dla dzieci ani ciężarnych ([NICE NG158](https://www.nice.org.uk/guidance/ng158/chapter/recommendations)).
- **Ból głowy:** usunięto użycie Canadian CT Head Rule jako algorytmu nieurazowego bólu; obrazowanie zależy od podejrzenia wtórnej przyczyny i czerwonych flag ([NICE CG150](https://www.nice.org.uk/guidance/cg150/chapter/Recommendations), [RCH Headache](https://www.rch.org.au/clinicalguide/guideline_index/headache/)).
- **Gorączka dzieci:** uwzględniono wiek <3 miesięcy z temperaturą ≥38°C, 3–6 miesięcy z ≥39°C i zakres traffic-light <5 lat; poprawa po antypiretyku nie stanowi testu wykluczającego poważne zakażenie ([NICE NG143](https://www.nice.org.uk/guidance/NG143/chapter/recommendations)).
- **Sepsa dorosłych:** ścieżka jasno odwołuje się do NICE NG253: wysokie ryzyko, antybiotyk w ciągu godziny oraz bolusy 250 ml z ponowną oceną; nie przedstawia tego jako identycznego schematu z automatycznym 30 ml/kg dla każdego chorego ([NICE NG253](https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis)).
- **Omdlenie dzieci:** EKG przynajmniej raz i wywiad rodzinny/obciążenie wysiłkiem jako podstawy oceny; brak automatycznego TK i EEG w typowym przypadku ([RCH Syncope](https://www.rch.org.au/clinicalguide/guideline_index/syncope/)).
- **Krwawienie:** w dorosłej ścieżce górnego krwawienia jawnie wybrano próg wczesnego wypisu NICE GBS=0, bez zacierania różnic z zaleceniami stosującymi 0–1; osobna pediatryczna ścieżka opiera się na nasileniu i perfuzji ([NICE CG141](https://www.nice.org.uk/guidance/cg141/chapter/Recommendations), [CHOP Upper GI Bleed](https://www.chop.edu/clinical-pathway/upper-gastrointestinal-bleed-clinical-pathway)).
- **Obrazowanie pleców:** bez czerwonych flag nie ma rutynowego obrazowania, a w opiece specjalistycznej wynik ma zmienić postępowanie; pediatria ma własny wariant ACR ([NICE NG59](https://www.nice.org.uk/guidance/ng59/chapter/Recommendations), [ACR Back Pain–Child](https://acsearch.acr.org/docs/3099011/Narrative/)).
- **Świadomość i drogi oddechowe:** GCS służy ocenie i monitorowaniu, a decyzje dotyczące zabezpieczenia dróg oddechowych wynikają z całości ABCDE; w pediatrii uwzględniono bezpieczeństwo LP i fakt, że prawidłowe TK nie wyklucza wzrostu ICP ([RCUK ABCDE](https://www.resus.org.uk/library/abcde-approach), [RCH Altered conscious state](https://www.rch.org.au/clinicalguide/guideline_index/Altered_conscious_state/)).

## Audyt kodu i poprawki

| Priorytet | Problem starej wersji | Wprowadzone rozwiązanie |
|---|---|---|
| Krytyczny dla edycji | Inspektor przebudowywany przy każdym znaku; utrata fokusu i kursora | Osobny cykl odświeżania grafu; aktywne pola nie są podmieniane |
| Wysoki | Sekwencja u1/u2 resetowana po odświeżeniu | Losowe UUID oraz kontrola kolizji |
| Wysoki | Brak globalnej unikatowości ID między grafami | Walidacja globalnych identyfikatorów węzłów i krawędzi |
| Wysoki | Import częściowo uszkadzał bieżący stan | Odczyt, walidacja i przygotowanie scalenia przed zatwierdzeniem |
| Wysoki | Import starego pliku mógł resetować edycje innych modułów | Scalenie z bieżącymi danymi; archiwum v1 jako oddzielny moduł |
| Wysoki | Importowany tekst mógł udawać zweryfikowaną treść bazową | Każdy importowany krok jest oznaczany jako własny/wymagający weryfikacji |
| Wysoki | Uszkodzony localStorage uniemożliwiał start | Walidacja, start z bazą, zachowanie starego zapisu i czytelne ostrzeżenie |
| Średni | Ciche błędy zapisu | Status dostępności pamięci i zalecenie eksportu przy błędzie |
| Średni | Nowa treść znikała pod starym zapisem | Wersja schematu, rewizja treści i odświeżanie nieedytowanych kroków |
| Średni | Ukryty mobilny inspektor | Dostępny panel oraz domyślna lista kroków na telefonie, płótno na żądanie |
| Średni | Wyszukiwanie tylko po tytule | Wyszukiwanie w treści, badaniach, pułapkach i pozostałych szczegółach |
| Średni | Trudna obsługa krawędzi i brak kierunku | Powiększony obszar kliknięcia, groty strzałek i etykiety TAK/NIE |
| Średni | Brak bezpiecznej edycji historii | Cofanie/ponawianie, potwierdzenia usuwania i resetu w interfejsie |
| Średni | Niebezpieczne lub nieaktywne adresy | Aktywowane są tylko adresy HTTP(S); treść użytkownika escapowana |

## Weryfikacja

- **Stan zastany:** odtworzono błąd utraty fokusu w przeglądarce przed zmianami.
- **Edycja:** wpisano pełne zdanie w jednym polu bez utraty fokusu; odtworzono je po odświeżeniu.
- **Trwałość i ID:** dodano dwa kroki z odświeżeniem pomiędzy nimi; oba zachowane.
- **Historia:** usunięcie, cofnięcie i ponowienie usunięcia zmieniało liczbę kroków zgodnie z operacją.
- **Import:** duplikaty ID odrzucone bez zmiany grafu; import v1 zachował edycję istniejącej ścieżki v2.
- **Interfejs:** skontrolowano przełączanie populacji, wyszukiwanie po treści, otwieranie źródeł i edytora.
- **Układ:** przeprowadzono kontrolę desktopową i mobilną 375 px oraz odrębny przegląd narzędziem Taste. Testy przeglądarkowe nie stanowią walidacji klinicznej.
- **Backend podglądu:** pełne zdanie zachowało fokus i zostało odtworzone po ponownym otwarciu strony; odczyt API potwierdził zapis 24 grafów. Próba zapisu starej rewizji zwróciła 409, inny identyfikator testowego odwiedzającego otrzymał pusty stan, brak identyfikacji zwrócił 403, a niepoprawna struktura JSON 400.
- **Wdrożony artefakt:** ponownie potwierdzono edycję i zapis po odświeżeniu, eksport JSON z 24 grafami, 23 odsyłacze w bibliotece źródeł oraz pediatryczny widok mobilny bez poziomego przepełnienia przy szerokości 375 px. Nie wystąpiły błędy JavaScript. Test wykonano przez prywatny proxy dokładnie wdrożonego artefaktu; kanoniczny ekran Perplexity zatrzymał automatyczną przeglądarkę na zabezpieczeniu antybotowym.
- **Granice testów:** przeprowadzono scenariusze przeglądarkowe i kontrolę walidatora, nie pełną formalną regresję wszystkich możliwych grafów. Ostatnia inspekcja Taste przed zmianą adaptera zapisu wykazała zero błędów i ostrzeżenie o dużym udziale drobnej typografii metadanych. Po zmianie adaptera ponownie sprawdzono zapis, odczyt, populacje i brak poziomego przepełnienia przy 375 px.

## Architektura i zachowanie danych

- **Kod:** `index.html` odpowiada za strukturę, `styles.css` za wygląd i responsywność, `clinical-data.js` za treści i źródła, `app.js` za edytor, graf i walidację, a `storage-adapter.js` za zapis wersji podglądowej. `clinical-server.py` udostępnia API i SQLite poza publicznym katalogiem plików. Wersja samodzielna HTML jest generowana skryptem budowania.
- **Prywatność:** aplikacja nie jest połączona z bazą pacjentów. Zapis podglądu jest odseparowany dla odwiedzającego na podstawie tożsamości wstrzykiwanej przez prywatny proxy platformy; bez tego nagłówka API stanu odmawia dostępu. Nie należy wpisywać danych pacjentów.
- **Zapis podglądu:** przeglądarkowa pamięć jest niedostępna w iframe platformy, dlatego zastosowano backend i SQLite. Numer rewizji zapobiega cichemu nadpisaniu stanu przez inną kartę. Konflikt wymaga eksportu zmian i ponownego wczytania; nie ma automatycznego łączenia konfliktów.
- **Trwałość:** backend i SQLite należą do środowiska podglądu, nie do produkcyjnej usługi z gwarancją utrzymania. Sprawdzono bieżący zapis/odczyt, nie wielodniową dostępność. Zachowuj kopie JSON; zmiana urządzenia lub tożsamości odwiedzającego nie oznacza automatycznej synchronizacji.
- **Wersja samodzielna:** korzysta z pamięci lokalnej danej przeglądarki i originu. Nowy podgląd na innej domenie nie odczyta automatycznie zapisu z poprzedniego pliku lub aplikacji; do przeniesienia służy import/eksport JSON.
- **Migracja:** stare JSON można zaimportować do archiwum; starsza treść nie uzyskuje przez to statusu aktualnej wytycznej. Import zachowuje inne, nieobjęte nim moduły.
- **Współpraca:** brak synchronizacji kont i równoczesnej współedycji. Udostępnienie aplikacji nie synchronizuje edycji między odwiedzającymi.
- **Ograniczenie importu:** do 5 MB; istniejące moduły i archiwum v1. Nieznane identyfikatory modułów, niepoprawne współrzędne, wadliwe krawędzie i powtórzone ID są odrzucane.

## Dalszy rozwój

Najbardziej użyteczne następne etapy to głębsze podalgorytmy wewnątrz ścieżek, kalkulatory kolejnych skal z testami granicznymi oraz wersjonowany przegląd merytoryczny przez klinicystę. Synchronizacja i współedycja wymagałyby osobnego projektu backendu, uwierzytelniania i rozstrzygania konfliktów.

Odświeżanie rewizji treści aktualizuje nieedytowane kroki o istniejących ID. Nie dopisuje automatycznie nowych kroków i połączeń do już istniejącego, zapisanego grafu; taki rozwój wymaga jawnej migracji z zachowaniem rozróżnienia między usunięciem przez użytkownika a nowym elementem bazy.
