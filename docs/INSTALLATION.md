# Installazione e avvio — 0.4.0 sperimentale

## Utente Windows

Il pacchetto locale è `release/FILOCONTINUO-Setup-0.4.0-x64.exe`. È un installer NSIS x64 **non firmato, sperimentale**: non costituisce una release stabile pubblicata. Richiede Windows supportato da Electron 45 (Windows 10 o successivo); Windows 7/8 non sono supportati. Node, Vite e browser non servono all'utente finale.

Eseguire il setup, scegliere la cartella, eventualmente selezionare il collegamento desktop e poi avviare FILOCONTINUO dal menu Start. Il setup non avvia automaticamente l'app al termine. La disinstallazione è disponibile nelle impostazioni App di Windows. I dati utente sono conservati, ma la prova reale d'installazione/disinstallazione non è stata effettuata in questa sessione.

Per provare senza installazione, conservare **tutta** `release/win-unpacked/` e aprire `FILOCONTINUO.exe`. Copiare soltanto l'EXE non basta. L'app non necessita di rete per testo, geometria, editor e file; la verifica delle release richiede Internet. Il test automatico del pacchetto non equivale a una prova su un PC pulito.

## Dati e recupero

- Dati applicazione: `%APPDATA%/FILOCONTINUO/`, inclusa la sessione Chromium `filocontinuo-ui` che conserva autosave, profili e preferenze.
- Impostazioni versionate: `settings.json`; la precedente scrittura è conservata in `.previous`. Uno schema futuro non viene riscritto automaticamente.
- Cartella iniziale dei dialoghi progetto: la cartella Documenti di Windows, quindi `FILOCONTINUO/Progetti`. È possibile scegliere altre cartelle.
- Progetti: JSON V1/V2; nessuna rigenerazione silenziosa dei tracciati. Aprire e salvare esplicitamente i vecchi file.

Da **Impostazioni → Aggiornamenti → Esporta backup dati** salvare autosave, ultimo progetto valido, profili e preferenze in un JSON. Copiare separatamente i progetti esterni. Per ripristinare, salvare prima il progetto corrente e usare **Ripristina backup**: schema e contenuti sono validati e una copia preventiva viene scritta in `Backups/`. Conservare una copia dell'intera cartella dati a programma chiuso prima di aggiornamenti sperimentali. Non cancellarla durante la disinstallazione. I dati del browser della modalità web restano separati: usare Salva/Apri per trasferire i progetti.

## Sviluppo locale

Sul computer corrente `avvia.cmd` mantiene la modalità web esistente su http://127.0.0.1:5173/. Per i comandi manuali, da `D:/FILOCONTINUO_Studio/filocontinuo_github`:

```powershell
$env:PATH = "$PWD/.tools/node-v22.16.0-win-x64;$env:PATH"
$env:TEMP = "$PWD/.tools/tmp"
$env:TMP = $env:TEMP
npm ci
npm run dev
# Oppure, in una nuova sessione con lo stesso ambiente:
npm run desktop:dev
```

`desktop:dev` compila il renderer e avvia Electron, senza server Vite né hot reload. `desktop:runtime` prepara il runtime Electron ufficiale se manca. Su un altro computer usare Node 22 e Git installati oppure predisporli sul disco dati: `.tools` non è distribuita nel repository. La prima installazione dipendenze/build richiede rete; la normale esecuzione del pacchetto no.

```powershell
npm run examples:v03
npm test
npm run build
npm run desktop:dist
npm run desktop:smoke
```

Chiudere l'app impacchettata prima di ricostruirla: Windows può bloccare file del runtime o log aperti. Usare normalmente `desktop:dist`, che prepara il pacchetto dai sorgenti; non riutilizzare directory di esecuzione contenenti log/dati per una distribuzione.

Sorgenti in Git; build in `dist/`, installer in `release/`, cache e temporanei di sviluppo in `.tools/`. Nell'app distribuita i dati seguono i percorsi Windows standard e non dipendono da D:.

## Migrazione effettuata e backup esterno

Cartella attiva: D:/FILOCONTINUO_Studio/filocontinuo_github, ramo develop con versione desktop 0.4.0 sperimentale. Aprire questa cartella in VS Code oppure il workspace locale .tools/FILOCONTINUO-GITHUB.code-workspace. Il primo push è stato autorizzato ed eseguito; nessuna release stabile. main mantiene la baseline V0.3.

Backup: D:/FILOCONTINUO_Studio/filocontinuo_backup/migrazione-20261118-182427225. progetto-originale contiene la copia precedente, inclusi installer e backup; dati-applicazione contiene i dati FILOCONTINUO dell'utente Windows e progetti-documenti i file della sua cartella Documenti/FILOCONTINUO. SHA256.json elenca 1257 file; 208 file critici sono stati confrontati con gli originali. Altri percorsi di salvataggio personali non vengono scoperti automaticamente.

Git funziona da D:/FILOCONTINUO_Studio/filocontinuo_tools/git e non richiede la cartella originale. Node e cache del nuovo checkout sono in .tools del nuovo progetto. Le impostazioni VS Code precedenti sono conservate nel backup. Il sistema Windows mantiene le credenziali GCM; non sono esportate.

Per ripristinare, copiare lo snapshot in una cartella nuova e usare npm ci/build per le dipendenze escluse. Prima di ripristinare i dati dell'app, chiudere FILOCONTINUO e salvare una copia dei dati attuali. Il backup contiene dati personali e non va pubblicato. La cartella originale è stata conservata: la migrazione non ne esegue la cancellazione.

## Nuovo setup Style Studio

La cartella attiva è ora D:/FILOCONTINUO_Studio/filocontinuo_github e il branch della consegna è feature/v04-style-studio. Gli strumenti Git sono nella sottocartella sorella filocontinuo_tools; backup in filocontinuo_backup. I vecchi percorsi riportati sopra descrivono la prima migrazione.

Il nuovo setup locale è release/FILOCONTINUO-Setup-0.4.0.exe, alias identico del file canonico -x64.exe richiesto dall’updater. Mantiene lo stesso numero 0.4.0 della base sperimentale precedente; per ottenere lo Studio occorre eseguire manualmente il nuovo setup. Questa sessione lo ha generato e verificato come pacchetto avviabile, senza installarlo sul sistema o provare un aggiornamento fra versioni firmate.

Dopo l’avvio scegliere Style Studio. Comporre e confrontare le famiglie, quindi Applica/genera 3D o Apri nell’editor. Un candidato rosso richiede correzione: la mesh chiusa non certifica il LED. Galleria e progetti in examples/v04; npm run examples:v04 li rigenera.

L’importazione web di progetti/SVG resta limitata a 2 MB; il dialogo nativo dei progetti a 8 MB. Una famiglia personale complessa inclusa nel progetto può richiedere il dialogo desktop. I limiti di quota dell’autosave sono segnalati e non sostituiscono il salvataggio esplicito.
