import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useFatture } from '../store/fattureStore'
import {
  calcolaTotaliFattura, formatEuro,
  totalePerMese, totalePerCategoria,
} from '../utils/calcoli'

const COLORI = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function Report() {
  const { fatture } = useFatture()
  const [anno, setAnno] = useState(() => new Date().getFullYear())

  const fattureFiltrate = useMemo(
    () => fatture.filter(f => new Date(f.data).getFullYear() === anno),
    [fatture, anno]
  )

  const datiMensili = useMemo(() => {
    const mesi = totalePerMese(fattureFiltrate)
    const nomi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    return nomi.map((nome, i) => {
      const chiave = `${anno}-${String(i + 1).padStart(2, '0')}`
      return { mese: nome, totale: mesi[chiave] ?? 0 }
    })
  }, [fattureFiltrate, anno])

  const datiCategorie = useMemo(() => {
    const cat = totalePerCategoria(fattureFiltrate)
    return Object.entries(cat).map(([name, value]) => ({ name, value }))
  }, [fattureFiltrate])

  const statsAnno = useMemo(() => {
    const pagate = fattureFiltrate.filter(f => f.stato === 'pagata')
    const nonPagate = fattureFiltrate.filter(f => f.stato !== 'pagata' && f.stato !== 'bozza')
    return {
      totaleFatturato: fattureFiltrate.reduce((s, f) => s + calcolaTotaliFattura(f).totale, 0),
      totaleIncassato: pagate.reduce((s, f) => s + calcolaTotaliFattura(f).totale, 0),
      totaleInAttesa: nonPagate.reduce((s, f) => s + calcolaTotaliFattura(f).totale, 0),
      nFatture: fattureFiltrate.length,
    }
  }, [fattureFiltrate])

  const anniDisponibili = useMemo(() => {
    const set = new Set(fatture.map(f => new Date(f.data).getFullYear()))
    if (set.size === 0) set.add(new Date().getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [fatture])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Report</h1>
        <select
          value={anno}
          onChange={e => setAnno(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {anniDisponibili.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Fatturato totale" value={formatEuro(statsAnno.totaleFatturato)} sub={`${statsAnno.nFatture} fatture`} />
        <StatCard label="Incassato" value={formatEuro(statsAnno.totaleIncassato)} colore="text-green-600" />
        <StatCard label="In attesa" value={formatEuro(statsAnno.totaleInAttesa)} colore="text-yellow-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Fatturato mensile {anno}</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datiMensili} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatEuro(v)} />
            <Bar dataKey="totale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Per categoria</h2>
          {datiCategorie.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Nessun dato</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={datiCategorie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {datiCategorie.map((_, i) => <Cell key={i} fill={COLORI[i % COLORI.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => formatEuro(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Riepilogo per categoria</h2>
          {datiCategorie.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Nessun dato</p>
          ) : (
            <div className="space-y-3">
              {datiCategorie.sort((a, b) => b.value - a.value).map((d, i) => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{d.name}</span>
                    <span className="font-medium text-gray-900">{formatEuro(d.value)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(d.value / statsAnno.totaleFatturato) * 100}%`,
                        backgroundColor: COLORI[i % COLORI.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, colore = 'text-gray-900' }: { label: string; value: string; sub?: string; colore?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colore}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
