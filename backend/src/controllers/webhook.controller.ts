import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { leadService } from '../services/lead.service';
import { conversationService } from '../services/conversation.service';
import { followUpService } from '../services/followup.service';

export const webhookController = {
  async searchVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const results = await vehicleService.searchForBot(query);

      return res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },

  async registerLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { channel, channelUserId, name, phone } = req.body;

      const lead = await leadService.findOrCreate({
        channel,
        channelUserId,
        name,
        phone,
      });

      // Schedule welcome follow-up for new leads
      await followUpService.scheduleWelcome24h(lead.id);

      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  },

  async handoff(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.body;
      const conversation = await conversationService.setHumanHandoff(Number(conversationId), true);

      return res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  },
};
