# 🚀 Guia de Deploy no Easypanel

## Passo a Passo Completo

### 1. Preparar o Repositório

```bash
# Adicionar ao git
git add dashboard-nutria/
git commit -m "feat: adiciona dashboard NutrIA completo"
git push origin main
```

### 2. Criar Serviço Backend no Easypanel

1. **Criar Novo Projeto**
   - Nome: `nutria-dashboard`

2. **Adicionar Serviço (Backend)**
   - Tipo: `GitHub`
   - Repositório: Seu repositório
   - Branch: `main`
   - Build Path: `dashboard-nutria`

3. **Configurar Build**
   ```
   Build Command: npm install
   Start Command: npm start
   Port: 3000
   ```

4. **Variáveis de Ambiente**
   ```
   DATABASE_URL=postgresql://usuario:senha@host:5432/nutria
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://dashboard-nutria.seu-dominio.com
   ```

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build
   - Anote a URL da API (ex: `https://api-nutria.seu-dominio.com`)

### 3. Criar Serviço Frontend no Easypanel

1. **Adicionar Serviço (Frontend)**
   - Tipo: `GitHub`
   - Repositório: Mesmo repositório
   - Branch: `main`
   - Build Path: `dashboard-nutria/frontend`

2. **Configurar Build**
   ```
   Build Command: npm install && npm run build
   Start Command: npm run preview
   Port: 4173
   ```

3. **Variáveis de Ambiente**
   ```
   VITE_API_URL=https://api-nutria.seu-dominio.com
   ```

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build
   - Acesse a URL do dashboard

### 4. Configurar Domínios (Opcional)

**Backend:**
- Domínio: `api-nutria.seu-dominio.com`
- SSL: Ativar (Let's Encrypt automático)

**Frontend:**
- Domínio: `dashboard-nutria.seu-dominio.com`
- SSL: Ativar (Let's Encrypt automático)

### 5. Testar

1. Acesse o dashboard: `https://dashboard-nutria.seu-dominio.com`
2. Verifique se os dados estão carregando
3. Teste a navegação entre páginas
4. Verifique os alertas

## 🔧 Troubleshooting

### Erro de CORS

Se aparecer erro de CORS, verifique:

1. `FRONTEND_URL` está correto no backend
2. URL da API está correta no frontend

### Erro de Conexão com Banco

1. Verifique `DATABASE_URL`
2. Teste conexão:
   ```bash
   psql "postgresql://usuario:senha@host:5432/nutria"
   ```

### Frontend não carrega dados

1. Abra DevTools (F12)
2. Veja erros no Console
3. Verifique Network tab
4. Confirme que `VITE_API_URL` está correto

### Build falha

**Backend:**
```bash
# Teste local
cd dashboard-nutria
npm install
npm start
```

**Frontend:**
```bash
# Teste local
cd dashboard-nutria/frontend
npm install
npm run build
npm run preview
```

## 📊 Monitoramento

Após deploy, monitore:

1. **Logs do Backend**
   - Erros de conexão
   - Queries lentas
   - Erros de API

2. **Logs do Frontend**
   - Erros de build
   - Erros de runtime

3. **Performance**
   - Tempo de resposta da API
   - Tempo de carregamento do frontend

## 🔄 Atualizações

Para atualizar o dashboard:

```bash
# Fazer mudanças
git add .
git commit -m "feat: nova feature"
git push origin main

# Easypanel vai fazer redeploy automático
```

Ou manualmente no Easypanel:
1. Ir no serviço
2. Clicar em "Redeploy"

## 🎯 Checklist Pós-Deploy

- [ ] Backend está rodando
- [ ] Frontend está rodando
- [ ] Dados estão carregando
- [ ] Métricas estão corretas
- [ ] Usuários aparecem
- [ ] Conversas aparecem
- [ ] Alertas aparecem
- [ ] SSL está ativo
- [ ] Domínios configurados

## 💡 Dicas

1. **Use variáveis de ambiente** - Nunca commite credenciais
2. **Monitore logs** - Fique de olho em erros
3. **Teste antes** - Sempre teste local antes de fazer push
4. **Backup** - Faça backup do banco regularmente

## 🆘 Suporte

Se tiver problemas:

1. Verifique logs no Easypanel
2. Teste conexões manualmente
3. Verifique variáveis de ambiente
4. Teste local primeiro
