# Guia de Configuração da Conta Meta Business

Este guia detalha o processo completo para configurar a conta Meta Business necessária para integrar o bot com WhatsApp, Instagram e Facebook Messenger.

---

## 1. Criar Conta Meta Business

### 1.1 Acesse o Meta Business Suite
1. Vá para [business.facebook.com](https://business.facebook.com)
2. Clique em **"Criar Conta"**
3. Preencha:
   - Nome da empresa (ex: "AutoRevenda Veículos")
   - Seu nome
   - E-mail comercial
4. Confirme o e-mail recebido

### 1.2 Verificação do Negócio
> ⚠️ **Obrigatório** para usar a API do WhatsApp em produção.

1. No Business Suite, vá em **Configurações → Segurança → Verificação do negócio**
2. Prepare os documentos:
   - CNPJ da empresa
   - Contrato social ou alvará de funcionamento
   - Comprovante de endereço comercial
3. Faça upload dos documentos
4. Aguarde aprovação (pode levar 2-5 dias úteis)

---

## 2. Configurar no Meta for Developers

### 2.1 Criar Conta de Desenvolvedor
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em **"Começar"** e complete o registro
3. Vincule à sua conta Meta Business

### 2.2 Criar App
1. Clique em **"Criar App"**
2. Selecione o tipo: **Business**
3. Preencha:
   - Nome do App: "AutoRevenda Bot"
   - E-mail de contato
   - Conta Business: selecione a conta criada
4. Clique em **"Criar App"**

### 2.3 Adicionar Produtos ao App
No painel do App, adicione:
1. **WhatsApp** → Clique em "Configurar"
2. **Messenger** → Clique em "Configurar" (para Facebook)

---

## 3. Configurar WhatsApp Business API

### 3.1 Número de Teste
1. No App, vá em **WhatsApp → Getting Started**
2. Um número de teste será fornecido automaticamente
3. Adicione seu número pessoal como destinatário de teste
4. Envie a mensagem de teste para verificar

### 3.2 Número de Produção
1. Vá em **WhatsApp → Getting Started → Add Phone Number**
2. Adicione o número da loja (com verificação por SMS/ligação)
3. Configure o perfil comercial:
   - Nome: AutoRevenda
   - Descrição: "Loja de veículos seminovos e usados"
   - Categoria: Concessionária de veículos
   - Foto de perfil

### 3.3 Gerar Token de Acesso Permanente
1. Vá em **WhatsApp → Configuration**
2. Clique em **"Generate Access Token"**
3. Selecione as permissões:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
4. Copie e salve o token gerado

> 🔑 **Guarde este token com segurança!** Ele será usado no arquivo `.env`

### 3.4 Configurar Webhook
1. Em **WhatsApp → Configuration → Webhook**
2. **Callback URL**: A URL será fornecida pelo Typebot
3. **Verify Token**: Use o mesmo valor do `META_VERIFY_TOKEN` no `.env`
4. **Webhook Fields**: Marque `messages`

---

## 4. Configurar Facebook Messenger

### 4.1 Conectar Página do Facebook
1. No App, vá em **Messenger → Settings**
2. Na seção **"Access Tokens"**, clique em **"Add or Remove Pages"**
3. Selecione a página da loja no Facebook
4. Gere o **Page Access Token**
5. Copie o token → será o `META_PAGE_ACCESS_TOKEN` no `.env`

### 4.2 Configurar Webhook do Messenger
1. Em **Messenger → Settings → Webhooks**
2. **Callback URL**: `https://seu-dominio.com/webhook/meta`
3. **Verify Token**: Mesmo `META_VERIFY_TOKEN` do `.env`
4. **Subscription Fields**: Marque `messages`, `messaging_postbacks`

---

## 5. Configurar Instagram

### 5.1 Pré-requisitos
- Conta Instagram Business ou Creator (não pessoal)
- Conta Instagram vinculada à Página do Facebook

### 5.2 Vincular Instagram ao App
1. No App, vá em **Instagram → Basic Display** ou **Instagram Messaging**
2. Conecte a conta Instagram Business da loja

### 5.3 Configurar Webhook do Instagram
1. Em **Instagram → Webhooks**
2. **Callback URL**: `https://seu-dominio.com/webhook/meta` (mesmo do Messenger)
3. **Verify Token**: Mesmo token
4. **Subscription Fields**: Marque `messages`

---

## 6. Variáveis de Ambiente

Após completar a configuração, preencha o arquivo `.env`:

```env
# Meta Business API
META_APP_ID="seu_app_id_aqui"
META_APP_SECRET="seu_app_secret_aqui"
META_VERIFY_TOKEN="um-token-aleatorio-seguro"
META_PAGE_ACCESS_TOKEN="token-da-pagina-facebook"
META_WHATSAPP_TOKEN="token-do-whatsapp"
META_PHONE_NUMBER_ID="id-do-numero-whatsapp"
```

### Onde encontrar cada valor:
| Variável | Onde encontrar |
|---|---|
| `META_APP_ID` | Painel do App → Settings → Basic |
| `META_APP_SECRET` | Painel do App → Settings → Basic |
| `META_VERIFY_TOKEN` | Você define (string aleatória segura) |
| `META_PAGE_ACCESS_TOKEN` | Messenger → Settings → Access Tokens |
| `META_WHATSAPP_TOKEN` | WhatsApp → Configuration → Access Token |
| `META_PHONE_NUMBER_ID` | WhatsApp → Getting Started → Phone Number ID |

---

## 7. Checklist Final

- [ ] Conta Meta Business criada e verificada
- [ ] App criado no Meta for Developers
- [ ] WhatsApp Business API configurado
- [ ] Número de telefone adicionado e verificado
- [ ] Token permanente do WhatsApp gerado
- [ ] Webhook do WhatsApp configurado (via Typebot)
- [ ] Página do Facebook conectada ao App
- [ ] Webhook do Messenger configurado (Channel Bridge)
- [ ] Instagram Business vinculado
- [ ] Webhook do Instagram configurado (Channel Bridge)
- [ ] Variáveis de ambiente preenchidas no `.env`
- [ ] Backend API acessível publicamente (HTTPS)
- [ ] Channel Bridge acessível publicamente (HTTPS)
- [ ] Teste de envio de mensagem no WhatsApp ✅
- [ ] Teste de envio de mensagem no Instagram ✅
- [ ] Teste de envio de mensagem no Facebook ✅

---

## Troubleshooting

### Webhook não verifica
- Verifique se o `VERIFY_TOKEN` é idêntico no Meta e no `.env`
- Certifique-se de que a URL tem HTTPS válido
- Confira se o servidor está respondendo na porta correta

### Mensagens não chegam
- Verifique se subscreveu ao campo `messages` no webhook
- Confirme que o token de acesso tem as permissões corretas
- Verifique os logs do Channel Bridge ou do Typebot

### Erro 403 no envio
- O token de acesso pode ter expirado
- Gere um novo token permanente
- Verifique se a página está conectada ao App

### WhatsApp: Template Messages
Para enviar mensagens proativas (follow-ups), você precisa:
1. Criar **Message Templates** aprovados pela Meta
2. Templates devem ser em português
3. Aguardar aprovação (até 24h)
4. Usar a API de templates para envio proativo
