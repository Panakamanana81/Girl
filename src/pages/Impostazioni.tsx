import { useState } from 'react'
import { Eye, EyeOff, Save, Trash2, CheckCircle, ExternalLink, Bot } from 'lucide-react'
import { leggiApiKey, salvaApiKey, rimuoviApiKey, resetChat } from '../utils/gemini'

export function Impostazioni() {
  const [chiave, setChiave] = useState(leggiApiKey)
  const [visibile, setVisibile] = useState(false)
  const [salvato, setSalvato] = useState(false)

  function salva() {
    salvaApiKey(chiave)
    resetChat()
    setSalvato(true)
    setTimeout(() => setSalvato(false), 2500)
  }

  function elimina() {
    if (!confirm('Rimuovere la chiave API?')) return
    rimuoviApiKey()
    resetChat()
    setChiave('')
  }

  const haSalvato = !!leggiApiKey()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>

      {/* Sezione AI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bot size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Assistente AI (Gemini)</h2>
            <p className="text-sm text-gray-500">Configura la chiave API per attivare il chatbot</p>
          </div>
        </div>

        {/* Stato */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${haSalvato ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          <CheckCircle size={16} />
          {haSalvato ? 'Chiave API configurata — assistente attivo' : 'Chiave API non ancora configurata'}
        </div>

        {/* Come ottenerla */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-blue-800">Come ottenere la chiave gratuita:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Vai su <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline font-medium inline-flex items-center gap-1">aistudio.google.com <ExternalLink size={11} /></a></li>
            <li>Accedi con il tuo account Google</li>
            <li>Clicca su <strong>"Get API Key"</strong> → <strong>"Create API Key"</strong></li>
            <li>Copia la chiave e incollala qui sotto</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">✓ Gratuito · ✓ Solo account Google · ✓ 1.500 richieste/giorno</p>
        </div>

        {/* Input chiave */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chiave API Gemini</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={visibile ? 'text' : 'password'}
                value={chiave}
                onChange={e => setChiave(e.target.value)}
                placeholder="AIza..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setVisibile(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {visibile ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">La chiave è salvata solo sul tuo dispositivo, mai inviata altrove.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={salva}
            disabled={!chiave.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {salvato ? <CheckCircle size={15} /> : <Save size={15} />}
            {salvato ? 'Salvata!' : 'Salva chiave'}
          </button>
          {haSalvato && (
            <button
              onClick={elimina}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              <Trash2 size={15} />
              Rimuovi
            </button>
          )}
        </div>
      </div>

      {/* Info privacy */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-700">Privacy e sicurezza</p>
        <p>• La chiave API è salvata localmente nel browser (localStorage) e non viene mai trasmessa a server terzi.</p>
        <p>• I messaggi della chat vengono inviati direttamente all'API di Google Gemini.</p>
        <p>• Nessun dato delle tue fatture viene condiviso con l'AI a meno che tu non lo scriva esplicitamente nel chat.</p>
      </div>
    </div>
  )
}
