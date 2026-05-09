import { describe, it, expect } from 'vitest'
import {
  calcolaTotaliVoce,
  calcolaTotaliFattura,
  generaNumeroFattura,
  isFatturaScaduta,
  totalePerMese,
  totalePerCategoria,
} from '../utils/calcoli'
import type { Fattura, VoceFattura } from '../types/invoice'

const voce: VoceFattura = { id: '1', descrizione: 'Test', quantita: 2, prezzoUnitario: 100, ivaPercentuale: 22 }

describe('calcolaTotaliVoce', () => {
  it('calcola imponibile, iva e totale correttamente', () => {
    const t = calcolaTotaliVoce(voce)
    expect(t.imponibile).toBe(200)
    expect(t.iva).toBeCloseTo(44)
    expect(t.totale).toBeCloseTo(244)
  })

  it('gestisce quantita zero', () => {
    const t = calcolaTotaliVoce({ ...voce, quantita: 0 })
    expect(t.imponibile).toBe(0)
    expect(t.totale).toBe(0)
  })

  it('gestisce IVA zero', () => {
    const t = calcolaTotaliVoce({ ...voce, ivaPercentuale: 0 })
    expect(t.iva).toBe(0)
    expect(t.totale).toBe(t.imponibile)
  })
})

const fattura: Fattura = {
  id: 'f1',
  numero: '2025/0001',
  data: '2025-01-15',
  dataScadenza: '2025-02-15',
  cliente: 'Acme srl',
  stato: 'emessa',
  voci: [
    { id: 'v1', descrizione: 'A', quantita: 1, prezzoUnitario: 500, ivaPercentuale: 22 },
    { id: 'v2', descrizione: 'B', quantita: 2, prezzoUnitario: 100, ivaPercentuale: 10 },
  ],
}

describe('calcolaTotaliFattura', () => {
  it('somma correttamente tutte le voci', () => {
    const t = calcolaTotaliFattura(fattura)
    expect(t.imponibile).toBe(700)
    expect(t.iva).toBeCloseTo(130)
    expect(t.totale).toBeCloseTo(830)
  })

  it('restituisce zero per fattura senza voci', () => {
    const t = calcolaTotaliFattura({ ...fattura, voci: [] })
    expect(t.imponibile).toBe(0)
    expect(t.iva).toBe(0)
    expect(t.totale).toBe(0)
  })
})

describe('generaNumeroFattura', () => {
  it('genera il primo numero dell\'anno corrente', () => {
    const anno = new Date().getFullYear()
    const n = generaNumeroFattura([])
    expect(n).toBe(`${anno}/0001`)
  })

  it('incrementa il numero se esistono già fatture', () => {
    const anno = new Date().getFullYear()
    const n = generaNumeroFattura([{ ...fattura, numero: `${anno}/0003` }])
    expect(n).toBe(`${anno}/0004`)
  })
})

describe('isFatturaScaduta', () => {
  it('restituisce true se la data di scadenza è passata e non è pagata', () => {
    const f = { ...fattura, dataScadenza: '2020-01-01', stato: 'emessa' as const }
    expect(isFatturaScaduta(f)).toBe(true)
  })

  it('restituisce false se è pagata', () => {
    const f = { ...fattura, dataScadenza: '2020-01-01', stato: 'pagata' as const }
    expect(isFatturaScaduta(f)).toBe(false)
  })

  it('restituisce false se non è ancora scaduta', () => {
    const f = { ...fattura, dataScadenza: '2099-01-01', stato: 'emessa' as const }
    expect(isFatturaScaduta(f)).toBe(false)
  })
})

describe('totalePerMese', () => {
  it('raggruppa i totali per mese correttamente', () => {
    const fatture: Fattura[] = [
      { ...fattura, id: 'a', data: '2025-03-01', voci: [{ id: '1', descrizione: 'x', quantita: 1, prezzoUnitario: 100, ivaPercentuale: 0 }] },
      { ...fattura, id: 'b', data: '2025-03-15', voci: [{ id: '2', descrizione: 'y', quantita: 1, prezzoUnitario: 200, ivaPercentuale: 0 }] },
      { ...fattura, id: 'c', data: '2025-04-01', voci: [{ id: '3', descrizione: 'z', quantita: 1, prezzoUnitario: 50, ivaPercentuale: 0 }] },
    ]
    const mesi = totalePerMese(fatture)
    expect(mesi['2025-03']).toBe(300)
    expect(mesi['2025-04']).toBe(50)
  })
})

describe('totalePerCategoria', () => {
  it('raggruppa i totali per categoria', () => {
    const fatture: Fattura[] = [
      { ...fattura, id: 'a', categoria: 'Consulenza', voci: [{ id: '1', descrizione: 'x', quantita: 1, prezzoUnitario: 1000, ivaPercentuale: 0 }] },
      { ...fattura, id: 'b', categoria: 'Consulenza', voci: [{ id: '2', descrizione: 'y', quantita: 1, prezzoUnitario: 500, ivaPercentuale: 0 }] },
      { ...fattura, id: 'c', categoria: 'Prodotti', voci: [{ id: '3', descrizione: 'z', quantita: 1, prezzoUnitario: 200, ivaPercentuale: 0 }] },
    ]
    const cat = totalePerCategoria(fatture)
    expect(cat['Consulenza']).toBe(1500)
    expect(cat['Prodotti']).toBe(200)
  })

  it('usa "Senza categoria" per fatture senza categoria', () => {
    const f = { ...fattura, id: 'x', categoria: undefined, voci: [{ id: '1', descrizione: 'x', quantita: 1, prezzoUnitario: 100, ivaPercentuale: 0 }] }
    const cat = totalePerCategoria([f])
    expect(cat['Senza categoria']).toBe(100)
  })
})
