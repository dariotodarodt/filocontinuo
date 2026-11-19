# FILOCONTINUO 0.4.2 · Report di brainstorming

**Love e Memo a 400 mm superano i controlli implementati sul LED e sulla mesh. Amore li supera a 600 mm.** Tutte e tre le parole sono composte da un percorso aperto con due estremità. A queste misure risultano zero incroci e zero ripassi rilevati. Il risultato è numerico. Leggibilità, inserimento del LED e resistenza delle pareti richiedono ancora una prova reale.

Il confronto usa lo stesso profilo dimostrativo per entrambi i motori. LED 6 × 8 mm a flessione laterale, raggio di mezzeria 12 mm, tolleranza 0,30 mm, pareti indipendenti da 1,20 mm, fondo da 1,50 mm e altezza pareti 7 mm. La distanza richiesta tra assi paralleli è 8,70 mm.

| Parola | Dimensioni centrali mm | LED mm | R minimo 0.4.1 → 0.4.2 mm | Distanza osservata mm | LED / mesh |
|---|---:|---:|---:|---:|---|
| Love | 400 × 138,5 | 777,2 | 2,62 → 20,68 | 15,20 | compatibile / valida |
| Love | 600 × 207,8 | 1.165,9 | 3,93 → 31,02 | 15,80 | compatibile / **non valida** |
| Amore | 400 × 51,2 | 635,1 | 1,67 → 13,60 | 15,22 | vicino ai limiti / valida |
| Amore | 600 × 76,7 | 952,7 | 2,50 → 20,41 | 15,13 | compatibile / valida |
| Memo | 400 × 50,7 | 667,8 | 1,43 → 13,97 | 15,33 | compatibile / valida |
| Memo | 600 × 76,1 | 1.001,8 | 2,14 → 20,96 | 15,33 | compatibile / valida |

**Motore.** La V0.4.1 arrotondava vertici ravvicinati mediante quadratiche proporzionali ai lati. Nei ritorni stretti questo produceva raggi molto piccoli anche senza cuspidi. La V0.4.2 costruisce otto glifi generici, L, A, M, o, v, e, m, r, con segmenti e archi tangenti. Converte ogni arco in cubiche di apertura massima 45°, verifica lo spazio per il raggio richiesto e analizza le cubiche effettive. Il progetto salva testo, versione del motore, variante, modalità, dimensioni, profilo e nodi. La V0.4.1 resta selezionabile. “Love Love” viene rifiutata a 400 mm per spazio insufficiente. Per “Stay playful” e gli altri casi con lettere mancanti il nuovo motore segnala il glifo assente.

**Misure e provini.** La distanza in tabella è misurata tra segmenti campionati con separazione lungo il percorso di almeno circa un quarto di circonferenza R12. Dipende dal campionamento e dal criterio di vicinanza lungo la curva. La galleria locale confronta i due motori a 400, 600, 800 e 1000 mm. Contiene SVG calligrafici, tecnici e Neon, progetti JSON e anomalie della baseline con segmento e coordinate. Sono disponibili 12 provini STL e 3MF con ritorni R8, R12, R16 e R20, rami paralleli o convergenti. Tutte le mesh dei provini sono valide e rientrano nel piatto 256 × 256 mm. R8 è intenzionalmente sotto il minimo del profilo. Le misure sono riportate nei nomi dei file e nell’indice. Mancano marcature sul pezzo e una serie a tolleranze variabili.

**Verifiche e distribuzione.** Sono passati 65 test locali, zero falliti, incluse le 63 prove precedenti. Build web, generazione del setup Windows e smoke del pacchetto sono riusciti. Nell’app aperta con dati isolati è stato individuato il comando ONE. Il clic mediante accessibilità non è riuscito. Animazione, modifica nodi, esportazione e ciclo di riapertura nella nuova interfaccia restano da verificare visivamente. Non sono stati effettuati installazione, slicing, stampa o inserimento del LED. Mancano le fotografie originali. Il setup sperimentale 0.4.2 è privo di firma. Nessuna release stabile pubblicata.

**Stato di sviluppo.** Il codice è sul branch feature/v042-one-geometry, commit 1127b46, dalla baseline f220b61. La CI della V0.4.1 è riuscita. La nuova verifica è tracciata nel run GitHub Actions 44572555074. Restano aperti il difetto della mesh Love a 600 mm, l’estensione dei glifi, i raccordi contestuali, la normalizzazione dei raggi dichiarati al bordo o come diametro, il margine di sicurezza configurabile, la parete condivisa, il confronto automatico delle varianti e la riproduzione multipercorso. Il motore vincolato offre la composizione assoluta. La modalità per parola rimane disponibile nel motore precedente.

**Passaggio alla V0.5.** Il primo caso numericamente compatibile è disponibile. Prima del sezionamento, il proprietario dovrebbe valutare la grafia di Love e Memo nella galleria, confermare la convenzione del raggio del proprio LED e provare un ritorno stampato. Conviene anche risolvere il difetto della mesh a 600 mm prima di usarla per progettare gli incastri.