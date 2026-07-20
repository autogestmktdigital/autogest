'use client';

import { useState } from 'react';
import {
  getConsent,
  setCustomConsent,
  acceptAllCookies,
  rejectNonEssentialCookies,
  type ConsentState,
} from '@/lib/consent';

export function CookieSettingsButton() {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>(getConsent());

  function handleSave() {
    setCustomConsent(preferences);
    setOpen(false);
  }

  function handleAcceptAll() {
    acceptAllCookies();
    setPreferences(getConsent());
    setOpen(false);
  }

  function handleReject() {
    rejectNonEssentialCookies();
    setPreferences(getConsent());
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => {
          setPreferences(getConsent());
          setOpen(true);
        }}
        className="text-xs text-white/50 underline transition hover:text-brothers-green"
      >
        Configurações de cookies
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brothers-gray p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Configurações de cookies</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-brothers-green" />
                <div>
                  <p className="text-sm font-medium text-white">Essenciais</p>
                  <p className="text-xs text-white/60">Necessários para o funcionamento do site.</p>
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
                  <p className="text-xs text-white/60">Google Analytics e métricas de uso.</p>
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
                  <p className="text-xs text-white/60">Meta Pixel, Google Ads e remarketing.</p>
                </div>
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={handleReject}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                Recusar tudo
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                Salvar
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-brothers-green px-4 py-2 text-sm font-semibold text-brothers-dark transition hover:brightness-110"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
