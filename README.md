# FILOCONTINUO 0.4.2

Aprire release/FILOCONTINUO-Setup-0.4.2.exe. Nel pannello ONE selezionare Geometria vincolata, provare Love a 400 mm e applicare per il calcolo 3D. [Galleria](examples/v042/galleria.html).

# FILOCONTINUO 0.4.1
Progetta insegne Neon Flex da percorsi centrali Bézier. Apri il setup Windows x64 sperimentale in release/FILOCONTINUO-Setup-0.4.1.exe. Nel pannello ONE scegli il testo, confronta i raccordi e applica la proposta per analizzarla in 3D. Style Studio offre Signature, Minimal e Vintage. Il checkout attivo è D:/FILOCONTINUO_Studio/filocontinuo_github.

[Stato tecnico](PROJECT_STATUS.md) · [Roadmap](ROADMAP.md) · [Changelog](CHANGELOG.md) · [Installazione](docs/INSTALLATION.md) · [Galleria ONE](examples/v042/galleria.html)

## Avvio web locale

Doppio clic su **avvia.cmd**, quindi http://127.0.0.1:5173/. Tenere aperta la finestra del server; Ctrl+C per arrestarlo. Il programma funziona offline dopo l'installazione, senza account o servizi remoti. Cache/log npm e TEMP/TMP dell'avvio sono sul disco D nella cartella `.tools`.

Per sviluppo e riproduzione dei risultati:

```powershell
$env:PATH = "$PWD/.tools/node-v22.16.0-win-x64;$env:PATH"
$env:TEMP = "$PWD/.tools/tmp"
$env:TMP = $env:TEMP
npm ci
npm run dev
npm run examples:v03
npm test
npm run build
```

Su altri computer installare Node.js 22+ o copiare il runtime portatile. La sincronizzazione GitHub è predisposta, ma il primo push richiede conferma del proprietario. Il server ascolta sul loopback.

## Come continuare un progetto

Apri accetta JSON V1/V2. La grafia precedente rimane invariata: il nuovo motore va scelto esplicitamente, oppure con **Nuovo**, che crea un progetto V0.3. Lo schema rimane JSON V2, esteso con campi opzionali e nodi/maniglie originali. I vecchi SVG già campionati restano polilinee convertibili in cubiche lineari equivalenti; le loro curve originali non possono essere recuperate.

Il selettore Motore mantiene V0.1, V0.2 classico/aperto e V0.3 contestuale. Quando ci sono modifiche manuali, testo e motore sono congelati. **Rigenera dal testo** sostituisce esplicitamente le modifiche; larghezza/inclinazione/proporzione trasformano invece anche le curve editate. La spaziatura del testo richiede rigenerazione.

Salva scarica `.filo.json`; autosave mantiene l'ultimo stato nel browser. La cronologia conserva fino a 60 operazioni e include le maniglie. Dopo un errore è disponibile il ripristino dell'ultimo progetto calcolato con mesh valida, salvato separatamente nel browser. Questo non certifica la compatibilità fisica LED.

## Generazione e confronto

Impostare **Larghezza percorso** (obiettivo) e **Larghezza massima percorso**. Sono quote del percorso centrale; il solido comprende anche pareti e tolleranza. Non avviene un aumento automatico della larghezza per ottenere un esito favorevole.

**Genera varianti** produce Fluida, Aperta e Slanciata, con differenze di geometria/proporzione e apertura delle forme. Le schede mostrano anteprima, ingombro, tratti LED, lunghezza, raggio osservato e stato geometrico. L'originale resta intatto fino alla scelta. Una candidata incompatibile può essere aperta per correzione manuale: non è presentata come soluzione produttiva. **Caso Stay playful · confronta** usa gli stessi limiti e profilo del progetto corrente.

Il motore usa scheletri centrali originali raccordati C1, porte di ingresso/uscita, forme iniziale/intermedia/finale/isolata classificate e variazioni proporzionali dipendenti dai vicini. Punti e barre sono elementi secondari separati e protetti dai raccordi automatici. Svolazzi iniziali/finali facoltativi. Non è ancora una libreria professionale di glifi contestuali alternativi: ricalco fotografico, qualità estetica e raccordi producibili richiedono ulteriore lavoro.

Supportati a–z, S e punteggiatura di base; altre maiuscole tramite minuscole. I caratteri assenti sono segnalati. Provati anche Amore, Olivia, Tradizione, Buon compleanno e Filocontinuo. Nessun contorno di font estruso.

La [galleria locale](.tools/legacy-examples/v03/galleria.html) raccoglie **36 SVG puliti** (sei testi × tre varianti × due larghezze) e sono presenti sei SVG Neon estetici aggiuntivi. `confronto.json` contiene parametri e misure riproducibili. Eseguire `npm run examples:v03` prima dei test degli artefatti se si rigenera questa cartella.

## Tre viste

- **Calligrafica:** percorso pulito senza annotazioni.
- **Tecnica:** canaletta, percorsi, nodi/maniglie nell'editor e anomalie; mantiene anche la vista 3D orbitabile.
- **Neon:** anteprima estetica su fondo scuro, senza simulazione fisica della luce.

Le viste estetiche non nascondono lo stato di compatibilità nel pannello. Le anteprime SVG sono generate e controllate come dati, non valutate visivamente in questa sessione.

## Editor

Trascinare un percorso per spostarlo, un nodo per spostare punto/maniglie, una maniglia per cambiare la curva. Maiusc+clic per selezione multipla. **+ Nodo** divide esattamente con de Casteljau; **− Nodo** modifica la forma mantenendo almeno due nodi. **Separa** agisce su nodi interni aperti; **Unisci** collega fine→inizio dei due percorsi selezionati. **Inverti** conserva la geometria cambiando il verso. **Apri ciclo** duplica il nodo selezionato come estremità e conserva il percorso completo, senza creare automaticamente un varco per il LED.

Ruota/Scala agiscono sul centro medio dei nodi del percorso. Sfondo trascinabile, rotella per zoom, Adatta per ripristinare la vista. Un clic di selezione non crea una modifica nella cronologia; Escape, pointercancel e perdita della cattura annullano il trascinamento. Le modifiche vengono applicate al rilascio. Dopo operazioni topologiche la selezione viene azzerata. Questi flussi hanno controlli di codice/unità ma non sono stati provati con il mouse nel browser.

## Controlli e ottimizzazione

Quattro stati: **Compatibile con i controlli**, **Vicino ai limiti**, **Incompatibile**, **Da verificare**. Verde solo quando i controlli implementati sono conclusivi; grigio per verifiche non conclusive, giallo per margini, rosso per violazioni. Le anomalie selezionate vengono centrate nell'editor; coordinate rappresentative, non una soluzione simbolica delle intersezioni.

La curvatura usa le derivate Bernstein e suddivisione adattiva: velocità limitata inferiormente mediante il box dei controlli derivati, prodotto vettoriale velocità/accelerazione limitato superiormente. Inclusi estremi e giunzioni. Una retta monotona è riconosciuta analiticamente; curve singolari e budget esauriti non ricevono verde. Una discontinuità di tangente >0,05° è incompatibile, tra 0,001° e 0,05° non conclusiva. La verifica impone anche raggio almeno pari a metà della larghezza esterna per evitare pieghe della sezione. Si tratta di bound numerici Float64, non certificazione CAD con arrotondamenti direzionati.

Le interferenze rimangono su polilinee adattive entro 0,03 mm, passo massimo 2 mm, con controlli/raggruppamenti della V0.2 e relative esclusioni locali. Non c'è una prova generale di assenza di auto-intersezioni triangolo-triangolo della mesh.

**Ottimizza percorso** prova tangenti e raccordi cubici tra estremità distinte, anche con inversione. Barre/punti restano esclusi. Applica limiti di larghezza, raggio, nuovi difetti localizzati e **Scostamento massimo proposta**. Lo scostamento è un limite superiore simmetrico della distanza geometrica ottenuto da polilinee a 0,01 mm, distanza ai segmenti e margine di metà corda; può rifiutare miglioramenti piccoli perché conservativo. Confronta evidenze geometriche, non solo gruppi di avvisi. Ricerca limitata a 24 tentativi, senza soluzione globale garantita. Originale conservato fino alla conferma; proposta tratteggiata e misure prima/dopo.

## Calcoli, errori e produzione

Analisi, mesh, varianti e ottimizzazioni avvengono in Web Worker. Modificare il progetto termina il vecchio job; ID obsoleti scartati. Annulla calcolo termina il worker, mantiene gli ultimi dati e sospende export/editing finché non si ricalcola. Errori mostrati senza cancellare il progetto. **Ricalcola** e **Ripristina ultimo progetto calcolato** consentono di proseguire. Servono browser moderni con Worker; non c'è fallback sincrono nascosto.

Mesh, geometria LED, piatto P1S, larghezza massima e prova fisica sono stati separati. Profili iniziali dimostrativi; flessione verticale non supportata in XY. Il passo di taglio è conservato, non ottimizzato. Il campo Osservazioni nei provini conserva nel JSON soltanto quanto scritto dall'utente, senza promuovere il profilo a verificato.

Provini di calibrazione V0.2 mantenuti: tre rette da 82 mm e tre archi R8/R12/R20 con linguette T/R incise, circa 179,5 × 188,3 × 8,5 mm. STL/3MF entro P1S, senza prova slicer o fisica. Alcune curve sono volutamente sotto il minimo per sperimentare.

STL/OBJ: coordinate mm, importare come mm. 3MF Core con unità, senza impostazioni Bambu. SVG V2 con cubiche originali. Import SVG polinomiale con trasformazioni: archi/ellissi da convertire prima, testi/use/immagini/script respinti; massimo 2 MB, 200 percorsi, 5000 nodi. Mesh non valida o dati non aggiornati bloccano l'export.

