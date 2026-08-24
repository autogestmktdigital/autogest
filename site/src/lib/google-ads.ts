/**
 * Rastreamento de conversão do Google Ads (gtag.js) — Brothers Multimarcas.
 *
 * Complementa o Google Tag Manager já existente (src/lib/gtm.ts).
 * Usa o mesmo window.dataLayer do GTM (padrão oficial do Google para
 * gtag.js + GTM coexistirem), sem duplicar scripts.
 *
 * Seguro para SSR — só executa no navegador.
 */

export const GOOGLE_ADS_ID = 'AW-18328106537';

const WHATSAPP_CONVERSION_LABEL = 'AW-18328106537/GPm3CMqUiOccEKnswqNE';

/**
 * Registra a conversão "WhatsApp | Clique no site" no Google Ads.
 *
 * Não bloqueia nem atrasa a abertura do WhatsApp: apenas dispara o evento
 * se `gtag` já estiver disponível. Se o Google Ads não tiver carregado
 * (consentimento negado, ad blocker, script ainda não carregado, etc.),
 * a função não faz nada e a navegação para o WhatsApp continua normal.
 */
export function trackWhatsAppConversion(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: WHATSAPP_CONVERSION_LABEL,
  });
}
