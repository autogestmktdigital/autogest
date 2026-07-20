# Checklist de Produção — Brothers Multimarcas

## Variáveis de Ambiente Obrigatórias

Configure no arquivo `.env.local` (ou no painel da Vercel/Cloudflare):

```env
NEXT_PUBLIC_SITE_URL=https://brothersmultimarcas.com
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_API_URL=https://api.brothersmultimarcas.com/api
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Atenção:** `NEXT_PUBLIC_GTM_ID` e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` são opcionais. O site funciona normalmente sem elas.

---

## Consentimento de Cookies (LGPD)

- ✅ Banner de cookies implementado
- ✅ Três categorias: Essenciais, Analíticos, Marketing
- ✅ Botões: Aceitar todos, Recusar, Preferências
- ✅ Armazenamento no `localStorage`
- ✅ Não exibe novamente após decisão
- ✅ Botão "Configurações de cookies" no footer para alterar escolha
- ✅ Google Consent Mode v2 integrado (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`)
- ✅ Estado padrão: `denied` para todas as categorias não essenciais
- ✅ GTM só carrega após consentimento para analíticos ou marketing

### Como testar:

1. Abra o site em aba anônima
2. Verifique se o banner aparece
3. Clique em "Recusar" — o GTM não deve carregar
4. Verifique no console: `window.dataLayer` deve conter `consent_default` com valores `denied`
5. Clique em "Aceitar todos" — `consent_update` deve ser enviado com `granted`
6. Recarregue a página — o banner não deve aparecer
7. Clique em "Configurações de cookies" no footer e altere a escolha

---

## Google Tag Manager (GTM)

- ✅ Carregamento condicional via `NEXT_PUBLIC_GTM_ID`
- ✅ `@next/third-parties/google` (solução oficial)
- ✅ dataLayer tipado e centralizado
- ✅ Eventos implementados:
  - `whatsapp_click` (com `button_location`, `vehicle_id`, `vehicle_name`, `vehicle_price`)
  - `view_vehicle` (com dados completos do veículo)
  - `view_inventory` (com `vehicles_visible`)

### Como testar:

1. Configure `NEXT_PUBLIC_GTM_ID` com um ID de teste
2. Acesse o Modo Preview do GTM
3. Navegue pelo site e verifique se os eventos aparecem no Tag Assistant

---

## Google Analytics 4 (GA4)

- ✅ Não instalado diretamente no código
- ✅ Deve ser configurado dentro do GTM
- ✅ Eventos do dataLayer estão prontos para serem mapeados no GTM

### Como configurar:

1. No GTM, crie uma tag do tipo "Google Analytics: GA4 Configuration"
2. Use o Measurement ID do GA4
3. Configure triggers para os eventos `whatsapp_click`, `view_vehicle`, `view_inventory`
4. Publique o container do GTM

---

## Meta Pixel (Facebook)

- ✅ Não instalado diretamente no código
- ✅ Estrutura do dataLayer compatível
- ✅ Pode ser configurado via GTM no futuro

### Como configurar futuramente:

1. No GTM, crie uma tag do tipo "Meta Pixel"
2. Use o Pixel ID fornecido pelo Meta
3. Mapeie os eventos:
   - `view_inventory` → `PageView` ou `ViewContent`
   - `view_vehicle` → `ViewContent` (com dados do veículo)
   - `whatsapp_click` → `Lead` ou `Contact`
4. Publique o container do GTM

---

## Sitemap

- ✅ Gerado dinamicamente em `/sitemap.xml`
- ✅ Inclui: página inicial, estoque, política de privacidade, veículos ativos
- ✅ Exclui: veículos inativos, rotas administrativas
- ✅ Domínio base via `NEXT_PUBLIC_SITE_URL`

### Como verificar:

- Acesse: `https://brothersmultimarcas.com/sitemap.xml`

---

## Robots.txt

- ✅ Gerado em `/robots.txt`
- ✅ Permite indexação de páginas públicas
- ✅ Bloqueia: `/admin`, `/login`, `/api`, `/_next`, `/404`
- ✅ Referência ao sitemap

### Como verificar:

- Acesse: `https://brothersmultimarcas.com/robots.txt`

---

## SEO Técnico

- ✅ Metadata global completo (title template, description, keywords, OG, Twitter Cards)
- ✅ Canonical URLs baseadas em `NEXT_PUBLIC_SITE_URL`
- ✅ Favicon configurado (múltiplos tamanhos)
- ✅ Apple touch icon
- ✅ Manifesto web app (`/manifest.json`)
- ✅ Meta tags de robôs (`index, follow`)
- ✅ Verificação do Google Search Console (via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)
- ✅ Página de política de privacidade indexável

### Como verificar:

- Use a ferramenta [Meta Tags](https://metatags.io/) para validar OG e Twitter Cards
- Use o [Rich Results Test](https://search.google.com/test/rich-results) para validar dados estruturados

---

## Dados Estruturados (JSON-LD)

- ✅ Schema `AutoDealer` na página inicial
- ✅ Schema `Vehicle` nas páginas de detalhes de veículos
- ✅ Dados reais: marca, modelo, ano, preço, km, combustível, cor, transmissão
- ✅ Oferta com preço em BRL e disponibilidade `InStock`

### Como verificar:

- Use o [Schema Markup Validator](https://validator.schema.org/)
- Insira a URL da página de um veículo

---

## Política de Privacidade

- ✅ Página pública: `/politica-de-privacidade`
- ✅ Texto completo em português do Brasil
- ✅ LGPD mencionada
- ✅ Explicação de cookies, GTM, GA4, Meta Pixel, WhatsApp
- ✅ Direitos do titular
- ✅ Link no footer
- ✅ Link no banner de cookies

---

## Segurança

- ✅ Headers de segurança no `next.config.mjs`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restritivo
- ✅ Links externos com `rel="noreferrer"`
- ✅ Nenhuma variável secreta exposta com `NEXT_PUBLIC_`
- ✅ URLs externas validadas

---

## Performance

- ✅ `next/image` configurado (unoptimized para compatibilidade com standalone)
- ✅ Lazy loading implícito via Next.js
- ✅ Fonte do sistema (Arial, Helvetica) — sem carregamento externo
- ✅ Scripts externos (GTM) carregados de forma otimizada via `@next/third-parties`
- ✅ Componentes client (`'use client'`) usados apenas onde necessário

---

## Etapas de Deploy

1. **Configurar variáveis de ambiente** no painel da hospedagem
2. **Executar build de produção**: `npm run build`
3. **Verificar se o build passou** sem erros
4. **Testar rotas principais**:
   - `/` (home)
   - `/veiculos` (estoque)
   - `/veiculos/1` (detalhes de veículo)
   - `/politica-de-privacidade`
   - `/sitemap.xml`
   - `/robots.txt`
5. **Testar banner de cookies** em aba anônima
6. **Verificar JSON-LD** no Schema Markup Validator
7. **Submeter sitemap** no Google Search Console
8. **Configurar GTM** com GA4 e publicar container

---

## Testes Pós-Produção

- [ ] Site carrega corretamente em desktop e mobile
- [ ] Banner de cookies aparece em navegação anônima
- [ ] Consentimento é salvo e não reaparece
- [ ] GTM carrega apenas após consentimento
- [ ] Eventos do dataLayer aparecem no console
- [ ] Sitemap retorna XML válido
- [ ] Robots.txt retorna texto correto
- [ ] Página de política de privacidade acessível
- [ ] Meta tags OG aparecem corretamente no Facebook/Twitter
- [ ] JSON-LD validado no Schema Markup Validator
- [ ] WhatsApp abre corretamente em todos os botões
- [ ] Imagens dos veículos carregam
- [ ] Filtros do estoque funcionam
- [ ] Página 404 retorna status 404

---

## Pendências Externas

| Item | Dependência | Responsável |
|---|---|---|
| ID do GTM | Configurar `NEXT_PUBLIC_GTM_ID` | Cliente / Agência |
| Google Analytics 4 | Configurar tag no GTM | Cliente / Agência |
| Meta Pixel | Configurar tag no GTM futuramente | Cliente / Agência |
| Google Search Console | Verificar propriedade e submeter sitemap | Cliente / Agência |
| Certificado SSL | Garantir HTTPS ativo | Hospedagem |
| Domínio configurado | Apontar para a hospedagem | Cliente / Registro.br |

---

## Riscos e Validações Manuais

1. **GTM não carrega sem consentimento**: Validar manualmente no console do navegador
2. **Eventos duplicados**: Monitorar no Tag Assistant do GTM
3. **Imagens de veículos**: Verificar se o backend está retornando URLs corretas
4. **API disponível**: Garantir que `NEXT_PUBLIC_API_URL` está acessível em produção
5. **CORS**: Verificar se o backend permite requisições do domínio do site
6. **Build na Vercel/Cloudflare**: Pode ser necessário ajustar configurações específicas da plataforma

---

## Arquivos Criados

- `src/lib/consent.ts`
- `src/lib/jsonld.ts`
- `src/components/site/cookie-banner.tsx`
- `src/components/site/cookie-settings-button.tsx`
- `src/components/site/jsonld-script.tsx`
- `src/app/politica-de-privacidade/page.tsx`
- `docs/production-checklist.md`

## Arquivos Alterados

- `src/app/layout.tsx` — metadata completo, CookieBanner, GTM condicional
- `src/app/page.tsx` — JSON-LD AutoDealer
- `src/app/veiculos/[id]/page.tsx` — JSON-LD Vehicle
- `src/app/sitemap.ts` — usa NEXT_PUBLIC_SITE_URL
- `src/app/robots.ts` — usa NEXT_PUBLIC_SITE_URL
- `src/components/site/footer.tsx` — link política + botão cookies
- `next.config.mjs` — security headers
- `.env.example` — novas variáveis
- `docs/google-tracking.md` — atualizado com consentimento
