import * as XLSX from 'xlsx'
import type { Fattura, VoceFattura } from '../types/invoice'
import { calcolaTotaliFattura, generaId } from './calcoli'

interface RigaExport {
  Numero: string
  Data: string
  'Data Scadenza': string
  Cliente: string
  'P.IVA Cliente': string
  Categoria: string
  Stato: string
  Descrizione: string
  Quantita: number
  'Prezzo Unitario': number
  'IVA %': number
  Imponibile: number
  IVA: number
  Totale: number
  Note: string
}

export function esportaExcel(fatture: Fattura[], nomeFile = 'fatture.xlsx'): void {
  const righe: RigaExport[] = []

  for (const f of fatture) {
    const totali = calcolaTotaliFattura(f)
    if (f.voci.length === 0) {
      righe.push(rigaVuota(f, totali.imponibile, totali.iva, totali.totale))
      continue
    }
    for (const voce of f.voci) {
      const imponibile = voce.quantita * voce.prezzoUnitario
      const iva = imponibile * (voce.ivaPercentuale / 100)
      righe.push({
        Numero: f.numero,
        Data: f.data,
        'Data Scadenza': f.dataScadenza,
        Cliente: f.cliente,
        'P.IVA Cliente': f.partitaIvaCliente ?? '',
        Categoria: f.categoria ?? '',
        Stato: f.stato,
        Descrizione: voce.descrizione,
        Quantita: voce.quantita,
        'Prezzo Unitario': voce.prezzoUnitario,
        'IVA %': voce.ivaPercentuale,
        Imponibile: imponibile,
        IVA: iva,
        Totale: imponibile + iva,
        Note: f.note ?? '',
      })
    }
  }

  const ws = XLSX.utils.json_to_sheet(righe)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Fatture')
  XLSX.writeFile(wb, nomeFile)
}

function rigaVuota(
  f: Fattura,
  imponibile: number,
  iva: number,
  totale: number
): RigaExport {
  return {
    Numero: f.numero,
    Data: f.data,
    'Data Scadenza': f.dataScadenza,
    Cliente: f.cliente,
    'P.IVA Cliente': f.partitaIvaCliente ?? '',
    Categoria: f.categoria ?? '',
    Stato: f.stato,
    Descrizione: '',
    Quantita: 0,
    'Prezzo Unitario': 0,
    'IVA %': 0,
    Imponibile: imponibile,
    IVA: iva,
    Totale: totale,
    Note: f.note ?? '',
  }
}

export function esportaCSV(fatture: Fattura[], nomeFile = 'fatture.csv'): void {
  const righe: RigaExport[] = []
  for (const f of fatture) {
    for (const voce of f.voci.length ? f.voci : [null]) {
      if (voce) {
        const imponibile = voce.quantita * voce.prezzoUnitario
        const iva = imponibile * (voce.ivaPercentuale / 100)
        righe.push({
          Numero: f.numero,
          Data: f.data,
          'Data Scadenza': f.dataScadenza,
          Cliente: f.cliente,
          'P.IVA Cliente': f.partitaIvaCliente ?? '',
          Categoria: f.categoria ?? '',
          Stato: f.stato,
          Descrizione: voce.descrizione,
          Quantita: voce.quantita,
          'Prezzo Unitario': voce.prezzoUnitario,
          'IVA %': voce.ivaPercentuale,
          Imponibile: imponibile,
          IVA: iva,
          Totale: imponibile + iva,
          Note: f.note ?? '',
        })
      }
    }
  }
  const ws = XLSX.utils.json_to_sheet(righe)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Fatture')
  XLSX.writeFile(wb, nomeFile, { bookType: 'csv' })
}

export function importaDaFile(file: File): Promise<Fattura[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const righe = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
        const fatture = parsaRighe(righe)
        resolve(fatture)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}

function parsaRighe(righe: Record<string, unknown>[]): Fattura[] {
  const mappa = new Map<string, Fattura>()

  for (const r of righe) {
    const numero = String(r['Numero'] ?? '')
    if (!numero) continue

    if (!mappa.has(numero)) {
      mappa.set(numero, {
        id: generaId(),
        numero,
        data: String(r['Data'] ?? ''),
        dataScadenza: String(r['Data Scadenza'] ?? ''),
        cliente: String(r['Cliente'] ?? ''),
        partitaIvaCliente: String(r['P.IVA Cliente'] ?? '') || undefined,
        categoria: String(r['Categoria'] ?? '') || undefined,
        stato: (String(r['Stato'] ?? 'bozza')) as Fattura['stato'],
        note: String(r['Note'] ?? '') || undefined,
        voci: [],
      })
    }

    const descrizione = String(r['Descrizione'] ?? '')
    if (descrizione) {
      const voce: VoceFattura = {
        id: generaId(),
        descrizione,
        quantita: Number(r['Quantita'] ?? 1),
        prezzoUnitario: Number(r['Prezzo Unitario'] ?? 0),
        ivaPercentuale: Number(r['IVA %'] ?? 22),
      }
      mappa.get(numero)!.voci.push(voce)
    }
  }

  return Array.from(mappa.values())
}
