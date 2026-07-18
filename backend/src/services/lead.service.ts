import { prisma } from '../config';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import type { Channel, LeadStatus } from '../types';

export interface LeadFilters {
  status?: LeadStatus;
  channel?: Channel;
  assignedToId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class LeadService {
  async list(filters: LeadFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.channel) where.channel = filters.channel;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { conversations: true, financingSimulations: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: number) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        conversations: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
        financingSimulations: {
          orderBy: { createdAt: 'desc' },
          include: { vehicle: { select: { brand: true, model: true, year: true } } },
        },
        followUps: { orderBy: { scheduledFor: 'desc' }, take: 10 },
      },
    });

    if (!lead) throw new AppError('Lead não encontrado', 404);
    return lead;
  }

  async findOrCreate(data: {
    channel: Channel;
    channelUserId: string;
    name?: string;
    phone?: string;
  }) {
    let lead = await prisma.lead.findUnique({
      where: {
        channel_channelUserId: {
          channel: data.channel,
          channelUserId: data.channelUserId,
        },
      },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          channel: data.channel,
          channelUserId: data.channelUserId,
          name: data.name,
          phone: data.phone,
          status: 'bot',
        },
      });
    }

    return lead;
  }

  async update(id: number, data: Prisma.LeadUpdateInput) {
    await this.getById(id);
    return prisma.lead.update({ where: { id }, data });
  }

  async updateStatus(id: number, status: LeadStatus) {
    return this.update(id, { status });
  }

  async assignToSeller(id: number, sellerId: number) {
    return this.update(id, {
      assignedTo: { connect: { id: sellerId } },
      status: 'in_conversation' as LeadStatus,
    });
  }

  async getStats() {
    const [byStatus, byChannel, total] = await Promise.all([
      prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['channel'],
        _count: { id: true },
      }),
      prisma.lead.count(),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byChannel: byChannel.reduce((acc, item) => {
        acc[item.channel] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const leadService = new LeadService();
