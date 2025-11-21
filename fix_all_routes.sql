-- Script para corrigir todas as referências no código
-- Execute este script para entender as mudanças necessárias

-- 1. Tabela correta é food_analyses (não daily_analyses)
SELECT 'food_analyses' as tabela_correta, COUNT(*) as total_registros
FROM food_analyses;

-- 2. Campos da tabela food_analyses
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'food_analyses'
ORDER BY ordinal_position;

-- 3. Campos da tabela users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 4. Estrutura do n8n_chat
-- session_id = user_id
-- message = jsonb com {type, content, ...}
SELECT 
  session_id as user_id,
  message->>'type' as role,
  message->>'content' as content,
  created_at
FROM n8n_chat
LIMIT 5;

-- 5. Teste de queries corrigidas

-- Contar análises por usuário
SELECT 
  user_id,
  COUNT(*) as total_analyses,
  AVG(score) as avg_score
FROM food_analyses
GROUP BY user_id;

-- Contar conversas por usuário
SELECT 
  session_id as user_id,
  COUNT(*) as total_messages
FROM n8n_chat
GROUP BY session_id;

-- Contar follow-ups por usuário
SELECT 
  user_id,
  COUNT(*) as total_sent,
  SUM(CASE WHEN user_responded THEN 1 ELSE 0 END) as total_responded
FROM followup_logs
GROUP BY user_id;

-- 6. Query completa de usuários (corrigida)
SELECT 
  u.id,
  u.name,
  u.subscription,
  u.state,
  u.consecutive_days,
  u.daily_analyses,
  u.last_interaction,
  u.trial_start,
  u.trial_end,
  COUNT(DISTINCT fa.id) as total_analyses,
  AVG(fa.score) as avg_score,
  COUNT(DISTINCT fl.id) as followups_sent,
  COUNT(DISTINCT CASE WHEN fl.user_responded THEN fl.id END) as followups_responded
FROM users u
LEFT JOIN food_analyses fa ON u.id = fa.user_id
LEFT JOIN followup_logs fl ON u.id = fl.user_id
GROUP BY u.id, u.name, u.subscription, u.state, u.consecutive_days, 
         u.daily_analyses, u.last_interaction, u.trial_start, u.trial_end;
