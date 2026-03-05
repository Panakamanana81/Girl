# Generatore esercizi parametrici per Fusion 360

Piccola applicazione web (HTML/CSS/JS) che genera esercizi con livelli di difficoltà differenti.

## Funzionalità
- Selezione della difficoltà: **facile**, **medio**, **difficile**.
- Generazione automatica di una **tavola parametrica** con quote da ricreare in Fusion 360.
- Istruzioni operative e tolleranza consigliata per ogni livello.

## Avvio locale
Per evitare errori `not found` in anteprima, usa il server incluso:

```bash
npm start
```

Il server legge la porta da `PORT` (default `8000`) e ha fallback su `index.html` anche per route non root.

In alternativa puoi ancora aprire `index.html` direttamente o usare `python3 -m http.server 8000`.
