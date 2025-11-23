import { BarChart3 } from 'lucide-react'

export default function ActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Atividade (24h)</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
          <p>Sem dados de atividade recente</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Atividade</h2>
            <p className="text-sm text-slate-500">Volume de mensagens nas últimas 24 horas</p>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-64 space-x-2">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full flex items-end justify-center h-56 relative">
                <div
                  className="w-full bg-primary-100 group-hover:bg-primary-500 rounded-t-sm transition-all duration-300 relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.count} msgs
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">
                {item.hour}h
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
