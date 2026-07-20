/**
 * Gerenciamento de consentimento de cookies e Google Consent Mode v2.
 * Seguro para SSR — só executa no browser.
 */

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'brothers-consent';

const defaultConsent: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
};

/**
 * Verifica se está no navegador.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Retorna o estado atual de consentimento.
 * Se não houver decisão salva, retorna o padrão (tudo denied exceto essential).
 */
export function getConsent(): ConsentState {
  if (!isBrowser()) return defaultConsent;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConsent, ...JSON.parse(stored) };
    }
  } catch {
    // Ignora erro de parse
  }
  return defaultConsent;
}

/**
 * Salva a decisão do usuário no localStorage.
 */
export function setConsent(consent: ConsentState): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

/**
 * Verifica se o usuário já tomou uma decisão de consentimento.
 */
export function hasConsentDecision(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Retorna true se o usuário aceitou a categoria específica.
 */
export function isConsentGranted(category: ConsentCategory): boolean {
  return getConsent()[category];
}

/**
 * Envia o estado de consentimento para o dataLayer (Google Consent Mode v2).
 * Deve ser chamado após o GTM estar disponível.
 */
export function pushConsentToDataLayer(): void {
  if (!isBrowser() || !window.dataLayer) return;
  const consent = getConsent();

  window.dataLayer.push({
    event: 'consent_update',
    consent_state: {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    },
  });
}

/**
 * Inicializa o consentimento padrão (denied) no dataLayer.
 * Deve ser chamado o mais cedo possível, antes do GTM carregar.
 */
export function pushDefaultConsent(): void {
  if (!isBrowser() || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'consent_default',
    consent_state: {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  });
}

/**
 * Aceita todas as categorias de cookies.
 */
export function acceptAllCookies(): void {
  const consent: ConsentState = {
    essential: true,
    analytics: true,
    marketing: true,
  };
  setConsent(consent);
  pushConsentToDataLayer();
}

/**
 * Recusa cookies não essenciais.
 */
export function rejectNonEssentialCookies(): void {
  const consent: ConsentState = {
    essential: true,
    analytics: false,
    marketing: false,
  };
  setConsent(consent);
  pushConsentToDataLayer();
}

/**
 * Define consentimento personalizado.
 */
export function setCustomConsent(consent: ConsentState): void {
  setConsent(consent);
  pushConsentToDataLayer();
}
