# FILOCONTINUO V0.1

Studio locale per progettare canalette aperte per LED Neon Flex a partire da percorsi monolinea. Prima versione sperimentale funzionante, sviluppata il 17 novembre 2026.

## Avvio su Windows

Aprire **avvia.cmd** con un doppio clic. Il browser si apre su http://127.0.0.1:5173; attendere che il server sia pronto e ricaricare se necessario. Tenere aperta la finestra del server; Ctrl+C lo arresta. Non occorre un account.

È incluso un runtime Node portatile nella cartella locale ignorata `.tools`. Su un altro computer installare Node.js 22+ oppure copiare anche il runtime. Per lo sviluppo:

```powershell
npm install --cache .tools/npm-cache
npm run dev
npm test
npm run build
```

Se Node non è nel PATH, nella sessione PowerShell locale usare prima:

```powershell
$env:PATH = "$PWD/.tools/node-v22.16.0-win-x64;$env:PATH"
```

Una volta installate le dipendenze, l'app funziona senza servizi remoti. Nessun caricamento di progetti o fotografie su server. Il server ascolta soltanto su loopback.

## Come usarlo

1. Digitare il testo (caso iniziale: **Stay playful**). Signature collega solo ancore coincidenti tra lettere compatibili; Minimal lascia separate le lettere. L'alfabeto originale sperimentale comprende a–z, una S dedicata, !, - e punto. Le altre maiuscole usano il glifo minuscolo. I caratteri assenti sono segnalati.
2. Impostare larghezza del percorso centrale, inclinazione, spaziatura e parametri della sezione U. I campi numerici si applicano uscendo dal campo o con Invio. L'ingombro esterno include gli spessori, quindi supera la larghezza del percorso.
3. Ruotare la vista 3D con il mouse, usare rotella e tasto destro. Passare alla vista 2D per ispezionare contorni e percorso centrale tratteggiato. La griglia è da 10 mm. Il comando Adatta ripristina la vista.
4. Consultare il rapporto tecnico. Gli incroci del disegno di esempio sono avvisi reali, non una dichiarazione di produzione pronta.
5. Esportare STL binario, 3MF, OBJ o SVG. STL e OBJ non codificano unità: importarli in millimetri nello slicer. 3MF contiene unità esplicite e mesh Core; non è un progetto Bambu Studio con impostazioni di stampa.
6. Salva scarica un `.filo.json`; Apri lo ricarica. Il browser conserva anche l'ultimo stato in localStorage. Annulla/Ripeti mantengono fino a 60 modifiche nella sessione.

Importazione SVG: i percorsi geometrici diventano **linee centrali**, compresi i contorni chiusi. Usare SVG monolinea senza testi, istanze `<use>`, immagini o script; convertire prima gli oggetti in percorsi. Trasformazioni sono gestite da SVGLoader; la larghezza viene adattata al valore in mm impostato. Massimo 2 MB, 200 percorsi e 15.000 punti importati. Curve ricampionate, non editor Bézier. I colori e lo spessore stroke originali non definiscono la canaletta.

## Struttura

| Cartella | Responsabilità |
| --- | --- |
| `src/calligraphy` | Glifi Bézier centrali originali e layout |
| `src/vector` | Campionamento dei percorsi e import SVG |
| `src/core` | Tipi, parametri, schema progetto e validazione |
| `src/geometry` | Offset/unioni planari e costruzione mesh per livelli |
| `src/optimization` | Analisi lunghezza, raggi e interferenze; ottimizzazione automatica futura |
| `src/ui` | Visualizzatore Three.js / SVG |
| `src/export` | STL, 3MF Core, OBJ e SVG |
| `tests` | Test geometrici e verifica dei file |
| `examples` | Progetto Stay playful, mesh e rapporto generati dai test |
| `docs` | Specifica, decisioni e riepilogo per ChatGPT |

React + TypeScript + Vite + Three.js; Clipper integer a 1/1000 mm per unione e offset; Earcut per triangolazione; fflate per il pacchetto 3MF. Nessun motore CAD remoto. Per le future operazioni solide generiche valutare OpenCascade WASM o Manifold, senza sostituire il percorso centrale con un font estruso.

## Geometria e limiti

Larghezza interna = larghezza LED + tolleranza totale. Larghezza esterna = interna + 2 × parete. Altezza totale = fondo + altezza pareti. La cavità comincia al livello del fondo e rimane aperta superiormente. Estremità arrotondate chiuse, senza terminali separati o uscite cavo.

Si costruiscono fondo inferiore, fondo della cavità, bordo superiore e pareti dai poligoni uniti: una mesh a guscio chiuso per ogni componente, senza solidi sovrapposti assemblati. Tolleranza archi offset 0,015 mm; coordinate mesh Float32. La validazione controlla incidenza e verso dei bordi, ventagli dei vertici, triangoli degeneri e volume positivo. È una verifica topologica numerica, non una certificazione CAD: non include un test generale triangolo-triangolo di auto-intersezione o il limite di errore delle Bézier campionate.

Il raggio è stimato sui campioni. Incroci e vicinanze generano avvisi; non vengono corretti automaticamente. Le unioni risolvono il volume delle canalette sovrapposte, ma possono aprire/fondere le pareti e non rendono fisicamente possibile l'incrocio del LED. Per produrre, correggere i percorsi, verificare raggi e intervallo di taglio del LED, tolleranze e dimensioni del piatto nello slicer. Il modello iniziale largo circa 409 mm non entra intero in un piatto 256 × 256 mm.

Le quattro fotografie citate dall'utente **non sono allegate o presenti nella cartella iniziale**. Non sono state analizzate; la calligrafia è un prototipo originale, non la riproduzione del riferimento fotografico. Depositare le fotografie originali in `docs/references/` per una sessione successiva.

## Riferimenti tecnici

- [Clipper: offset, precisione e tipi di estremità](https://github.com/junmer/clipper-lib/blob/master/Documentation.md)
- [Three.js SVGLoader](https://threejs.org/docs/pages/SVGLoader.html)
- [Three.js STLExporter](https://threejs.org/docs/pages/STLExporter.html)

Stato dettagliato e risultati: PROJECT_STATUS.md. Prossimi sviluppi: ROADMAP.md.
