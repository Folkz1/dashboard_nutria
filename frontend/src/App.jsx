import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import UsersPage from './pages/UsersPage'
import Conversations from './pages/Conversations'
import Alerts from './pages/Alerts'
import PublicProfile from './pages/PublicProfile'
import Wrapped from './pages/Wrapped'
import SourcesManager from './pages/SourcesManager'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas (sem navegação) */}
        <Route path="/u/:token" element={<PublicProfile />} />
        <Route path="/wrapped/:token/:year/:month" element={<Wrapped />} />

        {/* Rotas do dashboard (com navegação) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/sources" element={<SourcesManager />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
