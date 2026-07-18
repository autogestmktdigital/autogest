import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export const vehicleSaleService = {
  async create(data: Prisma.VehicleSaleCreateInput) {
    return prisma.vehicleSale.create({ data });
  },

  async getByVehicleId(vehicleId: number) {
    return prisma.vehicleSale.findFirst({
      where: { vehicleId },
    });
  },

  async update(id: number, data: Prisma.VehicleSaleUpdateInput) {
    return prisma.vehicleSale.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.vehicleSale.delete({
      where: { id },
    });
  },
};
