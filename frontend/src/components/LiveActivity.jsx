import { useState, useEffect } from 'react';

export default function LiveActivity({ users }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = (lastInteraction) => {
    if (!lastInteraction) return 'Nunca';
    const diff = Math.floor((currentTime - new Date(lastInteraction)) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  const getStatus = (lastInteraction) => {
    if (!lastInteraction) return 'offline';
    const diff = Math.floor((currentTime - new Date(lastInteraction)) / 1000);
    if (diff < 300) return 'online'; // 5 min
    if (diff < 900) return 'away'; // 15 min
    return 'offline';
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  const statusLabels = {
    online: '🟢 Online',
    away: '🟡 Ausente',
    offline: '⚪ Offline'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        👥 Atividade em Tempo Real
      </h2>
      
      <div className="space-y-3">
        {users.map((user) => {
          const status = getStatus(user.last_interaction);
          return (
            <div
              key={user.user_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[status]} animate-pulse`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name || user.user_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {statusLabels[status]} • {getTimeAgo(user.last_interaction)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user.subscription || 'free'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.consecutive_days || 0} dias
                </p>
              </div>
            </div>
          );
        })}
        
        {users.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhum usuário ativo no momento
          </p>
        )}
      </div>
    </div>
  );
}
