# Roadmap

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
- [ ] Bound del minimo di curvatura per intervalli e singolarità
- [ ] Alfabeto compatto con continuità tangente e meno interruzioni
- [ ] Editor dei cicli, inversione direzione, snap e maniglie vincolate
- [ ] Ottimizzatore globale con routing e conservazione estetica misurabile
- [ ] Test generale di auto-intersezioni della mesh e controllo degli spessori
- [ ] Test d'importazione e slicing in Bambu Studio / Cura
- [ ] Worker per analisi e generazione; limiti complessità unificati

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

- [ ] Simulazione luminosa e varianti calligrafiche
- [x] Persistenza controlli Bézier per SVG polinomiali importati in V0.2
- [ ] Conversione adattiva archi/ellissi durante importazione SVG
- [ ] Desktop Windows tramite Tauri o Electron; riutilizzo dei moduli puri
- [ ] 3MF con componenti e metadati produttivi; validazione schema completa
- [ ] Aggiornare toolchain quando disponibile una patch per l'advisory picomatch rilevato da npm audit
