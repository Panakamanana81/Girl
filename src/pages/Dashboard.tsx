import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, FileText, AlertCircle, CheckCircle, Plus } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useFatture } from '../store/fattureStore'
import { calcolaTotaliFattura, formatEuro, formatData, totalePerMese, isFatturaScaduta } from '../utils/calcoli'
import { CardStatistica } from '../components/CardStatistica'
import { BadgeStato } from '../components/BadgeStato'

const COLORI = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function Dashboard() {
  const { fatture } = useFatture()

  const stats = useMemo(() => {
    const totaleFatturato = fatture.reduce((s, f) => s + calcolaTotaliFattura(f).totale, 0)
    const fatturePagate = fatture.filter(f => f.stato === 'pagata')
    const fattureInAttesa = fatture.filter(f => f.stato === 'emessa')
    const fattureScadute = fatture.filter(f => isFatturaScaduta(f) && f.stato !== 'pagata')
    const totalePagato = fatturePagate.reduce((s, f) => s + calcolaTotaliFattura(f).totale, 0)
    return { totaleFatturato, fatturePagate, fattureInAttesa, fattureScadute, totalePagato }
  }, [fatture])

  const datiMensili = useMemo(() => {
    const mesi = totalePerMese(fatture)
    return Object.entries(mesi)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([mese, totale]) => {
        const [anno, m] = mese.split('-')
        const data = new Date(Number(anno), Number(m) - 1)
        return {
          mese: data.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
          totale,
        }
      })
  }, [fatture])

  const datiStato = useMemo(() => {
    const conteggi: Record<string, number> = {}
    for (const f of fatture) conteggi[f.stato] = (conteggi[f.stato] ?? 0) + 1
    return Object.entries(conteggi).map(([name, value]) => ({ name, value }))
  }, [fatture])

  const ultimeFatture = useMemo(
    () => [...fatture].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5),
    [fatture]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/fatture/nuova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          <Plus size={16} />
          Nuova fattura
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStatistica
          titolo="Fatturato totale"
          valore={formatEuro(stats.totaleFatturato)}
          sottotitolo={`${fatture.length} fatture`}
          icona={<TrendingUp size={32} />}
          colore="text-blue-600"
        />
        <CardStatistica
          titolo="Incassato"
          valore={formatEuro(stats.totalePagato)}
          sottotitolo={`${stats.fatturePagate.length} fatture pagate`}
          icona={<CheckCircle size={32} />}
          colore="text-green-600"
        />
        <CardStatistica
          titolo="In attesa"
          valore={String(stats.fattureInAttesa.length)}
          sottotitolo="fatture emesse"
          icona={<FileText size={32} />}
          colore="text-yellow-600"
        />
        <CardStatistica
          titolo="Scadute"
          valore={String(stats.fattureScadute.length)}
          sottotitolo="da saldare"
          icona={<AlertCircle size={32} />}
          colore="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Fatturato mensile</h2>
          {datiMensili.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Nessun dato disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={datiMensili}>
                <defs>
                  <linearGradient id="coloreTotale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatEuro(v)} />
                <Area type="monotone" dataKey="totale" stroke="#3b82f6" fill="url(#coloreTotale)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stato fatture</h2>
          {datiStato.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Nessun dato disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={datiStato} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {datiStato.map((_, i) => (
                    <Cell key={i} fill={COLORI[i % COLORI.length]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Ultime fatture</h2>
          <Link to="/fatture" className="text-sm text-blue-600 hover:underline">Vedi tutte</Link>
        </div>
        {ultimeFatture.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Nessuna fattura ancora. <Link to="/fatture/nuova" className="text-blue-600 hover:underline">Crea la prima!</Link></p>
        ) : (
          <div className="divide-y divide-gray-50">
            {ultimeFatture.map(f => (
              <Link key={f.id} to={`/fatture/${f.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.numero} — {f.cliente}</p>
                  <p className="text-xs text-gray-400">{formatData(f.data)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeStato stato={f.stato} />
                  <span className="text-sm font-semibold text-gray-900">{formatEuro(calcolaTotaliFattura(f).totale)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
