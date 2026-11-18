# FILOCONTINUO — riepilogo V0.3 per ChatGPT

## Esito principale

Il progetto esistente D:\filocontinuo è stato aggiornato a **0.3.0** il 18 novembre 2026, con backup iniziale in `.tools/backups/prima-v03-2026-11-18.zip`. Generatori V0.1/V0.2, file e test precedenti sono conservati. Nuovo usa il motore V0.3; un progetto aperto mantiene la sua grafia fino a scelta esplicita del motore o della variante. Avvio con avvia.cmd, URL http://127.0.0.1:5173/. Cache/log/temporanei su D.

**L'obiettivo produttivo non è ancora raggiunto.** Sono state generate candidate Stay playful da quattro tratti, senza incroci rilevati, ma con raggi troppo piccoli e distanze insufficienti a 400/600 mm. Non dichiarare ottenuta una scrittura naturale e producibile. I nuovi raggi sono peggiori del riferimento aperto: la riduzione delle interruzioni è un compromesso ancora da risolvere.

## Cosa è stato implementato

Motore contestuale a percorsi centrali originali, arrotondamenti C1 convertiti in cubiche, porte baseline e classificazione iniziale/intermedia/finale/isolata. Proporzioni dipendenti dai vicini, tratti secondari separati/protetti e svolazzi facoltativi. Tre alternative realmente differenti per geometria/proporzioni: Fluida, Aperta, Slanciata. Predisposizione contestuale presente, repertorio professionale di glifi alternativi ancora parziale. Non vengono estrusi contorni di font.

Genera varianti mostra anteprime, dimensioni, numero di tratti, lunghezza, raggio e stato. Originale conservato fino alla scelta. Le candidate rosse si aprono per correzione manuale. Limiti espliciti di larghezza obiettivo/massima; nessun aumento automatico a 1600 mm per ottenere un esito favorevole.

Controllo conservativo della curvatura mediante derivate Bernstein, box della velocità e bound del prodotto vettoriale con suddivisione adattiva. Inclusi estremi e giunzioni. Rettifili monotoni riconosciuti; curve singolari e budget esauriti non ricevono verde. Stati: compatibile con i controlli, vicino ai limiti, incompatibile, da verificare. Giunzioni >0,05° rosse, 0,001–0,05° non conclusive. Anche la sezione impone un minimo geometrico di metà larghezza esterna. Restano bound Float64, non certificazione CAD con intervalli arrotondati.

Ottimizzatore con raccordi cubici fra estremità separate, inversione quando utile, controllo di raggio/larghezza/scostamento e nuovi difetti localizzati. Esclusi punti/barre. Valuta evidenze geometriche oltre ai gruppi di avvisi. Scostamento: limite superiore simmetrico derivato da polilinee a 0,01 mm e margine di metà corda. Ricerca limitata, con motivazioni dei rifiuti; nessuna soluzione universale o garanzia estetica. Anteprima, conferma e annullamento mantenuti.

Editor con inversione/apertura cicli, clic senza modifica, annullamento Escape/pointercancel/lost capture e draft aggiornato al rilascio. Undo/redo usa lo stesso reducer testato sulle maniglie. Osservazioni dei provini salvate in JSON senza inventare una verifica fisica.

Analisi, mesh, varianti e ottimizzazione in Web Worker annullabile. Nuovo progetto/job termina quello superato; ID obsoleti scartati. Errori conservano ultimo risultato e progetto. Export/editing sospesi finché i dati non sono aggiornati; ricalcolo e ripristino dell'ultimo progetto con mesh valida disponibili. La sola geometria dei provini è ancora calcolata nel thread UI.

Tre viste: Calligrafica pulita, Tecnica con editor/canaletta/anomalie, Neon estetica su sfondo scuro senza simulazione fisica.

## Risultati a parametri uguali

Profilo dimostrativo costante: 6 × 8 mm, raggio 12 mm, tolleranza 0,3 mm, pareti 1,2 mm, fondo 1,5 mm, altezza pareti 7 mm, flessione laterale. Inclinazione 8°, spaziatura 1,3, proporzione 1. Quote del percorso centrale.

| Versione / variante | Larghezza | Tratti | LED teorico | Raggio osservato sulle cubiche | Esito |
| --- | ---: | ---: | ---: | ---: | --- |
| V0.2 aperta | 400 mm | 17 | 555,79 mm | 3,733 mm | incompatibile |
| V0.2 aperta | 600 mm | 17 | 833,74 mm | 5,599 mm | incompatibile |
| V0.2 riferimento | 1600 mm | 17 | 2223,75 mm | 13,191 mm | esito storico sì; oggi una discontinuità segnalata |
| V0.3 Fluida | 400 mm | 4 | 902,02 mm | 0,705 mm | incompatibile |
| V0.3 Aperta | 400 mm | 4 | 746,82 mm | 0,736 mm | incompatibile |
| V0.3 Slanciata | 400 mm | 4 | 1048,96 mm | 0,597 mm | incompatibile |
| V0.3 Fluida | 600 mm | 4 | 1353,23 mm | 1,057 mm | incompatibile |
| V0.3 Aperta | 600 mm | 4 | 1120,42 mm | 1,105 mm | incompatibile |
| V0.3 Slanciata | 600 mm | 4 | 1573,69 mm | 0,896 mm | incompatibile |

Riduzione strutturale 17→4, −76,5%, **senza compatibilità LED raggiunta**. Zero incroci rilevati sulle sei candidate, ma prossimità e curvature insufficienti. Tutte le sei mesh sono chiuse valide: mesh valida e LED compatibile restano distinti. La V0.2 a 1600 mm non è cambiata: il controllo più severo trova una giunzione prima tollerata. I raggi delle cubiche non rappresentano un raggio fisico definito in uno spigolo.

## Artefatti e verifica

Generati 36 SVG puliti: Stay playful, Amore, Olivia, Tradizione, Buon compleanno e Filocontinuo × tre alternative × 400/600 mm. Sei SVG Neon estetici aggiuntivi. Tutto in examples/v03/, con galleria.html, progetti JSON, confronto.json, rapporti diagnostici/mesh e STL/3MF/OBJ di una candidata. Rigenerazione: npm run examples:v03.

34/34 test superati, build TypeScript/Vite riuscita. Suite portata a 34 test, preservando i 20 precedenti. Nuovi test su bound contro curva densa, estremi/singolarità/non verde, sezione minima, apertura/inversione, raccordi accettati/rifiutati, scostamento, V1/V2/metadata, undo/redo, gate async, sei testi/varianti, vero handler worker con adapter Node, SVG, STL roundtrip e indici 3MF/OBJ, SSR V0.3. SSR e adapter Node non sono test browser.

Server HTTP 200. Browser CUA tentato: `The browser access host is unavailable`. **Nessuna QA visiva, prova manuale dei gesti, slicing o stampa fisica effettuata.** Foto e specifiche LED reali non allegate: nessuna analisi fotografica o misura dedotta da immagini.

Audit ripetuto: 4 high nella catena dev Vite/picomatch, registry ancora 4.0.7 e nessuna patch compatibile trovata; nessun aggiornamento/downgrade forzato. Server soltanto loopback, rapporto audit in .tools/npm-audit-v03.json.

## Cosa resta da fare

1. Valutare gli SVG con fotografie e LED reali; disegnare glifi/raccordi a raggio controllato, senza ridurre i tratti sacrificando le curvature. Stabilire dimensioni realistiche del prodotto.
2. Verificare in browser worker, cancellazione, selezioni e gesti; poi slicer e stampa dei provini V0.2, annotando solo misure reali.
3. Rafforzare collisioni/raggruppamenti e bound numerici: ancora polilinee con esclusioni locali, nessuna prova generale triangolo-triangolo o minimi spessori.
4. Completare la libreria contestuale, maiuscole/cifre/accenti, inversione/selezione avanzata e routing dell'ottimizzatore.
5. Sezionamento P1S, giunti, terminali, passacavi e costi rimangono futuri. Nessuna produzione pronta dichiarata.
