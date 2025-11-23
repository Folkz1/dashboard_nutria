import { AlertTriangle, AlertCircle, CheckCircle2, Zap, XCircle, Bell } from 'lucide-react'

export default function AlertsPanel({ alerts }) {
  const alertConfig = {
    trial_ending: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    inactive_user: { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
    limit_reached: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    milestone: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    error: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    default: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-rose-50 rounded-lg mr-3">
            <Bell className="w-5 h-5 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Alertas Importantes</h2>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full">
            {alerts.length} novos
          </span>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.type] || alertConfig.default
          const Icon = config.icon

          return (
            <div
              key={index}
              className={`p-4 border rounded-xl transition-all hover:shadow-sm ${config.bg} ${config.border}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${config.color}`}>{alert.title}</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                  {alert.action && (
                    <button className={`mt-3 text-xs font-semibold uppercase tracking-wider ${config.color} hover:opacity-80 transition-opacity`}>
                      {alert.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
            <p>Tudo tranquilo por aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}
