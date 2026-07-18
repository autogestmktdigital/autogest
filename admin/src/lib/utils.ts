import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export const leadStatusLabels: Record<string, string> = {
  bot: 'Bot',
  new: 'Novo',
  in_conversation: 'Em Conversa',
  negotiating: 'Negociando',
  converted: 'Convertido',
  gave_up: 'Desistiu',
  invalid: 'Indevido',
  no_return: 'Sem Retorno',
  // Status antigos (compatibilidade)
  new_lead: 'Novo',
  contacted: 'Em Conversa',
  qualified: 'Negociando',
  lost: 'Desistiu',
};

export const leadStatusColors: Record<string, string> = {
  bot: 'default',
  new: 'info',
  in_conversation: 'warning',
  negotiating: 'warning',
  converted: 'success',
  gave_up: 'danger',
  invalid: 'danger',
  no_return: 'secondary',
  // Status antigos (compatibilidade)
  new_lead: 'info',
  contacted: 'warning',
  qualified: 'warning',
  lost: 'danger',
};

export const vehicleStatusLabels: Record<string, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  sold: 'Vendido',
};

export const vehicleStatusColors: Record<string, string> = {
  available: 'success',
  reserved: 'warning',
  sold: 'danger',
};

export const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  website: 'Website',
};

export const channelColors: Record<string, string> = {
  whatsapp: 'success',
  instagram: 'danger',
  facebook: 'info',
  website: 'default',
};

export const fuelLabels: Record<string, string> = {
  flex: 'Flex',
  gasoline: 'Gasolina',
  ethanol: 'Etanol',
  diesel: 'Diesel',
  electric: 'Elétrico',
  hybrid: 'Híbrido',
};

export const transmissionLabels: Record<string, string> = {
  manual: 'Manual',
  automatic: 'Automático',
  cvt: 'CVT',
  automated: 'Automatizado',
};

export const followUpTypeLabels: Record<string, string> = {
  welcome_24h: 'Boas-vindas 24h',
  check_interest: 'Verificar Interesse',
  price_drop: 'Queda de Preço',
  new_stock: 'Novo Estoque',
  custom: 'Personalizado',
};

export const followUpStatusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  sent: 'Enviado',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const followUpStatusColors: Record<string, string> = {
  scheduled: 'warning',
  sent: 'success',
  failed: 'danger',
  cancelled: 'default',
};
