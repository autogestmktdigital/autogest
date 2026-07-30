import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const vehicleSaleService = {
  async create(rawData: Record<string, unknown>) {
    const data: Prisma.VehicleSaleCreateInput = {
      vehicleId: Number(rawData.vehicleId),
      salePrice: Number(rawData.salePrice),
      saleDate: new Date(String(rawData.saleDate)),
      buyerName: String(rawData.clientName || rawData.buyerName || ''),
      buyerPhone: rawData.clientPhone ? String(rawData.clientPhone) : undefined,
      buyerEmail: rawData.clientEmail ? String(rawData.clientEmail) : undefined,
      paymentMethod: String(rawData.paymentMethod || ''),
      downPayment: rawData.downPayment ? Number(rawData.downPayment) : undefined,
      financedAmount: rawData.financedAmount ? Number(rawData.financedAmount) : undefined,
      installments: rawData.installments ? Number(rawData.installments) : undefined,
      installmentValue: rawData.installmentValue ? Number(rawData.installmentValue) : undefined,
      notes: rawData.documentationNotes ? String(rawData.documentationNotes) : undefined,
    };
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
