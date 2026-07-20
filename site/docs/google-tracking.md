# Rastreamento Google — Brothers Multimarcas

## Visão Geral

Este documento descreve a implementação de rastreamento Google Tag Manager (GTM) no site Brothers Multimarcas, preparada para produção e otimizada para as duas funções principais do site:

1. Exibir o estoque de veículos.
2. Levar o visitante a entrar em contato com um vendedor pelo WhatsApp.

---

## Variáveis de Ambiente

Adicione ao arquivo `.env.local` (ou `.env` em produção):

```env
NEXT_PUBLIC_SITE_URL=https://brothersmultimarcas.com
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Importante:** O GTM só é carregado quando `NEXT_PUBLIC_GTM_ID` estiver preenchida. Se estiver vazia, nenhum script do GTM é injetado.

O arquivo `.env.example` já contém as variáveis documentadas.

---

## Consentimento de Cookies (LGPD)

O site implementa um banner de cookies com três categorias:

- **Essenciais**: sempre ativos, necessários para o funcionamento do site
- **Analíticos**: Google Analytics, métricas de uso
- **Marketing**: Meta Pixel, Google Ads, remarketing

### Como funciona:

1. O usuário acessa o site e vê o banner de cookies
2. O estado padrão de consentimento é `denied` para todas as categorias não essenciais
3. O GTM **não carrega** antes do consentimento para analíticos ou marketing
4. O usuário pode:
   - **Aceitar todos**: ativa analíticos e marketing
   - **Recusar**: mantém apenas essenciais
   - **Preferências**: escolhe individualmente
5. A decisão é salva no `localStorage` e não é exibida novamente
6. O usuário pode alterar a escolha clicando em "Configurações de cookies" no footer

### Google Consent Mode v2:

O site envia os seguintes estados ao dataLayer:

```javascript
// Estado padrão (antes do consentimento)
{
  event: 'consent_default',
  consent_state: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  }
}

// Após o usuário consentir
{
  event: 'consent_update',
  consent_state: {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  }
}
```

---

## Arquivos Alterados / Criados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/layout.tsx` | Alterado | Metadata completo, CookieBanner, GTM condicional ao consentimento |
| `src/lib/gtm.ts` | Criado | Funções utilitárias para envio de eventos ao `dataLayer` |
| `src/lib/consent.ts` | Criado | Gerenciamento de consentimento de cookies e Google Consent Mode v2 |
| `src/lib/jsonld.ts` | Criado | Geradores de dados estruturados schema.org |
| `src/types/gtm.d.ts` | Criado | Declaração de tipo global para `window.dataLayer` |
| `src/components/site/whatsapp-link.tsx` | Criado | Componente de link de WhatsApp com rastreamento automático |
| `src/components/site/cookie-banner.tsx` | Criado | Banner de consentimento de cookies |
| `src/components/site/cookie-settings-button.tsx` | Criado | Botão para alterar preferências de cookies |
| `src/components/site/jsonld-script.tsx` | Criado | Componente para renderizar JSON-LD |
| `src/components/site/header.tsx` | Alterado | Substitui `<a>` por `<WhatsAppLink>` |
| `src/components/site/footer.tsx` | Alterado | Substitui `<a>` por `<WhatsAppLink>`, link política + botão cookies |
| `src/app/page.tsx` | Alterado | Substitui `<a>` do WhatsApp por `<WhatsAppLink>`, JSON-LD AutoDealer |
| `src/app/veiculos/page.tsx` | Alterado | Evento `view_inventory` e botão WhatsApp nos cards |
| `src/app/veiculos/[id]/page.tsx` | Alterado | Evento `view_vehicle`, botão WhatsApp, JSON-LD Vehicle |
| `src/app/politica-de-privacidade/page.tsx` | Criado | Página de política de privacidade LGPD |
| `src/app/sitemap.ts` | Alterado | Usa `NEXT_PUBLIC_SITE_URL`, inclui política de privacidade |
| `src/app/robots.ts` | Alterado | Usa `NEXT_PUBLIC_SITE_URL` |
| `.env.example` | Alterado | Adiciona `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| `next.config.mjs` | Alterado | Security headers (X-Content-Type-Options, X-Frame-Options, etc.) |
| `docs/google-tracking.md` | Criado | Este documento |
| `docs/production-checklist.md` | Criado | Checklist completo de produção |

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

## Dados Estruturados (JSON-LD)

### Página Inicial — AutoDealer

Schema.org tipo `AutoDealer` com:
- Nome, URL, logo
- Telefone, e-mail
- Endereço completo
- Redes sociais (Instagram, Facebook)
- Faixa de preço

### Página de Veículo — Vehicle

Schema.org tipo `Vehicle` com:
- Nome, marca, modelo
- Cor, combustível, transmissão
- Quilometragem
- Oferta com preço em BRL e disponibilidade `InStock`
- Imagens do veículo
- Ano de produção

---

## Sitemap

Arquivo: `src/app/sitemap.ts`

Gera sitemap dinâmico em `/sitemap.xml` com:
- Página inicial (`/`)
- Página de estoque (`/veiculos`)
- Página de política de privacidade (`/politica-de-privacidade`)
- Todas as páginas de veículos ativos (`/veiculos/:id`)

Domínio base via `NEXT_PUBLIC_SITE_URL`.

Atualizado automaticamente em cada build.

---

## Robots.txt

Arquivo: `src/app/robots.ts`

Gera `/robots.txt` com:
- Permissão de indexação em todas as páginas públicas
- Bloqueio de rotas administrativas: `/admin`, `/login`, `/api`, `/_next`, `/404`
- Referência ao sitemap via `NEXT_PUBLIC_SITE_URL`

---

## Política de Privacidade

Pública em: `/politica-de-privacidade`

Cobertura:
- Dados técnicos coletados
- Uso de cookies (essenciais, analíticos, marketing)
- Google Analytics e Google Tag Manager
- Meta Pixel (futuro)
- Links para WhatsApp
- Finalidade da coleta
- Retenção e segurança
- Direitos LGPD
- Canal de contato

---

## Como Testar

### Testar o Banner de Cookies

1. Abra o site em aba anônima (`Ctrl+Shift+N`)
2. Verifique se o banner aparece na parte inferior
3. Clique em "Recusar" e recarregue — o banner não deve reaparecer
4. Clique em "Configurações de cookies" no footer
5. Altere a escolha e salve

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

### Validar Dados Estruturados

- Use o [Schema Markup Validator](https://validator.schema.org/)
- Insira a URL da página inicial (deve mostrar AutoDealer)
- Insira a URL de um veículo (deve mostrar Vehicle)

---

## Validações de Segurança

- ✅ Nenhum dado pessoal do usuário é enviado (telefone, nome, e-mail)
- ✅ O GTM só carrega se `NEXT_PUBLIC_GTM_ID` estiver configurada **E** o usuário consentiu
- ✅ Eventos só funcionam no navegador (seguro para SSR)
- ✅ `window.dataLayer` é verificado antes de cada push
- ✅ Sem duplicação de eventos por re-renderização
- ✅ Headers de segurança configurados
- ✅ Links externos com `rel="noreferrer"`

---

## Pendências

| Item | Dependência |
|---|---|
| ID do GTM | Configurar `NEXT_PUBLIC_GTM_ID` no ambiente de produção |
| Google Analytics 4 | Configurar dentro do GTM (não via gtag.js direto) |
| Meta Pixel | Configurar via GTM futuramente |
| Google Search Console | Verificar propriedade e submeter sitemap |

---

## Notas Técnicas

- Utiliza `@next/third-parties/google` (solução oficial Next.js)
- Compatível com Next.js App Router
- Renderização híbrida (Server Components + Client Components)
- TypeScript tipado em todos os eventos
- Componente `WhatsAppLink` reutilizável para novos botões de WhatsApp
- Consentimento gerenciado via `localStorage` (persistente entre sessões)
- Google Consent Mode v2 com estados padrão `denied`
