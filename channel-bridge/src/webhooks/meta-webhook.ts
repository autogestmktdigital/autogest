import { Router, Request, Response } from 'express';
import { normalizeInstagramMessage, normalizeFacebookMessage } from '../adapters/message-adapter';
import { TypebotClient } from '../typebot-client';
import { MetaSender } from '../adapters/meta-sender';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || '';
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || '';
const TYPEBOT_API_URL = process.env.TYPEBOT_API_URL || '';
const TYPEBOT_API_TOKEN = process.env.TYPEBOT_API_TOKEN || '';
const TYPEBOT_BOT_ID = process.env.TYPEBOT_BOT_ID || '';

const typebotClient = new TypebotClient(TYPEBOT_API_URL, TYPEBOT_API_TOKEN, TYPEBOT_BOT_ID);
const metaSender = new MetaSender(PAGE_ACCESS_TOKEN);

// Armazena sessões ativas: senderId -> typebotSessionId
const sessionStore = new Map<string, string>();

export function createWebhookRouter(): Router {
  const router = Router();

  // Verificação do webhook (GET)
  router.get('/meta', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WEBHOOK] Verificação Meta bem-sucedida');
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  });

  // Receber mensagens (POST)
  router.post('/meta', async (req: Request, res: Response) => {
    const body = req.body;

    // Responde 200 imediatamente para o Meta
    res.sendStatus(200);

    try {
      if (body.object === 'instagram') {
        for (const entry of body.entry || []) {
          const message = normalizeInstagramMessage(entry);
          if (message) {
            await processMessage(message);
          }
        }
      } else if (body.object === 'page') {
        for (const entry of body.entry || []) {
          const message = normalizeFacebookMessage(entry);
          if (message) {
            await processMessage(message);
          }
        }
      }
    } catch (error) {
      console.error('[WEBHOOK] Erro ao processar mensagem:', error);
    }
  });

  return router;
}

async function processMessage(message: { channel: 'instagram' | 'facebook'; senderId: string; text?: string }) {
  const { channel, senderId, text } = message;

  if (!text) return;

  const sessionKey = `${channel}:${senderId}`;
  let sessionId = sessionStore.get(sessionKey);

  try {
    let response;

    if (!sessionId) {
      // Iniciar nova sessão no Typebot
      response = await typebotClient.startSession(sessionKey);
      sessionId = response.sessionId;
      sessionStore.set(sessionKey, sessionId);
      console.log(`[BRIDGE] Nova sessão criada: ${sessionKey} -> ${sessionId}`);
    }

    // Enviar mensagem ao Typebot
    response = await typebotClient.sendMessage(sessionId, text);

    // Extrair textos da resposta
    const replies = typebotClient.extractTextFromResponse(response);
    const media = typebotClient.extractMediaFromResponse(response);

    // Enviar respostas de volta ao canal
    for (const reply of replies) {
      await metaSender.sendTextMessage(senderId, reply, channel);
    }

    for (const mediaUrl of media) {
      await metaSender.sendImageMessage(senderId, mediaUrl, channel);
    }
  } catch (error) {
    console.error(`[BRIDGE] Erro ao processar mensagem de ${sessionKey}:`, error);

    // Em caso de erro, envia mensagem padrão
    await metaSender.sendTextMessage(
      senderId,
      'Desculpe, estou com uma dificuldade técnica no momento. Por favor, tente novamente em alguns instantes.',
      channel,
    );
  }
}
