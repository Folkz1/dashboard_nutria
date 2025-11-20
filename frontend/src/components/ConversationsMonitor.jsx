import { useState, useEffect, useRef } from 'react';

export default function ConversationsMonitor({ conversations }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, autoScroll]);

  const getTimeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            💬 Conversas em Tempo Real
          </h2>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>

      <div className="p-6 max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          {conversations.map((conv, index) => (
            <div
              key={index}
              className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {conv.user_name || conv.user_id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(conv.timestamp)}
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  conv.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
              </div>
              
              <div className="space-y-2">
                {conv.role === 'user' && (
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">👤</span>
                    <p className="text-sm text-gray-700">{conv.content}</p>
                  </div>
                )}
                {conv.role === 'assistant' && (
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">🤖</span>
                    <p className="text-sm text-gray-700">{conv.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhuma conversa recente
            </p>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
