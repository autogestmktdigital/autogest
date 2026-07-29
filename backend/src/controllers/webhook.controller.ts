import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { leadService } from '../services/lead.service';
import { conversationService } from '../services/conversation.service';
import { followUpService } from '../services/followup.service';
import { openaiService } from '../services/openai.service';

const TYPEBOT_PUBLIC_ID = 'brothers-multimarcas-v-2-9-iknk9xg';
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

async function sendWhatsAppListMessage(
  to: string,
  headerText: string,
  bodyText: string,
  options: Array<{ id: string; title: string; description?: string }>
) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_ACCESS_TOKEN não configurado');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  // Build interactive message
  const interactive: any = {
    type: 'list',
    body: {
      text: bodyText,
    },
    action: {
      button: 'Ver opções',
      sections: [
        {
          title: 'Opções',
          rows: options.map((opt, idx) => ({
            id: opt.id || String(idx),
            title: opt.title.substring(0, 24),
            description: opt.description?.substring(0, 72),
          })),
        },
      ],
    },
  };

  // Only add header if it's not empty
  if (headerText && headerText.trim()) {
    interactive.header = {
      type: 'text',
      text: headerText.substring(0, 60),
    };
  }

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
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
    console.error('Erro ao enviar lista WhatsApp:', err);
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

  return res.json() as Promise<{
    sessionId: string;
    messages: TypebotMessage[];
    input?: TypebotInput;
  }>;
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

  return res.json() as Promise<{
    messages: TypebotMessage[];
    input?: TypebotInput;
  }>;
}

interface TypebotMessage {
  type: string;
  content?: {
    type?: string;
    text?: string;
    richText?: Array<{ type: string; children: Array<{ text?: string }> }>;
    options?: Array<{ id?: string; label?: string; content?: string }>;
    buttonLabel?: string;
  };
  text?: string;
  options?: Array<{ id?: string; label?: string; content?: string }>;
}

interface TypebotInput {
  type: string;
  items?: Array<{ id?: string; content?: string; label?: string }>;
  options?: {
    labels?: { placeholder?: string };
    variableId?: string;
  };
}

function extractTypebotText(messages: TypebotMessage[]): string[] {
  return messages
    .filter((m) => m.type === 'text')
    .map((m) => {
      if (typeof m.text === 'string') return m.text;
      if (m.content?.text) return m.content.text;

      if (m.content?.richText && Array.isArray(m.content.richText)) {
        return m.content.richText
          .map((block) => {
            if (block.children && Array.isArray(block.children)) {
              return block.children.map((child) => child.text || '').join('');
            }
            return '';
          })
          .join('\n');
      }

      return '';
    })
    .filter(Boolean);
}

function extractTypebotOptions(
  input?: TypebotInput
): { header: string; body: string; options: Array<{ id: string; title: string }> } | null {
  if (!input) return null;
  if (input.type !== 'choice input') return null;

  const items = input.items || [];
  if (items.length === 0) return null;

  const options = items.map((item, idx) => ({
    id: String(idx),
    title: (item.content || item.label || `Opção ${idx + 1}`).substring(0, 20),
  }));

  if (options.length === 0) return null;

  return {
    header: '',
    body: 'Escolha uma opção:',
    options,
  };
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
            
            // Extrair texto da mensagem (texto normal OU resposta de lista interativa)
            let text = '';
            let isListReply = false;
            let listReplyId = '';

            if (message.text?.body) {
              text = message.text.body;
            } else if (message.interactive?.list_reply) {
              isListReply = true;
              listReplyId = message.interactive.list_reply.id;
              text = message.interactive.list_reply.title || '';
            } else if (message.interactive?.button_reply?.title) {
              text = message.interactive.button_reply.title;
            }

            console.log(`Mensagem recebida de ${from}: ${text} (listReply: ${isListReply}, id: ${listReplyId})`);

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

              // Se for resposta de lista, usar o texto da opção selecionada
              let typebotMessage = text;
              if (isListReply && message.interactive?.list_reply?.title) {
                typebotMessage = message.interactive.list_reply.title;
                console.log(`Resposta de lista recebida: ${typebotMessage}`);
              }

              // 3. Salvar mensagem do cliente
              await conversationService.addMessage(conversation.id, 'customer', text);

              // 4. Se está em handoff humano, não enviar para Typebot
              if (conversation.isHumanHandoff) {
                console.log(`Conversa ${conversation.id} em handoff humano. Ignorando Typebot.`);
                return res.sendStatus(200);
              }

              // 5. Enviar para Typebot
              let typebotMessages: TypebotMessage[] = [];
              let typebotInput: TypebotInput | undefined;

              try {
                if (!conversation.typebotSessionId) {
                  // Primeira interação - startChat
                  console.log(`Iniciando Typebot para lead ${lead.id}`);
                  const startResult = await startTypebotChat({
                    Telefone: from,
                    Nome: lead.name || '',
                  });

                  console.log(`Typebot startChat resposta: sessionId=${startResult.sessionId}, messages=${startResult.messages?.length}, input=${startResult.input ? 'sim' : 'nao'}`);

                  // Atualizar conversa com sessionId
                  conversation = await conversationService.updateTypebotSession(
                    conversation.id,
                    startResult.sessionId
                  );

                  typebotMessages = startResult.messages || [];
                  typebotInput = startResult.input;
                } else {
                  // Continuar conversa existente
                  console.log(`Continuando Typebot session ${conversation.typebotSessionId} com mensagem: ${typebotMessage}`);
                  const continueResult = await continueTypebotChat(
                    conversation.typebotSessionId,
                    typebotMessage
                  );

                  console.log(`Typebot continueChat resposta: messages=${continueResult.messages?.length}, input=${continueResult.input ? 'sim' : 'nao'}`);

                  typebotMessages = continueResult.messages || [];
                  typebotInput = continueResult.input;
                }
              } catch (typebotErr: any) {
                console.error('Erro ao chamar Typebot:', typebotErr.message);
                throw typebotErr;
              }

              // 6. Separar mensagens de texto e opções
              const textMessages = extractTypebotText(typebotMessages);
              const choiceOptions = extractTypebotOptions(typebotInput);

              // 7. Enviar mensagens de texto
              for (const msg of textMessages) {
                await sendWhatsAppMessage(from, msg);
                await conversationService.addMessage(conversation.id, 'agent', msg);
              }

              // 8. Se houver opções, enviar como lista interativa
              if (choiceOptions) {
                await sendWhatsAppListMessage(
                  from,
                  choiceOptions.header,
                  choiceOptions.body,
                  choiceOptions.options
                );
                await conversationService.addMessage(
                  conversation.id,
                  'agent',
                  `[Lista de opções] ${choiceOptions.options.map((o) => o.title).join(', ')}`
                );
              }
            } catch (err: any) {
              console.error('Erro ao processar mensagem WhatsApp:', err);
              console.error('Stack trace:', err.stack);
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
      console.log('Recebendo requisição createLead:', JSON.stringify(req.body));
      
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
        console.log('Erro createLead: telefone não informado. Body:', JSON.stringify(req.body));
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
      // Converter status do Typebot para status do sistema
      let leadStatus = status || 'new';
      if (leadStatus === 'Aguardando vendedor') {
        leadStatus = 'new';
      }

      const lead = await leadService.findOrCreate({
        channel: 'whatsapp',
        channelUserId: telefone,
        name: nome || 'Não informado',
        phone: telefone,
        interestNotes,
        status: leadStatus,
      });

      // Criar uma nova conversa
      const conversation = await conversationService.create({
        leadId: lead.id,
        channel: 'whatsapp',
        status: 'active',
      });

      console.log('Lead criado com sucesso:', { leadId: lead.id, conversationId: conversation.id });

      return res.json({
        success: true,
        leadId: lead.id,
        conversationId: conversation.id,
        status: lead.status,
      });
    } catch (error) {
      console.error('Erro no createLead:', error);
      next(error);
    }
  },
};
