import type { ReactNode } from 'react'

interface Props {
  titolo: string
  valore: string
  sottotitolo?: string
  icona: ReactNode
  colore?: string
}

export function CardStatistica({ titolo, valore, sottotitolo, icona, colore = 'text-blue-600' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{titolo}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{valore}</p>
          {sottotitolo && <p className="mt-1 text-xs text-gray-400">{sottotitolo}</p>}
        </div>
        <div className={`${colore} opacity-80`}>{icona}</div>
      </div>
    </div>
  )
}
