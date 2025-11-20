# 📝 Comandos para Commit no Git

## Adicionar ao Repositório

```bash
# Voltar para raiz do projeto
cd ..

# Adicionar todos os arquivos do dashboard
git add dashboard-nutria/

# Verificar o que será commitado
git status

# Fazer commit
git commit -m "feat: adiciona dashboard NutrIA completo com analytics e wrapped

- Dashboard com 4 páginas (Visão Geral, Usuários, Conversas, Alertas)
- Backend Node.js + Express + PostgreSQL + WebSocket
- Frontend React + Vite + TailwindCSS
- Métricas em tempo real
- Engagement score automático
- Sistema de alertas inteligente
- 🆕 Perfil público do usuário (compartilhável)
- 🆕 Wrapped mensal estilo Spotify (compartilhável)
- 🆕 Integração completa com N8N
- Pronto para deploy no Easypanel
- Documentação completa"

# Enviar para GitHub
git push origin main
```

## Verificar no GitHub

Após o push, verifique se apareceu:

```
dashboard-nutria/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── DEPLOY.md
├── QUICKSTART.md
├── setup.ps1
├── setup.sh
├── Dockerfile
├── docker-compose.yml
├── routes/
│   ├── analytics.js
│   ├── users.js
│   ├── conversations.js
│   └── alerts.js
├── services/
│   ├── database.js
│   └── realtime.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── Dockerfile
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── MetricCard.jsx
        │   ├── LiveActivity.jsx
        │   ├── AlertsPanel.jsx
        │   ├── ActivityChart.jsx
        │   ├── ConversationsMonitor.jsx
        │   └── UsersList.jsx
        └── pages/
            ├── Overview.jsx
            ├── UsersPage.jsx
            ├── Conversations.jsx
            └── Alerts.jsx
```

## Próximo Passo: Deploy no Easypanel

Depois do push, siga o guia: [DEPLOY.md](./DEPLOY.md)
