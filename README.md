# AutoGest - Sistema de Gestão Automotiva

Sistema completo para gestão de concessionárias e lojas de veículos, com controle de estoque, leads, conversas, follow-ups e site público.

## Estrutura do Projeto

```
├── backend/          # API Node.js + Express + Prisma
├── admin/            # Painel administrativo (Next.js)
└── site/             # Site público da loja (Next.js)
```

## Tecnologias

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Admin**: Next.js 16, React, TypeScript, Tailwind CSS
- **Site**: Next.js, React, TypeScript, Tailwind CSS
- **Deploy**: Railway (backend), Vercel (frontend), Cloudflare (DNS)

## Deploy

Veja os guias de deploy:
- [Backend - Railway](backend/RAILWAY_DEPLOY.md)
- [Frontend - Vercel](VERCEL_DEPLOY.md)

## Domínios

- **Admin**: `brothers-admin.autogest.store`
- **API**: `brothers-api.autogest.store`
- **Site**: `www.brothersmultimarcas.com`

## Funcionalidades

- Controle de estoque de veículos
- Gestão de leads e conversas
- Bot vendedor digital (WhatsApp/Messenger)
- Agendamento de retornos (follow-ups)
- Simulação de financiamento
- Controle de permissões (admin/vendedor)
- Site público com catálogo de veículos

## Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Admin
```bash
cd admin
npm install
npm run dev
```

### Site
```bash
cd site
npm install
npm run dev
```

## Variáveis de Ambiente

Copie os arquivos `.env.example` e preencha com seus valores:
- `backend/.env.example`

## Licença

Privado - Brothers Multimarcas
