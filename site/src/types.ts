export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'inactive';
export type FuelType = 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  modelYear?: number | null;
  price: number;
  mileageKm: number;
  fuel: FuelType;
  color: string;
  transmission: TransmissionType;
  plate?: string | null;
  description?: string | null;
  features?: string | null;
  images?: string | null;
  status?: VehicleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleListResponse {
  success: boolean;
  data: Vehicle[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VehicleDetailResponse {
  success: boolean;
  data: Vehicle;
}