import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai'

const SYSTEM_PROMPT = `Sei un assistente intelligente integrato nell'app "Gestione Fatture".
Il tuo nome è "Assistente Fatture".

Il tuo scopo è:
- Guidare l'utente nell'uso dell'app
- Dare consigli pratici sulla gestione delle fatture
- Spiegare concetti fiscali e contabili in modo semplice (IVA, imponibile, scadenze, ecc.)
- Aiutare a capire i report e le statistiche

Funzionalità disponibili nell'app:
1. Dashboard: panoramica con statistiche, grafici fatturato mensile e stato fatture
2. Fatture: lista completa con filtri per stato, data e testo. Puoi creare, modificare ed eliminare fatture
3. Nuova fattura: inserisci cliente, data, data scadenza, voci con descrizione/quantità/prezzo/IVA%, stato e categoria
4. Dettaglio fattura: visualizza tutti i dati, esporta in Excel o elimina
5. Import/Export: importa fatture da file Excel o CSV, esporta la lista o selezioni multiple
6. Report: analisi per mese e per categoria, filtrabili per anno
7. Impostazioni: configura la chiave API per questo assistente

Regole:
- Rispondi SEMPRE in italiano
- Sii conciso e pratico
- Se l'utente chiede qualcosa fuori dall'ambito (fatture, contabilità, uso dell'app), rispondi gentilmente che sei specializzato solo in questi argomenti
- Non inventare dati specifici dell'utente che non conosci
- Per domande fiscali complesse, suggerisci sempre di consultare un commercialista`

const STORAGE_KEY = 'gemini_api_key'

export function leggiApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

export function salvaApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export function rimuoviApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export interface MessaggioChat {
  ruolo: 'utente' | 'assistente'
  testo: string
  errore?: boolean
}

let chatSession: ChatSession | null = null
let ultimaApiKey = ''

function getChatSession(apiKey: string): ChatSession {
  if (chatSession && apiKey === ultimaApiKey) return chatSession

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  })
  chatSession = model.startChat({
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
    history: [],
  })
  ultimaApiKey = apiKey
  return chatSession
}

export async function inviaMessaggio(testo: string): Promise<string> {
  const apiKey = leggiApiKey()
  if (!apiKey) throw new Error('Chiave API non configurata')

  const session = getChatSession(apiKey)
  const result = await session.sendMessage(testo)
  return result.response.text()
}

export function resetChat(): void {
  chatSession = null
  ultimaApiKey = ''
}
