import { Request, Response, NextFunction } from 'express';
import { followUpService } from '../services/followup.service';

export const followUpController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await followUpService.listAll();
      return res.json({ success: true, data: followUps });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadId, type, scheduledFor } = req.body;
      const followUp = await followUpService.create({
        leadId: Number(leadId),
        type,
        scheduledFor: new Date(scheduledFor),
      });
      return res.status(201).json({ success: true, data: followUp });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { scheduledFor } = req.body;
      const followUp = await followUpService.update(id, { scheduledFor: new Date(scheduledFor) });
      return res.json({ success: true, data: followUp });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const followUp = await followUpService.cancelFollowUp(id);
      return res.json({ success: true, data: followUp });
    } catch (error) {
      next(error);
    }
  },
};
