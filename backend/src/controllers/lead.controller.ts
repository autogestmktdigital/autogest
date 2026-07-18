import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import type { LeadFilters } from '../services/lead.service';

export const leadController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: LeadFilters & { phone?: string } = {
        status: req.query.status as LeadFilters['status'],
        channel: req.query.channel as LeadFilters['channel'],
        assignedToId: req.query.assignedToId ? Number(req.query.assignedToId) : undefined,
        search: req.query.search as string | undefined,
        phone: req.query.phone as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      const result = await leadService.list(filters);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await leadService.getStats();

      return res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const lead = await leadService.getById(id);

      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const lead = await leadService.update(id, req.body);

      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      // Bloquear status automáticos do sistema
      if (status === 'bot' || status === 'new') {
        return res.status(400).json({ success: false, message: 'Status automático do sistema não pode ser definido manualmente' });
      }
      const lead = await leadService.updateStatus(id, status);

      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  },

  async assignToSeller(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { sellerId } = req.body;
      const lead = await leadService.assignToSeller(id, sellerId);

      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  },
};
