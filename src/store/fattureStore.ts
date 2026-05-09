import { createContext, useContext } from 'react'
import type { Fattura } from '../types/invoice'

const STORAGE_KEY = 'gestione_fatture_data'

export function caricaFatture(): Fattura[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function salvaFatture(fatture: Fattura[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fatture))
}

export interface FattureContextType {
  fatture: Fattura[]
  aggiungiFattura: (f: Fattura) => void
  aggiornafattura: (f: Fattura) => void
  eliminaFattura: (id: string) => void
  importaFatture: (fatture: Fattura[]) => void
}

export const FattureContext = createContext<FattureContextType | null>(null)

export function useFatture(): FattureContextType {
  const ctx = useContext(FattureContext)
  if (!ctx) throw new Error('useFatture deve essere usato dentro FattureProvider')
  return ctx
}
