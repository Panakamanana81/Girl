import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import { useFatture } from '../store/fattureStore'
import {
  calcolaTotaliFattura, calcolaTotaliVoce, formatEuro,
  generaId, generaNumeroFattura,
} from '../utils/calcoli'
import type { Fattura, VoceFattura, StatoFattura } from '../types/invoice'

function voceVuota(): VoceFattura {
  return { id: generaId(), descrizione: '', quantita: 1, prezzoUnitario: 0, ivaPercentuale: 22 }
}

const fatturaVuota = (fatture: Fattura[]): Fattura => ({
  id: generaId(),
  numero: generaNumeroFattura(fatture),
  data: new Date().toISOString().slice(0, 10),
  dataScadenza: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  cliente: '',
  stato: 'bozza',
  voci: [voceVuota()],
})

const STATI: Array<{ value: StatoFattura; label: string }> = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'emessa', label: 'Emessa' },
  { value: 'pagata', label: 'Pagata' },
  { value: 'scaduta', label: 'Scaduta' },
]

export function FormFattura() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fatture, aggiungiFattura, aggiornafattura } = useFatture()

  const isNuova = id === 'nuova'
  const [fattura, setFattura] = useState<Fattura>(() => {
    if (isNuova) return fatturaVuota(fatture)
    return fatture.find(f => f.id === id) ?? fatturaVuota(fatture)
  })

  useEffect(() => {
    if (!isNuova && !fatture.find(f => f.id === id)) {
      navigate('/fatture')
    }
  }, [id, isNuova, fatture, navigate])

  function setField<K extends keyof Fattura>(key: K, value: Fattura[K]) {
    setFattura(f => ({ ...f, [key]: value }))
  }

  function setVoce<K extends keyof VoceFattura>(voceId: string, key: K, value: VoceFattura[K]) {
    setFattura(f => ({
      ...f,
      voci: f.voci.map(v => v.id === voceId ? { ...v, [key]: value } : v),
    }))
  }

  function aggiungiVoce() {
    setFattura(f => ({ ...f, voci: [...f.voci, voceVuota()] }))
  }

  function rimuoviVoce(voceId: string) {
    setFattura(f => ({ ...f, voci: f.voci.filter(v => v.id !== voceId) }))
  }

  function salva() {
    if (!fattura.cliente.trim()) { alert('Inserisci il nome del cliente.'); return }
    if (isNuova) aggiungiFattura(fattura)
    else aggiornafattura(fattura)
    navigate(`/fatture/${fattura.id}`)
  }

  const totali = calcolaTotaliFattura(fattura)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNuova ? 'Nuova fattura' : `Modifica ${fattura.numero}`}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Informazioni generali</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero</label>
            <input
              value={fattura.numero}
              onChange={e => setField('numero', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data emissione</label>
            <input
              type="date"
              value={fattura.data}
              onChange={e => setField('data', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data scadenza</label>
            <input
              type="date"
              value={fattura.dataScadenza}
              onChange={e => setField('dataScadenza', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <input
              value={fattura.cliente}
              onChange={e => setField('cliente', e.target.value)}
              placeholder="Nome o ragione sociale"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">P.IVA cliente</label>
            <input
              value={fattura.partitaIvaCliente ?? ''}
              onChange={e => setField('partitaIvaCliente', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
            <select
              value={fattura.stato}
              onChange={e => setField('stato', e.target.value as StatoFattura)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              value={fattura.categoria ?? ''}
              onChange={e => setField('categoria', e.target.value || undefined)}
              placeholder="es. Consulenza, Prodotti..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Voci</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2">Descrizione</th>
                <th className="pb-2 w-20">Qtà</th>
                <th className="pb-2 w-32">Prezzo unit.</th>
                <th className="pb-2 w-20">IVA %</th>
                <th className="pb-2 w-32 text-right">Totale voce</th>
                <th className="pb-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fattura.voci.map(v => {
                const tv = calcolaTotaliVoce(v)
                return (
                  <tr key={v.id}>
                    <td className="py-2 pr-2">
                      <input
                        value={v.descrizione}
                        onChange={e => setVoce(v.id, 'descrizione', e.target.value)}
                        placeholder="Descrizione"
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number" min={0}
                        value={v.quantita}
                        onChange={e => setVoce(v.id, 'quantita', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number" min={0} step={0.01}
                        value={v.prezzoUnitario}
                        onChange={e => setVoce(v.id, 'prezzoUnitario', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number" min={0} max={100}
                        value={v.ivaPercentuale}
                        onChange={e => setVoce(v.id, 'ivaPercentuale', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right text-sm font-medium text-gray-900">
                      {formatEuro(tv.totale)}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => rimuoviVoce(v.id)}
                        disabled={fattura.voci.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={aggiungiVoce}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus size={16} />
          Aggiungi voce
        </button>

        <div className="border-t border-gray-100 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Imponibile</span>
            <span>{formatEuro(totali.imponibile)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA</span>
            <span>{formatEuro(totali.iva)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
            <span>Totale</span>
            <span>{formatEuro(totali.totale)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea
          value={fattura.note ?? ''}
          onChange={e => setField('note', e.target.value || undefined)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Annulla
        </button>
        <button
          onClick={salva}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          <Save size={16} />
          Salva
        </button>
      </div>
    </div>
  )
}
