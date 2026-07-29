import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { leadService } from '../services/lead.service';
import { conversationService } from '../services/conversation.service';
import { followUpService } from '../services/followup.service';
import { openaiService } from '../services/openai.service';

const TYPEBOT_PUBLIC_ID = 'brothers-multimarcas-v-2-8-ow8km46';
const TYPEBOT_API_URL = 'https://typebot.co/api/v1';

async function sendWhatsAppMessage(to: string, text: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_ACCESS_TOKEN não configurado');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Erro ao enviar mensagem WhatsApp:', err);
  }
}

async function startTypebotChat(prefilledVariables?: Record<string, string>) {
  const url = `${TYPEBOT_API_URL}/typebots/${TYPEBOT_PUBLIC_ID}/startChat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefilledVariables }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Typebot startChat error: ${err}`);
  }

  return res.json() as Promise<{ sessionId: string; messages: Array<{ type: string; content?: { text?: string }; text?: string }> }>;
}

async function continueTypebotChat(sessionId: string, message: string) {
  const url = `${TYPEBOT_API_URL}/sessions/${sessionId}/continueChat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Typebot continueChat error: ${err}`);
  }

  return res.json() as Promise<{ messages: Array<{ type: string; content?: { text?: string }; text?: string }> }>;
}

function extractTypebotTextMessages(
  messages: Array<{ type: string; content?: { text?: string }; text?: string }>
): string[] {
  return messages
    .filter((m) => m.type === 'text')
    .map((m) => {
      if (typeof m.text === 'string') return m.text;
      if (m.content?.text) return m.content.text;
      return '';
    })
    .filter(Boolean);
}

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
            const from = message.from; // Número do remetente (ex: 5511918622241)
            const text = message.text?.body || '';

            console.log(`Mensagem recebida de ${from}: ${text}`);

            // Não processar mensagens do próprio número
            const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
            if (from === phoneNumberId) {
              return res.sendStatus(200);
            }

            try {
              // 1. Criar ou buscar lead
              const lead = await leadService.findOrCreate({
                channel: 'whatsapp',
                channelUserId: from,
                phone: from,
              });

              // 2. Buscar ou criar conversa ativa
              let conversation = await conversationService.findOrCreateForLead(lead.id, 'whatsapp');

              // 3. Salvar mensagem do cliente
              await conversationService.addMessage(conversation.id, 'customer', text);

              // 4. Se está em handoff humano, não enviar para Typebot
              if (conversation.isHumanHandoff) {
                console.log(`Conversa ${conversation.id} em handoff humano. Ignorando Typebot.`);
                return res.sendStatus(200);
              }

              // 5. Enviar para Typebot
              let typebotMessages: string[] = [];

              if (!conversation.typebotSessionId) {
                // Primeira interação - startChat
                console.log(`Iniciando Typebot para lead ${lead.id}`);
                const startResult = await startTypebotChat({
                  Telefone: from,
                  Nome: lead.name || '',
                });

                // Atualizar conversa com sessionId
                conversation = await conversationService.updateTypebotSession(
                  conversation.id,
                  startResult.sessionId
                );

                typebotMessages = extractTypebotTextMessages(startResult.messages);
              } else {
                // Continuar conversa existente
                console.log(`Continuando Typebot session ${conversation.typebotSessionId}`);
                const continueResult = await continueTypebotChat(
                  conversation.typebotSessionId,
                  text
                );
                typebotMessages = extractTypebotTextMessages(continueResult.messages);
              }

              // 6. Enviar respostas do Typebot de volta ao WhatsApp
              for (const msg of typebotMessages) {
                await sendWhatsAppMessage(from, msg);
                // Salvar mensagem do bot no sistema
                await conversationService.addMessage(conversation.id, 'agent', msg);
              }
            } catch (err: any) {
              console.error('Erro ao processar mensagem WhatsApp:', err);
              // Enviar mensagem de erro amigável ao cliente
              await sendWhatsAppMessage(
                from,
                'Desculpe, tive um problema técnico. Um vendedor vai te atender em breve!'
              );
            }
          }
        }

        return res.sendStatus(200);
      }

      return res.sendStatus(400);
    } catch (error) {
      next(error);
    }
  },

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        nome,
        telefone,
        origem,
        motivoContato,
        veiculoInteresse,
        anoVeiculo,
        precoVeiculo,
        modeloDesejado,
        faixaPreco,
        usoPrincipal,
        possuiTroca,
        veiculoTroca,
        anoTroca,
        kmTroca,
        formaPagamento,
        dataVisita,
        resumoAtendimento,
        status,
      } = req.body;

      // Validação básica
      if (!telefone) {
        return res.status(400).json({
          success: false,
          error: 'Telefone é obrigatório',
        });
      }

      // Montar o resumo completo
      const interestNotes = [
        `Origem: ${origem || 'Não informada'}`,
        `Motivo: ${motivoContato || 'Não informado'}`,
        `Veículo de interesse: ${veiculoInteresse || 'Não informado'}`,
        `Ano: ${anoVeiculo || 'Não informado'}`,
        `Preço: ${precoVeiculo || 'Não informado'}`,
        `Modelo desejado: ${modeloDesejado || 'Não informado'}`,
        `Faixa de preço: ${faixaPreco || 'Não informada'}`,
        `Uso principal: ${usoPrincipal || 'Não informado'}`,
        `Possui troca: ${possuiTroca || 'Não informado'}`,
        veiculoTroca ? `Veículo da troca: ${veiculoTroca}` : '',
        anoTroca ? `Ano da troca: ${anoTroca}` : '',
        kmTroca ? `KM da troca: ${kmTroca}` : '',
        `Forma de pagamento: ${formaPagamento || 'Não informada'}`,
        dataVisita ? `Data da visita: ${dataVisita}` : '',
        '',
        '--- Resumo do Atendimento ---',
        resumoAtendimento || 'Não informado',
      ].filter(Boolean).join('\n');

      // Criar ou atualizar o lead
      const lead = await leadService.findOrCreate({
        channel: 'whatsapp',
        channelUserId: telefone,
        name: nome || 'Não informado',
        phone: telefone,
        interestNotes,
        status: status || 'new',
      });

      // Criar uma nova conversa
      const conversation = await conversationService.create({
        leadId: lead.id,
        channel: 'whatsapp',
        status: 'active',
      });

      return res.json({
        success: true,
        leadId: lead.id,
        conversationId: conversation.id,
        status: lead.status,
      });
    } catch (error) {
      next(error);
    }
  },
};
