# 🚀 Roadmap de Melhorias - Dashboard NutrIA

## 🎯 Próximas Features Prioritárias

### 1. 💬 Interface de Conversas Espelhadas (WhatsApp Web Style)

**Objetivo:** Ver e acompanhar conversas em tempo real, como se fosse WhatsApp Web

#### Design Proposto:

```
┌─────────────────────────────────────────────────────────────┐
│  💬 Conversas                                    [🔍 Buscar] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ 🟢 Diego     │  Diego Fernandes                    [👁️][🎉]│
│ há 2 min     │  ─────────────────────────────────────────  │
│ 3 análises   │                                              │
│              │  👤 Oi, esse whey é bom?          21:30     │
│ 🟡 Henry     │                                              │
│ há 15 min    │  🤖 Vou analisar o rótulo pra     21:30     │
│ 10 análises  │     você! Manda a foto                      │
│              │                                              │
│ ⚪ Ivan      │  👤 [📷 Imagem]                   21:31     │
│ há 2 dias    │                                              │
│ 0 análises   │  🤖 Analisando... ⏳              21:31     │
│              │                                              │
│              │  🤖 Score: 8.0/10 ✅              21:32     │
│              │     Whey 100% Pure                          │
│              │     • Proteína: 24g ✅                      │
│              │     • Carboidratos: 2g ✅                   │
│              │     • Gordura: 1g ✅                        │
│              │                                              │
│              │  👤 Obrigado! 🙏                  21:33     │
│              │                                              │
│              │  ─────────────────────────────────────────  │
│              │  [Digite uma mensagem...]        [Enviar]   │
└──────────────┴──────────────────────────────────────────────┘
```

#### Features:

**Lista de Conversas (Esquerda):**
- ✅ Usuários ordenados por última mensagem
- ✅ Status online/offline em tempo real
- ✅ Preview da última mensagem
- ✅ Contador de mensagens não lidas
- ✅ Badge de trial/premium
- ✅ Busca por nome/telefone

**Área de Chat (Direita):**
- ✅ Histórico completo da conversa
- ✅ Mensagens do usuário (direita, azul)
- ✅ Mensagens do bot (esquerda, cinza)
- ✅ Timestamps
- ✅ Indicador de "digitando..."
- ✅ Preview de imagens enviadas
- ✅ Análises formatadas (cards)
- ✅ Scroll automático para nova mensagem

**Ações Rápidas:**
- 📌 Fixar conversa
- 🔕 Silenciar notificações
- 👁️ Ver perfil público
- 🎉 Ver wrapped
- 🏷️ Adicionar tags
- 📝 Adicionar notas internas

**Envio de Mensagens (Futuro):**
- ✍️ Digitar e enviar mensagem
- 📎 Anexar arquivo
- 😊 Emojis
- 💾 Templates de mensagem
- 🤖 Sugestões da IA

#### Implementação:

**Backend:**
```javascript
// routes/conversations.js

// GET /api/conversations/list - Lista de conversas
router.get('/list', async (req, res) => {
  const conversations = await query(`
    SELECT DISTINCT ON (c.user_id)
      c.user_id,
      u.name,
      u.subscription,
      c.content as last_message,
      c.role as last_message_role,
      c.timestamp as last_message_time,
      u.last_interaction,
      COUNT(*) OVER (PARTITION BY c.user_id) as message_count
    FROM n8n_chat c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.user_id, c.timestamp DESC
  `);
  res.json(conversations);
});

// GET /api/conversations/:userId - Histórico completo
router.get('/:userId', async (req, res) => {
  const messages = await query(`
    SELECT 
      id,
      role,
      content,
      timestamp,
      session_id
    FROM n8n_chat
    WHERE user_id = $1
    ORDER BY timestamp ASC
  `, [req.params.userId]);
  res.json(messages);
});

// WebSocket para mensagens em tempo real
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const { type, userId } = JSON.parse(data);
    if (type === 'subscribe') {
      // Inscrever para receber mensagens deste usuário
      subscribeToUser(ws, userId);
    }
  });
});
```

**Frontend:**
```jsx
// pages/ConversationsLive.jsx
export default function ConversationsLive() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  // Conectar WebSocket
  useEffect(() => {
    const websocket = new WebSocket('ws://...');
    websocket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };
    setWs(websocket);
  }, []);

  // Carregar conversas
  useEffect(() => {
    fetch('/api/conversations/list')
      .then(r => r.json())
      .then(setConversations);
  }, []);

  // Carregar mensagens do usuário selecionado
  useEffect(() => {
    if (selectedUser) {
      fetch(`/api/conversations/${selectedUser}`)
        .then(r => r.json())
        .then(setMessages);
      
      // Inscrever no WebSocket
      ws?.send(JSON.stringify({ 
        type: 'subscribe', 
        userId: selectedUser 
      }));
    }
  }, [selectedUser]);

  return (
    <div className="flex h-screen">
      {/* Lista de conversas */}
      <ConversationsList 
        conversations={conversations}
        selected={selectedUser}
        onSelect={setSelectedUser}
      />
      
      {/* Área de chat */}
      <ChatArea 
        messages={messages}
        user={conversations.find(c => c.user_id === selectedUser)}
      />
    </div>
  );
}
```

---

### 2. 📡 Feed de Eventos em Tempo Real

**Objetivo:** Ver tudo que está acontecendo no sistema em tempo real

#### Design Proposto:

```
┌─────────────────────────────────────────────────────────────┐
│  📡 Eventos em Tempo Real                    [Filtros ▼]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🟢 AGORA • Diego Fernandes                                 │
│  📊 Analisou produto: Whey 100% Pure                        │
│  Score: 8.0/10 ✅                                           │
│  há 2 segundos                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  💬 HÁ 1 MIN • Henry                                        │
│  Enviou mensagem: "Quantas calorias tem nisso?"             │
│  [Ver conversa]                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🎉 HÁ 5 MIN • Ivan Moniz                                   │
│  Completou 7 dias consecutivos! 🔥                          │
│  [Enviar parabéns]                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ⚠️  HÁ 10 MIN • souliny                                    │
│  Inativo há 3 dias - Risco de churn                         │
│  [Enviar reengajamento]                                     │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  💰 HÁ 15 MIN • Diego Fernandes                             │
│  Atingiu limite de análises (3/3)                           │
│  [Oferecer upgrade]                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📸 HÁ 20 MIN • Henry                                       │
│  Enviou foto de rótulo                                      │
│  [Ver imagem]                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🏋️ HÁ 30 MIN • Ivan Moniz                                 │
│  Registrou treino: Peito                                    │
│  Duração: 45 min                                            │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🔔 HÁ 1 HORA • Sistema                                     │
│  2 trials acabam em 24h                                     │
│  [Ver usuários]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Tipos de Eventos:

**Usuário:**
- 💬 Nova mensagem
- 📊 Nova análise
- 📸 Foto enviada
- 🏋️ Treino registrado
- 🍽️ Refeição registrada
- 🎯 Meta atingida
- 🔥 Streak mantido

**Sistema:**
- ⚠️ Usuário inativo
- 💰 Limite atingido
- 🎉 Milestone alcançado
- 🔔 Trial acabando
- ❌ Erro no bot
- ✅ Follow-up respondido

**Conversão:**
- 💳 Upgrade para premium
- 🎁 Trial iniciado
- 😢 Cancelamento
- 🔄 Renovação

#### Features:

**Filtros:**
- 📋 Todos os eventos
- 💬 Apenas conversas
- 📊 Apenas análises
- ⚠️ Apenas alertas
- 🎉 Apenas milestones
- 👤 Por usuário específico

**Ações Rápidas:**
- 👁️ Ver detalhes
- 💬 Responder
- 📌 Fixar evento
- 🔕 Ignorar
- 📋 Copiar info

**Notificações:**
- 🔔 Som para eventos importantes
- 🎨 Cores por tipo de evento
- 📱 Badge no ícone do navegador
- 💬 Notificação desktop (opcional)

#### Implementação:

**Backend:**
```javascript
// routes/events.js

// GET /api/events/stream - Stream de eventos
router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Enviar eventos a cada 5 segundos
  const interval = setInterval(async () => {
    const events = await getRecentEvents();
    res.write(`data: ${JSON.stringify(events)}\n\n`);
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

async function getRecentEvents() {
  // Últimas mensagens
  const messages = await query(`
    SELECT 'message' as type, user_id, content, timestamp
    FROM n8n_chat
    WHERE timestamp > NOW() - INTERVAL '5 minutes'
    ORDER BY timestamp DESC
  `);

  // Últimas análises
  const analyses = await query(`
    SELECT 'analysis' as type, user_id, product_name, score, created_at
    FROM daily_analyses
    WHERE created_at > NOW() - INTERVAL '5 minutes'
    ORDER BY created_at DESC
  `);

  // Alertas ativos
  const alerts = await query(`
    SELECT 'alert' as type, user_id, alert_type, created_at
    FROM alerts
    WHERE created_at > NOW() - INTERVAL '5 minutes'
    ORDER BY created_at DESC
  `);

  return [...messages, ...analyses, ...alerts]
    .sort((a, b) => b.timestamp - a.timestamp);
}
```

**Frontend:**
```jsx
// components/EventsFeed.jsx
export default function EventsFeed() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');
    
    eventSource.onmessage = (event) => {
      const newEvents = JSON.parse(event.data);
      setEvents(prev => [...newEvents, ...prev].slice(0, 50));
      
      // Notificação sonora para eventos importantes
      if (newEvents.some(e => e.type === 'alert')) {
        playNotificationSound();
      }
    };

    return () => eventSource.close();
  }, []);

  const filteredEvents = events.filter(e => 
    filter === 'all' || e.type === filter
  );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <EventFilters filter={filter} onChange={setFilter} />
      
      {/* Feed */}
      <div className="space-y-3">
        {filteredEvents.map((event, i) => (
          <EventCard key={i} event={event} />
        ))}
      </div>
    </div>
  );
}
```

---

### 3. 🎨 Outras Melhorias Planejadas

#### Dashboard Principal
- [ ] Gráfico de conversão (funil)
- [ ] Mapa de calor de atividade
- [ ] Comparação mês a mês
- [ ] Previsão de receita

#### Usuários
- [ ] Segmentação automática
- [ ] Tags personalizadas
- [ ] Notas internas
- [ ] Histórico de ações

#### Analytics
- [ ] Cohort analysis
- [ ] Retention rate
- [ ] LTV (Lifetime Value)
- [ ] CAC (Custo de Aquisição)

#### Automações
- [ ] Criar follow-ups automáticos
- [ ] A/B testing de mensagens
- [ ] Regras de engajamento
- [ ] Webhooks customizados

#### Social Media
- [ ] Aba de posts do Instagram
- [ ] Performance de conteúdo
- [ ] Agendamento de posts
- [ ] Sugestões de conteúdo pela IA

---

## 🎯 Priorização

### Fase 1 (Próxima) - Conversas e Eventos
1. ✅ Interface de conversas espelhadas
2. ✅ Feed de eventos em tempo real
3. ✅ WebSocket para updates instantâneos

### Fase 2 - Analytics Avançado
1. Funil de conversão
2. Cohort analysis
3. Previsão de receita

### Fase 3 - Automações
1. Follow-ups automáticos
2. A/B testing
3. Regras de engajamento

### Fase 4 - Social Media
1. Aba de Instagram
2. Performance de posts
3. Agendamento

---

## 💡 Quer que eu implemente?

Posso começar por:

**Opção A:** Interface de Conversas Espelhadas (WhatsApp Web style)
**Opção B:** Feed de Eventos em Tempo Real
**Opção C:** Ambos ao mesmo tempo

Me diz qual você prefere e eu começo agora! 🚀
