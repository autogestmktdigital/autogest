# Deploy Evolution API no Railway

## Passo a passo

### 1. Criar projeto no Railway
- Acesse https://railway.app
- Crie um novo projeto
- Escolha "Deploy from GitHub repo"
- Selecione o repositório autogest

### 2. Configurar variáveis de ambiente
No painel do Railway, adicione:

```
DATABASE_URL=postgresql://... (criar banco PostgreSQL no Railway)
REDIS_URL=redis://... (criar Redis no Railway)
EVOLUTION_API_KEY=chave-secreta-aleatoria-aqui
SERVER_URL=https://seu-app.up.railway.app
```

### 3. Adicionar banco de dados
- Clique em "New" → Database → Add PostgreSQL
- Clique em "New" → Database → Add Redis

### 4. Deploy
- O Railway vai detectar o Dockerfile automaticamente
- Aguarde o deploy

### 5. Acessar
- URL: https://seu-app.up.railway.app
- API Key: a definida em EVOLUTION_API_KEY

## Conectar com Typebot

1. Acesse o manager do Evolution API
2. Crie uma instância
3. Configure o webhook para o Typebot
4. Escaneie o QR Code

## Endpoints importantes

- Manager UI: https://seu-app.up.railway.app/manager
- API: https://seu-app.up.railway.app
- Health check: GET /