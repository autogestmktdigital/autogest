'use client';

import { trackWhatsAppClick } from '@/lib/gtm';

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
