# 🔗 Perfil Público do Usuário

## O que é?

Uma página pública onde cada usuário pode ver seu próprio progresso no NutrIA, sem precisar fazer login. Perfeito para compartilhar via WhatsApp!

## Como funciona?

### 1. Gerar Link Público

**No Dashboard Admin:**
1. Vá em "Usuários"
2. Clique em "Ver detalhes" de um usuário
3. Clique no botão "🔗 Link Público"
4. O link é gerado e copiado automaticamente!

**Exemplo de link:**
```
https://dashboard-nutria.com/u/a1b2c3d4e5f6g7h8
```

### 2. Enviar para o Usuário

Você pode enviar o link via:
- WhatsApp (direto do bot)
- Follow-up automático
- Mensagem manual

**Exemplo de mensagem:**
```
🎉 Diego, veja seu progresso no NutrIA!

Acesse: https://dashboard-nutria.com/u/a1b2c3d4e5f6g7h8

Você vai ver:
✅ Seus dias consecutivos
✅ Todas as análises feitas
✅ Suas conquistas
✅ Seu score médio

Continue assim! 💪
```

## O que o usuário vê?

### 📊 Estatísticas Principais
- **Dias Consecutivos**: Streak atual
- **Análises Feitas**: Total de produtos analisados
- **Score Médio**: Qualidade dos produtos escolhidos

### 🏆 Conquistas Desbloqueadas
- 🔥 **Streak Master**: 7+ dias consecutivos
- 🔍 **Detetive Nutricional**: 10+ análises
- 🏆 **Expert em Rótulos**: 50+ análises
- ✅ **Escolhas Saudáveis**: Score médio alto
- ⚠️ **Alerta Vermelho**: Score médio baixo

### 📈 Gráfico de Atividade
- Últimos 30 dias
- Visualização de quando o usuário mais usa

### 🔍 Análises Recentes
- Últimas 10 análises
- Nome do produto
- Score recebido
- Alertas principais

### 🎁 Status do Trial
- Dias restantes (se trial)
- Badge Premium (se premium)

## Segurança

### Token Único
- Cada usuário tem um token único e permanente
- Gerado com: `MD5(user_id + secret)`
- Não expõe dados sensíveis
- Não permite edição, só visualização

### Dados Públicos
O que é mostrado:
- ✅ Nome
- ✅ Estatísticas de uso
- ✅ Análises feitas
- ✅ Conquistas

O que NÃO é mostrado:
- ❌ Telefone
- ❌ Conversas completas
- ❌ Dados pessoais sensíveis
- ❌ Informações de pagamento

## Integração com N8N

### Enviar Link Automaticamente

**Cenário 1: Após 3 análises**
```javascript
// No N8N, após detectar 3 análises
const userId = '6642536591';
const token = crypto.createHash('md5')
  .update(`${userId}-nutria-secret`)
  .digest('hex');
const link = `https://dashboard-nutria.com/u/${token}`;

// Enviar via WhatsApp
await sendWhatsApp(userId, `
🎉 Parabéns! Você já fez 3 análises!

Veja seu progresso: ${link}
`);
```

**Cenário 2: Trial acabando**
```javascript
// Quando trial está acabando
const link = await generatePublicLink(userId);

await sendWhatsApp(userId, `
⏰ Seu trial acaba em 2 dias!

Veja tudo que você já conquistou: ${link}

Não perca seu progresso! Faça upgrade para Premium.
`);
```

**Cenário 3: Milestone alcançado**
```javascript
// Quando usuário completa 7 dias
const link = await generatePublicLink(userId);

await sendWhatsApp(userId, `
🔥 7 DIAS CONSECUTIVOS! 

Você é INCRÍVEL! Veja suas conquistas: ${link}

Continue assim! 💪
`);
```

## API Endpoints

### Gerar Token
```bash
GET /api/public/generate-token/:userId

Response:
{
  "userId": "6642536591",
  "token": "a1b2c3d4e5f6g7h8",
  "publicUrl": "https://dashboard-nutria.com/u/a1b2c3d4e5f6g7h8"
}
```

### Buscar Dados Públicos
```bash
GET /api/public/user/:token

Response:
{
  "user": {
    "name": "Diego",
    "subscription": "trial",
    "memberSince": "2025-11-08",
    "consecutiveDays": 7,
    "trialDaysLeft": 5
  },
  "stats": {
    "totalAnalyses": 15,
    "totalConversations": 8,
    "avgScore": 6.5
  },
  "achievements": [...],
  "recentAnalyses": [...],
  "activityData": [...]
}
```

## Casos de Uso

### 1. Engajamento
Enviar link após milestones para celebrar conquistas

### 2. Conversão
Mostrar progresso antes do trial acabar para incentivar upgrade

### 3. Reengajamento
Lembrar usuário inativo do que ele já conquistou

### 4. Social Proof
Usuário pode compartilhar seu progresso nas redes sociais

### 5. Transparência
Mostrar que o bot está realmente ajudando

## Personalização

### Adicionar Novos Dados

Edite `routes/public.js`:
```javascript
// Adicionar nova métrica
const workoutCount = await query(`
  SELECT COUNT(*) FROM workout_logs WHERE user_id = $1
`, [userId]);

// Incluir na resposta
res.json({
  ...
  stats: {
    ...
    totalWorkouts: workoutCount.rows[0].count
  }
});
```

### Adicionar Nova Conquista

```javascript
// Em routes/public.js
if (stats.total_workouts >= 20) {
  achievements.push({
    icon: '💪',
    title: 'Fitness Master',
    description: '20+ treinos registrados'
  });
}
```

### Customizar Visual

Edite `frontend/src/pages/PublicProfile.jsx`:
- Cores
- Layout
- Componentes
- Animações

## Métricas para Acompanhar

1. **Taxa de Cliques**: Quantos usuários acessam o link
2. **Tempo na Página**: Quanto tempo ficam vendo
3. **Conversão**: Quantos fazem upgrade depois de ver
4. **Compartilhamentos**: Quantos compartilham nas redes

## Próximas Melhorias

- [ ] Botão de compartilhar nas redes sociais
- [ ] Comparação com média de outros usuários
- [ ] Ranking anônimo (top 10%, top 25%, etc)
- [ ] Gráficos mais detalhados
- [ ] Exportar progresso em PDF
- [ ] Metas personalizadas
- [ ] Badges animados

## Exemplo Completo

```javascript
// 1. Gerar link (uma vez)
const response = await fetch('http://api/public/generate-token/6642536591');
const { publicUrl } = await response.json();
// publicUrl = "https://dashboard-nutria.com/u/a1b2c3d4e5f6g7h8"

// 2. Salvar no banco (opcional)
await query(`
  UPDATE users 
  SET public_profile_url = $1 
  WHERE user_id = $2
`, [publicUrl, '6642536591']);

// 3. Enviar para usuário
await sendWhatsApp('6642536591', `
🎉 Diego, veja seu progresso!
${publicUrl}
`);

// 4. Usuário acessa e vê:
// - 7 dias consecutivos 🔥
// - 15 análises feitas 📊
// - Score médio 6.5/10
// - Conquistas desbloqueadas
// - Gráfico de atividade
// - Últimas análises
```

## Dicas

1. **Envie o link em momentos estratégicos**
   - Após conquistas
   - Antes do trial acabar
   - Quando usuário está inativo

2. **Use emojis na mensagem**
   - Chama mais atenção
   - Mais engajador

3. **Seja específico**
   - "Você tem 7 dias consecutivos!"
   - Não apenas "Veja seu progresso"

4. **Crie urgência**
   - "Seu trial acaba em 2 dias"
   - "Não perca suas conquistas"

5. **Celebre conquistas**
   - "🎉 Você é incrível!"
   - "💪 Continue assim!"
