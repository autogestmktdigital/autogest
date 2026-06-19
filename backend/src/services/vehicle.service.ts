import { prisma } from '../config';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import type { VehicleStatus, FuelType, TransmissionType } from '../types';

export interface VehicleFilters {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  status?: VehicleStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class VehicleService {
  async list(filters: VehicleFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (filters.brand) where.brand = { contains: filters.brand };
    if (filters.model) where.model = { contains: filters.model };
    if (filters.fuel) where.fuel = filters.fuel;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = 'available';
    }

    if (filters.yearMin || filters.yearMax) {
      where.year = {};
      if (filters.yearMin) where.year.gte = filters.yearMin;
      if (filters.yearMax) where.year.lte = filters.yearMax;
    }

    if (filters.priceMin || filters.priceMax) {
      where.price = {};
      if (filters.priceMin) where.price.gte = filters.priceMin;
      if (filters.priceMax) where.price.lte = filters.priceMax;
    }

    if (filters.search) {
      where.OR = [
        { brand: { contains: filters.search } },
        { model: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new AppError('Veículo não encontrado', 404);
    }
    return vehicle;
  }

  async create(data: Prisma.VehicleCreateInput) {
    return prisma.vehicle.create({ data });
  }

  async update(id: number, data: Prisma.VehicleUpdateInput) {
    await this.getById(id);
    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.getById(id);
    return prisma.vehicle.delete({ where: { id } });
  }

  async updateStatus(id: number, status: VehicleStatus) {
    await this.getById(id);
    return prisma.vehicle.update({ where: { id }, data: { status } });
  }

  async searchForBot(query: string, maxResults: number = 5) {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: 'available',
        OR: [
          { brand: { contains: query } },
          { model: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: maxResults,
      orderBy: { price: 'asc' },
    });

    return vehicles.map((v) => ({
      id: v.id,
      titulo: `${v.brand} ${v.model} ${v.year}`,
      preco: `R$ ${v.price.toLocaleString('pt-BR')}`,
      km: `${v.mileageKm.toLocaleString('pt-BR')} km`,
      combustivel: v.fuel,
      cambio: v.transmission === 'automatic' ? 'Automático' : 'Manual',
      cor: v.color,
      descricao: v.description,
      imagens: v.images,
    }));
  }
}

export const vehicleService = new VehicleService();
