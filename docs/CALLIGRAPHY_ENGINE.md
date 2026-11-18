# Motore calligrafico — Style Studio 0.4.0 sperimentale

## Dati, composizione e produzione

`src/calligraphy/studio/sources.ts` contiene tre alfabeti originali distinti. `families.ts` costruisce famiglie di dati versionate, indipendenti dalla UI. Le coordinate e le metriche del master sono quote nominali in millimetri; vengono scalate con un rapporto adimensionale attraverso le metriche della famiglia; il compositore restituisce sempre Bézier in millimetri, con Z riservato all'estrusione. Non sono contorni di font né caratteri di sistema estrusi.

Signature usa gesti curvi e ascendenti ad anello; Minimal usa scheletri geometrici e raccordi quadratici delle polilinee, con alcune interruzioni per evitare giunzioni a T; Vintage ha proporzioni tubolari, capitali ampie e tratti arrotondati propri. Non derivano da una sola trasformazione affine dello stesso alfabeto. La presenza di tre famiglie non costituisce validazione professionale della loro qualità estetica o producibilità.

`compose.ts` compone testo NFC, classifica vicini, ripetizioni e terminali, applica trasformazioni ai controlli reali, dispone le righe e adatta proporzionalmente l'intera composizione alla larghezza obiettivo. La famiglia e tutte le trasformazioni effettive sono salvate con il progetto. Gli estremi delle cubiche sono calcolati risolvendo le derivate quadratiche in Float64: un errore di campionamento nel disegno sorgente non deve amplificarsi quando si impone una larghezza massima. Non è una certificazione numerica CAD con arrotondamento diretto.

Le analisi riutilizzano `inspectPaths/checkBend`: raggi, estremi/giunzioni, cuspidi, incroci, ripassi e distanze; limiti conservativi e stati non conclusivi restano distinti. La mesh viene prodotta dal motore Clipper/Earcut esistente. Un candidato LED rosso può essere aperto per correzione; l'esportazione mesh richiede comunque una mesh valida e una valutazione aggiornata. Non viene ridotto il raggio del profilo, né aumentata automaticamente la larghezza oltre il massimo.

## Varianti e collegamenti

Signature offre terminali iniziali/finali/isolati per le minuscole; la forma intermedia usa la base quando non esiste un'alternativa dedicata. Esistono forme aperte di a/d/g/o/f/y, forme ripetute di l/o/n e raccordi ampi di a/e/r. Minimal e Vintage hanno forme aperte di a/o/e. Il menu della singola lettera elenca soltanto le varianti realmente presenti. `Genera varianti` elimina le proposte geometricamente identiche: non promette tre alternative per qualunque testo o famiglia.

I collegamenti automatici sono prudenti: solo porte consecutive della stessa parola/riga, aperte, orizzontali e rivolte in avanti, per una famiglia che li consente. La proposta unita viene analizzata integralmente. Se non è conclusiva o contiene errori, i collegamenti proposti vengono scartati e la composizione resta separata. Non è un algoritmo generale di routing, raccordo o ottimizzazione globale. Dati e licenze delle famiglie restano separati dai parametri LED.

La sostituzione di una lettera usa la matrice affine e i percorsi congelati di quella posizione: non rigenera le altre lettere. I collegamenti sono ricontrollati e possono essere rifiutati. Dopo modifiche arbitrarie nell'editor, il confronto fra snapshot e curve impedisce una sostituzione basata su una corrispondenza ormai obsoleta; serve una ricomposizione esplicita nello Studio, proposta prima dell'applicazione. La futura mappatura intelligente dei nodi modificati alle lettere non è implementata.

## Multiriga e parametri

Massimo 100 caratteri e cinque righe. Sinistra/centro/destra si riferiscono agli ingombri analitici dei percorsi; l'interlinea libera è in millimetri e si aggiunge al massimo ingombro verticale della composizione. Offset X/Y di ogni riga sono in millimetri e non generano connessioni fra righe. Uno spostamento può superare la larghezza massima: in tal caso Applica resta disabilitato. Le matrici delle singole posizioni predispongono la composizione a futuri supporti su curve/archi, che non sono disponibili nella UI.

Inclinazione, spaziature, proporzioni e altezza maiuscole agiscono sulle curve prima della normalizzazione alla larghezza obiettivo. Una variazione orizzontale, mantenendo quella larghezza fissa, modifica anche l'altezza finale: le dimensioni effettive sono mostrate nelle proposte. Le estensioni sono percentuali dell'em della famiglia, non quote finali assolute; la loro geometria partecipa alla normalizzazione. I campi della canaletta e del profilo LED restano invariati.

## Worker, errore e annullamento

Il confronto famiglie/varianti, la sostituzione di lettere e le analisi dello Studio usano il vero Web Worker esistente con il nuovo task `studio`. La valutazione della mesh e l'ottimizzatore continuano nei task precedenti. La UI attende 250 ms dopo le modifiche, termina il job precedente, usa ID e chiave degli input per rifiutare risultati obsoleti e non applica una vecchia proposta durante il ricalcolo. Errori e annullamento conservano il progetto e le ultime anteprime. I colori Neon non avviano nuovi calcoli geometrici; il materiale 3D viene aggiornato senza ricreare il renderer.

Le misure in `examples/v04/confronto.json` sono wall-clock di composizione e analisi sulla macchina della sessione, senza mesh e senza costo di avvio del worker. Non sono tempi garantiti per qualunque PC.

## Limiti produttivi

Stay playful a 400/600/800 mm resta incompatibile in tutte e tre le famiglie con il profilo dimostrativo 6 × 8 mm, R minimo 12 mm. La mesh chiusa non risolve distanze, curvature e cuspidi. Più tratti rispetto alla candidata V0.3 possono essere necessari quando i collegamenti non superano i controlli. Il passo di taglio e la flessione sono conservati; i multipli di taglio, la verifica dei LED reali e il routing elettrico non sono risolti. Nessuna fotografia originale è disponibile e nessuna misura fisica è stata inventata.
