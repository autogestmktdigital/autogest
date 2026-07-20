import type { Vehicle, VehicleDetailResponse, VehicleListResponse } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function parseJsonArray(value?: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function maskPlate(plate?: string | null) {
  if (!plate) return null;
  const sanitized = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!sanitized) return null;
  return `${'X'.repeat(Math.max(sanitized.length - 1, 0))}${sanitized.slice(-1)}`;
}

function parseVehicle(raw: Vehicle & Record<string, unknown>): Vehicle {
  const parsedFeatures = parseJsonArray(typeof raw.features === 'string' ? raw.features : Array.isArray(raw.features) ? raw.features : null);
  const parsedImages = parseJsonArray(typeof raw.images === 'string' ? raw.images : Array.isArray(raw.images) ? raw.images : null);

  return {
    ...raw,
    features: parsedFeatures.length > 0 ? parsedFeatures.join(', ') : null,
    images: parsedImages.length > 0 ? parsedImages.join(',') : null,
    plate: maskPlate(typeof raw.plate === 'string' ? raw.plate : null),
  };
}

function toImageUrl(image: string) {
  if (!image) return '/placeholder-car.svg';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const normalized = image.startsWith('/') ? image : `/uploads/${image}`;
  return `${apiBaseUrl.replace(/\/api$/, '')}${normalized}`;
}

export function getImageUrl(image: string) {
  return toImageUrl(image);
}

export function formatVehicleYear(vehicle: Pick<Vehicle, 'year' | 'modelYear'>) {
  if (vehicle.modelYear && vehicle.modelYear !== vehicle.year) {
    return `${vehicle.year}/${vehicle.modelYear}`;
  }
  return `${vehicle.year}`;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getVehicles(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const result = await request<VehicleListResponse>(`/vehicles/public${query.toString() ? `?${query.toString()}` : ''}`);
  return {
    ...result,
    data: Array.isArray(result.data) ? result.data.map((vehicle) => parseVehicle(vehicle as Vehicle & Record<string, unknown>)) : [],
  };
}

export async function getVehicle(id: number) {
  const result = await request<VehicleDetailResponse>(`/vehicles/public/${id}`);
  return {
    ...result,
    data: parseVehicle(result.data as Vehicle & Record<string, unknown>),
  };
}