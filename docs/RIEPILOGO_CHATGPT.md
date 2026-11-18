# FILOCONTINUO — riepilogo 0.4.0 per ChatGPT

## Risultato e stato reale

Il progetto esistente D:/filocontinuo è stato esteso con una distribuzione Windows Electron **0.4.0 sperimentale**. È una nuova MINOR compatibile, non una patch geometrica della V0.3. Il motore calligrafico, analisi, editor, quattro formati e reader JSON V1/V2 sono conservati. Modalità web ancora disponibile con avvia.cmd. Backup prima dei lavori: .tools/backups/prima-desktop-2026-11-18.zip. Le fotografie originali non sono disponibili e non sono state analizzate.

## GitHub e pubblicazione

Repository ufficiale pubblico dariotodarodt/filocontinuo, inizialmente vuoto e ancora senza riferimenti remoti all'ultimo controllo. Git portatile installato sotto .tools, repository locale inizializzato con origin ufficiale. Identità locale ricavata dall'account indicato dal proprietario: DtDesigns e indirizzo GitHub noreply, senza email personale.

Commit iniziali locali: 2b5077d importa la baseline V0.3, a428fa9 completa i file originali di avvio/configurazione. La consegna desktop è sul ramo feature/desktop-distribution; il commit finale è consultabile con git log e nel messaggio di consegna. main conserva V0.3, develop è il ramo di integrazione. Nessun force push, tag, release o cambio visibilità/licenza.

**Sincronizzazione remota non ancora eseguita**: autenticazione HTTPS non disponibile, verificata con dry-run senza scritture. Inoltre il proprietario ha richiesto conferma prima del primo push: deve approvare il manifesto docs/PUBLICATION_MANIFEST.md. Repository pubblico significa sorgenti e documenti leggibili da chiunque. UNLICENSED non è una licenza open source; nessuna licenza è stata scelta automaticamente.

Esclusi runtime, cache, backup, log, node_modules, installer, credenziali/certificati/.env e cartelle di dati personali/foto. Gli esempi sono generati dal software. Git non archivia i progetti privati degli utenti. Inventario dipendenze in THIRD_PARTY_NOTICES.md (388 pacchetti).

## Desktop e file

Electron 45.3.4, Builder 26.18.0, Updater 6.8.11. Runtime incluso nel pacchetto: l'utente non deve installare Node, avviare Vite o aprire un browser. Protocollo locale filocontinuo://app, sandbox/contextIsolation, Node disabilitato nel renderer, CSP e blocco navigazione/rete remota. Preload ristretto e validazione origine/frame/argomenti IPC; schema progetti condiviso con il motore. Nessun comando arbitrario dal renderer.

Dialoghi nativi per progetti ed esportazioni; controllo modifiche non salvate alla chiusura. Dati in %APPDATA%/FILOCONTINUO, cartella iniziale progetti Documenti/FILOCONTINUO/Progetti. Impostazioni schema 1 atomiche con copia precedente, backup/ripristino validato e copia preventiva dei dati correnti. Progetti esterni da copiare separatamente. I dati web del browser restano separati: trasferire con Salva/Apri. Non sono state necessarie migrazioni dei progetti V1/V2.

Installer reale non firmato: release/FILOCONTINUO-Setup-0.4.0-x64.exe, 126326438 byte, SHA-256 31C65C22497C27F7C91007F4331BD4449B26D70A7B9C9D100AC7FE6DD9D45C61. Icona originale, NSIS guidato per utente, menu Start e desktop facoltativo. Prevista disinstallazione standard senza cancellare dati, non verificata realmente. Il setup non è una release stabile e non è stato pubblicato.

## Aggiornamenti

Sezione Impostazioni → Aggiornamenti con versione, nuova stabile/data/note/dimensione/stato e comandi Controlla/Scarica/Installa e riavvia/Ricordamelo dopo. Auto-controllo inizialmente disattivato e facoltativo; autoDownload e autoInstallOnAppQuit disabilitati. Nessun downgrade o beta sul canale stabile. Download e installazione richiedono conferme native distinte e, prima di installare, progetto salvato.

Nella build sperimentale senza certificato download/installazione sono bloccati. Il percorso firmato richiede certificato Authenticode e Subject completo atteso, verifica fail closed dell'app e del pacchetto, più integrità SHA-512 del trasporto. Non è implementata una firma autonoma del manifest: HTTPS GitHub e firma binari sono le protezioni effettive. Nessun token GitHub nell'app. Repository privato richiederebbe una distribuzione separata, senza token incorporato.

## Automazione release

CI predisposta per npm ci, rigenerazione esempi, 45 test e build web su Linux, build NSIS/smoke Windows e soli artefatti Actions temporanei. Azioni fissate a SHA. Il push non pubblica release. Secondo workflow manuale richiede tag approvato, versione coerente, ambiente release-signing e certificato/secret; crea soltanto una bozza firmata con installer/blockmap/latest.yml. Pubblicazione finale stabile esclusivamente manuale e autorizzata dal proprietario. Nessun workflow eseguito su GitHub, nessuna protezione rami/ambiente dichiarata già configurata.

## Test realmente eseguiti

45/45 test superati: 34 precedenti mantenuti e 11 desktop per protocollo/IPC, limiti file, impostazioni/backup, consenso, versioni e metadati, corruzione/firme simulate, modifiche non salvate, offline/cancellazione/ripresa. Build TypeScript/Vite riuscita, warning bundle principale circa 978 kB. NSIS generato realmente; ripetuto smoke del pacchetto finale: renderer locale, bridge e vero Web Worker, mesh valida, sandbox true, Node false, contextIsolation true. Confronto ASAR/sorgenti principali coerente.

Prova visiva reale tramite Computer Use Windows: osservati CAD/mesh 3D e pannello aggiornamenti; interrogazione effettiva GitHub con esito No published versions on GitHub; download/installazione disabilitati. Salvataggio nativo riuscito con file e conferma UI; dialogo Apri osservato ma riapertura non completata per limiti del controllo del dialogo, poi annullato. Questo non è una validazione completa dell'editor. Il vecchio limite del browser non è stato aggirato: è stata usata l'API supportata di controllo dell'app Windows.

YAML dei workflow validato localmente; controllo versioni riuscito; npm ci --dry-run --ignore-scripts riuscito. Audit totale: 12 advisory (5 moderate, 7 high) nel grafo di sviluppo/build; audit runtime --omit=dev zero advisory del registry. Non significa assenza di vulnerabilità. Nessun downgrade/upgrade forzato per nascondere gli advisory. EPERM durante rename della build gestito dal fallback copia/eliminazione del builder, senza disattivare protezioni.

## Verifiche mancanti e prossimi passi

1. Approvare manifesto e autenticarsi, poi riesaminare remoto ed effettuare primo push autorizzato.
2. Configurare protezioni rami/ambiente e provare realmente GitHub Actions.
3. Ottenere certificato, correggere advisory compatibili, completare prove su Windows pulito: installazione, file V1/V2, export nativi, offline reale, disinstallazione, backup e conservazione dati.
4. Provare aggiornamento fra due versioni sperimentali firmate, consenso/differimento, riavvio e recupero dati. Solo poi richiedere autorizzazione alla release stabile.
5. Riprendere qualità calligrafica e vincoli produttivi: la consegna desktop non li risolve. Stay playful V0.3 rimane a quattro tratti con mesh valida ma LED incompatibile a 400/600 mm; raggi e distanze insufficienti. Nessuna prova fisica LED, slicing o stampa.

## Avvio

Utente: aprire il setup locale oppure release/win-unpacked/FILOCONTINUO.exe mantenendo tutta la cartella. Sviluppo desktop: npm run desktop:dev; web: avvia.cmd oppure npm run dev. Ambiente Node/cache/temp su D descritto in docs/INSTALLATION.md. Processo release, aggiornamenti e sicurezza descritti in RELEASE_PROCESS.md, UPDATE_SYSTEM.md, SECURITY.md; dettagli verifiche/hash in DISTRIBUTION_CHECKS.md. Il riepilogo V0.3 precedente è conservato in docs/history/RIEPILOGO-V03.md.
