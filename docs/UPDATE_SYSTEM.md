# Sistema di aggiornamento — 0.4.0

## Stato reale

Electron Updater **6.8.11**, Electron **45.3.4**, Electron Builder **26.18.0**. Provider fisso GitHub pubblico `dariotodarodt/filocontinuo`; nessun token nell'app. La build locale non firmata è sperimentale: può controllare le release, ma **download e installazione aggiornamenti sono bloccati**. In assenza di release il controllo può mostrare un errore di feed mancante, non una falsa verifica positiva.

La sezione Impostazioni → Aggiornamenti mostra versione, nuova stabile, data, note testuali, dimensione, stato e avanzamento. Controllo automatico all'avvio disattivato per impostazione iniziale e disattivabile. `autoDownload=false`, `autoInstallOnAppQuit=false`, `allowPrerelease=false`, `allowDowngrade=false`, `disableWebInstaller=true` sono impostati sul trasporto. La presenza dell'API `autoInstallOnAppQuit` è controllata; aggiornare la dipendenza richiede riesame delle API e dei test.

## Flusso autorizzato

1. Controllo manuale, oppure soltanto controllo all'avvio se abilitato.
2. Sono accettate versioni SemVer stabili strettamente superiori e metadati con nome artefatto previsto, dimensione e SHA-512 validi. Si rispetta anche l'esito di incompatibilità OS dell'updater.
3. **Scarica aggiornamento**, seguito da conferma nativa. Prima del download deve essere verificabile la firma dell'app installata.
4. L'updater verifica l'integrità del download; FILOCONTINUO controlla inoltre Authenticode con PowerShell, stato Valid e Subject completo del certificato previsto. Un errore o l'impossibilità di verificare blocca l'operazione.
5. **Installa e riavvia**, seguito da conferma nativa. Si ricontrollano modifiche non salvate e firma del pacchetto. Solo questo flusso chiama `quitAndInstall(false,true)`.

Ricordamelo dopo non installa nulla e durante il download richiede l'annullamento tramite CancellationToken. Errori di connessione, metadati e download sono esposti; un download interrotto può essere ritentato. Nessun trigger d'installazione su chiusura o normale riavvio. Le note non vengono interpretate come HTML.

## Firma e distribuzione

Il workflow firmato richiede certificato e password nei secret GitHub, nome editore e Subject completo nelle variabili dell'ambiente protetto. Il Subject deve corrispondere esattamente al certificato; rinnovi/cambi editore richiedono un piano esplicito di transizione. Il file policy distribuito contiene soltanto identità pubbliche, mai chiavi. Firma obbligatoria con `forceCodeSigning` nel percorso firmato; verifica della firma Windows dell'updater sempre attiva. Non impostare opzioni per aggirarla.

`latest.yml` e blockmap sono prodotti soltanto per il percorso configurato di pubblicazione firmata. SHA-512 fornisce integrità, **non è una firma autonoma del manifest**. Questa implementazione usa HTTPS GitHub e Authenticode dei binari; non dichiara una firma crittografica separata del manifest che l'updater scelto non implementa. Custodire il certificato, limitare accesso all'ambiente e proteggere account/tag/release GitHub.

Se il repository diventasse privato, questo provider pubblico non sarebbe sufficiente: predisporre un feed pubblico separato o un servizio di distribuzione autenticato senza credenziali incorporate nell'app. La visibilità non viene modificata dall'app né dai workflow.

## Verifiche e limiti

Test automatici del controller coprono consenso, nessun automatismo, errori/offline, cancellazione e ripresa, versioni, firme simulate, integrità fallita e modifiche non salvate. Non sostituiscono una prova reale di aggiornamento fra due installer firmati. Mancano certificato, release e tale prova; non è ancora una distribuzione produttiva.

Riferimenti: [API updater v26](https://www.electron.build/v26/docs/api/electron-updater.class.appupdater/), [configurazione Windows](https://www.electron.build/v26/docs/win/).
