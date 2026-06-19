import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversation.service';

export const conversationController = {
  async getActiveConversations(_req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await conversationService.getActiveConversations();

      return res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  },

  async listByLead(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = Number(req.params.leadId);
      const conversations = await conversationService.listByLead(leadId);

      return res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      const result = await conversationService.getMessages(id, page, limit);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async addMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { role, content, mediaUrl } = req.body;

      const message = await conversationService.addMessage(id, role, content, mediaUrl);

      return res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  },

  async setHumanHandoff(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { isHandoff } = req.body;

      const conversation = await conversationService.setHumanHandoff(id, isHandoff);

      return res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  },

  async closeConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const conversation = await conversationService.closeConversation(id);

      return res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  },
};
