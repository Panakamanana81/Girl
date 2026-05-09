import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FattureProvider } from './store/FattureProvider'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { ListaFatture } from './pages/ListaFatture'
import { FormFattura } from './pages/FormFattura'
import { DettaglioFattura } from './pages/DettaglioFattura'
import { Report } from './pages/Report'

export default function App() {
  return (
    <BrowserRouter>
      <FattureProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fatture" element={<ListaFatture />} />
              <Route path="/fatture/nuova" element={<FormFattura />} />
              <Route path="/fatture/:id" element={<DettaglioFattura />} />
              <Route path="/fatture/:id/modifica" element={<FormFattura />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </main>
        </div>
      </FattureProvider>
    </BrowserRouter>
  )
}
