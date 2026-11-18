Apri Codex, crea una nuova cartella di progetto chiamata FILOCONTINUO, allega le quattro fotografie che mi hai mostrato e incolla integralmente il seguente prompt.

Ho unificato le istruzioni precedenti in un unico comando, così da partire con una struttura ordinata e predisposta per tutti i futuri aggiornamenti.

# FILOCONTINUO — Avvio progetto V0.1

Agisci come sviluppatore software senior, specializzato in grafica vettoriale, geometria 3D, CAD e produzione mediante stampa 3D.

## 1. Obiettivo del progetto

Realizzare un software denominato **FILOCONTINUO**, dedicato alla progettazione e produzione di insegne luminose con LED Neon Flex.

Il programma dovrà trasformare un semplice testo digitato dall'utente in una scrittura calligrafica monolinea, generando automaticamente una canaletta tridimensionale nella quale alloggiare il LED flessibile.

Analizza attentamente le fotografie allegate, che rappresentano il prodotto fisico che vogliamo ottenere.

## 2. Architettura del software

Realizza un'applicazione web utilizzabile in locale su Windows, predisposta per una futura conversione in applicazione desktop.

Tecnologie suggerite:

- React.
- TypeScript.
- Vite.
- Three.js.
- Librerie geometriche per offset, unioni e triangolazioni.

Mantieni separati e indipendenti:

- Motore calligrafico.
- Motore vettoriale.
- Motore geometrico 3D.
- Motore di ottimizzazione produttiva.
- Interfaccia grafica.
- Sistema di esportazione.

Valuta le tecnologie suggerite e, se necessario, proponi alternative tecnicamente più affidabili.

## 3. Funzionalità della prima versione

- Inserimento del testo.
- Trasformazione del testo in scrittura calligrafica monolinea.
- Prima libreria di caratteri vettoriali monolinea.
- Importazione SVG.
- Visualizzazione 2D del percorso.
- Generazione automatica della canaletta 3D.
- Anteprima 3D navigabile.
- Impostazione delle dimensioni reali in millimetri.
- Calcolo della lunghezza del LED necessario.
- Esportazione STL, 3MF, OBJ e SVG, dando priorità a STL e 3MF.
- Salvataggio e riapertura del progetto.

## 4. Requisito fondamentale della calligrafia

Non utilizzare semplicemente il contorno di un font tradizionale estruso in 3D.

La scrittura deve essere costituita da percorsi vettoriali centrali, preferibilmente mediante curve Bézier, sui quali generare una canaletta a sezione costante.

Le lettere devono collegarsi naturalmente tra loro, riducendo il numero delle interruzioni del LED.

Non imporre collegamenti che generino sovrapposizioni o curvature fisicamente incompatibili con il LED.

La futura libreria dovrà supportare diversi stili:

- Signature.
- Minimal.
- Luxury.
- Vintage.
- Handwriting.

## 5. Canaletta parametrica

Generare una canaletta aperta superiormente, con sezione a U, che segua il percorso centrale della scrittura.

Parametri iniziali indicativi e completamente modificabili:

- Larghezza LED: 6 mm.
- Altezza LED: 8 mm.
- Spessore pareti: 1,2 mm.
- Spessore fondo: 1,5 mm.
- Tolleranza complessiva: 0,3 mm.
- Altezza delle pareti indipendente dall'altezza del LED.
- Raggio minimo di curvatura configurabile.

Il modello risultante deve essere un solido chiuso e valido per la stampa 3D, senza facce degeneri o geometrie non-manifold.

Segnalare eventuali intersezioni, sovrapposizioni e curvature troppo strette.

## 6. Interfaccia grafica

Realizzare un'interfaccia moderna, professionale, in italiano, ispirata ai software CAD.

Prevedere:

**Barra superiore**

- Nuovo progetto.
- Apri.
- Salva.
- Annulla.
- Ripeti.
- Esporta.

**Pannello laterale sinistro**

- Inserimento testo.
- Selezione stile calligrafico.
- Dimensioni della scritta.
- Inclinazione.
- Spaziatura.
- Parametri della canaletta.

**Area centrale**

- Vista vettoriale 2D.
- Vista tridimensionale.
- Griglia millimetrica.
- Zoom e navigazione.

**Pannello informativo**

- Dimensioni complessive.
- Lunghezza LED.
- Numero di percorsi indipendenti.
- Avvisi geometrici.
- Stato di validità del modello.

## 7. Funzionalità future

Predisporre l'architettura, senza necessariamente implementarle nella prima versione, per:

- Editor manuale dei nodi Bézier.
- Generazione di varianti calligrafiche.
- Collegamento intelligente delle lettere.
- Ottimizzazione della continuità del LED.
- Simulazione luminosa realistica.
- Divisione automatica della scritta in sezioni stampabili.
- Configurazione delle dimensioni del piatto di stampa.
- Profilo Bambu Lab P1S da 256 × 256 mm.
- Giunzioni e incastri tra sezioni.
- Fori per il passaggio dei cavi.
- Terminali di chiusura.
- Profili LED personalizzati.
- Calcolo del consumo di materiale.
- Calcolo dei costi di produzione.

## 8. Documentazione e collaborazione

Questo progetto viene sviluppato parallelamente attraverso ChatGPT, utilizzato per il brainstorming e la progettazione, e Codex, utilizzato per l'implementazione e i test.

Crea e mantieni aggiornati i seguenti file:

- `README.md`
- `AGENTS.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`

Il file `PROJECT_STATUS.md` deve contenere:

- Versione corrente.
- Architettura del software.
- Funzionalità operative.
- Funzionalità mancanti.
- Problemi riscontrati.
- Decisioni tecniche.
- Risultati dei test.
- Proposte di miglioramento.

Al termine di ogni sessione genera un riepilogo da trasferire nella chat di brainstorming di ChatGPT.

## 9. Prima attività operativa

1. Analizza i requisiti e le fotografie allegate.
2. Definisci l'architettura del progetto.
3. Crea la struttura delle cartelle.
4. Inizializza il progetto.
5. Realizza una prima interfaccia funzionante.
6. Implementa un percorso vettoriale di prova.
7. Genera la prima canaletta parametrica 3D.
8. Verifica la validità geometrica del modello.
9. Implementa l'esportazione STL.
10. Avvia l'applicazione in locale e verifica il funzionamento.

Utilizza la scritta "Stay playful", presente nelle fotografie, come riferimento estetico e caso di prova.

Non fermarti alla sola pianificazione: procedi con la realizzazione concreta della prima versione funzionante.

Non simulare funzionalità non implementate.

Dai priorità alla correttezza geometrica, alla stampabilità e alla struttura modulare del codice rispetto alla quantità di funzionalità.

Al termine mostrami il risultato, indicami come avviare il software e produci il riepilogo per ChatGPT.
