import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart2 } from 'lucide-react'

const voci = [
  { to: '/', label: 'Dashboard', icona: LayoutDashboard },
  { to: '/fatture', label: 'Fatture', icona: FileText },
  { to: '/report', label: 'Report', icona: BarChart2 },
]

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            <span className="font-bold text-lg text-gray-900">Gestione Fatture</span>
          </div>
          <div className="flex gap-1">
            {voci.map(({ to, label, icona: Icona }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icona size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
