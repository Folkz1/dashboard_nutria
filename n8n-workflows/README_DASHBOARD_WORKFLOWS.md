# 🔄 Workflows N8N para Dashboard NutrIA

Coleção de workflows prontos para automatizar ações do Dashboard NutrIA.

## 📦 Workflows Disponíveis

### 1. 🎉 Envio Automático de Wrapped Mensal
**Arquivo**: `dashboard_wrapped_mensal_automatico.json`

**O que faz**: Envia automaticamente o relatório mensal (Wrapped) para todos os usuários ativos todo dia 1º do mês às 10h.

**Quando usar**: Configurar uma vez e deixar rodando automaticamente.

**Frequência**: Mensal (dia 1º às 10h)

**Documentação**: [README_WRAPPED_AUTOMATICO.md](./README_WRAPPED_AUTOMATICO.md)

---

### 2. ⏰ Alertas de Trial Acabando
**Arquivo**: `dashboard_alertas_trial_acabando.json`

**O que faz**: Monitora usuários com trial acabando em 24h e envia mensagem personalizada com link do perfil público e oferta de upgrade.

**Quando usar**: Para aumentar conversão de trial para premium.

**Frequência**: Diária (10h da manhã)

**Mensagem enviada**:
```
⏰ João, seu trial acaba em 1 dia!

📊 Você já conquistou:
• 15 análises realizadas
• 7 dias consecutivos
• Score médio: 6.5/10

🎯 Veja todo seu progresso:
https://dashboard.com/u/abc123

💎 Não perca suas conquistas!
Faça upgrade para Premium.

Responda "premium" para saber mais.
```

---

## 🚀 Como Usar

### Passo 1: Importar no N8N

1. Abra seu N8N
2. Clique em **"+"** → **"Import from File"**
3. Selecione o arquivo `.json` do workflow
4. Clique em **"Import"**

### Passo 2: Configurar Credenciais

#### PostgreSQL

Todos os workflows precisam de acesso ao banco:

```
Host: 72.61.32.25
Port: 5432
Database: postgres
User: postgres
Password: 99d74b03160029761260
SSL: Desabilitado
```

#### Variáveis de Ambiente

Configure no N8N (Settings → Environment Variables):

```env
DASHBOARD_API=https://sua-api-dashboard.com
WHATSAPP_API=https://sua-api-whatsapp.com
```

### Passo 3: Criar Tabelas de Log (Opcional)

Para registrar execuções e monitorar:

```sql
-- Logs do Wrapped Mensal
CREATE TABLE IF NOT EXISTS wrapped_sends_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  wrapped_url TEXT,
  error_message TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Logs de Alertas de Trial
CREATE TABLE IF NOT EXISTS trial_alerts_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  days_left INTEGER,
  error_message TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_wrapped_sends_user ON wrapped_sends_log(user_id);
CREATE INDEX idx_wrapped_sends_date ON wrapped_sends_log(sent_at);
CREATE INDEX idx_trial_alerts_user ON trial_alerts_log(user_id);
CREATE INDEX idx_trial_alerts_date ON trial_alerts_log(sent_at);
```

### Passo 4: Ativar Workflows

1. Abra cada workflow importado
2. Clique no botão **"Active"** no canto superior direito
3. Pronto! Os workflows executarão automaticamente

## 📊 Monitoramento

### Ver Execuções no N8N

1. Vá em **"Executions"** no menu lateral
2. Filtre por nome do workflow
3. Veja logs detalhados de cada execução

### Consultar Logs no Banco

```sql
-- Wrapped enviados hoje
SELECT 
  user_id,
  sent_at,
  status,
  wrapped_url
FROM wrapped_sends_log 
WHERE DATE(sent_at) = CURRENT_DATE
ORDER BY sent_at DESC;

-- Taxa de sucesso do Wrapped (último mês)
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM wrapped_sends_log
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- Alertas de trial enviados hoje
SELECT 
  user_id,
  days_left,
  sent_at,
  status
FROM trial_alerts_log 
WHERE DATE(sent_at) = CURRENT_DATE
  AND alert_type = 'trial_ending'
ORDER BY sent_at DESC;

-- Usuários que receberam alerta mas não converteram
SELECT 
  tal.user_id,
  u.name,
  tal.sent_at,
  u.status
FROM trial_alerts_log tal
JOIN users u ON tal.user_id = u.user_id
WHERE tal.sent_at >= NOW() - INTERVAL '7 days'
  AND u.status = 'trial'
  AND u.trial_end_date < NOW();
```

## 🎯 Próximos Workflows (Roadmap)

### 3. 🔥 Celebrar Milestones
- Detecta quando usuário completa 7, 14, 30 dias consecutivos
- Envia mensagem de parabéns com conquistas
- Aumenta engajamento e retenção

### 4. 😴 Reengajamento de Inativos
- Detecta usuários inativos há 3+ dias
- Envia mensagem personalizada com progresso
- Tenta reativar antes do churn

### 5. 💰 Oportunidade de Upgrade
- Detecta quando usuário bate limite de análises
- Momento perfeito para oferecer premium
- Alta taxa de conversão

### 6. 🎁 Link Público após 3 Análises
- Primeira conquista do usuário
- Envia link do perfil público
- Aumenta engajamento inicial

### 7. 📊 Relatório Diário para Admin
- Resumo das métricas do dia
- Alertas importantes
- Enviado todo dia às 20h

## 🔧 Customização

### Alterar Horários

Edite o nó "Schedule Trigger" e mude o cron:

```
0 10 * * *    → Todo dia às 10h
0 9 * * *     → Todo dia às 9h
0 20 * * *    → Todo dia às 20h
0 10 * * 1    → Toda segunda às 10h
0 10 1 * *    → Dia 1º de cada mês às 10h
*/30 * * * *  → A cada 30 minutos
```

### Alterar Mensagens

Edite o nó "Code - Preparar Mensagem" e customize o texto:

```javascript
const message = `
🎉 Sua mensagem personalizada aqui!

Use variáveis: ${user.name}
Dados do usuário: ${user.total_analyses}

Link: ${publicData.publicUrl}
`;
```

### Filtrar Usuários

Edite queries SQL para mudar critérios:

```sql
-- Apenas premium
WHERE status = 'premium'

-- Apenas trial
WHERE status = 'trial'

-- Ativos nos últimos 7 dias
WHERE last_interaction >= NOW() - INTERVAL '7 days'

-- Com mais de 10 análises
WHERE total_analyses > 10
```

## 🚨 Troubleshooting

### Workflow não executa

- ✅ Verifique se está **Active**
- ✅ Confira o cron expression
- ✅ Veja logs em "Executions"

### Erro de conexão PostgreSQL

- ✅ Credenciais corretas?
- ✅ IP do servidor acessível?
- ✅ Firewall liberado?

### WhatsApp não envia

- ✅ API do WhatsApp funcionando?
- ✅ URL correta nas variáveis?
- ✅ Formato do telefone correto?

### API do Dashboard retorna erro

- ✅ Dashboard rodando?
- ✅ URL correta?
- ✅ Endpoints disponíveis?

## 📈 Métricas de Sucesso

Acompanhe estas métricas para medir efetividade:

### Wrapped Mensal
- **Taxa de Envio**: % de usuários que receberam
- **Taxa de Abertura**: % que clicaram no link
- **Taxa de Compartilhamento**: % que compartilharam
- **Engajamento pós-wrapped**: Análises nos 7 dias seguintes

### Alertas de Trial
- **Taxa de Conversão**: % que fizeram upgrade
- **Tempo até conversão**: Horas entre alerta e upgrade
- **Taxa de resposta**: % que responderam "premium"

## 💡 Boas Práticas

1. **Teste antes de ativar**: Execute manualmente primeiro
2. **Monitore logs**: Verifique execuções diariamente
3. **Ajuste horários**: Teste diferentes horários para melhor engajamento
4. **Personalize mensagens**: Teste variações de texto
5. **Respeite limites**: Não envie muitas mensagens por dia
6. **Trate erros**: Sempre registre falhas para análise

## 🔗 Integração com Dashboard

Estes workflows se integram perfeitamente com:

- **Dashboard Admin**: Visualize métricas em tempo real
- **API do Dashboard**: Endpoints prontos para uso
- **Banco PostgreSQL**: Mesma base de dados
- **Sistema de Alertas**: Usa alertas do dashboard

## 📞 Suporte

Problemas ou dúvidas?

1. Verifique a documentação de cada workflow
2. Consulte logs no N8N
3. Verifique tabelas de log no banco
4. Teste endpoints da API manualmente

## 📄 Licença

MIT - Use livremente no seu projeto NutrIA!

---

**Desenvolvido para o Dashboard NutrIA** 🥗
Automatize, monitore e cresça! 🚀
