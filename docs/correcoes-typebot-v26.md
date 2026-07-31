# Correções no Fluxo Typebot - Brothers Multimarcas

## O que foi corrigido no arquivo `brothers-multimarcas-flow.json`

### 1. Adicionado grupo "Perguntar Modelo" (group-perguntar-modelo)
- Antes: O bot não perguntava qual carro o usuário queria buscar
- Agora: Pergunta "Qual modelo ou marca você procura?" e salva na variável `var-modelo`

### 2. Adicionado grupo "Não Encontrou" (group-nao-encontrou)
- Antes: Se a API não retornasse carros, o fluxo quebrava
- Agora: Mostra mensagem amigável e dá opção de tentar outro modelo ou falar com vendedor

### 3. Adicionadas todas as edges de navegação
Faltavam edges conectando os botões "Ver estoque" para o grupo de pergunta do modelo:

| Edge | De | Para |
|------|-----|------|
| edge-ver-estoque-menu | Menu Principal → Ver estoque | Perguntar Modelo |
| edge-ver-estoque-site | Site Geral → Ver estoque | Perguntar Modelo |
| edge-ver-estoque-fb | Facebook → Ver estoque | Perguntar Modelo |
| edge-nao-instagram | Instagram → Não, quero ver estoque | Perguntar Modelo |
| edge-nao-yt | YouTube → Quero ver o estoque | Perguntar Modelo |
| edge-nao-tt | TikTok → Quero ver o estoque | Perguntar Modelo |
| edge-outros-carros | Carro do Site → Ver outras opções | Perguntar Modelo |
| edge-modelo-informado | Input do modelo | Consulta Estoque API |
| edge-nao-encontrou | API não encontrou | Grupo Não Encontrou |
| edge-tentar-novamente | Tentar outro modelo | Perguntar Modelo |
| edge-falar-vendedor-nao | Falar com vendedor (do não encontrou) | Falar com Vendedor |

### 4. Edges para "Falar com vendedor" e "Agendar visita"
- edge-falar-vendedor-menu, edge-falar-vendedor-site, edge-falar-vendedor-fb
- edge-agendar-menu, edge-agendar-site
- edge-duvidas-menu

## Como usar no Typebot

1. No Typebot, vá em **Configurações → Exportar/Importar**
2. Escolha **Importar por arquivo**
3. Selecione o arquivo `brothers-multimarcas-flow.json`
4. Publique o fluxo

## Teste rápido

1. Envie "Oi" para iniciar
2. Escolha "Ver estoque de veículos" no menu
3. Digite "HB20" quando perguntar o modelo
4. O bot deve mostrar os carros encontrados

## Se ainda não mostrar os carros

Verifique se a API está respondendo:
```bash
curl -X POST https://autogest-production-404d.up.railway.app/api/webhook/search-vehicles \
  -H "Content-Type: application/json" \
  -d '{"query":"HB20"}'
```

Se retornar JSON com veículos, o backend está OK e o problema é no Typebot.
