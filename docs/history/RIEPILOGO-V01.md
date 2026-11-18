# Riepilogo da trasferire a ChatGPT

È stata realizzata FILOCONTINUO V0.1.0 in D:\filocontinuo, il 17 novembre 2026. Avvio con avvia.cmd; URL locale http://127.0.0.1:5173/.

Stack: React, TypeScript, Vite, Three.js, Clipper, Earcut e fflate. Moduli separati per calligrafia, tipi/progetto, geometria, analisi produttiva, UI ed esportazione.

Operativi: testo monolinea da glifi Bézier originali, Signature con connessioni di base e Minimal con lettere separate, import SVG, viste 2D/3D navigabili, dimensioni in mm, sezione U parametrica, lunghezza LED, avvisi geometrici, Salva/Apri JSON, autosave, Annulla/Ripeti ed export STL, 3MF Core, OBJ e SVG. I glifi sono sperimentali: minuscole a–z e S dedicata, non una libreria professionale completa.

La mesh deriva da offset e unioni planari: fondo, pareti e cavità superiore formano una superficie chiusa orientata. Validazione su bordi, vertici, triangoli degeneri e volume; blocco export mesh se non valida. La verifica topologica non certifica auto-intersezioni generiche o compatibilità LED.

Caso Stay playful: percorso largo 400 mm, ingombro 408,69 × 89,42 × 8,50 mm; LED teorico 1,609 m; 7 percorsi; 26.148 triangoli; nessun bordo aperto, bordo/vertice non-manifold o faccia degenere. STL riletto e ricontrollato. Il disegno contiene però incroci e un raggio minimo stimato di 0,419 mm contro i 12 mm richiesti: NON pronto per la produzione. Il solido non entra intero sul piatto P1S 256 × 256 mm. Nessuna divisione automatica ancora implementata.

Test: 6/6 superati; TypeScript e build Vite superati; server HTTP 200. Controllo visivo del browser bloccato dallo strumento per impossibilità di determinare l'URL; nessun test slicer o stampa reale eseguito. Bundle da ottimizzare e analisi da spostare in Worker.

Le quattro fotografie non erano allegate o presenti: nessuna analisi fotografica e nessuna pretesa di riprodurre il loro lettering. Prossima priorità: acquisire le foto e costruire un percorso Stay playful realmente producibile, con raggi controllati, continuità tangente e incroci risolti. Poi confronto in Bambu Studio e stampa di un campione della sezione.

Documenti mantenuti: README.md, AGENTS.md, ROADMAP.md, CHANGELOG.md, PROJECT_STATUS.md. In examples/ sono disponibili progetto, STL, 3MF, SVG e rapporto JSON. Requisiti originali in docs/PROMPT_ORIGINALE.md.
