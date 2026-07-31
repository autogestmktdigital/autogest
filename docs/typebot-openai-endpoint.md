# Endpoint de Recomendação com OpenAI

## URL do Endpoint

```
POST https://autogest-production-404d.up.railway.app/api/webhooks/recommend-vehicles
```

## Método da Requisição

**POST**

## Headers

```json
{
  "Content-Type": "application/json"
}
```

## Formato do JSON de Envio

```json
{
  "customerPreferences": "Quero um SUV automático até 120 mil para uso na cidade",
  "vehicles": [
    {
      "id": 1,
      "titulo": "Honda CR-V 2020/2021",
      "preco": "R$ 115.900",
      "km": "45.000 km",
      "combustivel": "gasoline",
      "cambio": "Automático",
      "cor": "Prata",
      "descricao": "Completo, teto solar, couro"
    },
    {
      "id": 2,
      "titulo": "Toyota Corolla 2021/2022",
      "preco": "R$ 98.500",
      "km": "32.000 km",
      "combustivel": "flex",
      "cambio": "Automático",
      "cor": "Branco",
      "descricao": "XEI, multimídia, câmera de ré"
    }
  ]
}
```

### Campos obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `customerPreferences` | string | O que o cliente pediu (ex: "SUV automático até 120 mil") |
| `vehicles` | array | Lista de veículos retornados pela consulta ao estoque |

### Campos de cada veículo

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID do veículo no sistema |
| `titulo` | string | Nome completo: Marca + Modelo + Ano |
| `preco` | string | Preço formatado (ex: "R$ 115.900") |
| `km` | string | Quilometragem formatada (ex: "45.000 km") |
| `combustivel` | string | Tipo de combustível |
| `cambio` | string | Tipo de câmbio |
| `cor` | string | Cor do veículo |
| `descricao` | string (opcional) | Descrição adicional |

## Formato do JSON de Retorno

### Sucesso (200)

```json
{
  "success": true,
  "data": {
    "recommendation": "Com base no que você procura, encontrei estas opções:\n\n🚗 **Honda CR-V 2020/2021** - R$ 115.900\n✅ SUV automático, ideal para cidade\n✅ 45.000 km, muito bem cuidado\n✅ Completo com teto solar e couro\n\n🚗 **Toyota Corolla 2021/2022** - R$ 98.500\n✅ Automático, excelente para trânsito urbano\n✅ Apenas 32.000 km\n✅ Consumo econômico com motor flex\n\nQual desses você gostaria de conhecer melhor?"
  }
}
```

### Erro (400)

```json
{
  "success": false,
  "error": "Campos obrigatórios: customerPreferences (string) e vehicles (array)"
}
```

## Fluxo Completo no Typebot

### Passo 1: Consultar estoque

Use o endpoint de busca primeiro:

```
POST https://autogest-production-404d.up.railway.app/api/webhooks/search-vehicles
```

**Body:**
```json
{
  "query": "SUV automático"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Honda CR-V 2020/2021",
      "preco": "R$ 115.900",
      "km": "45.000 km",
      "combustivel": "gasoline",
      "cambio": "Automático",
      "cor": "Prata",
      "descricao": "Completo, teto solar, couro"
    }
  ]
}
```

### Passo 2: Enviar para recomendação

Pegue o resultado do Passo 1 e envie para:

```
POST https://autogest-production-404d.up.railway.app/api/webhooks/recommend-vehicles
```

**Body:**
```json
{
  "customerPreferences": "{{preferencias_do_cliente}}",
  "vehicles": "{{resultado_da_busca.data}}"
}
```

### Passo 3: Mostrar resposta

Use a variável `{{recommendation}}` do retorno para mostrar a mensagem final ao cliente.

## Observações Importantes

1. **A OpenAI NUNCA inventa veículos** - Ela analisa apenas a lista fornecida
2. **Se não houver veículos compatíveis**, a IA sugere os mais próximos ou pede mais informações
3. **A resposta é formatada em texto natural**, pronta para enviar no WhatsApp
4. **Máximo de 3 veículos recomendados** por resposta
5. **A API Key da OpenAI já está configurada** no backend

## Exemplo de Uso no Typebot

```
[Bloco HTTP Request 1 - Buscar veículos]
URL: https://autogest-production-404d.up.railway.app/api/webhooks/search-vehicles
Method: POST
Body: { "query": "{{user_input}}" }

[Bloco HTTP Request 2 - Recomendar com IA]
URL: https://autogest-production-404d.up.railway.app/api/webhooks/recommend-vehicles
Method: POST
Body: {
  "customerPreferences": "{{user_input}}",
  "vehicles": "{{HTTP Request 1.response.data}}"
}

[Bloco de Texto - Mostrar resultado]
Texto: {{HTTP Request 2.response.data.recommendation}}
```
