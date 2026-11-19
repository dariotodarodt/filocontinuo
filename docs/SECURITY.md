# Sicurezza e riservatezza

Il renderer desktop carica solo file locali dal protocollo `filocontinuo://app/`, con risoluzione vincolata a dist e CSP. Navigazione, finestre esterne, webview, richieste di rete del renderer e permessi Chromium sono negati. `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true`, `webSecurity=true`; nessuna API per eseguire comandi dal renderer.

Il preload espone soltanto operazioni tipizzate per progetti, esportazioni, backup, preferenze e aggiornamenti. Il main controlla origine, webContents e frame principale di ogni IPC. Nomi/tipi/dimensioni e schemi sono validati; i percorsi esterni sono scelti tramite dialoghi nativi. Il validatore del progetto è lo stesso del motore, impacchettato in CommonJS per il main. I file legacy V1/V2 sono accettati senza rigenerare geometria.

Salvare file e ripristinare backup sono azioni locali esplicite. Le impostazioni sono scritte atomicamente e conservano la precedente versione. I backup includono dati personali e non vanno commessi. I file di progetto esterni non vengono eliminati dall'installer. Queste protezioni riducono la superficie d'attacco, non costituiscono un audit di sicurezza indipendente.

PowerShell è invocato soltanto dal main per una funzione fissa Authenticode: percorso via variabile d'ambiente, nessuna interpolazione di codice dal renderer, esecuzione nascosta e timeout. Verifica fail closed; certificati mancanti o non verificabili bloccano gli aggiornamenti. Nessun token GitHub nella distribuzione. Il provider pubblico comunica con GitHub dal main soltanto per aggiornamenti richiesti o controllo all'avvio esplicitamente abilitato.

`.gitignore` esclude `.tools`, runtime, node_modules, build/installer compilati, credenziali, certificati, .env, backup, log, fotografie e progetti personali nelle cartelle designate. `build/` contiene invece **risorse sorgente** pubblicabili (icona e script NSIS). Qualsiasi nuovo file va comunque revisionato: .gitignore non riconosce automaticamente tutti i segreti o le fotografie in cartelle arbitrarie. I campioni in examples sono sintetici, non progetti personali. Le quattro fotografie originali non sono disponibili e non sono state pubblicate né analizzate.

Repository pubblico: la conferma prima del primo push deve riguardare l'intero manifesto, inclusi sorgenti, documenti e campioni. Nessuna modifica di visibilità né licenza open source automatica. Inventario delle licenze dipendenze in THIRD_PARTY_NOTICES.md; le licenze dei componenti restano applicabili anche a un progetto UNLICENSED.

Audit npm del 18 novembre 2026: 12 advisory complessivi (5 moderate, 7 high) nel grafo di sviluppo/build; audit `--omit=dev`: zero advisory dichiarati dal registry. Non significa assenza di vulnerabilità: Electron/Chromium e pacchetti devono essere mantenuti. Non applicati downgrade/upgrade forzati proposti dall'audit che cambiano toolchain. Riesaminare e correggere prima di una distribuzione stabile. Rapporti locali in `.tools/`.

Riferimento: [raccomandazioni sicurezza Electron](https://www.electronjs.org/docs/latest/tutorial/security). Firma e limiti del feed in UPDATE_SYSTEM.md. Segnalare problemi al proprietario tramite un canale privato concordato, senza includere segreti in issue pubbliche.

Aggiornamento della verifica dopo clone da GitHub: audit sullo stesso lockfile ora riporta 6 moderate e zero high/critical, zero advisory npm runtime. Non sono stati applicati upgrade/downgrade. Backup privati e dati utente sono in D:/FILOCONTINUO_Studio/filocontinuo_backup e restano fuori dal repository; Git e GCM in D:/FILOCONTINUO_Studio/filocontinuo_tools. Il primo push è stato autorizzato ed eseguito, senza pubblicare installer, token o una release stabile.

Style Studio aggiunge al bridge solo il tipo file styles e due chiavi di backup; famiglia, libreria e preferiti sono convalidati anche nel main tramite schema condiviso. Nessuna API di esecuzione comandi aggiunta. --review-dir è un’opzione CLI locale per prove isolate, non un messaggio IPC dal renderer. Nessuna famiglia esterna o personale inclusa nei sorgenti pubblicati.
