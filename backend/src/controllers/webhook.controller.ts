import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { leadService } from '../services/lead.service';
import { conversationService } from '../services/conversation.service';
import { followUpService } from '../services/followup.service';
import { openaiService } from '../services/openai.service';

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

  async recommendVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerPreferences, vehicles } = req.body;

      if (!customerPreferences || !vehicles || !Array.isArray(vehicles)) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: customerPreferences (string) e vehicles (array)',
        });
      }

      const recommendation = await openaiService.recommendVehicles({
        customerPreferences,
        vehicles,
      });

      return res.json({ success: true, data: { recommendation } });
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

  async vehicleAssistant(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          found: false,
          message: 'Desculpe, não entendi sua busca. Pode repetir o modelo ou marca que você procura?',
        });
      }

      // 1. Buscar veículos no estoque
      const vehicles = await vehicleService.searchForBot(query, 5);

      // 2. Se não encontrou nenhum
      if (!vehicles || vehicles.length === 0) {
        return res.json({
          success: true,
          found: false,
          message: 'Não encontrei veículos com esse termo no momento. 😕\n\nQuer tentar outro modelo ou falar com um vendedor?',
        });
      }

      // 3. Enviar para OpenAI formatar a resposta
      const recommendation = await openaiService.recommendVehicles({
        customerPreferences: query,
        vehicles,
      });

      // 4. Retornar mensagem pronta
      return res.json({
        success: true,
        found: true,
        message: recommendation,
      });
    } catch (error) {
      next(error);
    }
  },

  async whatsappWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Verificação do webhook (GET)
      if (mode === 'subscribe') {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'brothers-multimarcas-verify-token';
        
        if (token === verifyToken) {
          console.log('Webhook do WhatsApp verificado com sucesso');
          return res.status(200).send(challenge);
        } else {
          console.error('Token de verificação inválido');
          return res.sendStatus(403);
        }
      }

      // Recebimento de mensagens (POST)
      if (req.method === 'POST') {
        const body = req.body;
        
        if (body.object === 'whatsapp_business_account') {
          const entry = body.entry?.[0];
          const changes = entry?.changes?.[0];
          const value = changes?.value;
          
          if (value?.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const from = message.from; // Número do remetente
            const text = message.text?.body || '';
            
            console.log(`Mensagem recebida de ${from}: ${text}`);
            
            // Aqui você pode processar a mensagem e enviar para o Typebot
            // ou responder diretamente via API do WhatsApp
          }
        }
        
        return res.sendStatus(200);
      }

      return res.sendStatus(400);
    } catch (error) {
      next(error);
    }
  },
};
