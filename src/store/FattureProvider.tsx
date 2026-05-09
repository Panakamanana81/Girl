import { useState, type ReactNode } from 'react'
import type { Fattura } from '../types/invoice'
import { caricaFatture, salvaFatture, FattureContext } from './fattureStore'

export function FattureProvider({ children }: { children: ReactNode }) {
  const [fatture, setFatture] = useState<Fattura[]>(caricaFatture)

  function aggiorna(nuove: Fattura[]) {
    setFatture(nuove)
    salvaFatture(nuove)
  }

  function aggiungiFattura(f: Fattura) {
    aggiorna([...fatture, f])
  }

  function aggiornafattura(f: Fattura) {
    aggiorna(fatture.map(x => (x.id === f.id ? f : x)))
  }

  function eliminaFattura(id: string) {
    aggiorna(fatture.filter(x => x.id !== id))
  }

  function importaFatture(nuove: Fattura[]) {
    const esistenti = new Set(fatture.map(f => f.id))
    const daDaAggiungere = nuove.filter(f => !esistenti.has(f.id))
    aggiorna([...fatture, ...daDaAggiungere])
  }

  return (
    <FattureContext.Provider
      value={{ fatture, aggiungiFattura, aggiornafattura, eliminaFattura, importaFatture }}
    >
      {children}
    </FattureContext.Provider>
  )
}
