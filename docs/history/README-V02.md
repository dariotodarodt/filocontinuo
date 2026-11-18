# FILOCONTINUO V0.2

Studio locale Windows per progettare canalette LED Neon Flex da percorsi monolinea Bézier. Prototipo sperimentale: i controlli implementati non sostituiscono verifica del LED, slicing e stampa fisica.

## Avvio

Doppio clic su **avvia.cmd**, poi aprire http://127.0.0.1:5173/. Tenere aperta la finestra del server; Ctrl+C per arrestarlo. Se il server è già attivo, aprire direttamente l'URL. Nessun account o servizio remoto.

Il runtime Node portatile è in `.tools/node-v22.16.0-win-x64`. Comandi di sviluppo:

```powershell
$env:PATH = "$PWD/.tools/node-v22.16.0-win-x64;$env:PATH"
$env:TEMP = "$PWD/.tools/tmp"
$env:TMP = $env:TEMP
npm install
npm run dev
npm test
npm run build
```

`.npmrc` indirizza cache/log npm a `.tools/npm-cache`; avvia.cmd imposta anche TEMP/TMP sul disco D del progetto. Nessun file personale eliminato. Su un altro computer installare Node.js 22+ o copiare il runtime portatile. Dopo l'installazione delle dipendenze l'app funziona offline.

## Testo e compatibilità V0.1

Nuovo crea un progetto V0.2 con alfabeto aperto originale a–z, S e punteggiatura di base. Le altre maiuscole usano minuscole; caratteri assenti segnalati. Signature e Minimal variano lo spazio tra glifi: non sono famiglie calligrafiche professionali distinte. Il generatore non impone collegamenti non verificati.

Larghezza, inclinazione, proporzione verticale e spaziatura sono modificabili. I campi numerici si applicano con Invio o uscendo dal campo. L'ingombro del solido include pareti e tolleranza.

Apri accetta V0.1 e V0.2. La V0.1 mantiene generatore e geometria precedenti; modificandola nell'editor viene conservata come cubiche lineari equivalenti in V0.2. Non è possibile ricostruire le Bézier dei vecchi SVG già campionati. Salva scarica `.filo.json`; autosave mantiene l'ultimo stato nel browser. Undo/redo conserva fino a 60 operazioni. I file V0.2 contengono nodi e maniglie in mm e non sono leggibili dalla vecchia app.

## Editor Bézier

1. Premere **Editor nodi Bézier**. Cliccare/trascinare un tratto per selezionarlo/spostarlo; trascinare nodi e maniglie per modificare la curva. Le maniglie seguono il nodo quando viene spostato.
2. **+ Nodo** divide esattamente il segmento successivo con de Casteljau; sul nodo finale divide l'ultimo segmento. **− Nodo** elimina mantenendo almeno due nodi e può cambiare la forma.
3. **Separa** agisce su un nodo interno di un percorso aperto. Maiusc+clic seleziona due percorsi; **Unisci** collega fine→inizio nell'ordine di selezione. Le unioni manuali possono creare difetti, che sono rianalizzati.
4. **Ruota/Scala** agiscono intorno al centro medio dei nodi selezionati. Sfondo trascinabile, rotella per zoom, Adatta per ripristinare la vista.

Il gesto viene applicato al rilascio e aggiorna analisi/mesh; Annulla/Ripeti ripristinano anche le maniglie. Il JSON conserva le modifiche. Con modifiche manuali testo/stile sono congelati: **Rigenera dal testo** le sostituisce esplicitamente. Larghezza, inclinazione e proporzione trasformano anche le curve manuali; la spaziatura richiede rigenerazione.

## Diagnostica e ottimizzazione

Verde: nessun difetto rilevato; giallo: vicino ai limiti; rosso: incompatibile con un controllo. Marcatori ed elenco **Anomalie localizzate** selezionano il difetto, ne mostrano le coordinate e lo inquadrano nell'editor.

Rilevati: raggi insufficienti, cambi di tangente, incroci/auto-intersezioni, ripassi collineari, distanze e tratti troppo brevi. Rilevazioni vicine dello stesso tipo/sugli stessi percorsi sono raggruppate; coordinate rappresentative, campione peggiore per i raggi. Le intersezioni sono calcolate sulle polilinee, non simbolicamente sulle Bézier.

**Ottimizza percorso** prova allineamento delle tangenti, unioni quasi coincidenti e piccoli spostamenti per distanziare componenti. La proposta azzurra tratteggiata mostra conteggi prima/dopo e spostamento dei controlli; l'originale resta intatto fino alla conferma. Candidati accettati solo con punteggio migliore, senza aumento dei gruppi di incroci/ripassi e senza peggiorare il raggio campionato oltre il 2%. Se non migliora lo dichiara. È un'euristica limitata, senza garanzia estetica o di soluzione globale.

## Profili LED

Due profili dimostrativi 6 × 8 e 8 × 12 mm, con sezione, tolleranza, pareti/fondo, raggio, flessione e intervallo di taglio. Salvare un profilo lo rende riutilizzabile nel browser e nel progetto; import/export libreria JSON per trasferirlo. I profili iniziali e quelli creati in UI sono dimostrativi fino a verifica fisica.

Flessione laterale nel piano XY supportata; verticale registrata ma dichiarata non supportata. Il passo di taglio è conservato, senza ottimizzazione dei multipli o delle alimentazioni.

## Stay playful e calibrazione

**Caso Stay playful** cerca una scala compatibile con i controlli e il profilo corrente entro 2000 mm; non diminuisce il raggio richiesto. Con il profilo iniziale: percorso 1600 mm; raggio minimo campionato circa 13,20 mm contro 12 mm; zero errori e due avvisi. Ingombro 1608,69 × 168,99 × 8,50 mm; 17 tratti e 2,224 m di LED. Non entra sul P1S e non è suddiviso. Caso tecnico, non ricostruzione fotografica: le foto non sono disponibili.

**Campione calibrazione**: tre rette da 82 mm con tolleranze differenti e tre archi 90° R8/R12/R20, ciascuno con linguetta solidale marcata T (tolleranza totale, due decimali) o R (raggio). I sei provini sono componenti separati nello stesso STL/3MF. Ingombro iniziale circa 179,5 × 188,3 × 8,5 mm, entro P1S 256 × 256 × 256 mm. Alcuni raggi sono volutamente incompatibili per la prova fisica. Limiti: esterno ≤14 mm, altezza ≤30 mm. Nessuna stampa o prova slicer effettuata.

File riproducibili in `examples/v02/`: progetti, STL/3MF/OBJ/SVG e rapporti JSON.

## Geometria e formati

U aperta sopra: interno = LED + tolleranza totale; esterno = interno + 2 × parete; altezza = fondo + pareti, indipendente dall'altezza LED. Clipper su interi a 1/1000 mm, archi offset con tolleranza 0,015 mm, Earcut e mesh costruita da contorni per livelli. Controlli su bordi, orientamento, ventagli dei vertici, triangoli degeneri e volume. Export mesh bloccato se non valido.

STL binario/OBJ usano mm senza unità native: importare in mm. 3MF contiene unità e mesh Core, non impostazioni Bambu. SVG V0.2 conserva cubiche originali; V0.1 polilinee. Import SVG conserva controlli e trasformazioni di linee/quadratiche/cubiche; convertire archi/ellissi in cubiche. Respinti testi, use, immagini, script e foreignObject. Massimo 2 MB, 200 percorsi e 5000 nodi; scala iniziale adattata alla larghezza impostata. Contorni di font non diventano automaticamente monolinea.

Campionamento adattivo: involucro dei controlli entro **0,03 mm** dalla corda e passo massimo 2 mm. Raggi campionati in 63 punti interni per cubica, senza bound del minimo globale. Cambi di tangente >8° segnalati, >20° rossi; preavviso distanze a larghezza esterna +0,5 mm. Mancano controllo generale triangolo-triangolo e certificazione degli spessori. La UI distingue **mesh**, **LED** e **volume P1S**: mesh chiusa non significa produzione pronta.

## Moduli e verifica

`vector`: Bézier, editing, campionamento/import; `calligraphy`: librerie e layout; `optimization`: diagnostica/proposte/piatto; `geometry`: canalette e provini; `core`: schema e profili; `export`: formati; `ui`: visualizzatori/controlli. React/TypeScript/Vite/Three.js, nessun servizio remoto.

20 test automatici superati; build riuscita. Rendering iniziale SSR e parsing XML testati, ma **non equivalgono a QA visiva o prova dei gesti**. Browser automation host indisponibile. Slicer e stampa fisica non effettuati.

Stato/limiti: PROJECT_STATUS.md. Prossimi sviluppi: ROADMAP.md. Trasferimento a ChatGPT: docs/RIEPILOGO_CHATGPT.md. Documenti precedenti in docs/history/; backup iniziale in .tools/backups/prima-v02.zip.
