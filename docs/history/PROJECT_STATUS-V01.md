# Stato del progetto

Aggiornato: **17 novembre 2026**. Versione corrente: **0.1.0**, prototipo locale sperimentale.

## Architettura

React + TypeScript + Vite per UI e bundling; Three.js con OrbitControls per la vista 3D; SVG per 2D. Moduli calligraphy, vector, core, geometry, optimization, ui ed export. Il motore geometrico lavora in mm; offset/unioni Clipper su interi con scala 1000, triangolazione Earcut. Nessun servizio remoto. Pronto a essere incapsulato in desktop in futuro, ma nessun pacchetto desktop è implementato.

## Funzionalità operative

- Input testo e alfabeto monolinea originale a–z; S dedicata; le altre maiuscole usano minuscole. Segnalazione glifi assenti.
- Signature collega le ancore coincidenti; Minimal usa gli stessi glifi con lettere separate. Non sono due famiglie calligrafiche complete.
- Dimensioni, inclinazione e spaziatura; import SVG campionato con trasformazioni.
- Canaletta U parametrica, unioni di sovrapposizioni e cavità aperta superiormente.
- Anteprima 3D orbitabile e vista 2D navigabile, griglia 10 mm, adattamento e wireframe.
- Lunghezza teorica LED, numero percorsi e ingombro del solido; avvisi su raggi, incroci e prossimità.
- Controlli bordi aperti/non-manifold, orientamento, ventagli dei vertici, facce degeneri e volume. Export mesh bloccato in caso di esito negativo.
- Export STL binario, 3MF Core con unità mm, OBJ e SVG dei percorsi campionati.
- Salva/Apri progetto JSON versionato, autosave localStorage e Annulla/Ripeti.
- Script avvia.cmd, runtime Node portatile locale e build di produzione.

## Funzionalità mancanti

Editor nodi, calligrafia professionale con vincoli fisici, stili Luxury/Vintage/Handwriting, font completi, varianti, collegamenti intelligenti, ottimizzazione delle interruzioni, taglio per piatto, giunti, fori cavo, terminali, profili LED, simulazione luminosa, stima costi, installatore desktop. Dettagli in ROADMAP.md.

## Problemi e limiti riscontrati

1. **Fotografie assenti.** Le quattro immagini non sono disponibili nel messaggio o nel workspace iniziale. Non è stata eseguita analisi fotografica; il disegno non replica fedelmente il riferimento.
2. **Calligrafia non ancora producibile così com'è.** Il caso Stay playful contiene incroci e raggi inferiori a 12 mm. La mesh è topologicamente valida, ma il percorso LED richiede revisione. Non forzare un LED negli incroci.
3. **Controlli numerici limitati.** Il raggio è una stima locale su polilinee. Vicinanze/incroci sono segnalazioni di segmenti, non conteggi di difetti fisici distinti. Mancano test generali di auto-intersezione triangoli e certificazione dei minimi spessori. I ricampionamenti SVG non hanno un limite d'errore adattivo certificato.
4. **Prestazioni.** Geometria e analisi sincrone sul thread UI; analisi interferenze quadratica. I file sono limitati, ma un testo complesso può rallentare. Worker previsto.
5. **Disco C pieno.** npm ha restituito ENOSPC durante installazione e avvio di uno script; risolto indirizzando cache e log al progetto con `.npmrc` (`.tools/npm-cache`, sul disco D). Nessun file personale cancellato.
6. **Verifica visiva bloccata.** Browser automation host non disponibile; il fallback Chrome è stato fermato dallo strumento perché non poteva determinare l'URL corrente con sufficiente certezza. Nessuna verifica visiva o interazione completa nel browser è stata eseguita. Non dichiarare QA visiva superata.
7. **Slicer non verificato.** Non effettuati import manuale in slicer, schema 3MF completo o stampa fisica. Il 3MF è un pacchetto Core, non un progetto Bambu.
8. **Bundle.** Vite segnala un chunk JS di circa 937 kB non compresso (circa 262 kB gzip); ottimizzazione futura.

## Decisioni tecniche

- Curve centrali originali, non contorni font estrusi.
- Offset interno = (larghezza LED + tolleranza totale) / 2; offset esterno aggiunge la parete. Quote Z: fondo 0–fondo; pareti fino a fondo + altezza pareti.
- Unioni 2D per ottenere regioni esterne e cavità; mesh costruita dai livelli di contorno. Evitati solidi sovrapposti lasciati come mesh separate.
- Offset con archi arrotondati, tolleranza 0,015 mm. Il bordo campionato può differire di centesimi dalle dimensioni teoriche.
- Avvisi produttivi separati dallo stato mesh; non vengono risolti automaticamente. Nessun claim di stampa pronta.
- Esportazione nella convenzione XY, estrusione Z in millimetri. 3MF contiene unità esplicite; STL/OBJ vanno importati in mm.
- Progetto JSON format=filocontinuo, version=1. Testo conserva glifi Bézier nel codice; SVG importato conserva polilinee.
- In futuro valutare Clipper2 WASM per evoluzione della libreria e Manifold/OpenCascade per booleane solide generiche. L'attuale stack è sufficiente per la sezione U a livelli.

## Risultati test

`npm test`: **6 suite di casi, 6 superati, 0 falliti**. Tempo circa 10 secondi.

- Canaletta rettilinea: topologia, dimensioni con tolleranza di discretizzazione e volume rispetto alla soluzione analitica (<0,3%).
- Incroci, sovrapposizioni collineari, anelli chiusi e componenti separati.
- Stay playful: mesh, scrittura/rilettura STL binario con ricontrollo topologico; struttura ZIP e triangoli 3MF; output SVG e OBJ.
- Glifi e testi a larghezze 200 e 600 mm: mesh chiuse valide.
- Input non validi, parametri negativi, coordinate infinite e triangoli degeneri respinti.
- Lunghezza e avvisi di raggio indipendenti dallo stato mesh.

`npm run build`: **superato**, TypeScript e build Vite; unico warning bundle descritto sopra. Server Vite avviato su **http://127.0.0.1:5173/**; richiesta HTTP **200**. Verifica browser e slicer non eseguita per i limiti dichiarati.

### Fixture Stay playful (parametri iniziali)

| Misura | Risultato |
| --- | --- |
| Larghezza percorso | 400 mm |
| Ingombro solido | 408,69 × 89,42 × 8,50 mm |
| Lunghezza LED teorica | 1608,60 mm |
| Percorsi indipendenti | 7 |
| Triangoli | 26.148 |
| Bordi aperti / irregolari | 0 / 0 |
| Vertici non-manifold | 0 |
| Facce degeneri / orientamenti incoerenti | 0 / 0 |
| Volume solido | 36.704,56 mm³ |
| Raggio minimo stimato | 0,419 mm: incompatibile con il requisito 12 mm |

File riproducibili in examples/. Il modello supera la dimensione di un piatto P1S 256 × 256 mm e non è ancora suddiviso.

## Proposte per la prossima sessione

Acquisire le foto, ridisegnare un unico caso Stay playful fisicamente producibile, implementare raccordi con raggio controllato e localizzazione degli avvisi. Poi verificare il modello in Bambu Studio e con un campione fisico della sezione U. Prima dei font aggiuntivi, consolidare campionamento e geometria. Trasferire in chat brainstorming il testo docs/RIEPILOGO_CHATGPT.md.
