'use client';

import { trackWhatsAppClick } from '@/lib/gtm';
import { trackWhatsAppConversion } from '@/lib/google-ads';

interface WhatsAppLinkProps {
  href: string;
  buttonLocation: string;
  vehicleId?: number | string | null;
  vehicleName?: string | null;
  vehiclePrice?: number | null;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

/**
 * Link de WhatsApp com rastreamento automático de clique.
 * Substitui <a> em todos os botões/links de WhatsApp do site.
 */
export function WhatsAppLink({
  href,
  buttonLocation,
  vehicleId,
  vehicleName,
  vehiclePrice,
  children,
  className,
  target = '_blank',
  rel = 'noreferrer',
}: WhatsAppLinkProps) {
  function handleClick() {
    trackWhatsAppClick({
      buttonLocation,
      vehicleId,
      vehicleName,
      vehiclePrice,
    });

    // Conversão do Google Ads só é registrada quando o link efetivamente
    // abre o WhatsApp (wa.me). Outros usos deste componente (ex.: link de
    // telefone no footer) não devem gerar essa conversão.
    if (href.startsWith('https://wa.me/')) {
      trackWhatsAppConversion();
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
}
