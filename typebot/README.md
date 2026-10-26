# Typebot Self-Hosted - Railway

Guia para subir o Typebot self-hosted no Railway, substituindo o Typebot cloud pago.

## Serviços necessários

No Railway, crie um **novo projeto** chamado `typebot` (ou use um existente) e adicione:

| Serviço | Imagem Docker | Função |
|---------|--------------|--------|
| `typebot-builder` | `baptistearno/typebot-builder:latest` | Painel de criação de bots |
| `typebot-viewer` | `baptistearno/typebot-viewer:latest` | Endpoint que executa os bots |
| `postgres-typebot` | PostgreSQL (Railway addon) | Banco de dados do Typebot |
| `redis-typebot` | Redis (Railway addon) | Fila/cache do Typebot |

## Passo a passo

### 1. Criar banco PostgreSQL
1. No projeto Railway, clique em **New** → **Database** → **PostgreSQL**
2. Nomeie como `postgres-typebot`
3. Copie a `DATABASE_URL` gerada

### 2. Criar Redis
1. Clique em **New** → **Database** → **Redis**
2. Nomeie como `redis-typebot`
3. Copie a `REDIS_URL` gerada

### 3. Configurar Cloudflare R2 (storage)

1. No Cloudflare, vá em **R2** → **Create bucket**
2. Nomeie como `typebot-storage`
3. Vá em **Manage R2 API Tokens** → **Create API token**
4. Permissões: **Object Read & Write**, bucket `typebot-storage`
5. Anote:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint` (algo como `https://xxxx.r2.cloudflarestorage.com`)

### 4. Subir o Builder

1. No Railway, clique em **New** → **Docker Image**
2. Imagem: `baptistearno/typebot-builder:latest`
3. Nome: `typebot-builder`
4. Vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://... (copie do postgres-typebot)
REDIS_URL=redis://... (copie do redis-typebot)

NEXTAUTH_URL=https://bot.seudominio.com
NEXT_PUBLIC_VIEWER_URL=https://view.seudominio.com

# Email para magic link (opcional, configure um SMTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=sua-senha-smtp
SMTP_FROM_EMAIL=Typebot <noreply@seudominio.com>

# Storage S3 (Cloudflare R2)
S3_ACCESS_KEY=seu-access-key-r2
S3_SECRET_KEY=seu-secret-key-r2
S3_BUCKET=typebot-storage
S3_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_SSL=true

# Encryption key (gere uma aleatória com 32 caracteres)
ENCRYPTION_SECRET=sua-chave-de-32-caracteres-aleatoria
```

5. Em **Settings** → **Networking**, gere um domínio público (ex: `typebot-builder-production.up.railway.app`)

### 5. Subir o Viewer

1. No Railway, clique em **New** → **Docker Image**
2. Imagem: `baptistearno/typebot-viewer:latest`
3. Nome: `typebot-viewer`
4. Vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://... (mesmo do builder)
REDIS_URL=redis://... (mesmo do builder)

NEXT_PUBLIC_VIEWER_URL=https://view.seudominio.com

# Storage S3 (mesmo do builder)
S3_ACCESS_KEY=seu-access-key-r2
S3_SECRET_KEY=seu-secret-key-r2
S3_BUCKET=typebot-storage
S3_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_SSL=true

ENCRYPTION_SECRET=mesma-chave-do-builder
```

5. Em **Settings** → **Networking**, gere um domínio público (ex: `typebot-viewer-production.up.railway.app`)

### 6. Configurar domínios no Cloudflare

No Cloudflare DNS, crie:

| Tipo | Nome | Alvo | Proxy |
|------|------|------|-------|
| CNAME | `bot` | `typebot-builder-production.up.railway.app` | Ativado |
| CNAME | `view` | `typebot-viewer-production.up.railway.app` | Ativado |

### 7. Migrar o fluxo do Typebot cloud

1. Acesse o Typebot cloud atual
2. Abra o bot e vá em **Share** → **Export**
3. Baixe o JSON do fluxo
4. Acesse o Typebot self-hosted (`https://bot.seudominio.com`)
5. Faça login com o email configurado
6. Crie um novo workspace
7. Vá em **Import** e suba o JSON exportado
8. Publique o bot e anote o **Public ID** (vai ser algo como `meu-bot-abc123`)

### 8. Atualizar o backend

No Railway, no serviço do backend, adicione/atualize as variáveis:

```env
TYPEBOT_API_URL=https://view.seudominio.com/api/v1
TYPEBOT_PUBLIC_ID=meu-bot-abc123
```

> **Nota**: No self-hosted, a URL pública é a do **viewer**, não do builder.

## Variáveis de ambiente do backend

O backend já está preparado para usar variáveis de ambiente. Basta configurar no Railway:

| Variável | Valor (exemplo) |
|----------|-----------------|
| `TYPEBOT_API_URL` | `https://view.seudominio.com/api/v1` |
| `TYPEBOT_PUBLIC_ID` | `meu-bot-abc123` |

## Checklist de migração

- [ ] PostgreSQL criado no Railway
- [ ] Redis criado no Railway
- [ ] Bucket R2 criado e API token gerado
- [ ] Builder deployado e acessível
- [ ] Viewer deployado e acessível
- [ ] DNS configurado no Cloudflare
- [ ] Fluxo exportado do Typebot cloud
- [ ] Fluxo importado no self-hosted e publicado
- [ ] Backend atualizado com `TYPEBOT_API_URL` e `TYPEBOT_PUBLIC_ID`
- [ ] Teste ponta a ponta: enviar mensagem no WhatsApp e verificar resposta do bot

## Referências

- [Typebot Self-Hosting Docs](https://docs.typebot.io/self-hosting/get-started)
- [Railway Docker Deploy](https://docs.railway.app/deploy/deployments)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
