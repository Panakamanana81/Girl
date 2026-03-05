const difficultyProfiles = {
  facile: {
    count: 5,
    tolerance: '±0.5 mm',
    shapes: ['Rettangolo', 'Cerchio', 'Asola']
  },
  medio: {
    count: 8,
    tolerance: '±0.2 mm',
    shapes: ['Rettangolo', 'Cerchio', 'Asola', 'Smusso', 'Raccordo']
  },
  difficile: {
    count: 11,
    tolerance: '±0.1 mm',
    shapes: ['Rettangolo', 'Cerchio', 'Asola', 'Smusso', 'Raccordo', 'Pattern']
  }
};

const dimensionRules = {
  Rettangolo: () => ({
    parametro: 'Base x Altezza',
    valore: `${rand(30, 120)} x ${rand(20, 90)} mm`
  }),
  Cerchio: () => ({
    parametro: 'Diametro',
    valore: `${rand(10, 60)} mm`
  }),
  Asola: () => ({
    parametro: 'Lunghezza x Larghezza',
    valore: `${rand(20, 80)} x ${rand(8, 25)} mm`
  }),
  Smusso: () => ({
    parametro: 'Distanza x Angolo',
    valore: `${rand(1, 5)} mm x ${rand(30, 60)}°`
  }),
  Raccordo: () => ({
    parametro: 'Raggio',
    valore: `${rand(2, 18)} mm`
  }),
  Pattern: () => ({
    parametro: 'Ripetizioni x Passo',
    valore: `${rand(3, 8)} x ${rand(10, 24)} mm`
  })
};

const difficultySelect = document.getElementById('difficulty');
const generateBtn = document.getElementById('generateBtn');
const exerciseContainer = document.getElementById('exercise');


const runtimeMode = document.getElementById('runtimeMode');

if (window.location.protocol === 'file:') {
  runtimeMode.hidden = false;
  runtimeMode.textContent = 'Modalità offline: app aperta direttamente da index.html (nessun server necessario).';
}

generateBtn.addEventListener('click', generateExercise);
generateExercise();

function generateExercise() {
  const difficulty = difficultySelect.value;
  const profile = difficultyProfiles[difficulty];

  const rows = Array.from({ length: profile.count }, (_, i) => {
    const shape = pick(profile.shapes);
    const quota = dimensionRules[shape]();

    return {
      id: i + 1,
      tipo: shape,
      parametro: quota.parametro,
      valore: quota.valore
    };
  });

  const title = `Esercizio livello ${difficulty.toUpperCase()}`;
  const objective = objectiveByDifficulty(difficulty);

  exerciseContainer.innerHTML = `
    <span class="badge">${title}</span>
    <h2>Tavola parametrica</h2>
    <p>${objective}</p>

    <table class="grid">
      <thead>
        <tr>
          <th>#</th>
          <th>Entità</th>
          <th>Parametro</th>
          <th>Quota da applicare</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
            <tr>
              <td>${row.id}</td>
              <td>${row.tipo}</td>
              <td>${row.parametro}</td>
              <td>${row.valore}</td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>

    <p class="note">
      Istruzioni: in Fusion 360 crea uno sketch in mm, ricostruisci tutte le quote della
      tabella e assegna vincoli geometrici per mantenere il modello completamente definito.
      Tolleranza consigliata: <strong>${profile.tolerance}</strong>.
    </p>
  `;
}

function objectiveByDifficulty(level) {
  if (level === 'facile') {
    return 'Ricrea una piastra con geometrie base e quote principali.';
  }

  if (level === 'medio') {
    return 'Aggiungi dettagli funzionali (smussi/raccordi) e allineamenti.';
  }

  return 'Crea una tavola avanzata con pattern e dipendenze parametriche tra quote.';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(array) {
  return array[rand(0, array.length - 1)];
}
