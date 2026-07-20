'use client';

import { useEffect, useState } from 'react';
import {
  acceptAllCookies,
  rejectNonEssentialCookies,
  hasConsentDecision,
  getConsent,
  setCustomConsent,
  pushDefaultConsent,
  type ConsentState,
} from '@/lib/consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Envia consentimento padrão (denied) assim que o componente monta
    pushDefaultConsent();

    // Só mostra o banner se o usuário ainda não tomou decisão
    if (!hasConsentDecision()) {
      setVisible(true);
    }
  }, []);

  function handleAcceptAll() {
    acceptAllCookies();
    setVisible(false);
    setShowPreferences(false);
  }

  function handleReject() {
    rejectNonEssentialCookies();
    setVisible(false);
    setShowPreferences(false);
  }

  function handleOpenPreferences() {
    setPreferences(getConsent());
    setShowPreferences(true);
  }

  function handleSavePreferences() {
    setCustomConsent(preferences);
    setVisible(false);
    setShowPreferences(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-brothers-gray/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
        {!showPreferences ? (
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="text-sm text-white/80">
              <p className="font-semibold text-white">Este site utiliza cookies</p>
              <p className="mt-1">
                Utilizamos cookies essenciais, analíticos e de marketing para melhorar sua experiência.
                Ao continuar navegando, você concorda com nossa{' '}
                <a href="/politica-de-privacidade" className="underline hover:text-brothers-green">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleReject}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                Recusar
              </button>
              <button
                onClick={handleOpenPreferences}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                Preferências
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-brothers-green px-4 py-2 text-sm font-semibold text-brothers-dark transition hover:brightness-110"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-semibold text-white">Gerenciar preferências de cookies</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-brothers-green" />
                <div>
                  <p className="text-sm font-medium text-white">Essenciais</p>
                  <p className="text-xs text-white/60">Necessários para o funcionamento básico do site. Não podem ser desativados.</p>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
                  className="mt-1 h-4 w-4 accent-brothers-green"
                />
                <div>
                  <p className="text-sm font-medium text-white">Analíticos</p>
                  <p className="text-xs text-white/60">Ajuda-nos a entender como os visitantes interagem com o site (Google Analytics).</p>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, marketing: e.target.checked }))}
                  className="mt-1 h-4 w-4 accent-brothers-green"
                />
                <div>
                  <p className="text-sm font-medium text-white">Marketing</p>
                  <p className="text-xs text-white/60">Utilizados para exibir anúncios relevantes e medir campanhas (Meta Pixel, Google Ads).</p>
                </div>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreferences(false)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                Voltar
              </button>
              <button
                onClick={handleSavePreferences}
                className="rounded-lg bg-brothers-green px-4 py-2 text-sm font-semibold text-brothers-dark transition hover:brightness-110"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
