# 🔗 Integração Dashboard + N8N

## Visão Geral

O dashboard pode ser integrado com o N8N para automatizar ações baseadas nos dados dos usuários.

## 🎯 Casos de Uso

### 1. Enviar Link Público do Perfil

**Quando:** Após usuário fazer 3 análises

```javascript
// N8N Workflow

// 1. Trigger: Webhook quando análise é criada
// POST /webhook/analysis-created
// Body: { user_id, analysis_count }

// 2. Condition: analysis_count === 3

// 3. HTTP Request: Gerar link público
const response = await fetch(
  `${DASHBOARD_API}/api/public/generate-token/${user_id}`
);
const { publicUrl } = await response.json();

// 4. Send WhatsApp
await sendWhatsApp(user_id, `
🎉 Parabéns! Você já fez 3 análises!

Veja seu progresso: ${publicUrl}

Continue assim! 💪
`);
```

### 2. Enviar Wrapped Mensal

**Quando:** Todo dia 1º do mês às 10h

```javascript
// N8N Workflow

// 1. Schedule Trigger
// Cron: 0 10 1 * *

// 2. Get Active Users
const users = await query(`
  SELECT user_id, name 
  FROM users 
  WHERE last_interaction >= NOW() - INTERVAL '30 days'
`);

// 3. Loop: Para cada usuário
for (const user of users) {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  // 4. HTTP Request: Gerar wrapped
  const response = await fetch(
    `${DASHBOARD_API}/api/wrapped/generate/${user.user_id}/${year}/${lastMonth}`
  );
  const { wrappedUrl } = await response.json();
  
  // 5. Send WhatsApp
  await sendWhatsApp(user.user_id, `
🎉 ${user.name}, seu NutrIA Wrapped está pronto!

Veja como foi seu mês: ${wrappedUrl}

Compartilhe com seus amigos! 💚
  `);
}
```

### 3. Alertas de Oportunidade

**Quando:** Usuário bate limite de análises

```javascript
// N8N Workflow

// 1. Schedule: A cada hora
// Cron: 0 * * * *

// 2. HTTP Request: Buscar alertas
const response = await fetch(`${DASHBOARD_API}/api/alerts`);
const alerts = await response.json();

// 3. Filter: Apenas "limit_reached"
const limitAlerts = alerts.filter(a => a.type === 'limit_reached');

// 4. Loop: Para cada alerta
for (const alert of limitAlerts) {
  // 5. Send WhatsApp
  await sendWhatsApp(alert.user_id, `
💰 Você atingiu o limite de análises gratuitas!

Faça upgrade para Premium e tenha análises ilimitadas!

Responda "premium" para saber mais.
  `);
}
```

### 4. Reengajamento de Inativos

**Quando:** Usuário inativo há 3 dias

```javascript
// N8N Workflow

// 1. Schedule: Todo dia às 18h
// Cron: 0 18 * * *

// 2. HTTP Request: Buscar alertas
const response = await fetch(`${DASHBOARD_API}/api/alerts`);
const alerts = await response.json();

// 3. Filter: Apenas "inactive_user"
const inactiveAlerts = alerts.filter(a => a.type === 'inactive_user');

// 4. Loop: Para cada usuário inativo
for (const alert of inactiveAlerts) {
  // 5. HTTP Request: Buscar dados do usuário
  const userResponse = await fetch(
    `${DASHBOARD_API}/api/users/${alert.user_id}`
  );
  const user = await userResponse.json();
  
  // 6. HTTP Request: Gerar link público
  const linkResponse = await fetch(
    `${DASHBOARD_API}/api/public/generate-token/${alert.user_id}`
  );
  const { publicUrl } = await linkResponse.json();
  
  // 7. Send WhatsApp
  await sendWhatsApp(alert.user_id, `
Oi ${user.name}! Saudades! 😢

Você já fez ${user.total_analyses} análises e tem ${user.consecutive_days} dias consecutivos!

Veja seu progresso: ${publicUrl}

Vamos continuar? 💪
  `);
}
```

### 5. Celebrar Milestones

**Quando:** Usuário completa 7 dias consecutivos

```javascript
// N8N Workflow

// 1. Schedule: Todo dia às 20h
// Cron: 0 20 * * *

// 2. HTTP Request: Buscar alertas
const response = await fetch(`${DASHBOARD_API}/api/alerts`);
const alerts = await response.json();

// 3. Filter: Apenas "milestone"
const milestoneAlerts = alerts.filter(a => a.type === 'milestone');

// 4. Loop: Para cada milestone
for (const alert of milestoneAlerts) {
  // 5. HTTP Request: Gerar link público
  const linkResponse = await fetch(
    `${DASHBOARD_API}/api/public/generate-token/${alert.user_id}`
  );
  const { publicUrl } = await linkResponse.json();
  
  // 6. Send WhatsApp
  await sendWhatsApp(alert.user_id, `
🔥 PARABÉNS! 7 DIAS CONSECUTIVOS!

Você é INCRÍVEL! Veja suas conquistas: ${publicUrl}

Continue assim! 💪
  `);
}
```

### 6. Trial Acabando

**Quando:** Trial acaba em 24h

```javascript
// N8N Workflow

// 1. Schedule: Todo dia às 10h
// Cron: 0 10 * * *

// 2. HTTP Request: Buscar alertas
const response = await fetch(`${DASHBOARD_API}/api/alerts`);
const alerts = await response.json();

// 3. Filter: Apenas "trial_ending"
const trialAlerts = alerts.filter(a => a.type === 'trial_ending');

// 4. Loop: Para cada trial acabando
for (const alert of trialAlerts) {
  // 5. HTTP Request: Buscar dados do usuário
  const userResponse = await fetch(
    `${DASHBOARD_API}/api/users/${alert.user_id}`
  );
  const user = await userResponse.json();
  
  // 6. HTTP Request: Gerar link público
  const linkResponse = await fetch(
    `${DASHBOARD_API}/api/public/generate-token/${alert.user_id}`
  );
  const { publicUrl } = await linkResponse.json();
  
  // 7. Send WhatsApp
  await sendWhatsApp(alert.user_id, `
⏰ Seu trial acaba em 24 horas!

Você já fez ${user.total_analyses} análises e conquistou muito!

Veja tudo: ${publicUrl}

Não perca seu progresso! Faça upgrade para Premium.

Responda "premium" para saber mais.
  `);
}
```

### 7. Usuário Pede Wrapped

**Quando:** Usuário digita "wrapped" ou "relatório"

```javascript
// N8N Workflow

// 1. Trigger: Webhook de mensagem recebida
// POST /webhook/message-received
// Body: { user_id, message }

// 2. Condition: message contém "wrapped" ou "relatório"
if (message.toLowerCase().includes('wrapped') || 
    message.toLowerCase().includes('relatório')) {
  
  // 3. Get current date
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  // 4. HTTP Request: Gerar wrapped
  const response = await fetch(
    `${DASHBOARD_API}/api/wrapped/generate/${user_id}/${year}/${lastMonth}`
  );
  const { wrappedUrl } = await response.json();
  
  // 5. Send WhatsApp
  await sendWhatsApp(user_id, `
🎉 Aqui está seu Wrapped!

${wrappedUrl}

Veja suas conquistas e compartilhe! 💪
  `);
}
```

## 📋 Endpoints Disponíveis

### Analytics
```
GET /api/analytics/metrics
→ Métricas gerais do sistema

GET /api/analytics/activity
→ Atividade por período
```

### Users
```
GET /api/users
→ Lista todos usuários

GET /api/users/:id
→ Detalhes de um usuário
```

### Alerts
```
GET /api/alerts
→ Lista todos alertas ativos

Tipos de alerta:
- trial_ending: Trial acabando
- inactive_user: Usuário inativo
- limit_reached: Limite atingido
- milestone: Milestone alcançado
- error: Erro do sistema
```

### Public Profile
```
GET /api/public/generate-token/:userId
→ Gera link público do perfil

Response:
{
  "userId": "6642536591",
  "token": "a1b2c3d4e5f6g7h8",
  "publicUrl": "https://dashboard.com/u/a1b2c3d4e5f6g7h8"
}
```

### Wrapped
```
GET /api/wrapped/generate/:userId/:year/:month
→ Gera link do wrapped mensal

Response:
{
  "userId": "6642536591",
  "token": "a1b2c3d4e5f6g7h8",
  "wrappedUrl": "https://dashboard.com/wrapped/a1b2c3d4e5f6g7h8/2025/11",
  "year": 2025,
  "month": 11
}
```

## 🔧 Configuração

### 1. Variáveis de Ambiente no N8N

```env
DASHBOARD_API=https://api-nutria.seu-dominio.com
DASHBOARD_FRONTEND=https://dashboard-nutria.seu-dominio.com
```

### 2. Credenciais (Opcional)

Se quiser proteger os endpoints:

```javascript
// No N8N, adicionar header
headers: {
  'Authorization': 'Bearer SEU_TOKEN_SECRETO'
}

// No dashboard, validar
if (req.headers.authorization !== `Bearer ${process.env.N8N_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

## 📊 Monitoramento

### Logs no N8N

```javascript
// Adicionar em cada workflow
console.log('Workflow executado:', {
  workflow: 'send-wrapped',
  users_processed: users.length,
  timestamp: new Date()
});
```

### Métricas para Acompanhar

1. **Taxa de Envio**: Quantos links foram enviados
2. **Taxa de Abertura**: Quantos usuários clicaram
3. **Taxa de Conversão**: Quantos fizeram upgrade
4. **Erros**: Quantos envios falharam

## 🚨 Tratamento de Erros

```javascript
try {
  const response = await fetch(`${DASHBOARD_API}/api/wrapped/generate/${user_id}/${year}/${month}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  // Processar...
  
} catch (error) {
  console.error('Erro ao gerar wrapped:', error);
  
  // Enviar notificação para admin
  await sendWhatsApp(ADMIN_ID, `
⚠️ Erro ao gerar wrapped para usuário ${user_id}:
${error.message}
  `);
}
```

## 💡 Dicas

1. **Use Schedule Triggers** para automações recorrentes
2. **Use Webhooks** para ações em tempo real
3. **Adicione delays** entre envios para não sobrecarregar
4. **Monitore logs** para detectar problemas
5. **Teste com poucos usuários** antes de enviar para todos

## 🔮 Próximas Integrações

- [ ] Webhook quando usuário faz análise
- [ ] Webhook quando usuário responde follow-up
- [ ] Webhook quando usuário faz upgrade
- [ ] API para criar alertas customizados
- [ ] API para enviar notificações push
