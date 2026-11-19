## ONE 0.4.1 sperimentale · 19 novembre 2026

Il pannello FILOCONTINUO ONE compone scheletri originali, con percorso unico oppure uno per parola e tre ampiezze dei raccordi. Applica trasferisce le curve nell’editor e nel calcolo 3D con il profilo attivo. I progetti conservano la geometria. L’animazione del percorso unico offre pausa, riavvio e velocità regolabile.

Tutti i 16 casi numerici di examples/v041 risultano incompatibili con il LED dimostrativo R12. Restano aperti il ridisegno delle lettere, la parete condivisa, l’ottimizzazione contestuale e la calibrazione fisica. Dettagli in docs/ONE_CONTINUOUS_ENGINE.md e misure in examples/v041/confronto.json.

# Changelog

## 0.4.0 — 2026-11-18 — Style Studio sperimentale, nessuna release stabile

- Famiglie originali e versionate Signature/Minimal/Vintage, 92 caratteri ciascuna.
- Snapshot della famiglia e delle curve nei progetti V2, reader precedenti conservati.
- Style Studio, varianti, sostituzione lettere, multiriga e trasformazioni reali.
- Neon parametrico, preferiti e import/export famiglie monolinea con validazione e backup.
- Worker Studio, chiave degli input per evitare applicazione di risultati obsoleti, ingombri analitici delle cubiche.
- 30 progetti/SVG, 9 Neon, confronto con profilo fisso e legacy. Stay playful rimane incompatibile a 400/600/800 mm.
- 60 test e build web/desktop, smoke delle famiglie incluse, verifica visiva Windows e salvataggio/riapertura nativi.
- Nuovo installer locale non firmato con alias richiesto; comportamento aggiornamenti invariato e nessun latest.yml non firmato pubblicato.
- CI Linux e Windows riuscita sul codice e2d5cf4: corretto lo shim dei test worker (self === globalThis), senza modificare il worker distribuito. Audit: sei advisory moderati di sviluppo e zero di produzione; nessun downgrade automatico.


## 0.4.0 — 2026-11-18 — sorgenti pubblicati, distribuzione desktop sperimentale

- Primo push autorizzato, clone da GitHub verificato in D:/filocontinuo_github, backup esterno e Git separato dalla vecchia cartella.
- Installazione pulita dipendenze, 45 test, build web/installer e smoke del pacchetto ricostruito riusciti; nessuna release stabile pubblicata.

- Autenticazione GitHub completata con Git Credential Manager; configurato Git in VS Code e verificato push --dry-run, senza pubblicazione.

- Nuova app Electron Windows mantenendo modalità web e motore/schema V1/V2.
- Protocollo locale, sandbox, bridge limitato e convalida IPC/progetti/backup.
- Apertura/salvataggio nativi, controllo modifiche, dati Windows e backup/ripristino.
- Impostazioni/aggiornamenti con consenso separato; nessun download/installazione automatici, rifiuto beta/downgrade e blocco senza firma.
- Installer NSIS x64 non firmato, icona e collegamenti; smoke renderer/worker/mesh.
- Git locale, rami, origin pubblico, esclusioni dati e workflow CI/release solo in bozza; nessun push o release.
- 45 test superati e build web; QA installazione/aggiornamento reale ancora da eseguire.
- Documentazione distribuzione/sicurezza/licenze. Nessuna modifica geometrica o miglioramento LED rivendicato.


## 0.3.0 — 2026-11-18

- Aggiunto motore contestuale opzionale; conservati generatori e progetti precedenti.
- Tre candidate, contesti di lettera, porte e raccordi C1, tratti secondari protetti e svolazzi.
- Limiti larghezza/scostamento e confronti LED fissi senza ingrandimento automatico.
- Bound conservativi della curvatura, estremi/giunzioni/singolarità e quattro stati di verifica.
- Raccordi di estremità separate, inversione e scostamento geometrico con anteprima.
- Editor: inversione/apertura cicli, clic senza modifica, annullamento gesti, cronologia nodi/maniglie.
- Worker annullabile per analisi/mesh/varianti/ottimizzazione, risultati obsoleti scartati e ripristino.
- Viste Calligrafica/Tecnica/Neon e annotazioni fisiche dei provini.
- 36 SVG puliti, sei Neon e galleria/confronti V0.2/V0.3 per sei testi.
- Candidate Stay playful: 4 tratti e zero incroci rilevati, ma incompatibili a 400/600 mm e con raggi peggiori del riferimento. Obiettivo produttivo non raggiunto.
- 34 test e formati verificati; browser/slicer/stampa non verificati. Audit ripetuto: quattro high dev senza patch compatibile individuata.

## 0.2.0 — 2026-11-17

- Mantenuti generatore, file e test V0.1; nuovo schema Bézier V2 e backup iniziale.
- Aggiunti campionamento adattivo 0,03 mm, operazioni vettoriali immutabili e conservazione SVG polinomiali.
- Implementato editor percorsi/nodi/maniglie con split, join, trasformazioni e undo/redo.
- Aggiunte anomalie localizzate/raggruppate, colori e navigazione al difetto.
- Aggiunti ottimizzatore euristico con anteprima e profili LED dimostrativi riutilizzabili.
- Creati alfabeto aperto e caso Stay playful compatibile con i controlli a 1600 mm; resta fuori piatto e con 17 tratti.
- Generati provini di calibrazione con linguette incise T/R, raggi e tolleranze; export STL/3MF entro P1S.
- Distinti stati mesh/LED/volume P1S; conservati quattro formati di esportazione.
- Portati a 20 i test superati, inclusi SVG e rendering SSR; build riuscita. Nessuna QA visiva/slicer o prova fisica dichiarata.
- TEMP/TMP e cache npm di avvio su D; documentate dipendenze dev con advisory senza patch corrente.
- Foto ancora mancanti: nessuna ricostruzione fotografica dichiarata.

## 0.1.0 — 2026-11-17

- Creato FILOCONTINUO nel workspace locale Windows.
- Implementati alfabeto monolinea originale, testo, layout, spaziatura e inclinazione.
- Implementati offset/unioni planari e costruzione della canaletta U chiusa come solido e aperta superiormente.
- Aggiunti controlli topologici, lunghezza LED, raggio minimo stimato e avvisi di interferenza.
- Creati interfaccia italiana, viste SVG/Three.js, griglia, adattamento e triangoli.
- Aggiunti import SVG, esportatori STL/3MF/OBJ/SVG, file progetto, autosave e cronologia.
- Preparati avvio Windows, test, esempi e documentazione per proseguire tra ChatGPT e Codex.
- Segnalate fotografie mancanti e limiti fisici dell'alfabeto sperimentale.
