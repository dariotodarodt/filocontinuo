## ONE 0.4.1 sperimentale · 19 novembre 2026

Il pannello FILOCONTINUO ONE compone scheletri originali, con percorso unico oppure uno per parola e tre ampiezze dei raccordi. Applica trasferisce le curve nell’editor e nel calcolo 3D con il profilo attivo. I progetti conservano la geometria. L’animazione del percorso unico offre pausa, riavvio e velocità regolabile.

Tutti i 16 casi numerici di examples/v041 risultano incompatibili con il LED dimostrativo R12. Restano aperti il ridisegno delle lettere, la parete condivisa, l’ottimizzazione contestuale e la calibrazione fisica. Dettagli in docs/ONE_CONTINUOUS_ENGINE.md e misure in examples/v041/confronto.json.

# Formato famiglie monolinea, schema 1

Le famiglie integrate sono **Signature 1.0.0**, **Minimal 1.0.0**, **Vintage 1.0.0**. Ogni famiglia dichiara 92 caratteri: a–z, A–Z, à è é ì ò ù À È É Ì Ò Ù, 0–9 e i simboli `' ’ . , : ; ! ? - + = / ( ) & ° € %`. Spazi, tab e ritorni a capo sono gestiti dal compositore. Luxury, Handwriting e Modern non sono selezionabili perché non implementati.

Esempi completi esportabili/importabili: `examples/v04/families/*.json`. Schema principale:

```json
{
  "format": "filocontinuo-style",
  "schema": 1,
  "id": "mio-stile",
  "name": "Il mio stile",
  "version": "1.0.0",
  "author": "Autore della risorsa",
  "license": "Licenza o condizioni di uso verificate dal titolare",
  "description": "Descrizione del disegno monolinea",
  "metrics": {"em":40,"capHeight":25,"xHeight":12,"gap":4,"space":12},
  "connections": "separate",
  "supportedCharacters": ["a"],
  "glyphs": {
    "a": {
      "advance": 20,
      "paths": [{"id":"a-0","role":"main","nodes":[
        {"p":{"x":0,"y":0},"in":{"x":0,"y":0},"out":{"x":5,"y":0}},
        {"p":{"x":15,"y":0},"in":{"x":10,"y":0},"out":{"x":15,"y":0}}
      ]}]
    }
  }
}
```

Questo esempio descrive una semplice linea per illustrare la struttura, non un alfabeto pronto. I dati reali contengono i controlli Bézier originali e gli eventuali percorsi ausiliari. `entry`/`exit` sono ancore opzionali `{x,y,dx,dy}`; `variants` può contenere forme `initial`, `medial`, `final`, `isolated`, `open`, `repeated`, `wide`, ciascuna con `advance`, `paths` e ancore. Se una variante non è presente il menu non la offre. Nessuna sostituzione automatica di un carattere assente: la proposta segnala il carattere e non può essere applicata.

## Importazione e conservazione

Nel pannello Style Studio confermare i diritti d'uso e importare un JSON, massimo 2 MB. Autore e licenza sono obbligatori, ma la dichiarazione non è una verifica legale automatica: consultare FONT_LICENSES.md. Gli ID integrati non possono essere sovrascritti da un import. Sono ammesse nove famiglie personali, conservate localmente; ogni versione è identificata da `id@version`. Nessun download di font durante l'uso.

I validatori limitano inventario, coordinate, varianti e numero di nodi. La composizione finale è limitata a 200 percorsi e 5.000 nodi, come il progetto V2. Preferiti e famiglie personali sono inclusi nei backup desktop e validati anche nel processo main. L'esportazione della famiglia usa un dialogo nativo con schema convalidato.

Nei progetti JSON V2 estesi, `generator: "studio"` richiede curve congelate e `studio`: famiglia completa/versione, opzioni, posizioni/matrici per lettera, collegamenti e snapshot. I progetti V1/V2 precedenti vengono letti senza rigenerare la grafia. Le nuove proprietà Studio richiedono l'app aggiornata: non è promessa la lettura dei nuovi progetti da parte di vecchie app. I controlli legacy restano esplicitamente distinti dalle famiglie dello Studio; nei vecchi generatori alcune maiuscole usano il glifo minuscolo.

L'import SVG precedente è mantenuto per curve polinomiali. TTF/OTF, estrazione della linea centrale, archi SVG generali e font su percorsi curvi restano in roadmap; non esistono pulsanti che ne simulino il risultato.

Lo schema 1 definisce coordinate, advance, em e altre metriche del master in millimetri nominali. Le matrici applicano rapporti adimensionali e traslazioni in mm; i percorsi congelati sono le quote finali effettive. Il massimo di 2 MB per l’import della famiglia non implica che un progetto contenente una famiglia molto complessa rientri nel limite web di 2 MB: il dialogo desktop accetta progetti fino a 8 MB.
