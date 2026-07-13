# Guia de Deploy - AutoGest

Este guia vai te levar passo a passo para colocar o sistema no ar. Siga na ordem!

---

## ETAPA 1: Criar conta no GitHub e subir o código

### 1.1 Criar conta no GitHub
1. Acesse https://github.com
2. Clique em **"Sign up"** (Cadastrar)
3. Preencha com seu e-mail, senha e nome de usuário
4. Verifique seu e-mail

### 1.2 Criar repositório
1. Faça login no GitHub
2. Clique no botão **"+"** (canto superior direito) → **"New repository"**
3. Nome do repositório: `autogest`
4. Deixe como **"Public"** (ou Private se tiver conta paga)
5. NÃO marque "Add a README file"
6. Clique em **"Create repository"**

### 1.3 Subir o código

O GitHub vai mostrar uma tela com comandos. Você vai usar a opção **"...or push an existing repository from the command line"**.

Abra o terminal do Windows (Prompt de Comando ou PowerShell) e execute:

```bash
cd C:\Users\peter\.verdent\verdent-projects\ol-voc-ser-meu
```

Depois execute os comandos que o GitHub mostrou (vão ser algo assim):

```bash
git remote add origin https://github.com/SEU-USUARIO/autogest.git
git branch -M main
git push -u origin main
```

> **Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub!**

Quando pedir senha, use seu token de acesso pessoal do GitHub (não é a senha da conta).

---

## ETAPA 2: Deploy do Backend no Railway

### 2.1 Criar conta no Railway
1. Acesse https://railway.app
2. Clique em **"Start a New Project"** ou **"Login"**
3. Faça login com sua conta do GitHub

### 2.2 Criar banco de dados PostgreSQL
1. No dashboard do Railway, clique em **"New"** → **"Database"** → **"Add PostgreSQL"**
2. O Railway criará automaticamente o banco
3. Clique no serviço PostgreSQL que foi criado
4. Vá na aba **"Connect"**
5. Copie a **"Database URL"** (vai ser algo como `postgresql://...`)

### 2.3 Fazer deploy do backend
1. No Railway, clique em **"New"** → **"GitHub Repo"**
2. Selecione o repositório `autogest`
3. O Railway vai detectar o `Dockerfile` automaticamente
4. Antes de deployar, precisamos configurar as variáveis de ambiente

### 2.4 Configurar variáveis de ambiente
1. Clique no serviço do backend
2. Vá na aba **"Variables"**
3. Clique em **"New Variable"** e adicione uma por uma:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Cole a URL do PostgreSQL que copiou |
| `JWT_SECRET` | Gere uma senha forte em https://jwtsecret.com/generate |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | (ver Etapa 4) |
| `CLOUDINARY_API_KEY` | (ver Etapa 4) |
| `CLOUDINARY_API_SECRET` | (ver Etapa 4) |

4. Clique em **"Deploy"**

### 2.5 Rodar migrações do banco
1. No serviço do backend, clique nos **"..."** (três pontos) → **"View Logs"**
2. Depois clique em **"Shell"** (ou abra o console)
3. Execute:
   ```bash
   npx prisma migrate deploy
   ```

### 2.6 Criar usuário admin
Ainda no console do Railway, execute:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hash = await bcrypt.hash('sua-senha-forte', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@autogest.store',
      passwordHash: hash,
      role: 'admin',
      active: true,
    },
  });
  console.log('Admin criado:', user.email);
}
createAdmin();
"
```

### 2.7 Anote a URL do backend
O Railway vai te dar uma URL pública como:
```
https://autogest-api.up.railway.app
```

Anote essa URL! Você vai precisar dela nas próximas etapas.

---

## ETAPA 3: Criar conta no Cloudinary (imagens)

1. Acesse https://cloudinary.com
2. Clique em **"Sign Up for Free"**
3. Complete o cadastro
4. No dashboard, anote:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (clique em "Show" para revelar)
5. Volte no Railway e adicione essas 3 variáveis no backend

---

## ETAPA 4: Deploy do Admin no Vercel

### 4.1 Criar conta no Vercel
1. Acesse https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com sua conta do GitHub

### 4.2 Fazer deploy
1. No dashboard do Vercel, clique em **"Add New Project"**
2. Importe o repositório `autogest`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin`
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_API_URL`: URL do backend + `/api`
     - Exemplo: `https://autogest-api.up.railway.app/api`
5. Clique em **"Deploy"**

### 4.3 Configurar domínio customizado
1. No projeto do admin no Vercel, vá em **Settings** → **Domains**
2. Adicione: `brothers-admin.autogest.store`
3. O Vercel vai mostrar instruções de DNS

---

## ETAPA 5: Deploy do Site no Vercel

### 5.1 Fazer deploy
1. No Vercel, clique em **"Add New Project"**
2. Importe o MESMO repositório `autogest`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `site`
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_API_URL`: URL do backend + `/api`
     - Exemplo: `https://autogest-api.up.railway.app/api`
5. Clique em **"Deploy"**

### 5.2 Configurar domínio customizado
1. No projeto do site no Vercel, vá em **Settings** → **Domains**
2. Adicione: `www.brothersmultimarcas.com`
3. O Vercel vai mostrar instruções de DNS

---

## ETAPA 6: Configurar DNS no Cloudflare

### 6.1 Admin
No Cloudflare, crie um registro CNAME:
- **Nome**: `brothers-admin`
- **Alvo**: `cname.vercel-dns.com`
- **Proxy**: Desligado (DNS only)

### 6.2 Site
No Cloudflare, crie um registro CNAME:
- **Nome**: `www`
- **Alvo**: `cname.vercel-dns.com`
- **Proxy**: Desligado (DNS only)

### 6.3 Redirecionamento apex (opcional)
Para redirecionar `brothersmultimarcas.com` para `www.brothersmultimarcas.com`:

No Cloudflare, vá em **Rules** → **Redirect Rules**:
- **URL**: `brothersmultimarcas.com/*`
- **Para**: `https://www.brothersmultimarcas.com/$1`
- **Status**: 301

---

## ETAPA 7: Testar tudo

1. Acesse `https://brothers-admin.autogest.store`
2. Faça login com o admin que criou
3. Cadastre um veículo com foto
4. Acesse `https://www.brothersmultimarcas.com`
5. Verifique se o veículo aparece no site

---

## URLs Finais

| Serviço | URL |
|---------|-----|
| Admin | `https://brothers-admin.autogest.store` |
| Site público | `https://www.brothersmultimarcas.com` |
| API | `https://autogest-api.up.railway.app` |

---

## Precisa de ajuda?

Se travar em alguma etapa, me avise qual número da etapa e onde parou!
