## 0.4.3 · Parete condivisa sperimentale

## Revisione delle parole ONE Fusion · 19 novembre 2026

Il compositore `words.ts` dispone un’intera riga, adatta la larghezza dei ritorni alla densità di lettere e al profilo, combina nuovi tratti cubici e guide originali ONE e determina le maniglie di raccordo dalle tangenti. Ogni parola è un sottopercorso. Il collegamento tra parole è facoltativo sulla singola riga. L’asse verticale viene convertito in coordinate CAD quando si applica la bozza. La misura tra rami è campionata. Oltre il budget di 4000 punti la distanza resta indeterminata. La larghezza impostata è riferita all’asse. Il controllo della leggibilità resta affidato al proprietario.

La distanza nominale dei due assi è larghezza LED + tolleranza + divisoria + 0,12 mm. Separate sostituisce la divisoria con due pareti. I contorni esterni vengono uniti dal motore di offset e la cavità è calcolata separatamente. Il worker ripete il controllo dopo le modifiche; l’export mesh dei glifi sperimentali richiede anche distanza campionata con margine di 0,08 mm, una linea aperta e diagnostica LED conclusiva favorevole. Il margine è numerico, non una tolleranza di stampa certificata. Rigenerare la galleria con tsx scripts/generate-v043.ts.

# ONE vincolato 0.4.2

Gli archi usano maniglie tangenti di lunghezza 4R tan(θ/4)/3 e angolo massimo 45°. La normalizzazione uniforme deve lasciare almeno 1,015 volte il raggio richiesto sulle primitive unitarie. Il solver rifiuta il caso altrimenti. La diagnostica successiva verifica le cubiche. Distanze campionate e limiti sono documentati nel report e nei JSON. Rigenerazione con tsx scripts/generate-v042.ts e tsx scripts/calibrate-one.ts.

# ONE — Filo Unico sperimentale 0.4.1

Il compositore usa guide distinte per lettera, in coordinate locali, con ingresso e uscita sulla linea di base. Il parametro di raccordo determina i punti di tangenza lungo ciascun lato. Le quadratiche SVG vengono convertite negli stessi nodi Bézier utilizzati da editor, analisi e mesh. I ritorni sono parte del disegno di l, g, p e y. I punti di i e l’accento di ì sono stilizzati nel tracciato. Serve una revisione umana della leggibilità. I caratteri assenti producono un errore.

Gli spazi estendono la linea di base in modalità assoluta oppure separano i percorsi in modalità per parola. Il compositore scala le coordinate una volta sola alla larghezza impostata. La simulazione traccia la lunghezza normalizzata del percorso SVG usato per applicare la geometria. La riproduzione multipercorso è ancora da implementare.

Il controllo esistente considera la larghezza interna più due pareti. Per il profilo 6 × 8 mm con tolleranza 0,30 mm e pareti 1,20 mm la distanza di riferimento vale 8,70 mm. Il rapporto registra la minima distanza segnalata dai controlli campionati. Un valore nullo indica assenza di una misura segnalata. I conteggi indicano rilevamenti sulla polilinea, soggetti a raggruppamento e tolleranza. I controlli escludono tratti vicini lungo lo sviluppo della curva. Servono controlli ulteriori per certificare assenza di incroci e separazione delle cavità.

La prima implementazione usa pareti indipendenti. Parete condivisa, margine aggiuntivo regolabile, ricerca di continuità ottimizzata, ancore contestuali, repertorio completo, integrazione nelle schede Style Studio, simulazione multipercorso e provini ONE restano aperti. Le curve sono modificabili con l’editor esistente. Il progetto conserva i nodi applicati e il profilo. Per ora i parametri di composizione ONE devono essere reimpostati alla riapertura.

Le anteprime SVG e i progetti in examples/v041 sono riproducibili con tsx scripts/generate-one.ts. Il confronto V0.4 si trova in examples/v04/confronto.json. A 400, 600 e 800 mm Signature produceva 13 percorsi, Minimal e Vintage 18. ONE produce un percorso assoluto ma anche a 1000 mm resta incompatibile con R12. Nessuna prova di stampa, slicing o aggiornamento firmato.