# 🎉 Workflow: Envio Automático de Wrapped Mensal

## 📋 Descrição

Este workflow automatiza o envio do **NutrIA Wrapped** (relatório mensal estilo Spotify) para todos os usuários ativos do sistema. Executa automaticamente todo dia 1º de cada mês às 10h da manhã.

## 🎯 O que faz

1. **Agenda**: Executa todo dia 1º do mês às 10h (cron: `0 10 1 * *`)
2. **Busca usuários**: Consulta PostgreSQL para pegar usuários ativos nos últimos 30 dias
3. **Calcula período**: Determina automaticamente o mês/ano anterior
4. **Gera links**: Chama API do dashboard para gerar link único do wrapped
5. **Envia WhatsApp**: Envia mensagem personalizada com o link
6. **Registra logs**: Salva sucesso/erro no banco de dados
7. **Resumo**: Gera relatório final da execução

## 🚀 Como Importar no N8N

### Passo 1: Importar o Workflow

1. Abra seu N8N
2. Clique em **"+"** → **"Import from File"**
3. Selecione o arquivo: `dashboard_wrapped_mensal_automatico.json`
4. Clique em **"Import"**

### Passo 2: Configurar Credenciais PostgreSQL

1. Clique no nó **"PostgreSQL - Buscar Usuários Ativos"**
2. Em **"Credential to connect with"**, clique em **"Create New"**
3. Preencha:
   - **Name**: `PostgreSQL NutrIA`
   - **Host**: `72.61.32.25`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: `99d74b03160029761260`
   - **SSL**: Desabilitado
4. Clique em **"Save"**
5. Repita para os outros nós PostgreSQL (ou selecione a mesma credencial)

### Passo 3: Configurar Variáveis de Ambiente

No N8N, vá em **Settings** → **Environment Variables** e adicione:

```env
DASHBOARD_API=https://sua-api-dashboard.com
WHATSAPP_API=https://sua-api-whatsapp.com
```

**Ou** edite diretamente nos nós HTTP Request:

- **Nó "HTTP Request - Gerar Link Wrapped"**:
  - URL: `https://sua-api-dashboard.com/api/wrapped/generate/{{ $json.user_id }}/{{ $json.year }}/{{ $json.month }}`

- **Nó "HTTP Request - Enviar WhatsApp"**:
  - URL: `https://sua-api-whatsapp.com/send`

### Passo 4: Criar Tabela de Logs (Opcional)

Execute no PostgreSQL para registrar os envios:

\`\`\`sql
CREATE TABLE IF NOT EXISTS wrapped_sends_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  wrapped_url TEXT,
  error_message TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wrapped_sends_user ON wrapped_sends_log(user_id);
CREATE INDEX idx_wrapped_sends_date ON wrapped_sends_log(sent_at);
\`\`\`

Se não quiser logs, pode remover os nós:
- "PostgreSQL - Log Envio Sucesso"
- "PostgreSQL - Log Erro"

### Passo 5: Ativar o Workflow

1. Clique no botão **"Active"** no canto superior direito
2. O workflow agora executará automaticamente todo dia 1º às 10h

## 🧪 Testar Manualmente

Para testar sem esperar o dia 1º:

1. Clique no nó **"Schedule Trigger"**
2. Clique em **"Execute Node"**
3. Ou mude temporariamente o cron para `*/5 * * * *` (a cada 5 minutos)

## 📊 Estrutura do Workflow

\`\`\`
Schedule Trigger (Dia 1º às 10h)
    ↓
PostgreSQL - Buscar Usuários Ativos
    ↓
Code - Calcular Mês Anterior
    ↓
Split In Batches (processar 1 por vez)
    ↓
HTTP Request - Gerar Link Wrapped
    ↓
Code - Preparar Mensagem WhatsApp
    ↓
HTTP Request - Enviar WhatsApp
    ↓ (sucesso)          ↓ (erro)
Wait 2 segundos    PostgreSQL - Log Erro
    ↓                    ↓
PostgreSQL - Log    (volta para Split)
    ↓
(volta para Split até processar todos)
    ↓
Code - Resumo Final
\`\`\`

## 📝 Mensagem Enviada

\`\`\`
🎉 *João, seu NutrIA Wrapped está pronto!*

Veja como foi seu novembro:
https://dashboard.com/wrapped/abc123/2025/11

📊 Suas conquistas te esperam!
💪 Compartilhe com seus amigos!

_Enviado automaticamente pelo Dashboard NutrIA_
\`\`\`

## ⚙️ Configurações Importantes

### Cron Expression

- **Atual**: `0 10 1 * *` (dia 1º às 10h)
- **Alternativas**:
  - `0 9 1 * *` - Dia 1º às 9h
  - `0 20 1 * *` - Dia 1º às 20h
  - `0 10 * * 1` - Toda segunda-feira às 10h (semanal)

### Delay Entre Envios

- **Atual**: 2 segundos
- **Recomendado**: 2-5 segundos para não sobrecarregar API do WhatsApp
- **Ajustar**: No nó "Wait - 2 segundos entre envios"

### Filtro de Usuários

Query atual busca usuários:
- Ativos nos últimos 30 dias
- Com status = 'active'

Para ajustar, edite o nó "PostgreSQL - Buscar Usuários Ativos":

\`\`\`sql
-- Apenas usuários premium
SELECT user_id, name, phone 
FROM users 
WHERE last_interaction >= NOW() - INTERVAL '30 days' 
  AND status = 'premium'

-- Apenas trials
WHERE status = 'trial'

-- Todos os usuários
WHERE status IN ('trial', 'premium', 'active')
\`\`\`

## 🔍 Monitoramento

### Ver Execuções

1. No N8N, vá em **"Executions"**
2. Filtre por workflow: "Dashboard NutrIA - Envio Automático Wrapped Mensal"
3. Veja logs de cada execução

### Consultar Logs no Banco

\`\`\`sql
-- Envios de hoje
SELECT * FROM wrapped_sends_log 
WHERE DATE(sent_at) = CURRENT_DATE
ORDER BY sent_at DESC;

-- Taxa de sucesso do último mês
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM wrapped_sends_log
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- Usuários que não receberam
SELECT u.user_id, u.name, u.phone
FROM users u
LEFT JOIN wrapped_sends_log wsl 
  ON u.user_id = wsl.user_id 
  AND DATE(wsl.sent_at) = CURRENT_DATE
WHERE u.status = 'active'
  AND wsl.id IS NULL;
\`\`\`

## 🚨 Tratamento de Erros

O workflow tem 2 caminhos:

1. **Sucesso**: Registra log e continua para próximo usuário
2. **Erro**: Registra erro e continua (não para o workflow)

Erros comuns:
- API do dashboard fora do ar → Registra erro
- WhatsApp API falha → Registra erro
- Usuário sem telefone → Pula usuário

## 💡 Melhorias Futuras

- [ ] Enviar notificação para admin com resumo
- [ ] Retry automático em caso de erro
- [ ] Filtrar usuários que já receberam hoje
- [ ] A/B test de mensagens
- [ ] Enviar em horários diferentes por timezone

## 🔗 Workflows Relacionados

Outros workflows úteis para o dashboard:

1. **Alertas de Trial Acabando** - Envia 24h antes
2. **Reengajamento de Inativos** - Envia após 3 dias
3. **Celebrar Milestones** - 7 dias consecutivos
4. **Link Público após 3 Análises** - Primeira conquista

## 📞 Suporte

Problemas? Verifique:

1. ✅ Credenciais PostgreSQL configuradas
2. ✅ Variáveis de ambiente corretas
3. ✅ APIs do dashboard e WhatsApp funcionando
4. ✅ Tabela de logs criada (se usar)
5. ✅ Workflow ativado

## 📄 Licença

MIT - Use livremente no seu projeto NutrIA!
