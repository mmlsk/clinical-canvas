# Clinical Canvas

Interaktywna, edytowalna makieta edukacyjna algorytmów diagnostycznych dla dorosłych i dzieci. Wersja 2.1 zawiera płótno grafowe, bibliotekę źródeł oraz kalkulatory GCS, NEWS2 i Brighton PEWS / UBC.

## Funkcje

- **Algorytmy objawowe:** 11 głównych objawów i mapa przyjęcie–wypis, osobno dla dorosłych i dzieci; 24 grafy i 168 bazowych węzłów.
- **Treść kroków:** wywiad, badanie przedmiotowe, czerwone flagi, wskazania do badań, pułapki i logika decyzji.
- **Edytor:** przesuwanie, dodawanie i łączenie węzłów, edycja treści, undo/redo, import i eksport JSON, jasny i ciemny motyw oraz widok mobilny.
- **Kalkulatory:** standardowa GCS z obsługą NT, NEWS2 z dwiema skalami SpO₂ i jawnie oznaczony Brighton PEWS / UBC. Wynik można świadomie wstawić do grafu jako własną notatkę.

To makieta i synteza wybranych źródeł, nie komplet wszystkich wytycznych ani klinicznie zwalidowany system decyzyjny. Przed wykorzystaniem klinicznym konieczne są przegląd merytoryczny, sprawdzenie aktualności źródeł i zgodności z lokalnymi procedurami; nie wpisuj danych identyfikujących pacjentów.

## Szybkie uruchomienie

Wymagane są Node.js z obsługą `node:test` (zalecany Node.js 22+) oraz Python 3 do prostego serwera HTTP. Nie trzeba instalować pakietów npm ani pip.

```bash
git clone https://github.com/mmlsk/clinical-canvas.git
cd clinical-canvas
node --test tests/clinical-scores.test.cjs
node build-clinical-canvas.mjs
python3 -m http.server 8080 --bind 127.0.0.1
```

Otwórz [lokalną makietę](http://127.0.0.1:8080/makieta-medyczna-canvas.html). Ten wygenerowany, samodzielny HTML korzysta z pamięci lokalnej przeglądarki i nie wymaga backendu; regularnie eksportuj JSON jako przenośną kopię.

Zapis lokalny jest oddzielny dla różnych adresów i profili przeglądarki. Otwarcie kalkulatora i wprowadzanie obserwacji nie zapisuje formularza; dopiero wstawienie wyniku do grafu tworzy zapisywaną notatkę.

## Struktura projektu

```text
clinical-canvas/
  index.html             # Interfejs aplikacji modułowej
  styles.css             # Style i responsywność
  clinical-data.js        # Grafy startowe, opisy i źródła
  app.js                 # Edytor, walidacja, migracja, import/eksport
  score-engine.js        # Czyste funkcje obliczania punktów
  calculators.js         # Formularze kalkulatorów i prezentacja wyników
  storage-adapter.js     # Adapter serwerowego zapisu podglądu
tests/
  clinical-scores.test.cjs
docs/
  implementation-notes.md
clinical-server.py        # API zapisu podglądowego i SQLite
build-clinical-canvas.mjs  # Budowanie samodzielnego HTML
```

## Backend podglądowy

Modułowy `clinical-canvas/index.html` jest dostosowany do prywatnego podglądu platformy. W tym trybie platforma zastępuje `__PORT_8765__` adresem proxy do backendu; nie jest to gotowa konfiguracja hostingu statycznego.

```bash
python3 clinical-server.py
```

Serwer słucha na porcie 8765 i tworzy lokalny katalog `clinical-runtime/`. API oferuje `GET /api/health`, `GET /api/state` i `PUT /api/state`; zapis używa rewizji i zgłasza konflikt HTTP 409 zamiast cichego nadpisania.

API stanu wymaga nagłówka `X-Visitor-Id` dostarczanego przez zaufany, uwierzytelniający proxy. Sam ten nagłówek nie jest mechanizmem logowania: nie wystawiaj serwera bezpośrednio w internecie, a zewnętrzny proxy musi usuwać nagłówek klienta i nadawać własną zweryfikowaną tożsamość.

Backend nie zapewnia współedycji na żywo, produkcyjnej obsługi kont ani gwarancji trwałości. Baza SQLite, logi i lokalne konfiguracje nie są przechowywane w repozytorium; do zwykłego uruchomienia lokalnego użyj samodzielnego HTML z instrukcji powyżej.

## Testy

```bash
node --test tests/clinical-scores.test.cjs
python3 -m unittest tests/test_server.py
node --check clinical-canvas/app.js
node --check clinical-canvas/calculators.js
node --check clinical-canvas/score-engine.js
```

13 grup testów obejmuje m.in. 120 kombinacji E/V/M, 256 kombinacji domen i modyfikatorów PEWS, progi NEWS2, NT, niekompletne dane i wyłączenia populacyjne. Są to testy implementacji reguł, nie walidacja kliniczna narzędzia.

## Warianty skal i źródła

- **GCS:** kalkulator standardowy; małe dzieci wymagają odrębnej pGCS. Kryteria i ograniczenia opisują [oficjalna karta GCS](https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf) oraz [GCS FAQ](https://www.glasgowcomascale.org/faq/).
- **NEWS2:** reguły i odpowiedź według [Royal College of Physicians](https://www.rcp.ac.uk/media/ctulqqbn/news2-executive-summary_0.pdf).
- **PEWS:** wariant Brighton / UBC z 31.05.2024; trzy domeny i dwa modyfikatory, łącznie 0–13 pkt, zgodnie z [kartą UBC](https://ubccpd.ca/sites/default/files/documents/Brighton-PEWS.pdf).

PEWS sumuje ręcznie ocenione kategorie: nie dobiera automatycznie norm tętna i oddechów do wieku ani nie ustala uniwersalnych progów eskalacji. Źródła algorytmów są dostępne w interfejsie i `clinical-data.js`; daty przeglądu nie oznaczają publikacji nowych wytycznych.

Szczegóły zmian, testów i znanych ograniczeń zawiera [raport wdrożenia](docs/implementation-notes.md). Nie dodano odrębnej licencji dystrybucji kodu.
