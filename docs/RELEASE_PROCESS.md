# Processo Git e release

## Repository e rami

Repository ufficiale: https://github.com/dariotodarodt/filocontinuo. Verificato pubblico e senza riferimenti remoti all'inizio della sessione del 18 novembre 2026. La pubblicazione rende sorgenti, documenti e campioni autorizzati accessibili a chiunque; `UNLICENSED` non conferisce una licenza open source e non rende privati i contenuti. Nessuna licenza open source è stata scelta.

`main` conserva la baseline web 0.3.0; `develop` è il ramo di integrazione 0.4.0; `feature/desktop-distribution` contiene il desktop 0.4.0 sperimentale. Nuove attività in `feature/*`, correzioni in `fix/*`. Prima di integrare, test e revisione; il semplice push esegue CI ma non pubblica release. Nessun force push.

L'identità locale deriva dal profilo pubblico indicato dal proprietario: DtDesigns, email GitHub noreply. Verificare `git log` prima della pubblicazione. Git portatile, runtime, cache e backup in `.tools` restano locali. Il primo push richiede **conferma esplicita del proprietario sul manifesto dei file** ; l’autenticazione GitHub con dariotodarodt è stata completata e il dry-run dei tre rami è riuscito, senza inviare file. Il primo push è stato in seguito autorizzato ed eseguito; le note iniziali descrivono il controllo precedente.

Prima del push: `git fetch origin`, riesaminare riferimenti e differenze remote, controllare `.gitignore` e `docs/PUBLICATION_MANIFEST.md`, poi autenticarsi tramite GitHub/gestore credenziali. Non salvare token in URL, file o chat. Se i rami remoti sono comparsi, integrarli e riesaminarli senza sovrascriverli.

## Versioni e CI

Semantic Versioning: 0.4.0 è MINOR per la nuova applicazione desktop compatibile, non una PATCH della sola web 0.3.0. `package.json` è la sorgente della versione dell'interfaccia e di Electron; lockfile, documentazione e futuro tag `v0.4.0` devono coincidere. Non esiste ancora un tag o una release 0.4.0. Una versione nel sorgente non è di per sé una release stabile.

`.github/workflows/ci.yml`: npm ci, rigenerazione esempi, test, build web su Linux; su Windows build NSIS sperimentale e smoke dell'app impacchettata, poi soli artefatti Actions con scadenza 14 giorni. Dipendenze Actions fissate a SHA; job contents:read. Il workflow CI è stato eseguito realmente con successo sul codice e2d5cf4 (run 44377364398): Linux e Windows, incluso installer/smoke e artefatti sperimentali. Il workflow di release firmata non è stato eseguito. Configurare protezione di main/develop, revisioni e controlli richiesti dopo il primo push, senza dichiararli già attivi.

## Creare un setup sperimentale locale

Seguire l'ambiente in INSTALLATION.md, poi `npm ci`, `npm run examples:v03`, `npm test`, `npm run desktop:dist`, `npm run desktop:smoke`. `release/` non va commessa. L'installer senza certificato è sperimentale; non pubblicarlo come aggiornamento stabile. Conservare hash e rapporti prima di distribuirlo manualmente.

## Preparare una release firmata

1. Correggere gli advisory compatibili, completare QA e prove su Windows pulito: installazione, offline, file V1/V2, riavvio, disinstallazione e conservazione dati.
2. Ottenere certificato Authenticode; creare ambiente GitHub `release-signing` con revisori obbligatori. Secret `WINDOWS_CSC_LINK` e `WINDOWS_CSC_KEY_PASSWORD`; variabili `WINDOWS_PUBLISHER_NAME` e `WINDOWS_PUBLISHER_SUBJECT` (Subject DN completo). Nessuna chiave nel repository.
3. Aggiornare versione, lock, changelog, README e stato; `npm run version:check`, test/build e revisione. Integrare su main soltanto la versione approvata. Creare/pushare tag SemVer corrispondente **solo dopo autorizzazione**.
4. Avviare esplicitamente **Prepara release firmata in bozza**, indicando la versione e confermando la bozza. Il workflow valida versione/tag, ricostruisce e firma, verifica il pacchetto e crea soltanto una **draft release** con EXE, blockmap e latest.yml. `--publish never` impedisce pubblicazioni indirette del builder.
5. Provare realmente aggiornamento fra due versioni sperimentali firmate in ambiente isolato; controllare rifiuto/differimento, firma, corruzione, dati e nessuna installazione automatica. Riesaminare note e artefatti della bozza.
6. **Il proprietario autorizza esplicitamente e pubblica manualmente la release stabile.** Non è un passaggio automatico del workflow e non è stato eseguito.

Non usare una versione beta sul canale stabile; niente downgrade automatico. In caso di regressione distribuire una versione correttiva superiore. Backup prima dell'aggiornamento; recupero dati descritto in INSTALLATION.md. Autenticazione GitHub verificata. Certificati, ambiente protetto, tag, esecuzione Actions e rilascio restano da predisporre/verificare sul servizio.

VS Code locale: git.path nelle impostazioni utente punta a D:/FILOCONTINUO_Studio/filocontinuo_tools/git/cmd/git.exe. Il workspace .tools/FILOCONTINUO-GITHUB.code-workspace apre il progetto corrente, ora sul ramo feature/v04-style-studio. Configurazioni locali e credenziali non sono incluse nel repository. Il collegamento Git non implica accesso a Copilot, sincronizzazione delle impostazioni o pubblicazione del codice.

## Migrazione completata

I sorgenti sono ora sul remoto ufficiale. Il clone e Git esterno sono stati raccolti sotto D:/FILOCONTINUO_Studio; i precedenti percorsi D:/filocontinuo_github e D:/filocontinuo_tools sono storici. La configurazione iniziale che puntava a D:/filocontinuo/.tools/git è stata sostituita nelle impostazioni utente VS Code. La cartella precedente resta conservata. La documentazione della migrazione è nel ramo feature/migrazione-github, integrato in develop; nessun tag o release. Il manifesto del primo push conserva l’elenco storico approvato al commit 939adfa.

## Sviluppo Style Studio

Branch feature/v04-style-studio, codice 0.4.0 sperimentale e famiglie dati 1.0.0. Il ramo di feature viene sincronizzato senza integrare automaticamente main/develop o pubblicare tag/release. CI rigenera examples:v04 prima dei test. Artefatti e dati personali restano esclusi da Git. Conservare hash e backup del nuovo setup, poi eseguire separatamente i test di installazione/aggiornamento e ottenere firma/autorizzazione prima del canale stabile. Percorso locale corrente: D:/FILOCONTINUO_Studio/filocontinuo_github.
Dal 19 novembre 2026 GitHub conserva le tre release pubblicate più recenti (stabili e prerelease insieme), in ordine di pubblicazione. Il workflow su main esclude bozze e conserva tag e cronologia. I setup sperimentali non firmati sono distribuiti manualmente come prerelease, esclusi dal canale stabile.
