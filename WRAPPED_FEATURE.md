# 🎉 NutrIA Wrapped - Relatório Mensal Compartilhável

## O que é?

Inspirado no Spotify Wrapped, é um relatório visual e compartilhável que mostra o progresso do usuário no mês. Perfeito para engajamento e viralização!

## 🎨 O que o usuário vê?

### Slides Animados (Estilo Stories)

1. **Intro** 🥗
   - Logo animado
   - Nome do usuário
   - Mês/Ano

2. **Total de Análises** 📊
   - Número grande e impactante
   - Comparação com mês anterior
   - Crescimento em %

3. **Score Médio** ⭐
   - Score visual
   - Frase motivacional personalizada

4. **Melhor Produto** 🏆
   - Nome do produto
   - Score recebido
   - Celebração

5. **Categorias Favoritas** 📈
   - Top 3 categorias mais analisadas
   - Quantidade de cada

6. **Dias Ativos** 🔥
   - Total de dias que usou
   - Mensagem de consistência

7. **Ranking** 🎯
   - Percentil entre todos usuários
   - "Top X% dos usuários"

8. **Conquistas** 🏆
   - Badges desbloqueados no mês
   - Descrição de cada

9. **Final** 🎉
   - Mensagem motivacional
   - Botões de compartilhar
   - Link para perfil completo

## 🔗 Como Funciona?

### URL do Wrapped
```
https://dashboard-nutria.com/wrapped/TOKEN/2025/11
```

Onde:
- `TOKEN`: Token único do usuário
- `2025`: Ano
- `11`: Mês (1-12)

### Gerar Link

**Opção 1: Via API**
```bash
GET /api/wrapped/generate/:userId/:year/:month

Response:
{
  "userId": "6642536591",
  "token": "a1b2c3d4e5f6g7h8",
  "wrappedUrl": "https://dashboard-nutria.com/wrapped/a1b2c3d4e5f6g7h8/2025/11",
  "year": 2025,
  "month": 11
}
```

**Opção 2: Via Dashboard Admin**
- Ir em "Usuários"
- Clicar em usuário
- Botão "📊 Gerar Wrapped do Mês"

## 🤖 Integração com N8N

### Cenário 1: Envio Automático (Todo dia 1º do mês)

```javascript
// Workflow N8N - Executar todo dia 1º às 10h

// 1. Schedule Trigger
// Cron: 0 10 1 * *

// 2. Get All Active Users
const users = await query(`
  SELECT user_id, name 
  FROM users 
  WHERE subscription IN ('trial', 'premium')
    AND last_interaction >= NOW() - INTERVAL '30 days'
`);

// 3. Para cada usuário
for (const user of users) {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  // Gerar link do wrapped
  const response = await fetch(
    `${API_URL}/api/wrapped/generate/${user.user_id}/${year}/${lastMonth}`
  );
  const { wrappedUrl } = await response.json();
  
  // Enviar via WhatsApp
  await sendWhatsApp(user.user_id, `
🎉 ${user.name}, seu NutrIA Wrapped está pronto!

Veja como foi seu mês de análises: ${wrappedUrl}

Compartilhe com seus amigos! 💚
  `);
}
```

### Cenário 2: Envio Manual (Quando admin quiser)

```javascript
// Webhook N8N: /webhook/send-wrapped

// Recebe:
{
  "user_id": "6642536591",
  "year": 2025,
  "month": 11
}

// Gera e envia
const { wrappedUrl } = await fetch(
  `${API_URL}/api/wrapped/generate/${user_id}/${year}/${month}`
).then(r => r.json());

await sendWhatsApp(user_id, `
🎊 Seu NutrIA Wrapped está pronto!
${wrappedUrl}
`);
```

### Cenário 3: Usuário Pede (Via conversa)

```javascript
// No chat, usuário digita: "quero ver meu wrapped"

// Bot detecta intenção
if (message.includes('wrapped') || message.includes('relatório mensal')) {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  const { wrappedUrl } = await fetch(
    `${API_URL}/api/wrapped/generate/${user_id}/${year}/${lastMonth}`
  ).then(r => r.json());
  
  return `
🎉 Aqui está seu Wrapped!

${wrappedUrl}

Veja suas conquistas e compartilhe! 💪
  `;
}
```

## 📊 Dados Mostrados

### Estatísticas Principais
- Total de análises no mês
- Score médio
- Melhor e pior score
- Dias ativos
- Crescimento vs mês anterior

### Destaques
- Melhor produto (maior score)
- Pior produto (menor score)
- Top 3 categorias mais analisadas
- Alertas mais comuns
- Dia mais ativo

### Conquistas Automáticas
- 🏆 **Análise Diária**: 30+ análises
- ✅ **Escolhas Saudáveis**: Score médio ≥ 7
- 🔥 **Super Ativo**: 50+ análises
- 💪 **Consistência**: 20+ dias ativos

### Ranking
- Percentil entre todos usuários
- "Top X% dos usuários mais ativos"

## 🎨 Personalização

### Frases Motivacionais

Baseadas no score médio:

```javascript
if (avgScore >= 7) {
  'Você está fazendo escolhas incríveis! Continue assim! 🌟'
} else if (avgScore >= 5) {
  'Bom trabalho! Suas escolhas estão melhorando! 💪'
} else {
  'Vamos juntos melhorar suas escolhas! Você consegue! 🚀'
}
```

### Cores dos Slides

Cada slide tem gradiente único:
- Intro: Roxo → Azul → Verde
- Análises: Verde → Teal → Azul
- Score: Azul → Roxo → Rosa
- Melhor: Amarelo → Laranja → Vermelho
- Categorias: Índigo → Roxo → Rosa
- Dias: Teal → Verde → Esmeralda
- Ranking: Roxo → Rosa → Vermelho
- Conquistas: Amarelo → Âmbar → Laranja
- Final: Roxo → Azul → Verde

## 📱 Compartilhamento

### WhatsApp
```
🥗 Meu NutrIA Wrapped de Novembro!

✅ 45 análises
📊 Score médio: 7.2
🔥 23 dias ativos

Veja o meu: https://dashboard-nutria.com/wrapped/...
```

### Instagram Stories
- Usuário tira print da tela
- Compartilha nos stories
- Marca @nutria_oficial

### Futuro: Imagem Gerada
- Gerar imagem PNG do wrapped
- Download automático
- Otimizado para stories (1080x1920)

## 🎯 Casos de Uso

### 1. Engajamento Mensal
Enviar automaticamente todo dia 1º do mês

### 2. Reengajamento
Enviar para usuários inativos mostrando progresso passado

### 3. Conversão
Mostrar conquistas antes do trial acabar

### 4. Viralização
Usuários compartilham nas redes sociais

### 5. Gamificação
Competição saudável entre usuários

## 📈 Métricas para Acompanhar

1. **Taxa de Abertura**: % que clica no link
2. **Tempo na Página**: Quanto tempo ficam vendo
3. **Compartilhamentos**: Quantos compartilham
4. **Conversão**: Quantos fazem upgrade depois
5. **Viralização**: Novos usuários vindos de compartilhamentos

## 🔮 Próximas Melhorias

### Fase 2: Visual
- [ ] Animações entre slides
- [ ] Música de fundo (opcional)
- [ ] Efeitos de confete
- [ ] Modo escuro/claro

### Fase 3: Compartilhamento
- [ ] Gerar imagem PNG automaticamente
- [ ] Botão de download
- [ ] Compartilhar direto no Instagram
- [ ] Compartilhar no Facebook

### Fase 4: Personalização
- [ ] Escolher tema de cores
- [ ] Adicionar foto de perfil
- [ ] Mensagem personalizada do bot
- [ ] Comparação com amigos

### Fase 5: Analytics
- [ ] Tracking de visualizações
- [ ] Heatmap de slides mais vistos
- [ ] Taxa de compartilhamento
- [ ] Origem do tráfego

## 💡 Ideias Criativas

### Wrapped Especial de Fim de Ano
- Wrapped anual (Janeiro a Dezembro)
- Estatísticas do ano inteiro
- Evolução mês a mês
- Conquistas anuais

### Wrapped Semanal
- Mini-wrapped toda segunda-feira
- Resumo da semana passada
- Mais frequente = mais engajamento

### Wrapped Comparativo
- Comparar com mês anterior
- Comparar com média dos usuários
- Ranking entre amigos

### Wrapped Temático
- Wrapped de Verão (Dez-Fev)
- Wrapped de Bulking (Jun-Ago)
- Wrapped de Cutting (Mar-Mai)

## 🛠️ Implementação Técnica

### Backend
```javascript
// routes/wrapped.js
- GET /api/wrapped/:token/:year/:month
  → Retorna dados do wrapped
  
- GET /api/wrapped/generate/:userId/:year/:month
  → Gera link do wrapped
```

### Frontend
```javascript
// pages/Wrapped.jsx
- Slides animados
- Navegação entre slides
- Botões de compartilhamento
- Responsivo (mobile-first)
```

### Banco de Dados
Usa tabelas existentes:
- `users` - Dados do usuário
- `daily_analyses` - Análises do mês
- `n8n_chat` - Conversas (futuro)

### Performance
- Queries otimizadas
- Cache de 1 hora (dados não mudam)
- Lazy loading de slides
- Imagens otimizadas

## 🔐 Segurança

- Token único por usuário
- Dados públicos apenas
- Rate limiting (futuro)
- Sem dados sensíveis

## 📝 Exemplo Completo

```javascript
// 1. Dia 1º de Dezembro, 10h da manhã
// N8N executa workflow automático

// 2. Para cada usuário ativo
const users = await getActiveUsers();

for (const user of users) {
  // 3. Gerar wrapped de Novembro
  const wrapped = await fetch(
    `${API_URL}/api/wrapped/generate/${user.id}/2025/11`
  ).then(r => r.json());
  
  // 4. Enviar via WhatsApp
  await sendWhatsApp(user.id, `
🎉 ${user.name}, seu NutrIA Wrapped de Novembro está pronto!

📊 Veja suas conquistas: ${wrapped.wrappedUrl}

Compartilhe com seus amigos e mostre seu progresso! 💪
  `);
}

// 5. Usuário clica no link
// 6. Vê slides animados com suas estatísticas
// 7. Compartilha no Instagram Stories
// 8. Amigos veem e se interessam pelo NutrIA
// 9. Novos usuários! 🚀
```

## 🎊 Mensagens Sugeridas

### Envio Automático
```
🎉 Seu NutrIA Wrapped está pronto!

Veja como foi seu [MÊS]:
[LINK]

Compartilhe suas conquistas! 💚
```

### Usuário Pediu
```
📊 Aqui está seu Wrapped!

[LINK]

Veja suas estatísticas e conquistas do mês! 🏆
```

### Reengajamento
```
Saudades! 😢

Lembra do seu progresso em [MÊS]?
[LINK]

Vamos continuar juntos? 💪
```

### Conversão
```
🔥 Você foi INCRÍVEL em [MÊS]!

Veja suas conquistas: [LINK]

Não perca seu progresso! Faça upgrade para Premium e continue evoluindo! 🚀
```
