import { useState, useEffect } from 'react'
import { Users, Clock } from 'lucide-react'

export default function LiveActivity({ users }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeAgo = (lastInteraction) => {
    if (!lastInteraction) return 'Nunca'
    const diff = Math.floor((currentTime - new Date(lastInteraction)) / 1000)
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const getStatus = (lastInteraction) => {
    if (!lastInteraction) return 'offline'
    const diff = Math.floor((currentTime - new Date(lastInteraction)) / 1000)
    if (diff < 300) return 'online' // 5 min
    if (diff < 900) return 'away' // 15 min
    return 'offline'
  }

  const statusColors = {
    online: 'bg-emerald-500 ring-emerald-100',
    away: 'bg-amber-500 ring-amber-100',
    offline: 'bg-slate-300 ring-slate-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-50 rounded-lg mr-3">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Atividade Recente</h2>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {users.length} ativos
        </span>
      </div>

      <div className="space-y-4">
        {users.map((user) => {
          const status = getStatus(user.last_interaction)
          return (
            <div
              key={user.user_id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${statusColors[status]}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                    {user.name || `User ${user.user_id.substring(0, 6)}`}
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {getTimeAgo(user.last_interaction)} atrás
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.subscription === 'premium'
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                  {user.subscription || 'free'}
                </span>
              </div>
            </div>
          )
        })}

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhum usuário ativo</p>
          </div>
        )}
      </div>
    </div>
  )
}
