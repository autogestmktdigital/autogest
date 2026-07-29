import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversation.service';
import { sendWhatsAppText } from '../services/whatsapp.service';
import { prisma } from '../config';

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

      // Se for mensagem do vendedor (agente) e o canal for WhatsApp, enviar para o cliente
      if (role === 'agent' || role === 'seller') {
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: { lead: { select: { phone: true, channel: true } } },
        });

        if (conversation?.lead?.channel === 'whatsapp' && conversation.lead.phone) {
          try {
            await sendWhatsAppText(conversation.lead.phone, content);
            console.log(`Mensagem enviada para WhatsApp ${conversation.lead.phone}: ${content}`);
          } catch (err: any) {
            console.error('Erro ao enviar mensagem WhatsApp:', err.message);
            // Não falhar a requisição se o envio WhatsApp der erro
          }
        }
      }

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

  async assignConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { userId, userName } = req.body;

      const conversation = await conversationService.assignConversation(id, userId, userName);

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
