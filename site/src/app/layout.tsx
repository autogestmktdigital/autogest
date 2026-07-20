import './globals.css';
import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { CookieBanner } from '@/components/site/cookie-banner';
import { isConsentGranted } from '@/lib/consent';

export const metadata: Metadata = {
  title: {
    default: 'Brothers Multimarcas — Seminovos Selecionados em Guarulhos',
    template: '%s | Brothers Multimarcas',
  },
  description:
    'Seu próximo carro começa com informação. Veículos selecionados, revisados e com as melhores condições do mercado. Estoque multimarcas em Guarulhos — SP.',
  keywords: [
    'carros seminovos',
    'veículos usados',
    'loja de carros',
    'multimarcas',
    'Guarulhos',
    'São Paulo',
    'financiamento',
    'troca',
  ],
  authors: [{ name: 'Brothers Multimarcas' }],
  creator: 'Brothers Multimarcas',
  publisher: 'Brothers Multimarcas',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brothersmultimarcas.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Brothers Multimarcas',
    title: 'Brothers Multimarcas — Seminovos Selecionados',
    description:
      'Seu próximo carro começa com informação. Veículos selecionados, revisados e com as melhores condições do mercado.',
    images: [
      {
        url: '/logo-oficial.png',
        width: 1200,
        height: 630,
        alt: 'Brothers Multimarcas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brothers Multimarcas — Seminovos Selecionados',
    description:
      'Seu próximo carro começa com informação. Veículos selecionados, revisados e com as melhores condições do mercado.',
    images: ['/logo-oficial.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-oficial.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-oficial.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gtmEnabled = gtmId && (typeof window === 'undefined' || isConsentGranted('analytics') || isConsentGranted('marketing'));

  return (
    <html lang="pt-BR">
      <body className="bg-brothers-dark text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
      {gtmEnabled ? <GoogleTagManager gtmId={gtmId} /> : null}
    </html>
  );
}