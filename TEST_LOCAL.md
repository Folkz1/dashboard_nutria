# 🧪 Teste Local

## Passo a Passo

### 1. Instalar Dependências

```powershell
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configurar .env

Crie `dashboard-nutria/.env`:

```env
DATABASE_URL=postgres://postgres:99d74b03160029761260@72.61.32.25:5432/postgres?sslmode=disable
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Build do Frontend

```powershell
# Opção 1: Script automático
.\build-frontend.ps1

# Opção 2: Manual
cd frontend
npm run build
cd ..
```

Isso cria `frontend/dist/` com os arquivos compilados.

### 4. Iniciar Servidor

```powershell
npm start
```

Você deve ver:
```
🚀 NutrIA Dashboard running on port 3000
📊 WebSocket server ready
🌐 Frontend: http://localhost:3000
🔌 API: http://localhost:3000/api
```

### 5. Testar

Abra no navegador:

**Frontend:**
```
http://localhost:3000/
```

**API:**
```
http://localhost:3000/api/users
```

**Health:**
```
http://localhost:3000/health
```

## Troubleshooting

### Frontend não carrega (tela branca)

1. Verifique se `frontend/dist/` existe
2. Verifique se tem `frontend/dist/index.html`
3. Veja o console do navegador (F12)

### CSS não carrega

1. Verifique se `frontend/dist/assets/` existe
2. Veja a aba Network no DevTools
3. Verifique se os arquivos CSS estão sendo servidos

### API não responde

1. Verifique DATABASE_URL no .env
2. Teste conexão com banco
3. Veja logs do servidor no terminal

### Erro de CORS

Se testar com frontend separado (npm run dev):
1. Frontend roda em http://localhost:5173
2. API roda em http://localhost:3000
3. Proxy do Vite cuida do CORS

## Desenvolvimento

Para desenvolvimento, rode separado:

**Terminal 1 - Backend:**
```powershell
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Frontend: http://localhost:5173 (com hot reload)
API: http://localhost:3000

## Build para Produção

```powershell
# Build frontend
npm run build

# Inicia servidor (serve frontend + API)
npm start
```

Tudo em: http://localhost:3000
