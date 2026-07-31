# Endpoint Único - Vehicle Assistant

## URL
```
POST https://autogest-production-404d.up.railway.app/api/webhook/vehicle-assistant
```

## Envio (Typebot → Backend)
```json
{
  "query": "HB20 até 90 mil para uso na cidade"
}
```

## Retorno quando encontra veículos
```json
{
  "success": true,
  "found": true,
  "message": "Encontrei estas opções no nosso estoque:\n\n🚗 Hyundai HB20 Hatch 2022/2022\n💰 R$ 75.900\n📍 30.000 km\n\n🚗 Hyundai HB20S 2024/2024\n💰 R$ 109.900\n📍 5.000 km"
}
```

## Retorno quando NÃO encontra
```json
{
  "success": true,
  "found": false,
  "message": "Não encontrei veículos com esse termo no momento. 😕\n\nQuer tentar outro modelo ou falar com um vendedor?"
}
```

## Configuração no Typebot

1. **Bloco HTTP Request:**
   - URL: `https://autogest-production-404d.up.railway.app/api/webhook/vehicle-assistant`
   - Método: `POST`
   - Body: `{"query":"{{modelo}}"}`
   - Variável de resposta: `resposta_assistente`

2. **Mapeamento de variáveis** (apenas 2 campos):
   - `found` → bodyPath: `found`
   - `message` → bodyPath: `message`

3. **Condição:**
   - Se `found` = `true` → mostrar `{{message}}`
   - Se `found` = `false` → mostrar `{{message}}` + botões de tentar novamente

4. **Texto para mostrar resultado:**
   ```
   {{message}}
   ```

## Vantagem
O Typebot não precisa mais:
- Interpretar `data[0]`, `data[1]`
- Transportar lista de veículos entre APIs
- Criar variáveis para título, preço, km
- Chamar estoque e OpenAI separadamente

Toda a inteligência fica no backend. O Typebot apenas envia a query e exibe a resposta.
