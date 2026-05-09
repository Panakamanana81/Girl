import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Download, Upload, Trash2 } from 'lucide-react'
import { useFatture } from '../store/fattureStore'
import { calcolaTotaliFattura, formatEuro, formatData } from '../utils/calcoli'
import { esportaExcel, esportaCSV, importaDaFile } from '../utils/excelUtils'
import { BadgeStato } from '../components/BadgeStato'
import type { FiltriRicerca, StatoFattura } from '../types/invoice'

const STATI: Array<{ value: FiltriRicerca['stato']; label: string }> = [
  { value: 'tutti', label: 'Tutti gli stati' },
  { value: 'bozza', label: 'Bozza' },
  { value: 'emessa', label: 'Emessa' },
  { value: 'pagata', label: 'Pagata' },
  { value: 'scaduta', label: 'Scaduta' },
]

export function ListaFatture() {
  const { fatture, eliminaFattura, importaFatture } = useFatture()
  const [filtri, setFiltri] = useState<FiltriRicerca>({
    testo: '', stato: 'tutti', categoria: '', dataInizio: '', dataFine: '',
  })
  const [selezionate, setSelezionate] = useState<Set<string>>(new Set())

  const fattureFiltrate = useMemo(() => {
    return fatture.filter(f => {
      if (filtri.testo && !`${f.numero} ${f.cliente}`.toLowerCase().includes(filtri.testo.toLowerCase())) return false
      if (filtri.stato !== 'tutti' && f.stato !== filtri.stato) return false
      if (filtri.categoria && f.categoria !== filtri.categoria) return false
      if (filtri.dataInizio && f.data < filtri.dataInizio) return false
      if (filtri.dataFine && f.data > filtri.dataFine) return false
      return true
    }).sort((a, b) => b.data.localeCompare(a.data))
  }, [fatture, filtri])

  function toggleSelezione(id: string) {
    setSelezionate(prev => {
      const nuove = new Set(prev)
      nuove.has(id) ? nuove.delete(id) : nuove.add(id)
      return nuove
    })
  }

  function toggleTutte() {
    if (selezionate.size === fattureFiltrate.length) {
      setSelezionate(new Set())
    } else {
      setSelezionate(new Set(fattureFiltrate.map(f => f.id)))
    }
  }

  function eliminaSelezionate() {
    if (!confirm(`Eliminare ${selezionate.size} fattura/e?`)) return
    selezionate.forEach(id => eliminaFattura(id))
    setSelezionate(new Set())
  }

  async function handleImporta(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const importate = await importaDaFile(file)
      importaFatture(importate)
      alert(`Importate ${importate.length} fatture.`)
    } catch {
      alert('Errore durante l\'importazione del file.')
    }
    e.target.value = ''
  }

  const fattureEsport = selezionate.size
    ? fatture.filter(f => selezionate.has(f.id))
    : fattureFiltrate

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fatture</h1>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload size={16} />
            Importa
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImporta} />
          </label>
          <button
            onClick={() => esportaCSV(fattureEsport)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => esportaExcel(fattureEsport)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Excel
          </button>
          <Link
            to="/fatture/nuova"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <Plus size={16} />
            Nuova
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca numero, cliente..."
              value={filtri.testo}
              onChange={e => setFiltri(f => ({ ...f, testo: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtri.stato}
            onChange={e => setFiltri(f => ({ ...f, stato: e.target.value as StatoFattura | 'tutti' }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            type="date"
            value={filtri.dataInizio}
            onChange={e => setFiltri(f => ({ ...f, dataInizio: e.target.value }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filtri.dataFine}
            onChange={e => setFiltri(f => ({ ...f, dataFine: e.target.value }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {selezionate.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm text-blue-700">{selezionate.size} selezionate</span>
          <button
            onClick={eliminaSelezionate}
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <Trash2 size={14} />
            Elimina
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {fattureFiltrate.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Nessuna fattura trovata.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selezionate.size === fattureFiltrate.length && fattureFiltrate.length > 0} onChange={toggleTutte} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fattureFiltrate.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selezionate.has(f.id)} onChange={() => toggleSelezione(f.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/fatture/${f.id}`} className="text-sm font-medium text-blue-600 hover:underline">{f.numero}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{f.cliente}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatData(f.data)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatData(f.dataScadenza)}</td>
                  <td className="px-4 py-3"><BadgeStato stato={f.stato} /></td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatEuro(calcolaTotaliFattura(f).totale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
