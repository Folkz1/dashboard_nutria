-- Script para gerar links públicos para todos os usuários
-- Execute este script para ver os links de todos os usuários

SELECT 
  user_id,
  name,
  subscription,
  MD5(CONCAT(user_id, '-nutria-secret')) as token,
  CONCAT('https://dashboard-nutria.com/u/', MD5(CONCAT(user_id, '-nutria-secret'))) as public_url
FROM users
ORDER BY created_at DESC;

-- Exemplo de resultado:
-- user_id      | name  | subscription | token            | public_url
-- 6642536591   | Diego | trial        | a1b2c3d4e5f6g7h8 | https://dashboard-nutria.com/u/a1b2c3d4e5f6g7h8

-- Para salvar os links no banco (opcional):
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS public_token VARCHAR(32);
-- UPDATE users SET public_token = MD5(CONCAT(user_id, '-nutria-secret'));
