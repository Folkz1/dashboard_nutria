import { useState, useEffect, useRef } from 'react'
import { MessageSquare, User, Bot, Search, Filter, Clock, CheckCheck, Circle } from 'lucide-react'

export default function ConversationsMonitor({ conversations }) {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const messagesEndRef = useRef(null)

  // Agrupar conversas por user_id
  const groupedConversations = conversations.reduce((acc, conv) => {
    const userId = conv.user_id
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        user_name: conv.user_name || userId,
        messages: [],
        lastMessage: conv.timestamp,
        is_active: conv.is_active
      }
    }
    acc[userId].messages.push(conv)
    if (new Date(conv.timestamp) > new Date(acc[userId].lastMessage)) {
      acc[userId].lastMessage = conv.timestamp
      acc[userId].is_active = conv.is_active
    }
    return acc
  }, {})

  const conversationsList = Object.values(groupedConversations).sort(
    (a, b) => new Date(b.lastMessage) - new Date(a.lastMessage)
  )

  // Filtrar conversas
  const filteredConversations = conversationsList.filter(conv => {
    const matchesSearch = conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && conv.is_active) ||
      (filterStatus === 'inactive' && !conv.is_active)
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation])

  const getTimeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return new Date(timestamp).toLocaleDateString('pt-BR')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Conversas</h2>
              <p className="text-xs text-slate-500">{filteredConversations.length} conversas</p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'all'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'active'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'inactive'
                  ? 'bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              Inativas
            </button>
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${selectedConversation?.user_id === conv.user_id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                    {conv.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${conv.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {conv.user_name}
                    </p>
                    <span className="text-xs text-slate-500">
                      {getTimeAgo(conv.lastMessage)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {conv.messages[conv.messages.length - 1]?.content || 'Sem mensagens'}
                  </p>
                  {conv.messages.length > 0 && (
                    <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {conv.messages.length} msgs
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {selectedConversation.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${selectedConversation.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedConversation.user_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Circle className={`w-2 h-2 mr-1 ${selectedConversation.is_active ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-400 text-slate-400'}`} />
                      {selectedConversation.is_active ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  ID: {selectedConversation.user_id.substring(0, 8)}
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
              {selectedConversation.messages
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${msg.role === 'assistant' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-primary-500 text-white'
                      }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex flex-col max-w-[70%] ${msg.role === 'assistant' ? 'items-end' : 'items-start'
                      }`}>
                      <div className={`px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                          ? 'bg-white border border-slate-200 text-slate-900'
                          : 'bg-primary-500 text-white'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1 px-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.role === 'assistant' && (
                          <CheckCheck className="w-3 h-3 text-primary-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem (Desabilitado - Apenas Visualização) */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-500 border border-slate-200">
                💡 Modo visualização - Este é um espelho das conversas dos usuários
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma conversa selecionada</h3>
            <p className="text-sm">Selecione uma conversa da lista para visualizar as mensagens</p>
          </div>
        )}
      </div>
    </div>
  )
}
