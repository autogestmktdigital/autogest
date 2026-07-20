# Rastreamento Google — Brothers Multimarcas

## Visão Geral

Este documento descreve a implementação de rastreamento Google Tag Manager (GTM) no site Brothers Multimarcas, preparada para produção e otimizada para as duas funções principais do site:

1. Exibir o estoque de veículos.
2. Levar o visitante a entrar em contato com um vendedor pelo WhatsApp.

---

## Variáveis de Ambiente

Adicione ao arquivo `.env.local` (ou `.env` em produção):

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

> **Importante:** O GTM só é carregado quando `NEXT_PUBLIC_GTM_ID` estiver preenchida. Se estiver vazia, nenhum script do GTM é injetado.

O arquivo `.env.example` já contém a variável documentada.

---

## Arquivos Alterados / Criados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/layout.tsx` | Alterado | Importa `GoogleTagManager` do `@next/third-parties/google` e renderiza condicionalmente |
| `src/lib/gtm.ts` | Criado | Funções utilitárias para envio de eventos ao `dataLayer` |
| `src/types/gtm.d.ts` | Criado | Declaração de tipo global para `window.dataLayer` |
| `src/components/site/whatsapp-link.tsx` | Criado | Componente de link de WhatsApp com rastreamento automático |
| `src/components/site/header.tsx` | Alterado | Substitui `<a>` por `<WhatsAppLink>` |
| `src/components/site/footer.tsx` | Alterado | Substitui `<a>` por `<WhatsAppLink>` |
| `src/app/page.tsx` | Alterado | Substitui `<a>` do WhatsApp por `<WhatsAppLink>` |
| `src/app/veiculos/page.tsx` | Alterado | Adiciona evento `view_inventory` e botão WhatsApp nos cards |
| `src/app/veiculos/[id]/page.tsx` | Alterado | Adiciona evento `view_vehicle` e botão WhatsApp com dados do veículo |
| `src/app/sitemap.ts` | Criado | Sitemap dinâmico com veículos ativos |
| `src/app/robots.ts` | Criado | Regras de indexação para robôs |
| `.env.example` | Criado | Documenta variáveis de ambiente necessárias |
| `docs/google-tracking.md` | Criado | Este documento |

---

## Eventos Implementados

### 1. `whatsapp_click`

Disparado em **todos** os botões e links que encaminham o usuário ao WhatsApp.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `event` | string | `whatsapp_click` |
| `button_location` | string | Local onde o botão foi clicado: `header`, `vehicle_card`, `vehicle_details`, `floating_button`, `footer` |
| `vehicle_id` | number \| null | ID do veículo (quando aplicável) |
| `vehicle_name` | string \| null | Marca e modelo do veículo |
| `vehicle_price` | number \| null | Preço do veículo |
| `page_path` | string \| null | Caminho da página atual |

**Locais mapeados:**
- **Header** (`header`): botão "Fale pelo WhatsApp" no topo
- **Menu mobile** (`header`): link "Fale pelo WhatsApp" no menu hambúrguer
- **Página inicial** (`floating_button`): botão "Falar com vendedor" no banner
- **Card de veículo** (`vehicle_card`): botão "Quero falar sobre este veículo" na listagem
- **Detalhes do veículo** (`vehicle_details`): botão "Quero falar sobre este veículo" na página de detalhes
- **Footer** (`footer`): telefone no rodapé

---

### 2. `view_vehicle`

Disparado **uma única vez** quando a página de detalhes de um veículo é carregada.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `event` | string | `view_vehicle` |
| `vehicle_id` | number | ID do veículo |
| `vehicle_name` | string | Marca e modelo |
| `vehicle_brand` | string | Marca |
| `vehicle_model` | string | Modelo |
| `vehicle_year` | string | Ano (formato "2020/2021" ou "2020") |
| `vehicle_price` | number | Preço |
| `page_path` | string \| null | Caminho da página |

**Garantia anti-duplicação:** Usa `useRef` para garantir que o evento seja disparado apenas uma vez por montagem do componente, mesmo em re-renderizações do React.

---

### 3. `view_inventory`

Disparado **uma única vez** quando a página de estoque (`/veiculos`) é carregada.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `event` | string | `view_inventory` |
| `vehicles_visible` | number | Quantidade de veículos disponíveis exibidos |
| `page_path` | string \| null | Caminho da página |

---

## Sitemap

Arquivo: `src/app/sitemap.ts`

Gera sitemap dinâmico em `/sitemap.xml` com:
- Página inicial (`/`)
- Página de estoque (`/veiculos`)
- Todas as páginas de veículos ativos (`/veiculos/:id`)

Domínio base: `https://brothersmultimarcas.com`

Atualizado automaticamente em cada build.

---

## Robots.txt

Arquivo: `src/app/robots.ts`

Gera `/robots.txt` com:
- Permissão de indexação em todas as páginas públicas
- Bloqueio de rotas administrativas: `/admin`, `/login`, `/api`, `/_next`, `/404`
- Referência ao sitemap: `Sitemap: https://brothersmultimarcas.com/sitemap.xml`

---

## Como Testar

### Testar no Modo Preview do Google Tag Manager

1. Acesse [Google Tag Manager](https://tagmanager.google.com/)
2. Clique em **"Visualizar"** (Preview)
3. Insira a URL do site local: `http://localhost:3004`
4. Navegue pelo site e verifique se os eventos aparecem no painel do Tag Assistant

### Validar pelo DebugView do Google Analytics 4

1. No GA4, acesse **Configurar > DebugView**
2. Navegue pelo site com o console do navegador aberto
3. Verifique se os eventos chegam em tempo real

### Verificar Sitemap e Robots

- Sitemap: `http://localhost:3004/sitemap.xml`
- Robots: `http://localhost:3004/robots.txt`

---

## Validações de Segurança

- ✅ Nenhum dado pessoal do usuário é enviado (telefone, nome, e-mail)
- ✅ O GTM só carrega se `NEXT_PUBLIC_GTM_ID` estiver configurada
- ✅ Eventos só funcionam no navegador (seguro para SSR)
- ✅ `window.dataLayer` é verificado antes de cada push
- ✅ Sem duplicação de eventos por re-renderização

---

## Pendências

| Item | Dependência |
|---|---|
| ID do GTM | Configurar `NEXT_PUBLIC_GTM_ID` no ambiente de produção |
| Google Analytics 4 | Configurar dentro do GTM (não via gtag.js direto) |
| Meta Pixel | Não incluso nesta tarefa |
| Banner de cookies | Não incluso nesta tarefa |

---

## Notas Técnicas

- Utiliza `@next/third-parties/google` (solução oficial Next.js)
- Compatível com Next.js App Router
- Renderização híbrida (Server Components + Client Components)
- TypeScript tipado em todos os eventos
- Componente `WhatsAppLink` reutilizável para novos botões de WhatsApp
