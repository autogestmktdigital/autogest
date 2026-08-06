import { prisma } from '../config';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import type { VehicleStatus, FuelType, TransmissionType } from '../types';

export interface VehicleFilters {
  brand?: string;
  model?: string;
  plate?: string;
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
    const limit = filters.limit || 100;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.plate) where.plate = { contains: filters.plate, mode: 'insensitive' };
    if (filters.fuel) where.fuel = filters.fuel;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.status) {
      where.status = filters.status;
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
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
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
      data: vehicles.map((v) => ({
        ...v,
        features: v.features ? JSON.parse(v.features) : [],
        images: v.images ? JSON.parse(v.images) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id },
      include: { expenses: true }
    });
    if (!vehicle) {
      throw new AppError('Veículo não encontrado', 404);
    }
    return {
      ...vehicle,
      features: vehicle.features ? JSON.parse(vehicle.features) : [],
      images: vehicle.images ? JSON.parse(vehicle.images) : [],
    };
  }

  async getPublicById(id: number) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, status: 'available' },
      include: { expenses: true }
    });
    if (!vehicle) {
      throw new AppError('Veículo não encontrado', 404);
    }
    return {
      ...vehicle,
      features: vehicle.features ? JSON.parse(vehicle.features) : [],
      images: vehicle.images ? JSON.parse(vehicle.images) : [],
    };
  }

  async addExpense(vehicleId: number, data: { type: string; description: string; amount: number; date: Date }) {
    await this.getById(vehicleId);
    return prisma.vehicleExpense.create({
      data: {
        ...data,
        vehicleId,
      },
    });
  }

  async removeExpense(expenseId: number) {
    return prisma.vehicleExpense.delete({
      where: { id: expenseId },
    });
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
    const searchTerm = query.trim();
    
    // Se o usuário enviar um número, buscar por ano também
    const yearQuery = parseInt(searchTerm);
    const isYear = !isNaN(yearQuery) && searchTerm.length === 4;
    
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: 'available',
        OR: [
          { brand: { contains: searchTerm, mode: 'insensitive' } },
          { model: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { color: { contains: searchTerm, mode: 'insensitive' } },
          ...(isYear ? [
            { year: yearQuery },
            { modelYear: yearQuery }
          ] : []),
        ],
      },
      take: maxResults,
      orderBy: { price: 'asc' },
    });

    return vehicles.map((v) => ({
      id: v.id,
      titulo: `${v.brand} ${v.model} ${v.year}${v.modelYear ? `/${v.modelYear}` : ''}`,
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
