# Stato tecnico 0.4.2 · ONE

Love e Memo a 400 mm e Amore a 600 mm superano LED R12 e validazione mesh. Love a 600 mm fallisce la mesh. Suite locale 65/65, build web/desktop/smoke riuscite. Dati completi in examples/v042/confronto.json, calibrazione e limiti in docs/ONE_CONTINUOUS_ENGINE.md.

# Stato tecnico FILOCONTINUO 0.4.1 · 19 novembre 2026
**Software disponibile.** L’app web locale usa React, TypeScript, Vite e Three.js. Electron la distribuisce su Windows x64. Il compositore produce linee centrali Bézier, il worker analizza i percorsi e il motore Clipper/Earcut genera una canaletta a U. Sono operativi import SVG, editor di nodi e maniglie, profili LED, annulla/ripeti, salvataggio e riapertura V1/V2, esportazioni SVG, STL, OBJ e 3MF. L’ottimizzatore presenta proposte da confermare.

**Calligrafia e interfaccia.** Style Studio confronta Signature, Minimal e Vintage. Ogni famiglia dispone di 92 caratteri, comprese maiuscole, minuscole, accenti italiani, cifre e simboli. Supporta composizioni multiriga, varianti di singole lettere e una vista Neon estetica. I collegamenti automatici sono conservativi. Restano da rifinire leggibilità, continuità e varietà dei glifi.

**Ultimo sviluppo.** La 0.4.1 ha aggiunto un pannello ONE nella barra laterale. Le guide originali delle lettere comprendono ritorni affiancati e tre ampiezze di raccordo. È possibile comporre un percorso assoluto o uno per parola. L’anteprima anima il percorso assoluto con riproduzione, pausa, riavvio e velocità regolabile. Applicando la proposta, gli stessi nodi passano all’editor e alla mesh. La scelta implementativa è stata salvare i nodi nel formato esistente. Alla riapertura occorre reimpostare i parametri del compositore per generare una nuova proposta. Sono stati ridisegnati sette glifi dopo aver rilevato incroci nei primi esempi. Questa sessione ha aggiornato esclusivamente la documentazione.

**Copertura ONE.** Il codice contiene le maiuscole A, B, C, D, F, L, M, O, S, T e le minuscole a, b, c, d, e, f, g, i, j, k, l, m, n, o, p, q, r, t, u, v, x, y, z, oltre a ì e allo spazio. Segnala i caratteri mancanti. Restano parziali le varianti contestuali e l’integrazione nelle schede di Style Studio. Mancano continuità ottimizzata, parete condivisa verificata e provini specifici ONE.

## Risultati numerici ONE

| Testo | Larghezza mm | Percorsi | Incroci rilevati | Ripassi rilevati | LED mm | R osservato mm | Distanza segnalata mm | Mesh valida |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Love | 400 | 1 | 0 | 0 | 1.230,3 | 2,62 |  | True |
| Ciao | 400 | 1 | 0 | 0 | 1.116,5 | 2,38 |  | True |
| Amore | 400 | 1 | 0 | 0 | 1.069,7 | 1,67 | 5,84 | True |
| Olivia | 400 | 1 | 0 | 0 | 1.143,4 | 1,63 | 8,74 | True |
| Dario | 400 | 1 | 0 | 0 | 1.084,1 | 1,85 | 9,11 | True |
| Olga | 400 | 1 | 0 | 0 | 1.293,3 | 2,08 | 9,19 | True |
| Stay playful | 400 | 1 | 0 | 0 | 1.220,9 | 0,38 | 3,21 | True |
| Stay playful | 600 | 1 | 0 | 0 | 1.831,7 | 0,58 | 4,81 | True |
| Stay playful | 800 | 1 | 0 | 0 | 2.442,4 | 0,77 | 6,34 | True |
| Stay playful | 1000 | 1 | 0 | 0 | 3.053,1 | 0,96 | 7,60 | True |
| Tradizione | 400 | 1 | 0 | 0 | 1.081,0 | 0,89 | 5,17 | True |
| Filocontinuo | 400 | 1 | 0 | 0 | 1.107,4 | 0,78 | 3,44 | True |
| Buon compleanno | 400 | 1 | 0 | 0 | 1.052,5 | 0,30 | 2,53 | True |
| MoruMì | 400 | 1 | 0 | 0 | 1.094,0 | 0,71 | 5,96 | True |
| lloo | 400 | 1 | 0 | 0 | 1.270,8 | 2,72 |  | True |
| bbjjkkqqxx | 400 | 1 | 0 | 0 | 1.221,5 | 0,56 | 5,61 | True |

63 test locali superati, zero falliti. Gli esempi contengono anche i casi ripetuti lloo e bbjjkkqqxx. Le 16 analisi del percorso assoluto restituiscono incompatibilità LED. La galleria examples/v041/galleria.html collega progetti, anteprime tecniche e Neon. La simulazione è implementata sul tracciato ordinato; riproduzione, installazione e stampa restano da verificare sul PC.


**Produzione e verifiche.** La V0.2 dispone di provini generici di calibrazione. Restano da provare importazione in Bambu Studio, slicing, stampa e inserimento di un LED reale per ONE. La precedente suite locale V0.4.1 documenta 63 test superati e zero falliti, build web e desktop riuscite e avvio del pacchetto Windows verificato. In V0.4 sono stati osservati su Windows Style Studio, multiriga, Neon, vista 3D, annulla/ripeti e riapertura nativa. Per ONE restano aperte la revisione visiva della grafia e la prova dell’animazione. Le immagini disponibili nella galleria sono anteprime SVG. Questa sessione documentale non ha prodotto nuovi screenshot né rieseguito i test. Il worker limita i blocchi durante le analisi, ma manca un benchmark interattivo ONE. L’ultimo audit documentato conta sei advisory moderati nella catena di sviluppo e zero nelle dipendenze di produzione.

**GitHub e distribuzione.** Il branch locale e remoto `feature/v041-one` coincidono al commit software `f220b61`. `main` conserva la baseline V0.3 e `develop` la precedente integrazione desktop. L’API pubblica restituisce zero GitHub Releases. La verifica Actions della V0.4 era riuscita su Linux e Windows. Stato Actions 0.4.1 verificato: in_progress. Dettagli nel [run 44568317315](https://github.com/dariotodarodt/filocontinuo/actions/runs/44568317315). Il setup locale è `release/FILOCONTINUO-Setup-0.4.1.exe`, sperimentale e privo di firma. Il controller disabilita download automatico e installazione alla chiusura, richiede consenso distinto e blocca l’aggiornamento senza firma verificabile. Installazione pulita e aggiornamento reale fra pacchetti firmati restano da provare. Il riordino documentale è locale e il prompt originale nella radice rimane fuori da Git.

Pulizia esempi 19 novembre: examples/v042 è la raccolta corrente. I generatori e i test storici scrivono in .tools/legacy-examples. Rimane una fixture V2 per la compatibilità. Suite verificata 65/65. Distribuzione manuale 0.4.2 sperimentale, firma ancora da configurare.
