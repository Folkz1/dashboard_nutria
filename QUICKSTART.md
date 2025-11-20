# 🚀 Quick Start - NutrIA Dashboard

## Setup Rápido (5 minutos)

### 1. Clone e Configure

```bash
# Se ainda não clonou
git clone seu-repositorio
cd dashboard-nutria

# Windows
.\setup.ps1

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 2. Configure o Banco de Dados

Edite `dashboard-nutria/.env`:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/nutria
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Inicie os Serviços

**Terminal 1 - Backend:**
```bash
cd dashboard-nutria
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dashboard-nutria/frontend
npm run dev
```

### 4. Acesse

Abra: http://localhost:5173

## 🎯 O que você vai ver

### Visão Geral
- Total de usuários, ativos hoje, análises
- Gráfico de atividade 24h
- Usuários online agora
- Alertas importantes

### Usuários
- Lista completa com engagement score
- Detalhes de cada usuário
- Insights automáticos

### Conversas
- Monitor em tempo real
- Stream de mensagens

### Alertas
- Trials acabando
- Usuários inativos
- Oportunidades de conversão

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Backend com hot reload
cd frontend && npm run dev  # Frontend com hot reload

# Produção
npm start                # Backend
cd frontend && npm run build && npm run preview  # Frontend

# Docker
docker-compose up        # Sobe tudo
```

## 📊 Dados de Teste

O dashboard conecta direto no seu banco PostgreSQL existente. Se quiser testar com dados fake:

```sql
-- Inserir usuário de teste
INSERT INTO users (user_id, name, subscription, created_at, last_interaction)
VALUES ('123456789', 'Teste User', 'trial', NOW(), NOW());
```

## ⚡ Próximos Passos

1. **Fase 1 (Atual)**: Dashboard só leitura ✅
2. **Fase 2**: Adicionar botões de ação (enviar follow-up, etc)
3. **Fase 3**: Integrar com Gemini para sugestões automáticas

## 🆘 Problemas Comuns

### Erro de conexão com banco
```
Error: connect ECONNREFUSED
```
**Solução**: Verifique DATABASE_URL no .env

### Frontend não carrega dados
```
Failed to fetch
```
**Solução**: Verifique se backend está rodando na porta 3000

### CORS error
```
Access-Control-Allow-Origin
```
**Solução**: Verifique FRONTEND_URL no backend .env

## 📝 Estrutura de Dados

O dashboard usa estas tabelas:
- `users` - Dados dos usuários
- `n8n_chat` - Histórico de conversas
- `daily_analyses` - Análises diárias
- `followup_logs` - Follow-ups enviados

## 🎨 Personalização

### Mudar cores
Edite `frontend/tailwind.config.js`

### Adicionar métricas
Edite `routes/analytics.js`

### Novos alertas
Edite `routes/alerts.js`

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação completa
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy no Easypanel
