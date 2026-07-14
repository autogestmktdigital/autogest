import type { Vehicle, VehicleDetailResponse, VehicleListResponse } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

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

  return request<VehicleListResponse>(`/vehicles/public${query.toString() ? `?${query.toString()}` : ''}`);
}

export async function getVehicle(id: number) {
  return request<VehicleDetailResponse>(`/vehicles/public/${id}`);
}