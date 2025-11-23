import { useState } from 'react'
import { Eye, Gift, Link as LinkIcon, MessageSquare, X, Search, Filter, MoreHorizontal, ExternalLink, CheckCircle2 } from 'lucide-react'

export default function UsersList({ users }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [sortBy, setSortBy] = useState('engagement')
  const [searchTerm, setSearchTerm] = useState('')

  const openPublicProfile = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API_URL}/api/public/generate-token/${userId}`)
      if (res.ok) {
        const data = await res.json()
        window.open(data.publicUrl, '_blank')
      } else {
        alert('Erro ao gerar link do perfil')
      }
    } catch (error) {
      console.error('Error opening profile:', error)
      alert('Erro ao abrir perfil')
    }
  }

  const openWrapped = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const now = new Date()
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth()
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

      const res = await fetch(`${API_URL}/api/wrapped/generate/${userId}/${year}/${lastMonth}`)
      if (res.ok) {
        const data = await res.json()
        window.open(data.wrappedUrl, '_blank')
      } else {
        alert('Erro ao gerar wrapped')
      }
    } catch (error) {
      console.error('Error opening wrapped:', error)
      alert('Erro ao abrir wrapped')
    }
  }

  const calculateEngagementScore = (user) => {
    let score = 0

    // Dias consecutivos (max 30 pontos)
    score += Math.min((user.consecutive_days || 0) * 10, 30)

    // Análises feitas (max 30 pontos)
    const analysisRatio = (user.total_analyses || 0) / 50
    score += Math.min(analysisRatio * 30, 30)

    // Ativo hoje (20 pontos)
    const lastInteraction = new Date(user.last_interaction)
    const today = new Date()
    const diffHours = (today - lastInteraction) / (1000 * 60 * 60)
    if (diffHours < 24) score += 20

    // Follow-ups (max 20 pontos)
    if (user.followups_sent > 0) {
      const responseRate = (user.followups_responded || 0) / user.followups_sent
      score += responseRate * 20
    }

    return Math.round(score)
  }

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.user_id && user.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'engagement') {
      return calculateEngagementScore(b) - calculateEngagementScore(a)
    }
    if (sortBy === 'analyses') {
      return (b.total_analyses || 0) - (a.total_analyses || 0)
    }
    if (sortBy === 'days') {
      return (b.consecutive_days || 0) - (a.consecutive_days || 0)
    }
    return 0
  })

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 ring-emerald-100'
    if (score >= 40) return 'text-amber-600 bg-amber-50 ring-amber-100'
    return 'text-rose-600 bg-rose-50 ring-rose-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Usuários</h2>
            <p className="text-sm text-slate-500 mt-1">Gerencie e analise sua base de usuários</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="engagement">Engagement Score</option>
                <option value="analyses">Análises</option>
                <option value="days">Dias Consecutivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Eng Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dias</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Análises</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedUsers.map((user) => {
              const score = calculateEngagementScore(user)
              return (
                <tr key={user.id || user.user_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm mr-3">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name || 'Sem nome'}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.id || user.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${user.subscription === 'premium' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      user.subscription === 'trial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                      {user.subscription || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getScoreColor(score)}`}>
                      {score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.consecutive_days || 0} dias
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.total_analyses || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPublicProfile(user.id || user.user_id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Ver perfil público"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openWrapped(user.id || user.user_id)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ver wrapped do mês"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} openPublicProfile={openPublicProfile} openWrapped={openWrapped} />
      )}
    </div>
  )
}

function UserModal({ user, onClose, openPublicProfile, openWrapped }) {
  const [publicLink, setPublicLink] = useState(null)
  const [loadingLink, setLoadingLink] = useState(false)

  const generatePublicLink = async (userId) => {
    setLoadingLink(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API_URL}/api/public/generate-token/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setPublicLink(data.publicUrl)
        navigator.clipboard.writeText(data.publicUrl)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Error generating link:', error)
      alert('Erro ao gerar link')
    }
    setLoadingLink(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.name || 'Usuário'}</h3>
              <p className="text-sm text-slate-500 font-mono">{user.user_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Estatísticas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Membro desde</p>
                <p className="font-semibold text-slate-900 text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Dias consecutivos</p>
                <p className="font-semibold text-slate-900 text-sm">{user.consecutive_days || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Total de análises</p>
                <p className="font-semibold text-slate-900 text-sm">{user.total_analyses || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Última interação</p>
                <p className="font-semibold text-slate-900 text-sm">
                  {user.last_interaction ? new Date(user.last_interaction).toLocaleDateString('pt-BR') : 'Nunca'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Insights</h4>
            <div className="space-y-3">
              {user.subscription === 'trial' && (
                <div className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Trial ativo - Oportunidade de conversão
                </div>
              )}
              {(user.total_analyses || 0) > 10 && (
                <div className="flex items-center p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  Usuário muito ativo ({user.total_analyses} análises)
                </div>
              )}
              {(user.consecutive_days || 0) >= 7 && (
                <div className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Streak de {user.consecutive_days} dias! 🔥
                </div>
              )}
              {(!user.subscription || user.subscription === 'free') && (
                <div className="flex items-center p-3 bg-slate-50 text-slate-600 rounded-lg text-sm border border-slate-100">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mr-3"></div>
                  Usuário gratuito
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Ações Rápidas</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openPublicProfile(user.id || user.user_id)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Perfil
              </button>
              <button
                onClick={() => openWrapped(user.id || user.user_id)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium shadow-sm hover:shadow"
              >
                <Gift className="w-4 h-4 mr-2" />
                Ver Wrapped
              </button>
              <button
                onClick={() => generatePublicLink(user.id || user.user_id)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium shadow-sm hover:shadow"
                disabled={loadingLink}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {loadingLink ? 'Gerando...' : 'Copiar Link'}
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm hover:shadow">
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </button>
            </div>

            {publicLink && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 animate-in slide-in-from-top-2">
                <p className="text-sm font-medium text-purple-900 mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-purple-600" />
                  Link Público gerado com sucesso
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicLink)
                      alert('Link copiado novamente!')
                    }}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  💡 Envie este link para o usuário ver seu progresso pessoal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
