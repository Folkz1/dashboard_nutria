import { useState } from 'react';

export default function UsersList({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('engagement');

  const openPublicProfile = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/public/generate-token/${userId}`);
      if (res.ok) {
        const data = await res.json();
        window.open(data.publicUrl, '_blank');
      } else {
        alert('Erro ao gerar link do perfil');
      }
    } catch (error) {
      console.error('Error opening profile:', error);
      alert('Erro ao abrir perfil');
    }
  };

  const openWrapped = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const res = await fetch(`${API_URL}/api/wrapped/generate/${userId}/${year}/${lastMonth}`);
      if (res.ok) {
        const data = await res.json();
        window.open(data.wrappedUrl, '_blank');
      } else {
        alert('Erro ao gerar wrapped');
      }
    } catch (error) {
      console.error('Error opening wrapped:', error);
      alert('Erro ao abrir wrapped');
    }
  };

  const calculateEngagementScore = (user) => {
    let score = 0;
    
    // Dias consecutivos (max 30 pontos)
    score += Math.min((user.consecutive_days || 0) * 10, 30);
    
    // Análises feitas (max 30 pontos)
    const analysisRatio = (user.total_analyses || 0) / 50;
    score += Math.min(analysisRatio * 30, 30);
    
    // Ativo hoje (20 pontos)
    const lastInteraction = new Date(user.last_interaction);
    const today = new Date();
    const diffHours = (today - lastInteraction) / (1000 * 60 * 60);
    if (diffHours < 24) score += 20;
    
    // Follow-ups (max 20 pontos)
    if (user.followups_sent > 0) {
      const responseRate = (user.followups_responded || 0) / user.followups_sent;
      score += responseRate * 20;
    }
    
    return Math.round(score);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'engagement') {
      return calculateEngagementScore(b) - calculateEngagementScore(a);
    }
    if (sortBy === 'analyses') {
      return (b.total_analyses || 0) - (a.total_analyses || 0);
    }
    if (sortBy === 'days') {
      return (b.consecutive_days || 0) - (a.consecutive_days || 0);
    }
    return 0;
  });

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            👥 Usuários ({users.length})
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="engagement">Engagement Score</option>
            <option value="analyses">Análises</option>
            <option value="days">Dias Consecutivos</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Eng Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Dias
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Análises
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedUsers.map((user) => {
              const score = calculateEngagementScore(user);
              return (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || 'Sem nome'}
                      </p>
                      <p className="text-sm text-gray-500">{user.user_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.subscription === 'premium' ? 'bg-purple-100 text-purple-800' :
                      user.subscription === 'trial' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(score)}`}>
                      {score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.consecutive_days || 0} dias
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.total_analyses || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalhes
                      </button>
                      <button
                        onClick={() => openPublicProfile(user.user_id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                        title="Ver perfil público"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => openWrapped(user.user_id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        title="Ver wrapped do mês"
                      >
                        🎉
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function UserModal({ user, onClose }) {
  const [publicLink, setPublicLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);

  const generatePublicLink = async (userId) => {
    setLoadingLink(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/public/generate-token/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPublicLink(data.publicUrl);
        // Copiar para clipboard
        navigator.clipboard.writeText(data.publicUrl);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Erro ao gerar link');
    }
    setLoadingLink(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">
            👤 {user.name || user.user_id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📊 Estatísticas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Dias consecutivos</p>
                <p className="font-medium">{user.consecutive_days || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total de análises</p>
                <p className="font-medium">{user.total_analyses || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Última interação</p>
                <p className="font-medium">
                  {user.last_interaction ? new Date(user.last_interaction).toLocaleString('pt-BR') : 'Nunca'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🎯 Insights</h4>
            <div className="space-y-2">
              {user.subscription === 'trial' && (
                <p className="text-sm text-blue-600">
                  • Trial ativo - Oportunidade de conversão
                </p>
              )}
              {(user.total_analyses || 0) > 10 && (
                <p className="text-sm text-green-600">
                  • Usuário muito ativo ({user.total_analyses} análises)
                </p>
              )}
              {(user.consecutive_days || 0) >= 7 && (
                <p className="text-sm text-purple-600">
                  • Streak de {user.consecutive_days} dias! 🔥
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">⚡ Ações Rápidas</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => openPublicProfile(user.user_id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                👁️ Ver Perfil
              </button>
              <button 
                onClick={() => openWrapped(user.user_id)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                🎉 Ver Wrapped
              </button>
              <button
                onClick={() => generatePublicLink(user.user_id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loadingLink}
              >
                {loadingLink ? '⏳ Gerando...' : '🔗 Copiar Link'}
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                💬 Enviar Mensagem
              </button>
            </div>
            
            {publicLink && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  Link Público (copiado!):
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicLink);
                      alert('Link copiado novamente!');
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
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
  );
}
