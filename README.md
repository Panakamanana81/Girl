# Generatore esercizi parametrici per Fusion 360

Piccola applicazione web (HTML/CSS/JS) che genera esercizi con livelli di difficoltà differenti.

## Funzionalità
- Selezione della difficoltà: **facile**, **medio**, **difficile**.
- Generazione automatica di una **tavola parametrica** con quote da ricreare in Fusion 360.
- Istruzioni operative e tolleranza consigliata per ogni livello.
- Compatibile anche in **modalità offline** aprendo direttamente `index.html`.

## Avvio consigliato (senza server)
Apri il file `index.html` con doppio click o dal browser (`File > Open`).

## Avvio con server (opzionale)
Se preferisci una preview via localhost:

```bash
npm start
```

Il server legge la porta da `PORT` (default `8000`) e usa fallback su `index.html` per route non root.
