import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inviaMessaggio, leggiApiKey, resetChat, type MessaggioChat } from '../utils/gemini'

const SUGGERIMENTI = [
  'Come creo una nuova fattura?',
  'Come funziona il calcolo dell\'IVA?',
  'Come esporto le fatture in Excel?',
  'Cosa significa "imponibile"?',
]

export function ChatWidget() {
  const [aperto, setAperto] = useState(false)
  const [messaggi, setMessaggi] = useState<MessaggioChat[]>([])
  const [input, setInput] = useState('')
  const [caricamento, setCaricamento] = useState(false)
  const fineListaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const haApiKey = !!leggiApiKey()

  useEffect(() => {
    if (aperto && messaggi.length === 0 && haApiKey) {
      setMessaggi([{
        ruolo: 'assistente',
        testo: 'Ciao! Sono il tuo assistente per la gestione fatture 👋\nCome posso aiutarti oggi?',
      }])
    }
  }, [aperto, haApiKey, messaggi.length])

  useEffect(() => {
    fineListaRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messaggi])

  useEffect(() => {
    if (aperto) setTimeout(() => inputRef.current?.focus(), 100)
  }, [aperto])

  async function invia(testo: string) {
    if (!testo.trim() || caricamento) return
    setInput('')
    setMessaggi(prev => [...prev, { ruolo: 'utente', testo }])
    setCaricamento(true)
    try {
      const risposta = await inviaMessaggio(testo)
      setMessaggi(prev => [...prev, { ruolo: 'assistente', testo: risposta }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto'
      setMessaggi(prev => [...prev, { ruolo: 'assistente', testo: `Errore: ${msg}`, errore: true }])
    } finally {
      setCaricamento(false)
    }
  }

  function chiudi() {
    setAperto(false)
  }

  function apriEReset() {
    if (aperto) {
      chiudi()
    } else {
      setAperto(true)
    }
  }

  function svuotaChat() {
    setMessaggi([])
    resetChat()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {aperto && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)', height: 520 }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Assistente AI</p>
                <p className="text-blue-200 text-xs">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messaggi.length > 1 && (
                <button onClick={svuotaChat} className="text-blue-200 hover:text-white text-xs">
                  Nuova chat
                </button>
              )}
              <button onClick={chiudi} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Contenuto */}
          {!haApiKey ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle size={28} className="text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Chiave API mancante</p>
                <p className="text-sm text-gray-500">Configura la tua chiave API Gemini gratuita per usare l'assistente.</p>
              </div>
              <Link
                to="/impostazioni"
                onClick={chiudi}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Settings size={15} />
                Vai alle Impostazioni
              </Link>
            </div>
          ) : (
            <>
              {/* Messaggi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messaggi.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.ruolo === 'utente' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.ruolo === 'assistente' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {m.ruolo === 'assistente'
                        ? <Bot size={14} className="text-blue-600" />
                        : <User size={14} className="text-gray-600" />}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.ruolo === 'utente'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : m.errore
                          ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                      {m.testo}
                    </div>
                  </div>
                ))}
                {caricamento && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-blue-600" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  </div>
                )}
                <div ref={fineListaRef} />
              </div>

              {/* Suggerimenti (solo se chat vuota) */}
              {messaggi.length <= 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {SUGGERIMENTI.map(s => (
                    <button
                      key={s}
                      onClick={() => invia(s)}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && invia(input)}
                    placeholder="Scrivi un messaggio..."
                    disabled={caricamento}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => invia(input)}
                    disabled={!input.trim() || caricamento}
                    className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pulsante flottante */}
      <button
        onClick={apriEReset}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          aperto ? 'bg-gray-700 hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {aperto
          ? <X size={22} className="text-white" />
          : <MessageCircle size={24} className="text-white" />}
      </button>
    </div>
  )
}
