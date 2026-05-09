import type { Fattura, VoceFattura, TotaliFattura } from '../types/invoice'

export function calcolaTotaliVoce(voce: VoceFattura): TotaliFattura {
  const imponibile = voce.quantita * voce.prezzoUnitario
  const iva = imponibile * (voce.ivaPercentuale / 100)
  return { imponibile, iva, totale: imponibile + iva }
}

export function calcolaTotaliFattura(fattura: Fattura): TotaliFattura {
  return fattura.voci.reduce(
    (acc, voce) => {
      const t = calcolaTotaliVoce(voce)
      return {
        imponibile: acc.imponibile + t.imponibile,
        iva: acc.iva + t.iva,
        totale: acc.totale + t.totale,
      }
    },
    { imponibile: 0, iva: 0, totale: 0 }
  )
}

export function formatEuro(valore: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore)
}

export function formatData(isoDate: string): string {
  if (!isoDate) return ''
  return new Intl.DateTimeFormat('it-IT').format(new Date(isoDate))
}

export function generaId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function generaNumeroFattura(fatture: Fattura[]): string {
  const anno = new Date().getFullYear()
  const numeriAnno = fatture
    .filter(f => f.numero.startsWith(`${anno}/`))
    .map(f => parseInt(f.numero.split('/')[1] ?? '0', 10))
    .filter(n => !isNaN(n))
  const prossimo = numeriAnno.length > 0 ? Math.max(...numeriAnno) + 1 : 1
  return `${anno}/${String(prossimo).padStart(4, '0')}`
}

export function isFatturaScaduta(fattura: Fattura): boolean {
  if (fattura.stato === 'pagata') return false
  return new Date(fattura.dataScadenza) < new Date()
}

export function totalePerMese(fatture: Fattura[]): Record<string, number> {
  const mesi: Record<string, number> = {}
  for (const f of fatture) {
    const d = new Date(f.data)
    const chiave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const { totale } = calcolaTotaliFattura(f)
    mesi[chiave] = (mesi[chiave] ?? 0) + totale
  }
  return mesi
}

export function totalePerCategoria(fatture: Fattura[]): Record<string, number> {
  const cat: Record<string, number> = {}
  for (const f of fatture) {
    const k = f.categoria || 'Senza categoria'
    cat[k] = (cat[k] ?? 0) + calcolaTotaliFattura(f).totale
  }
  return cat
}
