# 🚀 Deploy Único (Backend + Frontend Juntos)

## Configuração no Easypanel

### 1. Configurações do Serviço

```yaml
Nome: nutria-dashboard
Repositório: Folkz1/dashboard_nutria
Branch: main
Build Path: . (raiz do projeto)
```

### 2. Build Commands

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Port:**
```
3000
```

### 3. Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgres://postgres:99d74b03160029761260@72.61.32.25:5432/postgres?sslmode=disable

# Server
PORT=3000
NODE_ENV=production

# CORS (mesma URL do serviço)
FRONTEND_URL=https://scrapers-dashboard-nutria.7exngm.easypanel.host
```

## O que acontece no build?

1. `npm install` - Instala dependências do backend
2. `npm run build` - Executa:
   - `cd frontend && npm install` - Instala dependências do frontend
   - `npm run build` - Compila o React para `frontend/dist`
3. `npm start` - Inicia o servidor que:
   - Serve a API em `/api/*`
   - Serve o frontend em `/*`

## URLs Finais

Tudo na mesma URL:

- **Frontend:** https://scrapers-dashboard-nutria.7exngm.easypanel.host/
- **API:** https://scrapers-dashboard-nutria.7exngm.easypanel.host/api/
- **Health:** https://scrapers-dashboard-nutria.7exngm.easypanel.host/health

## Estrutura de Rotas

```
/                    → Frontend (React SPA)
/users               → Frontend (React Router)
/conversations       → Frontend (React Router)
/alerts              → Frontend (React Router)
/u/:token            → Frontend (Perfil Público)
/wrapped/:token/:y/:m → Frontend (Wrapped)

/api/analytics       → Backend API
/api/users           → Backend API
/api/conversations   → Backend API
/api/alerts          → Backend API
/api/public          → Backend API
/api/wrapped         → Backend API
/health              → Backend Health Check
```

## Testando

Após o deploy:

1. **Health Check:**
   ```
   https://scrapers-dashboard-nutria.7exngm.easypanel.host/health
   ```
   Deve retornar: `{"status":"ok","timestamp":"..."}`

2. **API:**
   ```
   https://scrapers-dashboard-nutria.7exngm.easypanel.host/api/users
   ```
   Deve retornar lista de usuários

3. **Frontend:**
   ```
   https://scrapers-dashboard-nutria.7exngm.easypanel.host/
   ```
   Deve mostrar o dashboard

## Troubleshooting

### Erro 404 no frontend

Se o frontend não carregar:
1. Verifique se o build foi executado
2. Verifique se existe `frontend/dist/index.html`
3. Veja os logs do Easypanel

### Erro de CORS

Se aparecer erro de CORS:
1. Verifique se `FRONTEND_URL` está correto
2. Deve ser a mesma URL do serviço

### API não responde

1. Verifique `DATABASE_URL`
2. Teste conexão com banco
3. Veja logs do servidor

## Logs

Para ver logs no Easypanel:
1. Vá no serviço
2. Clique em "Logs"
3. Procure por:
   - `🚀 NutrIA Dashboard running on port 3000`
   - `📊 WebSocket server ready`
   - `🌐 Frontend: ...`
   - `🔌 API: ...`

## Redeploy

Para fazer redeploy após mudanças:

1. **Fazer commit no GitHub:**
   ```bash
   git add .
   git commit -m "feat: nova feature"
   git push origin main
   ```

2. **No Easypanel:**
   - Clique em "Redeploy"
   - Ou configure auto-deploy no GitHub webhook

## Performance

- Frontend é servido como arquivos estáticos (muito rápido)
- API responde na mesma URL (sem latência de CORS)
- WebSocket funciona normalmente
- Menos custos (1 serviço ao invés de 2)

## Próximos Passos

1. ✅ Deploy do serviço
2. ✅ Testar health check
3. ✅ Testar API
4. ✅ Testar frontend
5. ⏳ Configurar domínio customizado (opcional)
6. ⏳ Configurar SSL (automático no Easypanel)
7. ⏳ Integrar com N8N
