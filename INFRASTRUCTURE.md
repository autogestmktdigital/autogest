# Infraestrutura do Projeto - Autogest / Brothers Multimarcas

> Documento criado em: 31/07/2026
> Projeto: Sistema de gestão de veículos, vendas e atendimento via WhatsApp

---

## 1. Domínios

| Serviço | Provedor | Login/Tipo de Acesso |
|---------|----------|---------------------|
| Compra dos domínios | **GoDaddy** | Login Google |

**Domínios adquiridos:**
- (adicionar os domínios comprados aqui)

---

## 2. DNS / Hospedagem dos Domínios

| Serviço | Provedor | Login/Tipo de Acesso |
|---------|----------|---------------------|
| DNS / Nameservers | **Cloudflare** | Login Microsoft |

---

## 3. Repositório / Documentação do Código

| Serviço | Provedor | Observações |
|---------|----------|-------------|
| Repositório Git | **GitHub** | Código fonte do backend, frontend (admin) e site público |

**Repositório:** https://github.com/autogestmktdigital/autogest

---

## 4. IA de Desenvolvimento

| Serviço | Provedor | Uso |
|---------|----------|-----|
| Assistente de código | **Verdent** | Desenvolvimento, debug, deploy e manutenção do sistema |

---

## 5. Banco de Imagens / Assets

| Serviço | Provedor | Login/Tipo de Acesso | Uso |
|---------|----------|---------------------|-----|
| CDN de imagens | **Cloudinary** | Login Google | Upload e serviço de imagens dos veículos |

---

## 6. Hospedagem Backend (API + Banco)

| Serviço | Provedor | Login/Tipo de Acesso | Tecnologia |
|---------|----------|---------------------|------------|
| API + Servidor | **Railway** | Login Microsoft | Node.js + Prisma + PostgreSQL |

**URL da API:** https://autogest-production-404d.up.railway.app/api

---

## 7. Hospedagem Frontend

| Serviço | Provedor | Login/Tipo de Acesso | Projeto |
|---------|----------|---------------------|---------|
| Painel Administrativo | **Vercel** | Login Microsoft | Admin (Next.js) |
| Site Público | **Vercel** | Login Microsoft | Site institucional + estoque (Next.js) |

---

## 8. IA Utilizada no Projeto (OpenAI)

| Serviço | Provedor | Login/Tipo de Acesso | Uso |
|---------|----------|---------------------|-----|
| API de IA | **OpenAI** | Login Google | (adicionar uso específico, ex: geração de resumos, análise de leads, etc.) |

---

## 9. Bot de Atendimento (WhatsApp)

| Serviço | Provedor | Uso |
|---------|----------|-----|
| Fluxo conversacional | **Typebot** | Bot de atendimento automático no WhatsApp |

**URL do fluxo:** https://typebot.co/brothers-multimarcas-v-2-9-iknk9xg

---

## 10. WhatsApp (API Oficial)

| Serviço | Provedor | Uso |
|---------|----------|-----|
| API Oficial do WhatsApp | **Meta** | Envio e recebimento de mensagens oficiais |

---

## 11. Serviços Criados mas NÃO Utilizados

| Serviço | Provedor | Status | Observação |
|---------|----------|--------|------------|
| Evolution API | - | **Inativo** | Criado em versão anterior, não está em uso atualmente |

---

## 12. Contas de E-mail / Acesso

| Serviço | Tipo de Login | Observações |
|---------|--------------|-------------|
| GoDaddy | Google | Domínios |
| Cloudflare | Microsoft | DNS |
| Railway | Microsoft | Backend |
| Vercel | Microsoft | Frontend |
| OpenAI | Google | API de IA |
| Cloudinary | Google | Imagens |

---

## 13. Variáveis de Ambiente Importantes

| Variável | Local | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | Railway | Conexão com PostgreSQL |
| `JWT_SECRET` | Railway | Segredo para tokens de autenticação |
| `CLOUDINARY_CLOUD_NAME` | Railway | Nome da conta Cloudinary |
| `CLOUDINARY_API_KEY` | Railway | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | Railway | Secret do Cloudinary |
| `OPENAI_API_KEY` | Railway | Chave da API OpenAI |
| `META_WHATSAPP_TOKEN` | Railway | Token da API Oficial do WhatsApp |
| `META_PHONE_NUMBER_ID` | Railway | ID do número de telefone no WhatsApp Business |
| `TYPEBOT_WEBHOOK_URL` | Railway | URL do webhook do Typebot |

---

## Checklist - O que falta documentar?

- [ ] Número de telefone do WhatsApp Business oficial
- [ ] ID da conta Meta / WhatsApp Business
- [ ] Nome exato dos domínios comprados no GoDaddy
- [ ] URLs finais do admin e site na Vercel
- [ ] Uso específico da OpenAI no projeto
- [ ] Backup do banco de dados (Railway faz automaticamente?)
- [ ] Custo mensal estimado de cada serviço

---

*Última atualização: 31/07/2026*
