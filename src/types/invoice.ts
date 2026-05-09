export type StatoFattura = 'bozza' | 'emessa' | 'pagata' | 'scaduta'

export interface VoceFattura {
  id: string
  descrizione: string
  quantita: number
  prezzoUnitario: number
  ivaPercentuale: number
}

export interface Fattura {
  id: string
  numero: string
  data: string
  dataScadenza: string
  cliente: string
  partitaIvaCliente?: string
  indirizzoCliente?: string
  voci: VoceFattura[]
  note?: string
  stato: StatoFattura
  categoria?: string
}

export interface TotaliFattura {
  imponibile: number
  iva: number
  totale: number
}

export interface FiltriRicerca {
  testo: string
  stato: StatoFattura | 'tutti'
  categoria: string
  dataInizio: string
  dataFine: string
}
