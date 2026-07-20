/**
 * Utilitários para envio de eventos ao Google Tag Manager via dataLayer.
 * Funciona apenas no navegador (client-side), seguro para SSR.
 */

export interface DataLayerEvent {
  event: string;
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Envia um evento para o dataLayer do GTM.
 * Seguro para SSR — só executa no browser.
 */
export function pushToDataLayer(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  window.dataLayer.push(payload);
}

/**
 * Evento: clique em qualquer botão/link de WhatsApp
 */
export function trackWhatsAppClick(params: {
  buttonLocation: string;
  vehicleId?: number | string | null;
  vehicleName?: string | null;
  vehiclePrice?: number | null;
  pagePath?: string;
}): void {
  pushToDataLayer({
    event: 'whatsapp_click',
    button_location: params.buttonLocation,
    vehicle_id: params.vehicleId ?? null,
    vehicle_name: params.vehicleName ?? null,
    vehicle_price: params.vehiclePrice ?? null,
    page_path: params.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
  });
}

/**
 * Evento: visualização da página de detalhes de um veículo
 */
export function trackViewVehicle(params: {
  vehicleId: number | string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number | string;
  vehiclePrice: number;
  pagePath?: string;
}): void {
  pushToDataLayer({
    event: 'view_vehicle',
    vehicle_id: params.vehicleId,
    vehicle_name: params.vehicleName,
    vehicle_brand: params.vehicleBrand,
    vehicle_model: params.vehicleModel,
    vehicle_year: params.vehicleYear,
    vehicle_price: params.vehiclePrice,
    page_path: params.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
  });
}

/**
 * Evento: visualização da página de estoque
 */
export function trackViewInventory(params: {
  vehiclesVisible: number;
  pagePath?: string;
}): void {
  pushToDataLayer({
    event: 'view_inventory',
    vehicles_visible: params.vehiclesVisible,
    page_path: params.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
  });
}

/**
 * Hook helper para disparar evento uma única vez por montagem.
 * Use dentro de useEffect com [] como dependência.
 */
export function useTrackOnce(eventFn: () => void): void {
  if (typeof window !== 'undefined') {
    eventFn();
  }
}
