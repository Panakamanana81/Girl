import type { StatoFattura } from '../types/invoice'

const colori: Record<StatoFattura, string> = {
  bozza: 'bg-gray-100 text-gray-700',
  emessa: 'bg-blue-100 text-blue-700',
  pagata: 'bg-green-100 text-green-700',
  scaduta: 'bg-red-100 text-red-700',
}

const etichette: Record<StatoFattura, string> = {
  bozza: 'Bozza',
  emessa: 'Emessa',
  pagata: 'Pagata',
  scaduta: 'Scaduta',
}

export function BadgeStato({ stato }: { stato: StatoFattura }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colori[stato]}`}>
      {etichette[stato]}
    </span>
  )
}
