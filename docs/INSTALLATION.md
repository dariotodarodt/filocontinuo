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

Sul computer corrente `avvia.cmd` mantiene la modalità web esistente su http://127.0.0.1:5173/. Per i comandi manuali, da `D:/filocontinuo`:

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
