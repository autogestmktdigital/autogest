/**
 * Dados estruturados JSON-LD para schema.org.
 * Seguro para SSR — só gera objeto, não acessa window.
 */

export interface JsonLdAutoDealer {
  '@context': 'https://schema.org';
  '@type': 'AutoDealer';
  name: string;
  url: string;
  logo: string;
  image?: string;
  telephone?: string;
  email?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  sameAs?: string[];
  priceRange?: string;
}

export interface JsonLdVehicle {
  '@context': 'https://schema.org';
  '@type': 'Vehicle';
  name: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  model: string;
  vehicleIdentificationNumber?: string;
  color?: string;
  fuelType?: string;
  mileageFromOdometer?: {
    '@type': 'QuantitativeValue';
    value: number;
    unitCode: string;
  };
  offers?: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  image?: string[];
  description?: string;
  vehicleEngine?: {
    '@type': 'EngineSpecification';
    fuelType: string;
  };
  vehicleTransmission?: string;
  productionDate?: number;
}

/**
 * Gera JSON-LD para a empresa (AutoDealer).
 */
export function generateAutoDealerJsonLd(siteUrl: string): JsonLdAutoDealer {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'Brothers Multimarcas',
    url: siteUrl,
    logo: `${siteUrl}/logo-oficial.png`,
    image: `${siteUrl}/logo-oficial.png`,
    telephone: '+55-11-98561-4257',
    email: 'contato@brothersmultimarcas.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Anton Philips, 186, Vila Hermínia',
      addressLocality: 'Guarulhos',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://instagram.com/newbrothers_multimarcas',
      'https://facebook.com/brothersmultimarcas',
    ],
    priceRange: '$$$',
  };
}

/**
 * Gera JSON-LD para um veículo específico.
 */
export function generateVehicleJsonLd(
  vehicle: {
    id: number;
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    modelYear?: number | null;
    price: number;
    mileageKm: number;
    fuel: string;
    color: string;
    transmission: string;
    description?: string | null;
    images?: string | null;
    plate?: string | null;
  },
  siteUrl: string,
  imageUrls: string[]
): JsonLdVehicle {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''}`,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    color: vehicle.color,
    fuelType: vehicle.fuel,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileageKm,
      unitCode: 'KMT',
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/veiculos/${vehicle.id}`,
    },
    image: imageUrls.length > 0 ? imageUrls : undefined,
    description: vehicle.description || undefined,
    vehicleEngine: {
      '@type': 'EngineSpecification',
      fuelType: vehicle.fuel,
    },
    vehicleTransmission: vehicle.transmission,
    productionDate: vehicle.year,
  };
}
