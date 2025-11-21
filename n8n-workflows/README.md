# 🔄 Workflows N8N para Dashboard NutrIA

Workflows prontos para automatizar ações do Dashboard usando o MCP FlowEngine.

## 📦 Workflows Disponíveis

### 1. 🎉 Envio Automático de Wrapped Mensal
**Arquivo**: `dashboard_wrapped_mensal_automatico.json`

Envia automaticamente o relatório mensal (Wrapped) para todos os usuários ativos todo dia 1º do mês às 10h.

### 2. ⏰ Alertas de Trial Acabando
**Arquivo**: `dashboard_alertas_trial_acabando.json`

Monitora usuários com trial acabando em 24h e envia mensagem personalizada com link do perfil público e oferta de upgrade.

## 🚀 Como Importar no N8N

1. Abra seu N8N
2. Clique em **"+"** → **"Import from File"**
3. Selecione o arquivo `.json` do workflow
4. Configure as credenciais PostgreSQL
5. Configure as variáveis de ambiente (DASHBOARD_API, WHATSAPP_API)
6. Ative o workflow

## 📚 Documentação Completa

Veja a documentação detalhada em `INTEGRATION_N8N.md` na raiz do projeto dashboard.
