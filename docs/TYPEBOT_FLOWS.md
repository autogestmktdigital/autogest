# Guia de Configuração dos Fluxos no Typebot Cloud

Este documento descreve como configurar os fluxos conversacionais do bot vendedor digital no Typebot Cloud.

## Pré-requisitos

1. Conta no [Typebot Cloud](https://typebot.io) (plano Pro ou superior para WhatsApp)
2. Backend API rodando e acessível publicamente (com HTTPS)
3. Conta Meta Business verificada (para WhatsApp)

## Variáveis do Bot

Crie as seguintes variáveis no Typebot antes de montar os fluxos:

| Variável | Tipo | Descrição |
|---|---|---|
| `client_name` | Text | Nome do cliente |
| `client_phone` | Text | Telefone do cliente |
| `client_channel` | Text | Canal de origem (whatsapp/instagram/facebook) |
| `client_channel_id` | Text | ID do usuário no canal |
| `search_query` | Text | Busca de veículos |
| `vehicle_results` | Text | Resultados da busca |
| `vehicle_id` | Number | ID do veículo selecionado |
| `down_payment` | Number | Valor de entrada |
| `installments` | Number | Número de parcelas |
| `financing_result` | Text | Resultado da simulação |
| `ai_response` | Text | Resposta da IA |
| `lead_id` | Number | ID do lead no sistema |

---

## Fluxo 1: Boas-vindas e Identificação

### Estrutura:
```
[Início] 
  → [Texto] "Olá! 👋 Bem-vindo à AutoRevenda! Sou seu assistente virtual."
  → [Texto] "Como posso te ajudar hoje?"
  → [Botões] Menu Principal:
      • 🚗 Ver Veículos
      • 💰 Simular Financiamento  
      • 💬 Falar com Vendedor
      • ❓ Tenho uma dúvida
```

### Configuração:
1. **Bloco "Início"**: Trigger automático
2. **Set Variable**: `client_channel` = `{{system.whatsapp.phoneNumber}}` (ou variável do canal)
3. **Bloco de texto**: Mensagem de boas-vindas
4. **Bloco de botões**: 4 opções do menu principal

---

## Fluxo 2: Catálogo de Veículos

### Estrutura:
```
[Input texto] "Que tipo de veículo procura? (ex: SUV, sedan, pickup, ou nome do modelo)"
  → [Set variable] search_query = resposta
  → [Webhook] POST {API_URL}/api/webhook/search-vehicles
      Body: { "query": "{{search_query}}" }
      Save response in: vehicle_results
  → [Condition] vehicle_results está vazio?
      • Sim → [Texto] "Não encontrei veículos com esses critérios. Quer tentar outra busca?"
      • Não → [Texto] "Encontrei estas opções: {{vehicle_results}}"
              → [Botões]:
                  • 💰 Simular financiamento deste
                  • 🔍 Buscar outro veículo
                  • 📋 Ver detalhes
                  • ◀️ Voltar ao menu
```

### Configuração do Webhook:
- **URL**: `https://seu-dominio.com/api/webhook/search-vehicles`
- **Método**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "query": "{{search_query}}"
}
```
- **Salvar resposta em**: `vehicle_results`

---

## Fluxo 3: Simulação de Financiamento

### Estrutura:
```
[Input número] "Qual o ID do veículo? (informe o número que apareceu na busca)"
  → [Set variable] vehicle_id = resposta
[Input número] "Qual o valor de entrada? (em R$)"
  → [Set variable] down_payment = resposta  
[Input número] "Em quantas parcelas? (6 a 72)"
  → [Set variable] installments = resposta
  → [Webhook] POST {API_URL}/api/webhook/simulate-financing
      Body: {
        "vehicleId": {{vehicle_id}},
        "downPayment": {{down_payment}},
        "installments": {{installments}}
      }
      Save response in: financing_result
  → [Texto] "📊 Resultado da simulação:\n\n{{financing_result}}"
  → [Botões]:
      • ✅ Tenho interesse! Quero falar com vendedor
      • 🔄 Simular com outros valores
      • ◀️ Voltar ao menu
```

### Configuração do Webhook:
- **URL**: `https://seu-dominio.com/api/financing/quick`
- **Método**: POST
- **Body**:
```json
{
  "vehicleId": {{vehicle_id}},
  "downPayment": {{down_payment}},
  "installments": {{installments}}
}
```

---

## Fluxo 4: Captura de Lead

### Estrutura:
```
[Texto] "Para dar continuidade, preciso de alguns dados:"
[Input texto] "Qual seu nome completo?"
  → [Set variable] client_name = resposta
[Input texto] "Qual seu telefone com DDD?"
  → [Set variable] client_phone = resposta
  → [Webhook] POST {API_URL}/api/webhook/register-lead
      Body: {
        "channel": "{{client_channel}}",
        "channelUserId": "{{client_channel_id}}",
        "name": "{{client_name}}",
        "phone": "{{client_phone}}"
      }
      Save response in: lead_id
  → [Texto] "Perfeito, {{client_name}}! Seus dados foram registrados. ✅"
```

### Configuração do Webhook:
- **URL**: `https://seu-dominio.com/api/webhook/register-lead`
- **Método**: POST
- **Body**:
```json
{
  "channel": "{{client_channel}}",
  "channelUserId": "{{client_channel_id}}",
  "name": "{{client_name}}",
  "phone": "{{client_phone}}"
}
```

---

## Fluxo 5: Conversa Livre com IA (OpenAI)

### Estrutura:
```
[Bloco OpenAI] 
  → Model: gpt-4o-mini
  → System prompt: (copiar o system prompt do backend/src/services/openai.service.ts)
  → Messages: Histórico da conversa
  → Save response in: ai_response
  → [Texto] "{{ai_response}}"
  → [Input texto] (aguarda nova mensagem)
  → [Loop] volta para o bloco OpenAI
```

### Configuração do Bloco OpenAI no Typebot:
1. Vá em **Configurações do Bot** → **OpenAI**
2. Adicione sua API Key da OpenAI
3. No fluxo, adicione o bloco **OpenAI → Create chat completion**
4. **Modelo**: `gpt-4o-mini`
5. **System Message**:
```
Você é um vendedor digital especialista em veículos da AutoRevenda, uma loja de veículos de médio porte.

PERSONALIDADE:
- Seja cordial, profissional e entusiasta sobre os veículos
- Use linguagem natural e amigável, como um vendedor experiente
- Trate o cliente pelo nome quando souber

REGRAS:
- NUNCA invente informações sobre veículos que não estão no catálogo
- Quando não souber um dado específico, diga que vai verificar
- Sempre tente capturar o nome e telefone do cliente
- Sugira agendamento de visita ou test drive quando o cliente mostrar interesse
- Se o cliente pedir algo fora do seu escopo, ofereça transferência para um vendedor humano
- Mantenha respostas concisas (máximo 3 parágrafos)
```
6. **Messages**: Configure para manter o histórico das últimas mensagens
7. **Save response**: na variável `ai_response`

---

## Fluxo 6: Transferência para Vendedor Humano (Handoff)

### Estrutura:
```
[Texto] "Vou transferir você para um de nossos vendedores especializados! 🤝"
[Texto] "Por favor, aguarde um momento enquanto um vendedor fica disponível."
  → [Webhook] POST {API_URL}/api/webhook/handoff
      Body: { "conversationId": {{conversation_id}} }
  → [Texto] "Um vendedor foi notificado e entrará em contato em breve!"
  → [Texto] "Enquanto isso, posso ajudar com mais alguma coisa?"
```

---

## Integração com WhatsApp (Meta Business API)

### Passo a passo:

#### 1. Criar conta Meta Business
1. Acesse [business.facebook.com](https://business.facebook.com)
2. Crie uma conta Business
3. Complete a verificação do negócio (documentos da empresa)

#### 2. Configurar no Meta for Developers
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um novo App do tipo **Business**
3. Adicione o produto **WhatsApp**
4. Adicione o produto **Messenger** (para Facebook)
5. Adicione o produto **Instagram** (se necessário)

#### 3. Configurar WhatsApp Business API
1. No painel do App, vá em **WhatsApp → Getting Started**
2. Selecione ou crie um número de telefone para teste
3. Copie o **Phone Number ID** e **WhatsApp Business Account ID**
4. Gere um **Access Token** permanente

#### 4. Conectar ao Typebot
1. No Typebot Cloud, vá em **Settings → WhatsApp**
2. Cole o **Phone Number ID** 
3. Cole o **Access Token**
4. Configure o **Webhook URL** que o Typebot fornece
5. No Meta Developers, configure o webhook com a URL fornecida pelo Typebot
6. Subscreva aos campos: `messages`

#### 5. Configurar Instagram e Facebook (Channel Bridge)
1. No Meta Developers, configure os webhooks para Instagram e Facebook Messenger
2. Use a URL do Channel Bridge: `https://seu-dominio.com/webhook/meta`
3. Use o mesmo **Verify Token** configurado no `.env`
4. Subscreva aos campos: `messages`, `messaging_postbacks`

---

## Configurações Recomendadas do Typebot

### Geral:
- **Typing emulation**: Ativado (300ms delay)
- **Remember user**: Ativado (para manter contexto entre sessões)

### Tema:
- Cores da marca da loja
- Avatar do bot: logo da AutoRevenda

### Analytics:
- Ativar tracking para acompanhar:
  - Taxa de conclusão dos fluxos
  - Pontos de abandono
  - Fluxos mais utilizados

---

## URLs dos Webhooks (Backend API)

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/webhook/search-vehicles` | POST | Busca veículos no catálogo |
| `/api/webhook/register-lead` | POST | Registra/atualiza lead |
| `/api/webhook/handoff` | POST | Ativa transferência humana |
| `/api/financing/quick` | POST | Simulação rápida de financiamento |

> **Importante**: Todos os endpoints de webhook NÃO requerem autenticação. Certifique-se de que estão acessíveis publicamente via HTTPS.

---

## Diagrama do Fluxo Completo

```
[Início]
    │
    ├── 🚗 Ver Veículos
    │     ├── [Busca] → Webhook search-vehicles
    │     ├── [Resultados] → Exibe veículos
    │     ├── [Simular] → Vai para Financiamento
    │     └── [Voltar] → Menu Principal
    │
    ├── 💰 Simular Financiamento
    │     ├── [Coleta dados] → ID veículo, entrada, parcelas
    │     ├── [Calcula] → Webhook simulate-financing
    │     ├── [Resultado] → Exibe simulação
    │     └── [Interesse] → Captura Lead + Handoff
    │
    ├── 💬 Falar com Vendedor
    │     ├── [Captura Lead] → Webhook register-lead
    │     └── [Handoff] → Webhook handoff
    │
    └── ❓ Tenho uma dúvida
          └── [OpenAI Chat] → Conversa livre com IA
                ├── [Interesse detectado] → Captura Lead
                └── [Loop] → Continua conversa
```
