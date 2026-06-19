# AutoRevenda Bot - Vendedor Digital Multi-Canal

Bot vendedor digital com integração de IA para loja de veículos. Atende clientes via **WhatsApp**, **Instagram** e **Facebook Messenger** usando Typebot como motor conversacional e OpenAI para conversas inteligentes.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CANAIS DE ATENDIMENTO                 │
│  WhatsApp (nativo Typebot) │ Instagram │ Facebook        │
└──────────┬─────────────────┴─────┬─────┴────────────────┘
           │                       │
    ┌──────┴──────┐         ┌──────┴──────┐
    │   Typebot   │◄────────│  Channel    │
    │   Cloud     │         │  Bridge     │
    └──────┬──────┘         └─────────────┘
           │ webhooks
    ┌──────┴──────────────────────────────┐
    │          BACKEND API                │
    │  Veículos │ Leads │ Financiamento   │
    │  OpenAI   │ Follow-up │ Handoff     │
    └──────┬──────────────────────────────┘
           │
    ┌──────┴──────┐        ┌──────────────┐
    │   MySQL     │        │ Painel Admin │
    └─────────────┘        │  (Next.js)   │
                           └──────────────┘
```

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Backend API | Node.js + TypeScript + Express |
| ORM | Prisma |
| Banco de Dados | MySQL 8.0 |
| Painel Admin | Next.js 14 + Tailwind CSS |
| IA | OpenAI GPT-4o-mini |
| Chatbot Engine | Typebot Cloud |
| Canal WhatsApp | Meta Business API (via Typebot) |
| Canal Instagram/Facebook | Meta Graph API (via Channel Bridge) |

## Funcionalidades

- **Catálogo de Veículos** - Busca inteligente por modelo, marca, ano, preço
- **Captura de Leads** - Registro automático com dados do cliente
- **Simulação de Financiamento** - Cálculo tabela Price com taxa configurável
- **Conversa com IA** - Atendimento natural com OpenAI GPT
- **Transferência Humana** - Handoff para vendedor quando necessário
- **Follow-up Automático** - Mensagens de reengajamento programadas
- **Painel Administrativo** - CRUD de veículos, gestão de leads, dashboard

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Conta Typebot Cloud (Pro)
- Chave API OpenAI
- Conta Meta Business verificada (para produção)

## Setup Rápido

### 1. Clonar e configurar

```bash
git clone <repositório>
cd autorevenda-bot

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. Subir o banco de dados

```bash
docker-compose up -d
```

### 3. Backend API

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed    # Popula dados de exemplo
npm run dev        # Inicia em http://localhost:3001
```

### 4. Channel Bridge

```bash
cd channel-bridge
npm install
npm run dev        # Inicia em http://localhost:3002
```

### 5. Painel Admin

```bash
cd admin
npm install
npm run dev        # Inicia em http://localhost:3000
```

### 6. Configurar Typebot

Siga o guia completo em [`docs/TYPEBOT_FLOWS.md`](docs/TYPEBOT_FLOWS.md)

### 7. Configurar Meta Business

Siga o guia completo em [`docs/META_SETUP.md`](docs/META_SETUP.md)

## Acesso ao Painel Admin

Após o seed, use as credenciais padrão:

| Perfil | Email | Senha |
|---|---|---|
| Admin | admin@autorevenda.com | admin123 |
| Vendedor | vendedor@autorevenda.com | vendedor123 |

> ⚠️ **Altere as senhas em produção!**

## Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/change-password` | Alterar senha |
| POST | `/api/auth/users` | Criar usuário (admin) |
| GET | `/api/auth/users` | Listar usuários |

### Veículos
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/vehicles` | Listar veículos (com filtros) |
| GET | `/api/vehicles/:id` | Detalhes do veículo |
| POST | `/api/vehicles` | Criar veículo |
| PUT | `/api/vehicles/:id` | Atualizar veículo |
| DELETE | `/api/vehicles/:id` | Excluir veículo (admin) |
| PATCH | `/api/vehicles/:id/status` | Alterar status |

### Leads
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/leads` | Listar leads |
| GET | `/api/leads/stats` | Estatísticas |
| GET | `/api/leads/:id` | Detalhes do lead |
| PUT | `/api/leads/:id` | Atualizar lead |
| PATCH | `/api/leads/:id/status` | Alterar status |
| PATCH | `/api/leads/:id/assign` | Atribuir vendedor |

### Conversas
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/conversations/active` | Conversas ativas |
| GET | `/api/conversations/lead/:leadId` | Por lead |
| GET | `/api/conversations/:id/messages` | Mensagens |
| POST | `/api/conversations/:id/messages` | Enviar mensagem |
| PATCH | `/api/conversations/:id/handoff` | Handoff humano |
| PATCH | `/api/conversations/:id/close` | Fechar conversa |

### Financiamento
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/financing/simulate` | Simulação completa |
| POST | `/api/financing/quick` | Simulação rápida (sem auth) |

### Webhooks (Typebot)
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/webhook/search-vehicles` | Buscar veículos |
| POST | `/api/webhook/register-lead` | Registrar lead |
| POST | `/api/webhook/handoff` | Ativar handoff |
| POST | `/api/webhook/simulate-financing` | Simular financiamento |

## Estrutura do Projeto

```
autorevenda-bot/
├── backend/              # API principal (Express + Prisma)
│   ├── prisma/           # Schema e migrations
│   └── src/
│       ├── config/       # Configurações
│       ├── controllers/  # Controllers
│       ├── middleware/    # Auth, upload, errors
│       ├── routes/       # Rotas
│       ├── services/     # Lógica de negócio
│       ├── jobs/         # Cron jobs
│       └── server.ts     # Entrypoint
├── channel-bridge/       # Ponte Instagram/Facebook → Typebot
│   └── src/
│       ├── adapters/     # Normalizadores de mensagem
│       ├── webhooks/     # Handlers Meta webhook
│       └── server.ts     # Entrypoint
├── admin/                # Painel admin (Next.js)
│   └── src/
│       ├── app/          # Páginas (App Router)
│       ├── components/   # Componentes UI
│       └── lib/          # API client, utilitários
├── docs/                 # Documentação
│   ├── TYPEBOT_FLOWS.md  # Guia dos fluxos Typebot
│   └── META_SETUP.md     # Guia setup Meta Business
├── docker-compose.yml    # MySQL
└── .env.example          # Template de variáveis
```

## Deploy

### Opções recomendadas:

| Serviço | Opção | Custo estimado |
|---|---|---|
| Backend API | Railway / Render / VPS | $5-20/mês |
| Channel Bridge | Mesmo servidor do backend | Incluso |
| Painel Admin | Vercel (free tier) | Grátis |
| MySQL | PlanetScale / Railway | $5-10/mês |
| Typebot Cloud | Plano Pro | $39/mês |
| OpenAI API | Pay-as-you-go | ~$5-15/mês |

### Checklist de Deploy:
- [ ] Backend com HTTPS (necessário para webhooks Meta)
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Migrations do banco aplicadas
- [ ] CORS configurado para o domínio do admin
- [ ] Conta Meta Business verificada
- [ ] Webhooks apontando para URLs de produção
- [ ] Senhas padrão alteradas

## Licença

Projeto privado - Todos os direitos reservados.
