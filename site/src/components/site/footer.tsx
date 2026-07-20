import { Mail, MapPin, Phone } from 'lucide-react';
import { WhatsAppLink } from './whatsapp-link';
import { CookieSettingsButton } from './cookie-settings-button';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contato" className="border-t border-white/10 bg-brothers-gray py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <img src="/logo-oficial.png" alt="Brothers Multimarcas" className="mb-4 h-16 w-auto" />
            <p className="text-sm leading-relaxed text-white/70">
              Seu próximo carro começa com informação. Veículos selecionados, revisados e com as melhores condições do mercado.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-brothers-green">Contato</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brothers-green" />
                <WhatsAppLink href="tel:+5511985614257" buttonLocation="footer">(11) 98561-4257</WhatsAppLink>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brothers-green" />
                <a href="mailto:contato@brothersmultimarcas.com.br">contato@brothersmultimarcas.com.br</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-brothers-green" />
                <span>Av. Anton Philips, 186, Vila Hermínia - Guarulhos - SP</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-brothers-green">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/NewBrothersMultimarcas"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-brothers-green hover:text-brothers-green"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/brothersmultimarcassp"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-brothers-green hover:text-brothers-green"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@brothersmultimarcassp"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-brothers-green hover:text-brothers-green"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@brothersmultimarcassp"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-brothers-green hover:text-brothers-green"
              >
                <YouTubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <p>CNPJ: 48.573.595/0001-09</p>
          <p className="mt-1">© {year} Brothers Multimarcas. Todos os direitos reservados.</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <a href="/politica-de-privacidade" className="underline transition hover:text-brothers-green">
              Política de Privacidade
            </a>
            <span>|</span>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}