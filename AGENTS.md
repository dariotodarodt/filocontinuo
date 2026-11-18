# FILOCONTINUO — istruzioni di lavoro

- Interfaccia e documentazione in italiano. Unità interne ed esportate: millimetri; Z è l'asse di estrusione.
- Leggere README.md e PROJECT_STATUS.md prima di modificare il progetto.
- Separare calligrafia, geometria, analisi produttiva, UI ed esportazione. Non estrudere contorni di font per simulare monolinea.
- Conservare i percorsi centrali. Dichiarare ogni limite; nessun pulsante deve simulare funzionalità mancanti.
- Ogni modifica al motore geometrico richiede `npm test` e `npm run build`. Verificare volume, bordi, orientamento, vertici e facce degeneri. L'esportazione mesh deve essere bloccata se il controllo fallisce.
- I controlli numerici non garantiscono compatibilità fisica LED o stampa: distinguere sempre avvisi produttivi e validità della mesh.
- Non sovrascrivere originali fotografici. Le quattro foto iniziali non sono disponibili: non affermare di averle analizzate.
- Aggiornare CHANGELOG.md, ROADMAP.md, PROJECT_STATUS.md e docs/RIEPILOGO_CHATGPT.md al termine della sessione.
- Le funzioni future restano in roadmap, senza controlli fittizi nell'interfaccia.
- Non pubblicare il progetto: applicazione locale su Windows salvo diversa richiesta dell'utente.
- Leggere e scrivere testo come UTF-8, anche da Windows PowerShell.
- In V0.2 conservare nodi/maniglie originali e reader JSON V1; non rigenerare silenziosamente i progetti legacy.
- Salvare in JSON V2 dopo modifiche manuali. Ottimizzazioni soltanto proposte fino alla conferma esplicita nella UI.
- Per nuove funzioni vettoriali eseguire i test V0.1 e V0.2; SSR/XML non sono QA visiva. Non aggirare l'indisponibilità del browser con automazioni alternative non supportate.
- Cache, log e temporanei su D:\filocontinuo\.tools. Non forzare downgrade/upgrade della toolchain per nascondere advisory senza verificarne gli effetti.
- V0.3: non presentare le candidate a quattro tratti come soluzioni LED; 400/600 mm restano incompatibili. Consultare examples/v03/confronto.json.
- Non usare verde se un controllo esaurisce il budget. Conservare separati radiusLower, raggio osservato e difetti di giunzione.
- Conservare gate dei job, cancellazione e blocco export per dati obsoleti. Il test Node del worker non equivale a QA browser.
- Dopo modifiche al generatore, `npm run examples:v03` aggiorna gli artefatti prima di `npm test`. SSR non costituisce valutazione estetica.

- Distribuzione 0.4: rispettare docs/RELEASE_PROCESS.md e docs/SECURITY.md. Primo push soltanto dopo conferma esplicita sul manifesto e verifica del remoto; nessun force push o cambio visibilità/licenza.
- main stabile, develop integrazione, feature/* e fix/*; push e commit non autorizzano una release. Nessuna pubblicazione stabile senza consenso del proprietario.
- Electron sandbox/contextIsolation attivi, renderer senza Node/rete remota. Validare origine/frame e schema di ogni IPC, niente esecuzione comandi dal renderer.
- Updater 6: autoDownload=false e autoInstallOnAppQuit=false; consenso esplicito distinto per download/installazione, niente beta/downgrade. Senza firma verificabile bloccare gli aggiornamenti.
- Conservare dati Windows standard e reader V1/V2. Cache e temporanei di sviluppo su D; non obbligare gli utenti distribuiti ad avere disco D.
- Per modifiche desktop eseguire npm test, npm run build, npm run desktop:dist e npm run desktop:smoke. Lo smoke non prova installer, aspetto visivo o aggiornamento reale: documentare i limiti.
