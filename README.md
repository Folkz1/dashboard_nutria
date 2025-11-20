# 🥗 NutrIA Dashboard

Dashboard de Analytics e Gestão do NutrIA Bot com visualização em tempo real.

## 📋 Features

### ✅ Implementado (MVP - Fase 1)

- **Visão Geral**
  - Métricas principais (usuários, ativos, análises, conversão)
  - Gráfico de atividade 24h
  - Usuários online em tempo real
  - Alertas importantes

- **Usuários**
  - Lista completa com engagement score
  - Filtros e ordenação
  - Detalhes de cada usuário
  - Insights automáticos
  - **🔗 Gerador de link público** (NOVO!)

- **Conversas**
  - Monitor de conversas em tempo real
  - Stream de mensagens
  - Auto-scroll

- **Alertas**
  - Trials acabando
  - Usuários inativos
  - Limites atingidos
  - Milestones

- **🎯 Perfil Público do Usuário** (NOVO!)
  - Página pública para cada usuário
  - Estatísticas pessoais
  - Conquistas desbloqueadas
  - Gráfico de atividade
  - Análises recentes
  - Link único e seguro
  - Sem necessidade de login

- **🎉 Wrapped Mensal** (NOVO! Estilo Spotify)
  - Relatório visual do mês
  - Slides animados
  - Estatísticas impactantes
  - Conquistas do mês
  - Ranking entre usuários
  - Botões de compartilhamento
  - Integração com N8N para envio automático

## 🚀 Deploy no Easypanel

### 1. Backend (API)

```yaml
# Configuração do serviço no Easypanel
Nome: nutria-dashboard-api
Tipo: Node.js
Build Command: npm install
Start Command: npm start
Port: 3000

# Variáveis de Ambiente
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://seu-dashboard.com
```

### 2. Frontend

```yaml
# Configuração do serviço no Easypanel
Nome: nutria-dashboard-frontend
Tipo: Node.js
Build Command: cd frontend && npm install && npm run build
Start Command: cd frontend && npm run preview
Port: 4173

# Variáveis de Ambiente
VITE_API_URL=https://sua-api.com
```

## 💻 Desenvolvimento Local

### Backend

```bash
cd dashboard-nutria
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npm run dev
```

### Frontend

```bash
cd dashboard-nutria/frontend
npm install
cp .env.example .env
# Edite o .env com a URL da API
npm run dev
```

Acesse: http://localhost:5173

## 📁 Estrutura do Projeto

```
dashboard-nutria/
├── server.js              # Servidor Express
├── package.json
├── .env.example
├── routes/
│   ├── analytics.js       # Métricas e analytics
│   ├── users.js           # Dados de usuários
│   ├── conversations.js   # Conversas
│   ├── alerts.js          # Sistema de alertas
│   ├── public.js          # 🆕 API pública (perfil usuário)
│   └── wrapped.js         # 🆕 API wrapped mensal
├── services/
│   ├── database.js        # Conexão PostgreSQL
│   └── realtime.js        # WebSocket updates
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/    # Componentes reutilizáveis
    │   └── pages/         # Páginas do dashboard
    │       ├── PublicProfile.jsx  # 🆕 Perfil público
    │       └── Wrapped.jsx        # 🆕 Wrapped mensal
    ├── package.json
    └── vite.config.js
```

## 🔌 API Endpoints

### Analytics
- `GET /api/analytics/metrics` - Métricas principais
- `GET /api/analytics/activity` - Atividade por período

### Users
- `GET /api/users` - Lista de usuários
- `GET /api/users/:id` - Detalhes do usuário

### Conversations
- `GET /api/conversations/recent` - Conversas recentes
- `GET /api/conversations/:userId` - Conversas de um usuário

### Alerts
- `GET /api/alerts` - Alertas ativos

### Public (🆕)
- `GET /api/public/user/:token` - Dados públicos do usuário
- `GET /api/public/generate-token/:userId` - Gerar link público

### Wrapped (🆕)
- `GET /api/wrapped/:token/:year/:month` - Dados do wrapped mensal
- `GET /api/wrapped/generate/:userId/:year/:month` - Gerar link do wrapped

## 🎯 Próximas Fases

### Fase 2: Ações Manuais (1 dia)
- Botões para enviar follow-ups
- Integração com webhooks do N8N
- Ações rápidas por usuário

### Fase 3: Sugestões com IA (2-3 dias)
- Gemini analisa e sugere ações
- Aprovação e envio de mensagens
- Insights automáticos

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, PostgreSQL, WebSocket
- **Frontend**: React, Vite, TailwindCSS
- **Deploy**: Easypanel

## 📊 Cálculo do Engagement Score

```javascript
score = 
  (dias_consecutivos * 10) +              // Max 30 pontos
  (analises_feitas / limite) * 30 +       // Max 30 pontos
  (ativo_hoje ? 20 : 0) +                 // 20 pontos
  (followups_respondidos / enviados) * 20 // Max 20 pontos
```

## 🔒 Segurança

- CORS configurado
- Variáveis de ambiente para credenciais
- Validação de dados nas rotas

## 🔗 Perfil Público

Cada usuário pode ter um link público para ver seu progresso:

```
https://dashboard-nutria.com/u/TOKEN_UNICO
```

**Como usar:**
1. No dashboard admin, clique em "Ver detalhes" do usuário
2. Clique em "🔗 Link Público"
3. Envie o link para o usuário via WhatsApp

**O que o usuário vê:**
- Dias consecutivos
- Total de análises
- Score médio
- Conquistas desbloqueadas
- Gráfico de atividade
- Análises recentes

Veja documentação completa: [PUBLIC_PROFILE.md](./PUBLIC_PROFILE.md)

## 🎉 Wrapped Mensal

Relatório visual compartilhável do mês (estilo Spotify Wrapped):

```
https://dashboard-nutria.com/wrapped/TOKEN/2025/11
```

**Como usar:**
1. Enviar automaticamente todo dia 1º do mês via N8N
2. Ou gerar manualmente no dashboard admin
3. Usuário vê slides animados com suas estatísticas
4. Compartilha nas redes sociais

**O que mostra:**
- Total de análises do mês
- Score médio
- Melhor e pior produto
- Categorias favoritas
- Dias ativos
- Ranking (Top X%)
- Conquistas desbloqueadas
- Comparação com mês anterior

Veja documentação completa: [WRAPPED_FEATURE.md](./WRAPPED_FEATURE.md)

## 🔗 Integração com N8N

O dashboard pode ser integrado com N8N para automações:
- Enviar perfil público após 3 análises
- Enviar wrapped todo dia 1º do mês
- Alertas de trial acabando
- Reengajamento de inativos
- Celebrar milestones

Veja documentação completa: [INTEGRATION_N8N.md](./INTEGRATION_N8N.md)

## 📝 Licença

MIT
