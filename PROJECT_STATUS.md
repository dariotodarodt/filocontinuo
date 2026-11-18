# Stato FILOCONTINUO 0.4.0 — desktop sperimentale

Aggiornato il **18 novembre 2026**. Nuova MINOR compatibile: package/lock/app 0.4.0. Backup precedente: `.tools/backups/prima-desktop-2026-11-18.zip`. Il motore e i dati geometrici V0.3 restano invariati; i risultati a 400/600 mm restano incompatibili. Nessuna fotografia originale disponibile.

## Risultati della sessione desktop

- Electron 45.3.4, Builder 26.18.0, Updater 6.8.11, protocollo locale sicuro e renderer sandbox senza Node. Modalità web mantenuta. Nessun codice remoto caricato dal renderer.
- Dialoghi nativi per file V1/V2 e quattro esportazioni, controllo modifiche non salvate alla chiusura, dati Windows standard, backup/ripristino validato con copia preventiva, impostazioni schema 1 e preferenze persistenti.
- Impostazioni → Aggiornamenti: versione, stabile/data/note/dimensione/stato, controllo/download/installazione/differimento. Auto-controllo facoltativo inizialmente spento; auto-download e auto-installazione alla chiusura disabilitati. Niente beta o downgrade. Download e installazione bloccati senza firma. Firma Authenticode fail closed e SHA-512 dell'updater, non firma separata del manifest.
- Installer NSIS x64 reale in release, icona dedicata, menu Start e desktop facoltativo, disinstallazione prevista senza rimozione dati. Non firmato e sperimentale, non autorizzato alla distribuzione stabile. Vedere il rapporto di consegna per dimensione/hash e verifica finale.
- CI web/Windows e workflow manuale di sola release in bozza firmata, azioni fissate a SHA e permessi limitati. Nessuna esecuzione GitHub, tag o release effettuata.
- Git locale inizializzato, origin ufficiale pubblico inizialmente vuoto. Baseline V0.3 locale su main; develop e feature/desktop-distribution separano lo sviluppo. Identità DtDesigns con email GitHub noreply. Autenticazione GitHub completata con dariotodarodt tramite Git Credential Manager; push --dry-run riuscito sui tre rami senza inviare file. VS Code riconosce Git e il ramo nel workspace locale. Nessun push reale: conferma proprietario ancora richiesta dopo revisione del manifesto.
- Inventario licenze e nessuna licenza open source assegnata. Runtime/cache/backups/installer/foto e progetti privati esclusi. Git non è un archivio dei dati utente.

## Test e limiti della distribuzione

**45/45 test superati**: 34 precedenti conservati e 11 desktop per protocollo/IPC, limiti file, impostazioni, backup, consenso, firme simulate, metadati, beta/downgrade, offline e cancellazione/ripresa. Build TypeScript/Vite riuscita; warning chunk principale circa 978 kB conservato. Il test del pacchetto avvia Electron e attende dal vero renderer la conferma del worker e di una mesh valida; verifica anche sandbox e isolamento. Non è QA visiva o prova interattiva dei dialoghi.

Verifica visiva Windows effettuata tramite la skill Computer Use: osservati CAD/mesh 3D, impostazioni e blocco degli aggiornamenti non firmati; il controllo reale segnala nessuna release pubblicata. Salvataggio nativo riuscito, file JSON V2 validato. Dialogo Apri osservato, riapertura non completata per limiti del controllo del dialogo e poi annullata. Non è una prova completa dell'editor. Il limite storico del browser non è stato aggirato con automazioni alternative non supportate.

Non effettuati: installazione pulita, avvio su PC senza toolchain, disinstallazione, aggiornamento reale fra due versioni firmate, conservazione dati attraverso tale aggiornamento, disconnessione fisica dalla rete, slicing/stampa. Il renderer non effettua richieste remote per configurazione, ma questo non sostituisce una prova offline completa. Certificato di firma non disponibile; autenticazione GitHub ora completata. Smoke del pacchetto e test unitari non certificano questi flussi. Rapporto finale e hash in docs/DISTRIBUTION_CHECKS.md.

Audit: 12 advisory nel grafo totale (5 moderate, 7 high), zero nel grafo npm runtime `--omit=dev`; nessuna correzione forzata della toolchain. Firma/QA installazione e aggiornamento, advisory e protezioni GitHub devono essere risolti prima del canale stabile. Durante la build si è verificato EPERM su rename: il builder ha completato mediante il proprio fallback copia/eliminazione, senza disattivare controlli.

Documenti operativi: INSTALLATION, RELEASE_PROCESS, UPDATE_SYSTEM, SECURITY e THIRD_PARTY_NOTICES in docs/. Il riepilogo trasferibile descrive anche le operazioni ancora soggette a consenso o credenziali.

---

## Stato tecnico conservato della V0.3

# FILOCONTINUO V0.3 — riferimento storico

Aggiornato il **18 novembre 2026**. Versione **0.3.0** nel progetto esistente D:\filocontinuo. Backup precedente creato prima delle modifiche: `.tools/backups/prima-v03-2026-11-18.zip`. Documenti V0.2 archiviati in docs/history/.

**Obiettivo produttivo non ancora raggiunto:** le nuove candidate Stay playful hanno quattro tratti, senza incroci rilevati, ma a 400 e 600 mm violano ancora il raggio minimo e le distanze. Non sono pronte per LED o stampa di produzione. Non è stata dimostrata una qualità calligrafica professionale o fedeltà fotografica.

## Architettura e decisioni

- Stack React/TypeScript/Vite/Three.js mantenuto; geometria Clipper/Earcut V0.1/V0.2 conservata.
- Motori legacy e aperto preservati, nuovo generatore contestuale scelto esplicitamente. I progetti esistenti non vengono rigenerati silenziosamente.
- JSON V2 mantenuto, reader V1/V2 e Bézier originali conservati. Nuovi campi opzionali: variante, svolazzi, massimo larghezza/scostamento e note calibrazione.
- Scheletri originali monolinea, arrotondamenti quadratici convertiti in cubiche con tangenti C1, porte baseline e contesto iniziale/intermedio/finale/isolato. Tratti secondari protetti. Nessun font di contorno estruso.
- Analisi/mesh/ottimizzazione/varianti in Web Worker con job ID, terminazione, scarto risultati obsoleti ed errori strutturati. Ultimo risultato conservato e export sospeso quando non aggiornato; ultimo progetto con mesh valida salvato separatamente per ripristino.
- Stati distinti: mesh, LED, P1S, larghezza e osservazioni fisiche. Nessun esito produttivo dedotto dalla sola mesh.

## Funzionalità operative aggiunte

1. Tre varianti Fluida/Aperta/Slanciata con geometrie/proporzioni differenti, anteprima e scelta esplicita; misure di dimensioni, tratti, lunghezza e raggio. La candidata rossa si apre per correzione manuale, non come soluzione verificata.
2. Porte contestuali e variazioni proporzionali dipendenti dai vicini; svolazzi facoltativi. Predisposizione per glifi iniziali/intermedi/finali, non ancora repertorio professionale completo di alternative.
3. Larghezza obiettivo/massima e scostamento ammesso. Nessuna ricerca automatica illimitata della scala. Confronti 400/600 mm con profilo fisso.
4. Controllo conservativo della curvatura con estremi, derivate nulle, giunzioni e verifica non conclusiva; quattro stati invece del solo sì/no. Minimo aggiuntivo geometrico pari a metà dell'esterno canaletta.
5. Raccordi tra estremità separate con tangenti e inversione, esclusione barre/punti, controllo raggio e scostamento simmetrico conservativo. Criteri geometrici e nuovi difetti localizzati, non solo conteggio gruppi. Anteprima/conferma mantenute.
6. Editor con inversione/apertura cicli, clic senza modifica, Escape/cancel/lost capture, draft ref aggiornato e selezioni azzerate dopo operazioni topologiche. Undo/redo usa un reducer testato anche sulle maniglie.
7. Viste Calligrafica, Tecnica e Neon; quest'ultima estetica, senza simulazione fisica della luce.
8. Annotazioni reali dei provini nel progetto, senza dichiarazione automatica di verifica fisica.
9. 36 SVG puliti + 6 SVG Neon per i sei testi richiesti a 400/600 mm; galleria HTML e confronto JSON in examples/v03/. STL/3MF/OBJ di una candidata e rapporti mesh per le sei Stay playful.

## Confronto numerico riproducibile

Parametri fissi: LED 6 × 8 mm, raggio richiesto 12 mm, tolleranza totale 0,3 mm, pareti 1,2 mm, fondo 1,5 mm, pareti alte 7 mm, flessione laterale. Confronti con inclinazione 8°, spaziatura 1,3 e proporzione 1. La larghezza è del percorso centrale. Dati completi e contesti in examples/v03/confronto.json, comando `npm run examples:v03`.

| Versione / variante | Larghezza mm | Tratti | LED teorico mm | Raggio osservato sulle cubiche mm | Esito |
| --- | ---: | ---: | ---: | ---: | --- |
| V0.2 aperta | 400 | 17 | 555,79 | 3,733 | incompatibile |
| V0.2 aperta | 600 | 17 | 833,74 | 5,599 | incompatibile |
| V0.2 riferimento | 1600 | 17 | 2223,75 | 13,191 | sì storico V0.2, incompatibile con controllo giunzioni V0.3 |
| V0.3 Fluida | 400 | 4 | 902,02 | 0,705 | incompatibile |
| V0.3 Aperta | 400 | 4 | 746,82 | 0,736 | incompatibile |
| V0.3 Slanciata | 400 | 4 | 1048,96 | 0,597 | incompatibile |
| V0.3 Fluida | 600 | 4 | 1353,23 | 1,057 | incompatibile |
| V0.3 Aperta | 600 | 4 | 1120,42 | 1,105 | incompatibile |
| V0.3 Slanciata | 600 | 4 | 1573,69 | 0,896 | incompatibile |

Riduzione dei tratti **17→4 (−76,5%)** strutturale. **Non è un miglioramento della compatibilità LED:** i raggi delle nuove forme sono peggiori e restano insufficienti. Il generatore conserva collegamenti C1 ma alcune svolte sono troppo strette. Le sei candidate Stay playful non presentano incroci rilevati, ma hanno prossimità insufficienti; tutte hanno mesh chiuse valide, a conferma della necessità di stati separati. I raggi in tabella sono osservazioni sulle cubiche, non includono un raggio fisico definito agli spigoli.

Il riferimento V0.2 a 1600 mm mantiene identica geometria: il controllo V0.3 trova una discontinuità di tangente prima ammessa dalla soglia V0.2. Il vecchio esito non è stato riscritto nei test o nei rapporti storici.

## Test e verifiche

Suite estesa a **34 test**: 20 precedenti conservati, 14 nuovi su bound di curvatura/dense reference, estremi/singolarità e casi non verdi, minimo sezione, reverse/apertura, raccordi accettati/rifiutati, distanza geometrica, JSON V1/V2, reducer undo/redo, gate di cancellazione, sei testi/tre varianti, messaggi del vero worker con adapter Node, SVG generati, STL roundtrip, indici 3MF/OBJ e rendering iniziale SSR V0.3. Il test del worker non controlla un browser.

**34/34 test superati**, inclusi i 20 precedenti. **Build TypeScript/Vite riuscita**, con chunk worker circa 213 kB e JS principale circa 971 kB (273 kB gzip), warning di dimensione conservato. Continuità C1 verificata sui sei testi; handler worker verificato tramite adapter Node e formati tramite parsing/roundtrip. Nessuna equivalenza con una prova interattiva nel browser.

Server avviato e HTTP 200 su http://127.0.0.1:5173/. **QA visiva non eseguita:** nuovo inventario CUA restituisce `The browser access host is unavailable`. Nessuna automazione alternativa usata per aggirarlo. Nessuna prova di trascinamento nel browser, apertura in slicer, stampa o misura fisica.

## Limiti e problemi aperti

- Fotografie e specifiche reali LED ancora assenti. Nessuna osservazione fotografica o misura assoluta ricavata da foto; profilo 6 × 8 dimostrativo e quote/raggi sono ipotesi/configurazione, non dati di prodotto verificati.
- L'obiettivo 2–4 tratti è raggiunto solo come candidata incompatibile. Naturalezza, leggibilità e compattezza produttiva non validate; occorre ridisegnare i glifi con vincoli di raggio prima di aggiungere altri stili. Varianti contestuali attuali: porte, proporzioni e svolazzi; repertorio di glifi alternativi ancora parziale. Maiuscole complete/cifre/accenti assenti.
- Bound di curvatura numerici Float64, box derivati conservativi, massimo profondità 12 e 8192 visite per cubica. Non aritmetica a intervalli con arrotondamento direzionato. Rettifili monotoni gestiti separatamente; casi incerti non verdi. Non certificazione fisica/CAD.
- Interferenze ereditano polilinee 0,03 mm e raggruppamenti/esclusioni locali V0.2. I contatori raw sono evidenze campionate/aggregate, non una misura esatta della regione difettosa. Nessun test generale triangolo-triangolo o prova dei minimi spessori.
- Ottimizzatore limitato a 24 tentativi; nessun routing globale. Il bound dello scostamento può rifiutare proposte valide; controllo nuovi difetti basato su posizione rappresentativa e tolleranza 0,15 mm, non prova simbolica di non regressione. Non risolve automaticamente le candidate strette.
- Worker testato come handler Node e impacchettato da Vite, non verificato in un browser reale. Richiede Worker; nessun fallback sincrono. Geometria di calibrazione ancora generata sul thread UI quando richiesta.
- Export mesh valida possibile anche con LED rosso, accompagnato da stato/avvisi: utile per studio, non autorizzazione alla produzione. STL/OBJ richiedono unità mm nello slicer; 3MF Core senza profili Bambu.
- Flessione verticale non supportata; passo di taglio conservato senza verifica dei multipli. Sezionamento piatto, incastri, fori cavo, terminali, costi e desktop rimandati.
- Audit npm riesaminato il 18 novembre: **4 high** nella catena dev Vite/picomatch; registry indica ancora picomatch 4.0.7. Nessuna patch compatibile individuata, nessun downgrade/upgrade forzato. Rapporto in `.tools/npm-audit-v03.json`, server su loopback.

## Prossima priorità

Confrontare manualmente la galleria con fotografie e LED reali; ridisegnare pochi glifi e raccordi a raggio controllato, senza perseguire quattro tratti a scapito della geometria. Verificare browser/worker/editor, poi slicer e provini. Consolidare contatori spaziali e bound, completare repertorio contestuale e solo dopo affrontare il sezionamento. Riepilogo trasferibile in docs/RIEPILOGO_CHATGPT.md.
