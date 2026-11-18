# Stato FILOCONTINUO

Versione corrente: **0.2.0**, 17 novembre 2026. Aggiornato il progetto esistente D:\filocontinuo. Backup precedente: `.tools/backups/prima-v02.zip`; documenti V0.1 in `docs/history/`.

## Architettura e decisioni

Stack React/TypeScript/Vite/Three.js confermato. Bézier a nodi con punti/maniglie assoluti in mm nel JSON version=2; lettura version=1 invariata, generatore legacy conservato. I nuovi progetti usano un alfabeto aperto originale senza font estrusi. I vecchi SVG campionati possono essere editati come cubiche lineari equivalenti, non recuperati come curve originali.

Campionamento de Casteljau con bound sull'involucro dei controlli ≤0,03 mm e corda ≤2 mm, limiti di complessità/profondità espliciti. Quadratiche convertite esattamente in cubiche. SVG con linee/quadratiche/cubiche mantiene controlli/trasformazioni; archi ed ellissi richiedono conversione esterna. Motore Clipper/Earcut V0.1 conservato, estratta la costruzione da contorni per riutilizzarla nei provini.

Moduli vector, calligraphy, geometry, optimization, core, ui, export separati. Diagnostica analitica campionata e collisioni su polilinee con indice spaziale/raggruppamento. Tre stati distinti: mesh, LED, volume P1S. Proposte automatiche applicate solo dopo conferma.

## Funzionalità operative

- Conservazione delle Bézier, campionamento adattivo e proporzioni/spaziatura/inclinazione.
- Alfabeto aperto a–z e S; altre maiuscole via minuscole, caratteri assenti segnalati. Stili sperimentali.
- Editor: selezione singola/multipla, spostamento percorso/nodo/maniglia, inserimento esatto, eliminazione, separazione in nodi interni aperti, unione fine→inizio, rotazione e scala. Aggiornamento 3D al rilascio, undo/redo e salvataggio JSON.
- Colori, marcatori, lista dei difetti selezionabile con coordinate e centratura/zoom. Raggi, cuspidi, incroci/auto-intersezioni, ripassi, distanze e tratti troppo brevi.
- Ottimizzatore euristico con raccordi tangenti, unioni quasi coincidenti e piccoli distanziamenti; anteprima originale/proposta, conteggi e conferma/annullamento. Fallimenti dichiarati.
- Profili LED salvabili in browser/progetto e librerie JSON importabili/esportabili. Nome, sezione, raggio, flessione, passo di taglio e parametri della canaletta. Profili iniziali/creati dichiarati dimostrativi.
- Caso Stay playful con ricerca di scala compatibile entro 2000 mm o errore esplicito.
- Sei provini con rette, archi R8/R12/R20 e linguette T/R incise; STL/3MF e verifica mesh/P1S.
- Tutte le funzioni precedenti: parametri U, viste 2D/3D, SVG, dimensioni/lunghezze, salvataggio, autosave, annulla/ripeti e quattro esportazioni.
- Cache/log npm e temporanei di avvio sul disco D; nessun file personale cancellato.

## Test e verifiche reali

**npm test: 20/20 superati**, 0 falliti, circa 11,7 secondi. Sei test V0.1 conservati e 14 nuovi: errore del campionamento confrontato con curve dense; inserimento esatto; operazioni nodi/handle/trasformazioni; migrazione JSON; localizzazione/raggruppamento; ottimizzazione; profili; calibrazione; studio; SVG controlli/trasformazioni/roundtrip/ciclo chiuso; rendering iniziale SSR.

**npm run build: superato**, TypeScript e Vite. Warning chunk JS circa 970 kB (274 kB gzip). Server locale risponde **HTTP 200** su http://127.0.0.1:5173/.

**Nessuna QA visiva**: nuovo tentativo di inventario browser restituisce `The browser access host is unavailable`. Nessun test manuale di trascinamenti, screenshot finale, slicer o stampa fisica. SSR e XML non sono test visuali. 3MF verificato come pacchetto Core, senza validazione schema completa o apertura in slicer.

### Stay playful, profilo dimostrativo 6 × 8

| Misura/stato | Risultato |
| --- | --- |
| Percorso / ingombro | 1600 mm / circa 1608,69 × 168,99 × 8,50 mm |
| LED teorico / tratti | 2223,75 mm / 17 |
| Raggio minimo campionato | 13,20 mm contro minimo 12 mm |
| Errori / avvisi | 0 / 2, raggi nel margine del 15% |
| Mesh | chiusa, 34.880 triangoli |
| Bordi/vertici irregolari e degenerazioni | 0 |
| P1S | non compatibile intero; divisione assente |

Ridotti incroci/ripassi a scapito di compattezza e continuità: **17 tratti contro 7** della V0.1. Non dichiarare risolta la riduzione delle interruzioni o ottenuta una scrittura professionale conforme alle fotografie.

### Calibrazione

Ingombro iniziale circa **179,5 × 188,3 × 8,5 mm**, entro P1S. Tre rette da 82 mm con tolleranze totali 0 / 0,30 / 0,60 mm; tre archi 90° R8/R12/R20 alla tolleranza del profilo. Marcature T a due decimali e R intero. Provini con linguette anziché piastra piena per ridurre materiale; tutti nello stesso STL/3MF. Mesh e roundtrip STL validi. Dati precisi in examples/v02/calibrazione.json. Alcuni raggi sono volutamente incompatibili per la prova fisica.

## Problemi e funzionalità mancanti

1. **Fotografie mancanti** anche nel messaggio V0.2. Nessun originale analizzato/allegato: confronto fotografico ed estetico non eseguito.
2. **Controlli numerici limitati.** Raggio in 63 punti interni per cubica, senza bound del minimo globale o gestione certificata delle singolarità. Intersezioni/distanze su polilinee; gruppi vicini non sempre equivalgono a difetti fisici distinti. Cuspidi >8° gialle, >20° rosse; discontinuità minori possibili. Mancano test generali triangolo-triangolo della mesh e certificazione spessori. Compatibile con i controlli non equivale a pronto per produzione.
3. **Calligrafia sperimentale.** Alcuni glifi/dimensioni rimangono incompatibili. Signature/Minimal non sono famiglie complete. Nessun routing globale o riduzione universale delle interruzioni; caso tecnico grande e frammentato.
4. **Editor semplificato.** Nessuna apertura/separazione di cicli, inversione direzione, snap o vincoli maniglie. Eliminare/unire può cambiare molto la forma. Geometria aggiornata al rilascio, non a ogni evento intermedio.
5. **Ottimizzatore limitato.** Punteggio sui gruppi, non certificazione di non regressione; unioni solo entro 0,15 mm. Non garantisce risoluzione o estetica. Anteprima e correzione manuale necessarie.
6. **Profili.** Verticale non supportato in XY; passo di taglio registrato senza verifica multipli/alimentazioni. Assenti terminali/fori/giunti.
7. **Calibrazione.** Layout limitato a esterno ≤14 mm e altezza ≤30 mm; nessuna stampa fisica. Misure da controllare sul campione reale.
8. **Prestazioni/produzione.** Thread UI ancora sincrono, Worker futuro. Assenti sezionamento P1S, incastri, costi, simulazione luminosa e desktop.
9. **Dipendenze dev.** Audit npm: 4 segnalazioni high nella catena Vite/fdir/tinyglobby/picomatch, originate dal ReDoS nei glob di picomatch ≤4.0.7. Al controllo il registry indica 4.0.7 come versione corrente, senza patch compatibile disponibile; non applicato il downgrade Vite suggerito dall'audit. Server su loopback; SVG non passa ai glob. Rivalutare la toolchain, nessun claim di audit pulito.

## Proposte per la prossima sessione

Acquisire foto/LED reali; verificare UI e slicer; stampare/misurare i provini. Poi calligrafia compatta con raccordi e meno interruzioni, bound di curvatura per intervalli, singolarità e difetti meglio raggruppati, editor dei cicli, Worker e sezionamento P1S. Riepilogo dettagliato in docs/RIEPILOGO_CHATGPT.md.
