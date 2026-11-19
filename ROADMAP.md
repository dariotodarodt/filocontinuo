## ONE 0.4.1 sperimentale · 19 novembre 2026

Il pannello FILOCONTINUO ONE compone scheletri originali, con percorso unico oppure uno per parola e tre ampiezze dei raccordi. Applica trasferisce le curve nell’editor e nel calcolo 3D con il profilo attivo. I progetti conservano la geometria. L’animazione del percorso unico offre pausa, riavvio e velocità regolabile.

Tutti i 16 casi numerici di examples/v041 risultano incompatibili con il LED dimostrativo R12. Restano aperti il ridisegno delle lettere, la parete condivisa, l’ottimizzazione contestuale e la calibrazione fisica. Dettagli in docs/ONE_CONTINUOUS_ENGINE.md e misure in examples/v041/confronto.json.

# Roadmap

## V0.4 — Calligraphy & Style Studio

- [x] Backup, branch dedicato e conservazione dei generatori/progetti precedenti
- [x] Famiglie schema 1 originali Signature, Minimal, Vintage; autore/licenza/versione
- [x] 92 caratteri per famiglia, accenti, maiuscole e avvisi senza fallback nello Studio
- [x] Varianti realmente disponibili, ripetizioni e sostituzione di una lettera con snapshot
- [x] Confronto famiglie e varianti in worker, metriche e quattro stati LED
- [x] Parametri reali, multiriga, allineamenti, interlinea e offset
- [x] Import/export famiglie JSON, preferiti e backup desktop validato
- [x] Neon estetico parametrico e colore canaletta 3D
- [x] 30 progetti/SVG, 9 Neon e confronti 400/600/800 mm
- [x] 60 test, build web/desktop, smoke famiglie e prova visiva Windows limitata
- [ ] Qualità professionale e percorsi Stay playful realmente producibili con R12
- [ ] Glifi contestuali completi per ogni famiglia; raccordi generali e routing
- [ ] Corrispondenza lettera/nodi dopo modifiche manuali arbitrarie
- [ ] Verifica UI completa di import famiglie, singola lettera, nodi ed export
- [ ] Luxury, Handwriting, Modern; licenze esterne da esaminare prima di includere risorse
- [ ] TTF/OTF, estrazione sperimentale linea centrale e testo lungo archi
- [ ] Prove fisiche, tagli LED, firma e test di aggiornamento reale
- [ ] V0.5: sezionamento automatico e giunzioni per il piatto


## 0.4.0 — desktop e distribuzione sperimentale

- [x] Backup locale, Git/origin/rami e filtri di riservatezza
- [x] Electron sandbox e protocollo locale, API preload limitate e IPC validato
- [x] File nativi V1/V2, esportazioni, preferenze e backup/ripristino versionato
- [x] Installer NSIS reale non firmato, icona e collegamenti configurati
- [x] Aggiornamenti con consenso, nessun automatismo e blocco senza firma
- [x] 45 test e build web, smoke del pacchetto senza verifica visiva
- [x] Verifica visiva Windows limitata a CAD/3D e aggiornamenti, salvataggio nativo e JSON V2 valido
- [x] Workflow CI e release firmata solo in bozza, inventario licenze
- [x] Autenticazione GitHub, Git configurato in VS Code e verifica push --dry-run
- [x] Conferma del manifesto e primo push GitHub
- [x] Backup esterno D:/filocontinuo_backup e verifica di 208 file critici
- [x] Nuovo clone D:/filocontinuo_github, npm ci, 45 test, build web/desktop e smoke
- [x] Git separato in D:/filocontinuo_tools e configurazione percorso VS Code
- [ ] Protezioni rami e ambiente release-signing con revisori su GitHub
- [ ] Esecuzione effettiva dei workflow sul repository
- [ ] Certificato Authenticode e gestione sicura secret
- [ ] Test su Windows pulito: installazione, offline, file, disinstallazione
- [ ] Aggiornamento reale fra due versioni firmate con conservazione dati
- [ ] Correzione advisory compatibili del grafo build prima del canale stabile
- [ ] Autorizzazione proprietario per tag e pubblicazione stabile


## V0.3 — generazione contestuale e controlli

- [x] Backup e conservazione generatori/progetti V1/V2
- [x] Tre candidate contestuali con porte, contesto e svolazzi facoltativi
- [x] Confronti 400/600 mm senza aumento automatico della larghezza
- [x] Larghezza obiettivo/massima e scostamento ammesso configurabili
- [x] Bound numerico conservativo di curvatura, estremi, giunzioni e singolarità
- [x] Raccordi di estremità separate, inversione e controllo geometrico/scostamento
- [x] Apertura dei cicli e annullamento gesti nell'editor; cronologia testata
- [x] Worker per analisi, mesh, varianti e ottimizzazione, cancellazione/errori/job obsoleti
- [x] Viste Calligrafica, Tecnica, Neon estetica
- [x] 36 SVG per sei testi × tre varianti × 400/600 mm, sei Neon e galleria
- [x] Osservazioni reali della calibrazione salvate, senza certificazione automatica
- [x] 34 test, inclusi i 20 precedenti, worker e verifica formati
- [ ] Stay playful realmente compatibile in 2–4 tratti: candidate attuali incompatibili
- [ ] Glifi a raggio controllato: raggi attuali peggiori del riferimento V0.2
- [ ] Validare naturalezza/leggibilità con foto e revisione umana degli SVG
- [ ] Repertorio completo di glifi iniziali/intermedi/finali e alternative contestuali
- [ ] Verificare UI/worker/gesti nel browser, poi slicer e stampa
- [ ] Intervalli rigorosi di curvatura e bound delle collisioni
- [ ] Routing globale, misura spaziale dei difetti e non regressione più affidabile
- [ ] Calibrazione nel worker e profilazione delle prestazioni reali

## V0.1 — base operativa

- [x] Interfaccia CAD italiana e viste 2D/3D navigabili
- [x] Alfabeto monolinea sperimentale e testo Stay playful
- [x] Parametri U e dimensioni in millimetri
- [x] Import SVG come percorsi centrali
- [x] Offset, unioni e triangolazione; validazione topologica
- [x] Lunghezza LED e avvisi raggio/incroci/vicinanze
- [x] STL, 3MF Core, OBJ, SVG
- [x] Progetti JSON, salvataggio locale e Annulla/Ripeti

## V0.2 — percorsi producibili

Stato: base V0.2 implementata; compatibilità verificata con controlli numerici, senza prove fisiche. Caso Stay playful da 1600 mm: zero errori LED rilevati, 17 tratti, fuori piatto P1S.

- [ ] Acquisire e analizzare le quattro fotografie originali
- [ ] Ridisegnare l'alfabeto con vincoli di raggio e continuità tangente
- [ ] Lettere maiuscole, cifre, accenti e punteggiatura completa
- [ ] Signature e Minimal con glifi distinti; Luxury, Vintage, Handwriting
- [x] Bézier originali in JSON V2, import/export SVG e lettura progetti V1
- [x] Campionamento adattivo con limite 0,03 mm sull'involucro dei controlli
- [x] Editor nodi/maniglie, inserimento/eliminazione, split aperto/join, rotazione/scala e undo/redo
- [x] Localizzare e raggruppare anomalie con marcatori, coordinate e navigazione
- [x] Ottimizzazione euristica con anteprima, ricontrollo e conferma
- [x] Libreria LED dimostrativa salvabile, import/export JSON
- [x] Provini P1S con tolleranze, raggi e marcature T/R; STL/3MF
- [x] Stati separati mesh, compatibilità LED e volume P1S
- [ ] Verifica visiva browser: servizio di accesso indisponibile
- [x] Bound numerico di curvatura per suddivisione e gestione conservativa delle singolarità
- [ ] Intervalli rigorosi con arrotondamento direzionato
- [ ] Alfabeto compatto con continuità tangente e meno interruzioni
- [x] Apertura dei cicli e inversione direzione
- [ ] Snap, selezioni avanzate e maniglie vincolate
- [ ] Ottimizzatore globale con routing e conservazione estetica misurabile
- [ ] Test generale di auto-intersezioni della mesh e controllo degli spessori
- [ ] Test d'importazione e slicing in Bambu Studio / Cura
- [x] Worker per analisi, mesh, varianti e ottimizzazione
- [ ] Limiti complessità unificati, profilazione browser e test di carico

## Produzione

- [x] Controllo volume P1S 256 × 256 × 256 mm nell'orientamento corrente
- [ ] Altri piatti/configurazione personalizzata e ottimizzazione orientamento
- [ ] Divisione automatica e manuale in parti stampabili
- [ ] Giunzioni, incastri, terminali e fori cavo
- [x] Profili LED, passo di taglio e flessione memorizzati
- [ ] Verifica fisica profili, multipli di taglio, alimentazioni e connettori
- [ ] Collegamento intelligente delle lettere e ottimizzazione continuità LED
- [ ] Stima materiale, sfridi e costi reali

## Evoluzione

- [x] Tre candidate calligrafiche e vista Neon estetica
- [ ] Simulazione luminosa fisica e libreria calligrafica professionale
- [x] Persistenza controlli Bézier per SVG polinomiali importati in V0.2
- [ ] Conversione adattiva archi/ellissi durante importazione SVG
- [x] Desktop Windows Electron sperimentale; riutilizzo dei moduli puri (QA distribuzione ancora incompleta)
- [ ] 3MF con componenti e metadati produttivi; validazione schema completa
- [ ] Aggiornare toolchain quando disponibile una patch per l'advisory picomatch rilevato da npm audit
