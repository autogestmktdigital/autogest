Correções necessárias no JSON do Typebot V2.5:

## 1. Body Paths do webhook de estoque (Grupo 08)

Mudar TODOS os bodyPath de notação ponto para notação array:

De: "bodyPath": "data.0.id"
Para: "bodyPath": "data[0].id"

De: "bodyPath": "data.0.titulo"
Para: "bodyPath": "data[0].titulo"

... e assim por diante para todos os 40 mapeamentos (data.0 a data.4)

Lista completa de alterações:
- data.0.id → data[0].id
- data.0.titulo → data[0].titulo
- data.0.preco → data[0].preco
- data.0.km → data[0].km
- data.0.combustivel → data[0].combustivel
- data.0.cambio → data[0].cambio
- data.0.cor → data[0].cor
- data.0.descricao → data[0].descricao
- data.1.id → data[1].id
- data.1.titulo → data[1].titulo
- data.1.preco → data[1].preco
- data.1.km → data[1].km
- data.1.combustivel → data[1].combustivel
- data.1.cambio → data[1].cambio
- data.1.cor → data[1].cor
- data.1.descricao → data[1].descricao
- data.2.id → data[2].id
- data.2.titulo → data[2].titulo
- data.2.preco → data[2].preco
- data.2.km → data[2].km
- data.2.combustivel → data[2].combustivel
- data.2.cambio → data[2].cambio
- data.2.cor → data[2].cor
- data.2.descricao → data[2].descricao
- data.3.id → data[3].id
- data.3.titulo → data[3].titulo
- data.3.preco → data[3].preco
- data.3.km → data[3].km
- data.3.combustivel → data[3].combustivel
- data.3.cambio → data[3].cambio
- data.3.cor → data[3].cor
- data.3.descricao → data[3].descricao
- data.4.id → data[4].id
- data.4.titulo → data[4].titulo
- data.4.preco → data[4].preco
- data.4.km → data[4].km
- data.4.combustivel → data[4].combustivel
- data.4.cambio → data[4].cambio
- data.4.cor → data[4].cor
- data.4.descricao → data[4].descricao

## 2. Body do webhook de recomendação (Grupo 13)

De:
"body": "{\n  \"customerPreferences\": \"{{Preferências do cliente}}\",\n  \"vehicles\": {{=JSON.parse({{Veículos encontrados}})=}}\n}"

Para:
"body": "{\n  \"customerPreferences\": \"{{Preferências do cliente}}\",\n  \"vehicles\": {{Veículos encontrados}}\n}"

## Como aplicar:

1. Abra o arquivo JSON no Typebot (importe-o)
2. Ou use um editor de texto para fazer as substituições acima
3. Reimporte o arquivo corrigido no Typebot
4. Publique o fluxo
5. Teste a busca de veículos