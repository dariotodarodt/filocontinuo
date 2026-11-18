# FILOCONTINUO — riepilogo V0.4 per ChatGPT

## Calligraphy & Style Studio — 0.4.0 sperimentale, 18 novembre 2026

### Risultato effettivo

- Tre famiglie originali con disegni distinti: Signature, Minimal e Vintage, versione dati 1.0.0. Ciascuna supporta 92 caratteri: a–z/A–Z, dodici accenti italiani, dieci cifre e diciotto simboli; spazi e fino a cinque righe gestiti dal compositore. Nessuna sostituzione silenziosa di caratteri nello Studio.
- Formato famiglia schema 1 con autore/licenza, Bézier, metriche, ancore/tangenti e varianti effettive. Famiglia completa, versione e geometria congelate nei progetti JSON V2 estesi. Reader V1/V2 precedenti conservati, senza rigenerazione automatica.
- Style Studio con confronto simultaneo, varianti deduplicate, preferiti, import/export JSON monolinea, parametri reali, layout multiriga e offset indipendenti. Proposta originale intatta fino alla scelta. I motori legacy restano disponibili e dichiarano i loro limiti, inclusa la conversione di alcune maiuscole al glifo minuscolo.
- Varianti di singola lettera tramite dati/matrice congelati, senza rigenerare le altre lettere; geometria ricontrollata. Dopo modifiche arbitrarie nell'editor, la corrispondenza lettera/nodi è considerata obsoleta e serve ricomposizione esplicita. Non esiste mappatura intelligente delle modifiche manuali.
- Neon estetico con colore LED, intensità apparente, alone, sfondo, colore canaletta e acceso/spento; usa le curve effettive. Colore canaletta applicato al materiale 3D; nessuna rianalisi geometrica per sole modifiche Neon. Non è simulazione fotometrica.
- Worker per famiglie/varianti, analisi e mesh, annullamento e scarto dei risultati obsoleti. Dimensioni del percorso ottenute da estremi analitici delle cubiche in Float64, non da un box dei controlli o da un campionamento amplificato dalla scala.
- 30 progetti JSON e SVG per gli otto testi richiesti, 9 SVG Neon, tre famiglie JSON e galleria in examples/v04/. STL/3MF/OBJ di tre campioni generati localmente e ignorati da Git. Raggi e profilo LED non sono stati ridotti per ottenere esiti favorevoli.

### Risultati produttivi: obiettivo ancora aperto

Le famiglie sono una base sperimentale, **non un repertorio calligrafico professionale già validato**. La qualità estetica richiede revisione umana e miglioramenti dei glifi. Tutte le Stay playful restano incompatibili a 400, 600 e 800 mm con il profilo fisso. Il numero maggiore di tratti rispetto alla candidata V0.3 deriva anche dal rifiuto dei collegamenti non verificati; non viene presentato come miglioramento della continuità fisica.

Parametri del confronto: LED 6 × 8 mm, tolleranza 0,3 mm, pareti 1,2 mm, fondo 1,5 mm, altezza pareti 7 mm, raggio minimo 12 mm, flessione laterale, inclinazione 8°, spaziatura 1,3. Larghezza del percorso centrale; ingombro del solido e piatto sono verifiche separate. Le nove mesh Stay playful sono numericamente valide, ma questo non certifica il LED.

| Famiglia | Obiettivo mm | Percorsi | LED teorico mm | Raggio osservato mm | Errori raggruppati | Stato LED |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Signature | 400 | 13 | 987.8 | 1.072 | 101 | incompatible |
| Signature | 600 | 13 | 1481.9 | 1.608 | 99 | incompatible |
| Signature | 800 | 13 | 1976.1 | 2.144 | 85 | incompatible |
| Minimal | 400 | 18 | 675.4 | 3.143 | 35 | incompatible |
| Minimal | 600 | 18 | 1013.1 | 4.715 | 28 | incompatible |
| Minimal | 800 | 18 | 1350.9 | 6.287 | 15 | incompatible |
| Vintage | 400 | 18 | 805.5 | 2.539 | 50 | incompatible |
| Vintage | 600 | 18 | 1208.4 | 3.808 | 45 | incompatible |
| Vintage | 800 | 18 | 1611.2 | 5.077 | 39 | incompatible |

Confronti legacy riprodotti con gli stessi parametri e lo stesso controllo attuale:

| Generatore | Larghezza mm | Percorsi | LED teorico mm | Raggio osservato mm | Stato LED |
| --- | ---: | ---: | ---: | ---: | --- |
| V0.2 aperta | 400 | 17 | 664.5 | 4.463 | incompatible |
| V0.3 aperta | 400 | 4 | 746.8 | 0.736 | incompatible |
| V0.2 aperta | 600 | 17 | 996.8 | 6.694 | incompatible |
| V0.3 aperta | 600 | 4 | 1120.4 | 1.105 | incompatible |
| V0.2 aperta | 800 | 17 | 1329.2 | 8.907 | incompatible |
| V0.3 aperta | 800 | 4 | 1494.0 | 1.473 | incompatible |

Il confronto non dimostra una soluzione producibile. Forme aperte e correzione dei nodi restano strumenti necessari; il passo di taglio non è ancora ottimizzato e il profilo è dimostrativo. Le fotografie originali restano assenti.

### Test e prove realmente svolte

**60/60 test superati, zero falliti**: i 45 precedenti e 15 nuovi per famiglie/topologia, repertorio e accenti, input malformati, varianti/ripetizioni, sostituzione singola lettera, limiti dimensionali analitici, multiriga, collegamenti accettati/rifiutati, vecchi progetti, JSON e undo/redo, quattro esportazioni, Neon, backup stili e vero worker offline. npm run build e npm run desktop:dist riusciti. Nessun cambiamento al motore mesh Clipper/Earcut.

Smoke del pacchetto finale: renderer locale, sandbox true, contextIsolation true, Node false, tre famiglie effettivamente composte nel worker e mesh Studio valida. Le famiglie sono incorporate nei bundle e il renderer non può scaricare codice/font remoto. Non è una prova di disconnessione fisica dell'intero PC.

Verifica visiva reale tramite API supportata Computer Use Windows, su dati isolati: tre famiglie, L'amore è luce + MoruMì su due righe, accenti, Neon acceso/spento, applicazione Minimal alla mesh 3D, Annulla/Ripeti, salvataggio e riapertura nativi dello stesso JSON. Il file salvato è stato riletto con il validatore: famiglia 1.0.0 e snapshot identici. L'app di revisione è stata chiusa senza modificare i progetti personali. Le correzioni successive a tale prova riguardano convalida degli ID personali e conservazione delle estensioni nella sostituzione di lettere; sono coperte dalla suite e dalla build/smoke finali.

Non provati visivamente: ogni singolo glifo, import famiglia personale, sostituzione singola lettera, tutti i trascinamenti e tutti i dialoghi di export. Non eseguiti nuova installazione, disinstallazione, aggiornamento fra pacchetti firmati, slicing, stampa o misure fisiche. Nel registro Windows è presente FILOCONTINUO 0.4.0, coerente con l'installazione precedente riferita dall'utente: non è prova d'installazione del nuovo Style Studio.

Composizione+analisi dei 30 casi, sulla macchina della sessione: da 21 a 475 ms; mesh, avvio worker e carico di altri processi esclusi. Dati grezzi in confronto.json, non benchmark universale. Bundle principale circa 1019 kB e worker 223 kB; warning Vite di dimensione mantenuto. Audit rieseguito: sei advisory moderati nella catena di sviluppo electron-builder/minimatch, zero alti/critici e zero nelle dipendenze di produzione (npm audit --omit=dev). La proposta automatica comporta downgrade maggiore del builder: non applicata senza una valutazione separata. Nessuna dipendenza modificata.

### Desktop, versioni e distribuzione

La versione resta **0.4.0 sperimentale**, già usata dalla base desktop e richiesta anche per questo sviluppo; famiglie versione 1.0.0. Per ottenere lo Studio nell'app installata serve il nuovo setup manuale, anche se il numero versione è uguale. La vecchia installazione non è stata sostituita automaticamente.

Installer reale release/FILOCONTINUO-Setup-0.4.0-x64.exe e alias richiesto release/FILOCONTINUO-Setup-0.4.0.exe, identici: 126343708 byte, SHA-256 DDD6E151E9A132BC6914940862514AAB19502D2660D46C45EC3A233C27C444E8. Non firmati, soltanto locali. Blockmap generata. **latest.yml non generato per una distribuzione non firmata**: il percorso firmato richiede certificato/secret non disponibili. Nessuna firma disabilitata per aggirare il problema, nessun manifest fittizio pubblicato.

Updater 6.8.11 invariato: niente download/installazione automatici, niente beta/downgrade, consenso esplicito e progetto salvato richiesti. Download/installazione bloccati nella build non firmata. Nessun tag, release stabile o aggiornamento reso disponibile agli utenti.

### Percorsi e stato Git

Cartella attiva **D:/FILOCONTINUO_Studio/filocontinuo_github**; Git/GCM in **D:/FILOCONTINUO_Studio/filocontinuo_tools/git**; backup privati in **D:/FILOCONTINUO_Studio/filocontinuo_backup**. Cache e temporanei nella .tools del checkout. Il backup prima di questo sviluppo è prima-style-studio-20261118-190113 (bundle, sorgenti ZIP e patch delle modifiche locali).

Branch dedicato **feature/v04-style-studio**, basato sul commit 3d3d48d; sincronizzazione del ramo secondo autorizzazione, senza force push. main resta baseline web V0.3 e develop resta la precedente integrazione desktop fino a revisione. Sorgenti sincronizzati con commit 13779d5. Primo workflow GitHub effettivamente avviato: due test worker falliti su Linux per lo shim Node che definiva self come oggetto separato. Corretto il solo adattatore dei test usando self === globalThis; suite locale rieseguita, 60/60, e build web riuscita. Verificare le esecuzioni successive su https://github.com/dariotodarodt/filocontinuo/actions: gli esiti cloud restano distinti dalle prove locali. Nessun cambiamento al pacchetto desktop per questa correzione dei test.

Il precedente riordino delle tre cartelle è riuscito. La vecchia D:/filocontinuo **non è stata eliminata**: la verifica automatica ha rifiutato la cancellazione con blocked by policy e il tentativo reversibile di archiviarla ha incontrato un processo che la teneva in uso. Non è stata ritentata la cancellazione aggirando il blocco. Esiste anche un backup aggiornato con 3634 file confrontati tramite checksum. Questo limite non impedisce lo sviluppo nella nuova cartella.

### Prossimi sviluppi

Ridisegnare glifi/raccordi con raggi controllati e migliorare leggibilità, continuità e compattezza, senza forzare il verde. Completare repertori contestuali in ogni famiglia, mappatura dei nodi editati alle lettere, routing generale, test UI estesi e prove fisiche. Luxury/Handwriting/Modern, TTF/OTF e estrazione sperimentale della linea centrale dai contorni, archi SVG e testo lungo curve restano in roadmap. Sezionamento automatico rimandato alla V0.5.

---

## Riepilogo precedente conservato

# FILOCONTINUO — riepilogo migrazione per ChatGPT

## Migrazione GitHub verificata — 18 novembre 2026

- Primo push autorizzato ed eseguito: main conserva la baseline V0.3; develop integra 0.4.0 e la documentazione corrente. feature/desktop-distribution conserva l'implementazione desktop, feature/migrazione-github registra questa migrazione. Nessun force push, tag o release.
- Nuovo checkout ottenuto da GitHub: **D:/filocontinuo_github**. Il codice è stato recuperato dal ramo develop al commit 939adfa prima delle sole modifiche documentali della migrazione. La cartella D:/filocontinuo è conservata come originale, non è più il percorso di lavoro consigliato.
- Backup esterno privato: **D:/filocontinuo_backup/migrazione-20261118-182427225**. Copiati 1257 file, verificati contro l'originale 208 file critici, incluso l'installer. SHA256.json inventaria le copie. Inclusi progetto/.git, runtime portatili, backup precedenti, installer, dati %APPDATA%/FILOCONTINUO e file Documenti/FILOCONTINUO. Esclusi dipendenze, dist, cache e temporanei ricostruibili. Eventuali progetti scelti in altre cartelle restano nei loro percorsi.
- Git e Credential Manager copiati in **D:/filocontinuo_tools/git**; git.path utente di VS Code aggiornato e impostazioni precedenti salvate nel backup. Node 22.16.0 nel nuovo checkout .tools, cache/log/temp sul disco D. Nessun token nel repository o nei pacchetti.
- Da installazione pulita delle dipendenze: npm ci riuscito (388 pacchetti), examples:v03 rigenerati, **45/45 test**, build web TypeScript/Vite riuscita. Nessuna modifica alla geometria o rigenerazione silenziosa di progetti personali.
- Ricostruito realmente il desktop dal nuovo percorso: desktop:dist e desktop:smoke riusciti. Renderer locale, Web Worker e mesh valida confermati; contextIsolation e sandbox true, nodeIntegration false. Setup 126326618 byte, SHA-256 8048D719C182A4C4972EACA6F7903EB56337EAA8E662375F610DC222C87EC1DF, firma NotSigned. Rimane sperimentale, non installato né pubblicato come release.
- Nuovo audit sullo stesso lockfile: **6 moderate, zero high/critical; runtime zero advisory** del registry. Nessun upgrade/downgrade applicato. I vecchi rapporti con 12 advisory sono storici. Warning bundle web circa 978 kB conservato.
- Al controllo dopo il primo push l'API Actions riporta zero esecuzioni: workflow presenti nel ramo di sviluppo, esecuzione cloud e configurazione delle protezioni ancora da verificare. La prova locale non viene dichiarata prova GitHub Actions.
- Nessuna installazione pulita, disinstallazione, aggiornamento reale fra versioni firmate, stampa, slicing o misura LED effettuati in questa migrazione. Prove e limiti produttivi precedenti invariati. La vecchia cartella non è stata cancellata.

---

## Riepilogo conservato della preparazione desktop

# FILOCONTINUO — riepilogo 0.4.0 per ChatGPT

## Risultato e stato reale

Il progetto esistente D:/filocontinuo è stato esteso con una distribuzione Windows Electron **0.4.0 sperimentale**. È una nuova MINOR compatibile, non una patch geometrica della V0.3. Il motore calligrafico, analisi, editor, quattro formati e reader JSON V1/V2 sono conservati. Modalità web ancora disponibile con avvia.cmd. Backup prima dei lavori: .tools/backups/prima-desktop-2026-11-18.zip. Le fotografie originali non sono disponibili e non sono state analizzate.

## GitHub e pubblicazione

Repository ufficiale pubblico dariotodarodt/filocontinuo, inizialmente vuoto e ancora senza riferimenti remoti all'ultimo controllo. Git portatile installato sotto .tools, repository locale inizializzato con origin ufficiale. Identità locale ricavata dall'account indicato dal proprietario: DtDesigns e indirizzo GitHub noreply, senza email personale.

Commit iniziali locali: 2b5077d importa la baseline V0.3, a428fa9 completa i file originali di avvio/configurazione. La consegna desktop è sul ramo feature/desktop-distribution; il commit finale è consultabile con git log e nel messaggio di consegna. main conserva V0.3, develop è il ramo di integrazione. Nessun force push, tag, release o cambio visibilità/licenza.

**Sincronizzazione remota non ancora eseguita**: autenticazione GitHub ora completata con dariotodarodt tramite Git Credential Manager, dopo autorizzazione manuale dell’utente. Dry-run di main, develop e feature/desktop-distribution riuscito senza inviare file. VS Code configurato con il percorso Git portatile nelle impostazioni utente e verificato nel workspace locale .tools/FILOCONTINUO.code-workspace. Queste configurazioni locali e le credenziali non vengono pubblicate. Inoltre il proprietario ha richiesto conferma prima del primo push: deve approvare il manifesto docs/PUBLICATION_MANIFEST.md. Repository pubblico significa sorgenti e documenti leggibili da chiunque. UNLICENSED non è una licenza open source; nessuna licenza è stata scelta automaticamente.

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

1. Approvare il manifesto, poi riesaminare remoto ed effettuare primo push autorizzato; autenticazione già completata.
2. Configurare protezioni rami/ambiente e provare realmente GitHub Actions.
3. Ottenere certificato, correggere advisory compatibili, completare prove su Windows pulito: installazione, file V1/V2, export nativi, offline reale, disinstallazione, backup e conservazione dati.
4. Provare aggiornamento fra due versioni sperimentali firmate, consenso/differimento, riavvio e recupero dati. Solo poi richiedere autorizzazione alla release stabile.
5. Riprendere qualità calligrafica e vincoli produttivi: la consegna desktop non li risolve. Stay playful V0.3 rimane a quattro tratti con mesh valida ma LED incompatibile a 400/600 mm; raggi e distanze insufficienti. Nessuna prova fisica LED, slicing o stampa.

## Avvio

Utente: aprire il setup locale oppure release/win-unpacked/FILOCONTINUO.exe mantenendo tutta la cartella. Sviluppo desktop: npm run desktop:dev; web: avvia.cmd oppure npm run dev. Ambiente Node/cache/temp su D descritto in docs/INSTALLATION.md. Processo release, aggiornamenti e sicurezza descritti in RELEASE_PROCESS.md, UPDATE_SYSTEM.md, SECURITY.md; dettagli verifiche/hash in DISTRIBUTION_CHECKS.md. Il riepilogo V0.3 precedente è conservato in docs/history/RIEPILOGO-V03.md.
