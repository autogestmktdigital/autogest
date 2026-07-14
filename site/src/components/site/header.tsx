'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Clock, Menu, Phone, X } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brothers-dark/95 backdrop-blur">
      <div className="hidden border-b border-white/10 bg-brothers-gray py-2 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 text-xs text-white/70 lg:px-6">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brothers-green" />
            <span>Seg a Sex: 10:00 às 19:00</span>
            <span className="text-white/30">|</span>
            <span>Sáb, Dom e Feriados: 10:00 às 18:00</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Brothers Multimarcas" className="h-14 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/" className="text-sm font-medium text-white/80 transition hover:text-brothers-green">
            Início
          </Link>
          <Link href="/veiculos" className="text-sm font-medium text-white/80 transition hover:text-brothers-green">
            Veículos
          </Link>
          <Link href="/#sobre" className="text-sm font-medium text-white/80 transition hover:text-brothers-green">
            Sobre
          </Link>
          <Link href="/#contato" className="text-sm font-medium text-white/80 transition hover:text-brothers-green">
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="https://wa.me/5511985614257"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-brothers-green px-4 py-2 text-sm font-semibold text-brothers-dark transition hover:brightness-110"
          >
            <Phone className="h-4 w-4" />
            Fale pelo WhatsApp
          </a>
        </div>

        <button
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-brothers-gray lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              Início
            </Link>
            <Link href="/veiculos" onClick={() => setMobileOpen(false)}>
              Veículos
            </Link>
            <Link href="/#sobre" onClick={() => setMobileOpen(false)}>
              Sobre
            </Link>
            <Link href="/#contato" onClick={() => setMobileOpen(false)}>
              Contato
            </Link>
            <a href="https://wa.me/5511985614257" target="_blank" rel="noreferrer" className="text-brothers-green">
              Fale pelo WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}