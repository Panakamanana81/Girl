import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react'
import { useFatture } from '../store/fattureStore'
import { calcolaTotaliFattura, calcolaTotaliVoce, formatEuro, formatData } from '../utils/calcoli'
import { esportaExcel } from '../utils/excelUtils'
import { BadgeStato } from '../components/BadgeStato'

export function DettaglioFattura() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fatture, eliminaFattura } = useFatture()
  const fattura = fatture.find(f => f.id === id)

  if (!fattura) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Fattura non trovata.</p>
        <Link to="/fatture" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Torna alla lista</Link>
      </div>
    )
  }

  function elimina() {
    if (!confirm('Eliminare questa fattura?')) return
    eliminaFattura(fattura!.id)
    navigate('/fatture')
  }

  const totali = calcolaTotaliFattura(fattura)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Fattura {fattura.numero}</h1>
              <BadgeStato stato={fattura.stato} />
            </div>
            <p className="text-sm text-gray-500">{fattura.cliente}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => esportaExcel([fattura], `fattura-${fattura.numero}.xlsx`)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Excel
          </button>
          <Link
            to={`/fatture/${fattura.id}/modifica`}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit size={16} />
            Modifica
          </Link>
          <button
            onClick={elimina}
            className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Elimina
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Informazioni fattura</h2>
          <Row label="Numero" value={fattura.numero} />
          <Row label="Data emissione" value={formatData(fattura.data)} />
          <Row label="Data scadenza" value={formatData(fattura.dataScadenza)} />
          {fattura.categoria && <Row label="Categoria" value={fattura.categoria} />}
          {fattura.note && <Row label="Note" value={fattura.note} />}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Dati cliente</h2>
          <Row label="Cliente" value={fattura.cliente} />
          {fattura.partitaIvaCliente && <Row label="P.IVA" value={fattura.partitaIvaCliente} />}
          {fattura.indirizzoCliente && <Row label="Indirizzo" value={fattura.indirizzoCliente} />}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Voci</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
              <th className="pb-2">Descrizione</th>
              <th className="pb-2 w-16 text-right">Qtà</th>
              <th className="pb-2 w-32 text-right">Prezzo unit.</th>
              <th className="pb-2 w-16 text-right">IVA</th>
              <th className="pb-2 w-28 text-right">Imponibile</th>
              <th className="pb-2 w-28 text-right">Totale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fattura.voci.map(v => {
              const tv = calcolaTotaliVoce(v)
              return (
                <tr key={v.id}>
                  <td className="py-2.5 text-sm text-gray-900">{v.descrizione}</td>
                  <td className="py-2.5 text-sm text-gray-600 text-right">{v.quantita}</td>
                  <td className="py-2.5 text-sm text-gray-600 text-right">{formatEuro(v.prezzoUnitario)}</td>
                  <td className="py-2.5 text-sm text-gray-600 text-right">{v.ivaPercentuale}%</td>
                  <td className="py-2.5 text-sm text-gray-600 text-right">{formatEuro(tv.imponibile)}</td>
                  <td className="py-2.5 text-sm font-medium text-gray-900 text-right">{formatEuro(tv.totale)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Imponibile</span><span>{formatEuro(totali.imponibile)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IVA</span><span>{formatEuro(totali.iva)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Totale</span><span>{formatEuro(totali.totale)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}
