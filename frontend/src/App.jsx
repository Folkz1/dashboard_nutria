import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, MessageSquare, Bell } from 'lucide-react'
import Overview from './pages/Overview'
import UsersPage from './pages/UsersPage'
import Conversations from './pages/Conversations'
import Alerts from './pages/Alerts'
import PublicProfile from './pages/PublicProfile'
import Wrapped from './pages/Wrapped'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/users', icon: Users, label: 'Usuários' },
    { path: '/conversations', icon: MessageSquare, label: 'Conversas' },
    { path: '/alerts', icon: Bell, label: 'Alertas' },
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">🥗 NutrIA</h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(path)
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas (sem navegação) */}
        <Route path="/u/:token" element={<PublicProfile />} />
        <Route path="/wrapped/:token/:year/:month" element={<Wrapped />} />
        
        {/* Rotas do dashboard (com navegação) */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
