# Verifica dopo recupero da GitHub

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

## Rapporto precedente alla migrazione (storico)

# Rapporto distribuzione 0.4.0 — 18 novembre 2026

## Artefatto locale

- `release/FILOCONTINUO-Setup-0.4.0-x64.exe`: **126326438 byte** (circa 120,47 MiB).
- SHA-256: `31C65C22497C27F7C91007F4331BD4449B26D70A7B9C9D100AC7FE6DD9D45C61`.
- Authenticode: **NotSigned**, sperimentale. Non pubblicato in Git o GitHub Releases.
- Generato realmente da Electron Builder/NSIS, con blockmap. Il solo eseguibile di avvio dell'app è in `release/win-unpacked/`, accompagnato dal runtime completo.
- La build finale contiene il renderer attuale, main/preload attuali e la policy di ripiego non abilitata. Non sono artefatti segnaposto.

## Verifiche eseguite

| Verifica | Risultato e portata |
| --- | --- |
| `npm test` | 45/45 superati, compresi tutti i 34 precedenti e test dei quattro formati |
| `npm run build` | TypeScript/Vite riuscito; warning chunk principale circa 978 kB |
| Build desktop NSIS | Riuscita, installer sopra identificato; nessuna firma disponibile |
| `npm run desktop:smoke` | App impacchettata avviata realmente, renderer locale, bridge e Web Worker attivi, mesh valida |
| Preferenze del renderer reale | contextIsolation true, nodeIntegration false, sandbox true |
| Confronto ASAR/sorgenti | main, preload e index del renderer corrispondenti; template policy incluso nel pacchetto finale |
| UI desktop via Computer Use Windows | Schermata CAD/mesh 3D e pannello Aggiornamenti osservati; versione 0.4.0 e blocchi firma visibili |
| Controllo GitHub dalla UI | Feed interrogato realmente: `No published versions on GitHub`; nessun download/installazione |
| Salvataggio nativo | Progetto di prova salvato, conferma UI e file JSON presenti nella cartella standard Documenti/FILOCONTINUO/Progetti |
| Dialogo Apri | Aperto e osservato; riapertura del file non completata per limiti del controllo del dialogo nativo, poi annullato |
| YAML workflow | Parsing locale riuscito per entrambi; non eseguiti su GitHub |
| Versioni | package, lock e applicazione 0.4.0 coerenti; nessun tag/release creato |
| Lockfile | `npm ci --dry-run --ignore-scripts` riuscito; non equivale a installazione su ambiente pulito |
| Audit npm | 12 complessivi (5 moderate, 7 high); runtime `--omit=dev` zero advisory del registry |
| Remoto Git | Pubblico, nessun riferimento remoto al controllo; nessun push effettuato |
| Accesso di scrittura Git | Prima verifica fallita per autenticazione assente; dopo autorizzazione manuale, account dariotodarodt registrato in GCM e dry-run dei tre rami riuscito senza inviare file |

Lo smoke usa dati isolati sotto `.tools/tmp/`, nessun test sostituisce progetti utente. Il campo `offlineRenderer=true` del rapporto descrive il blocco configurato delle richieste remote del renderer, **non** una prova di disconnessione fisica della macchina. La prova visiva Windows aggiunge un'osservazione reale, ma non verifica tutti i gesti dell'editor o i dialoghi di esportazione.

## Non effettuato / ancora necessario

Installazione pulita, avvio su PC senza Node, disinstallazione, trasferimento reale V1/V2 con dialoghi, tutti gli export tramite dialoghi nativi, editor trascinamento/undo completo, backup/ripristino interattivo completo, offline con rete disconnessa, aggiornamento fra due installer firmati e conservazione dei dati durante tale aggiornamento. Mancano certificato, ambiente GitHub protetto, autorizzazione al primo push ed esecuzioni Actions. Nessuna prova fisica LED, slicing o stampa. I test unitari usano firme e trasporto simulati, senza dichiarare verifica di un certificato reale.

I percorsi calligrafici e le limitazioni V0.3 rimangono invariati: quattro tratti non significano compatibilità produttiva a 400/600 mm. La preparazione desktop non risolve questi difetti geometrici.
