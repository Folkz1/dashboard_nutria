import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function PublicProfile() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/user/${token}`);
      if (!res.ok) {
        throw new Error('Usuário não encontrado');
      }
      const userData = await res.json();
      setData(userData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const { user, stats, achievements, recentAnalyses, activityData } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.imgur.com/Diz9NMI.jpeg" 
              alt="NutrIA Logo" 
              className="h-16 w-16 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NutrIA</h1>
              <p className="text-sm text-gray-600">Seu Progresso Pessoal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {user.name}!
            </h2>
            <p className="text-gray-600">
              Membro desde {new Date(user.memberSince).toLocaleDateString('pt-BR')}
            </p>
            
            {user.subscription === 'trial' && user.trialDaysLeft !== null && (
              <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                🎁 {user.trialDaysLeft} dias restantes no trial
              </div>
            )}
            
            {user.subscription === 'premium' && (
              <div className="mt-4 inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                👑 Membro Premium
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-gray-900">
              {user.consecutiveDays}
            </div>
            <p className="text-sm text-gray-600 mt-1">Dias Consecutivos</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalAnalyses}
            </div>
            <p className="text-sm text-gray-600 mt-1">Análises Feitas</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-2">
              {stats.avgScore >= 7 ? '✅' : stats.avgScore >= 5 ? '⚠️' : '❌'}
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.avgScore || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-1">Score Médio</p>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🏆 Conquistas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {achievement.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Chart */}
        {activityData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📈 Sua Atividade (Últimos 30 dias)
            </h3>
            <div className="flex items-end justify-between h-32 space-x-1">
              {activityData.slice(0, 30).reverse().map((day, index) => {
                const maxCount = Math.max(...activityData.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-28">
                      <div
                        className="w-full bg-green-500 hover:bg-green-600 rounded-t transition-all cursor-pointer relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.count} análises
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🔍 Análises Recentes
            </h3>
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {analysis.product_name || 'Produto sem nome'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {analysis.main_alerts && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ {analysis.main_alerts}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <div
                      className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        analysis.score >= 7
                          ? 'bg-green-100 text-green-800'
                          : analysis.score >= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysis.score}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {user.subscription === 'trial' && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">
              Gostando do NutrIA?
            </h3>
            <p className="mb-6 opacity-90">
              Faça upgrade para Premium e tenha análises ilimitadas!
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Falar com o Bot
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img 
              src="https://i.imgur.com/Diz9NMI.jpeg" 
              alt="NutrIA Logo" 
              className="h-6 w-6 rounded-full"
            />
            <p>NutrIA - Seu assistente nutricional inteligente</p>
          </div>
          <p className="mt-2">Continue conversando pelo WhatsApp!</p>
        </div>
      </main>
    </div>
  );
}
