import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 group-hover:text-primary-600 transition-colors">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-200">
            {typeof Icon === 'string' ? <span className="text-xl">{Icon}</span> : <Icon className="w-6 h-6" />}
          </div>
        )}
      </div>

      {trend && (
        <div className={`mt-4 flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
          } w-fit px-2.5 py-1 rounded-full`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {trendValue}%
          <span className="text-slate-400 font-normal ml-1.5">vs mês anterior</span>
        </div>
      )}
    </div>
  )
}
