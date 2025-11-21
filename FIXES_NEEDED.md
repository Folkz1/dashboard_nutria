# 🔧 Correções Necessárias no Dashboard

## Problemas Encontrados

### 1. ❌ Nome de Tabela Incorreto
**Problema:** O código usa `daily_analyses` mas a tabela real é `food_analyses`

**Arquivos afetados:**
- `routes/analytics.js`
- `routes/users.js`
- `routes/public.js`
- `routes/wrapped.js`
- `routes/alerts.js`

**Correção:** Substituir todas as referências de `daily_analyses` por `food_analyses`

### 2. ❌ Campos Diferentes na Tabela food_analyses

**Campos que existem:**
- `id`
- `user_id`
- `product_name`
- `ocr_text`
- `ingredients`
- `nutrition_data` (jsonb)
- `analysis_result`
- `alerts` (array)
- `score`
- `feedback`
- `analyzed_at`
- `created_at`

**Campos que o código espera mas NÃO existem:**
- `main_alerts` → Usar `alerts` (é um array)

**Correção:** Ajustar queries para usar os campos corretos

### 3. ❌ Estrutura do n8n_chat

**Problema:** O código tenta extrair `user_id` do campo `message`, mas:
- `session_id` JÁ É o `user_id`
- `message` é um JSONB com estrutura: `{type, content, ...}`

**Correção:** Usar `session_id` como `user_id` diretamente

### 4. ❌ Campos da Tabela users

**Campos que o código espera mas têm nomes diferentes:**
- `trial_start_date` → `trial_start`
- `trial_end_date` → `trial_end`

**Correção:** Ajustar queries para usar os nomes corretos

### 5. ⚠️ Campos Calculados

**Problema:** O código calcula alguns campos que não existem:
- `total_analyses` → Precisa contar de `food_analyses`
- `avg_score` → Precisa calcular média de `food_analyses.score`
- `followups_sent` → Precisa contar de `followup_logs`
- `followups_responded` → Precisa contar de `followup_logs WHERE user_responded = true`

## Correções Aplicadas

### ✅ 1. Corrigir routes/analytics.js

```javascript
// ANTES
FROM daily_analyses

// DEPOIS
FROM food_analyses
```

### ✅ 2. Corrigir routes/users.js

```javascript
// ANTES
SELECT 
  u.id as user_id,
  u.name,
  u.subscription,
  u.state,
  u.consecutive_days,
  u.daily_analyses,
  u.last_interaction,
  u.trial_start_date,
  u.trial_end_date,
  COUNT(da.id) as total_analyses,
  AVG(da.score) as avg_score,
  da.main_alerts
FROM users u
LEFT JOIN daily_analyses da ON u.id = da.user_id

// DEPOIS
SELECT 
  u.id as user_id,
  u.name,
  u.subscription,
  u.state,
  u.consecutive_days,
  u.daily_analyses,
  u.last_interaction,
  u.trial_start,
  u.trial_end,
  COUNT(fa.id) as total_analyses,
  AVG(fa.score) as avg_score,
  ARRAY_TO_STRING(fa.alerts, ', ') as main_alerts
FROM users u
LEFT JOIN food_analyses fa ON u.id = fa.user_id
```

### ✅ 3. Corrigir routes/conversations.js

```javascript
// ANTES
SELECT 
  user_id,
  message->>'content' as content,
  message->>'type' as role
FROM n8n_chat

// DEPOIS
SELECT 
  session_id as user_id,
  message->>'content' as content,
  message->>'type' as role
FROM n8n_chat
```

### ✅ 4. Corrigir routes/public.js

```javascript
// ANTES
FROM daily_analyses
WHERE user_id = $1

// DEPOIS
FROM food_analyses
WHERE user_id = $1
```

### ✅ 5. Corrigir routes/wrapped.js

```javascript
// ANTES
FROM daily_analyses
WHERE user_id = $1
  AND created_at >= $2
  AND created_at <= $3

// DEPOIS
FROM food_analyses
WHERE user_id = $1
  AND created_at >= $2
  AND created_at <= $3
```

### ✅ 6. Corrigir routes/alerts.js

```javascript
// ANTES
FROM daily_analyses da

// DEPOIS
FROM food_analyses fa
```

## Resumo das Mudanças

| Antes | Depois |
|-------|--------|
| `daily_analyses` | `food_analyses` |
| `da.main_alerts` | `ARRAY_TO_STRING(fa.alerts, ', ')` |
| `trial_start_date` | `trial_start` |
| `trial_end_date` | `trial_end` |
| `message->>'user_id'` | `session_id as user_id` |
| `da.created_at` | `fa.created_at` |

## Testes Necessários

Após aplicar as correções, testar:

1. ✅ GET /api/users - Lista de usuários
2. ✅ GET /api/analytics/metrics - Métricas gerais
3. ✅ GET /api/conversations/recent - Conversas recentes
4. ✅ GET /api/alerts - Alertas
5. ✅ GET /api/public/user/:token - Perfil público
6. ✅ GET /api/wrapped/:token/:year/:month - Wrapped mensal

## Queries de Teste

```sql
-- Testar contagem de análises
SELECT user_id, COUNT(*) as total
FROM food_analyses
GROUP BY user_id;

-- Testar score médio
SELECT user_id, AVG(score) as avg_score
FROM food_analyses
GROUP BY user_id;

-- Testar conversas
SELECT session_id as user_id, COUNT(*) as total_messages
FROM n8n_chat
GROUP BY session_id;

-- Testar follow-ups
SELECT user_id, 
  COUNT(*) as total_sent,
  SUM(CASE WHEN user_responded THEN 1 ELSE 0 END) as total_responded
FROM followup_logs
GROUP BY user_id;
```
