export default function AlertsPanel({ alerts }) {
  const alertIcons = {
    trial_ending: '🚨',
    inactive_user: '⚠️',
    limit_reached: '💰',
    milestone: '🎉',
    error: '❌'
  };

  const alertColors = {
    trial_ending: 'bg-red-50 border-red-200 text-red-800',
    inactive_user: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    limit_reached: 'bg-green-50 border-green-200 text-green-800',
    milestone: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🔔 Alertas Importantes
      </h2>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg ${alertColors[alert.type] || 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">
                {alertIcons[alert.type] || '📌'}
              </span>
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.action && (
                  <button className="mt-2 text-sm font-medium underline hover:no-underline">
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            ✅ Nenhum alerta no momento
          </p>
        )}
      </div>
    </div>
  );
}
