import { prisma } from '../config';
import { AppError } from '../utils/AppError';
import type { Channel, ConversationStatus, MessageRole } from '../types';
import cron from 'node-cron';

export class ConversationService {
  async create(data: {
    leadId: number;
    channel: Channel;
    status?: ConversationStatus;
    typebotSessionId?: string;
  }) {
    return prisma.conversation.create({
      data: {
        leadId: data.leadId,
        channel: data.channel,
        status: data.status || 'active',
        typebotSessionId: data.typebotSessionId,
      },
    });
  }

  async findOrCreateForLead(leadId: number, channel: Channel) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        leadId,
        channel,
        status: 'active',
      },
    });

    const isNew = !conversation;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { leadId, channel, status: 'active' },
      });
      console.log(`[findOrCreateForLead] Nova conversa criada: ${conversation.id} para lead ${leadId}`);
    } else {
      console.log(`[findOrCreateForLead] Conversa existente encontrada: ${conversation.id} para lead ${leadId}`);
    }

    return { conversation, isNew };
  }

  async addMessage(conversationId: number, role: MessageRole, content: string, mediaUrl?: string) {
    const message = await prisma.message.create({
      data: { conversationId, role, content, mediaUrl },
    });

    // Incrementar contador de não lidas se for mensagem do cliente
    if (role === 'customer') {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });
    } else {
      // Se for mensagem do agente, marcar follow-ups pendentes como concluídos
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { leadId: true },
      });
      if (conversation) {
        await prisma.followUp.updateMany({
          where: {
            leadId: conversation.leadId,
            status: 'scheduled',
          },
          data: { status: 'completed' },
        });
      }
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });
    }

    return message;
  }

  async getMessages(conversationId: number, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { sentAt: 'asc' },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Zerar contador de não lidas ao visualizar mensagens
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    return { data: messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async setHumanHandoff(conversationId: number, isHandoff: boolean) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new AppError('Conversa não encontrada', 404);

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { isHumanHandoff: isHandoff },
    });
  }

  async assignConversation(conversationId: number, userId: number, userName: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { lead: true },
    });
    if (!conversation) throw new AppError('Conversa não encontrada', 404);

    // Atualizar lead com o vendedor e status
    await prisma.lead.update({
      where: { id: conversation.leadId },
      data: {
        assignedToId: userId,
        status: 'in_conversation',
      },
    });

    // Ativar handoff (bot desligado)
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { isHumanHandoff: true },
    });
  }

  async listByLead(leadId: number) {
    return prisma.conversation.findMany({
      where: { leadId },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getActiveConversations() {
    const conversations = await prisma.conversation.findMany({
      where: { status: 'active' },
      include: {
        lead: { select: { id: true, name: true, phone: true, channel: true, status: true, interestNotes: true, assignedTo: { select: { id: true, name: true } } } },
        _count: { select: { messages: true } },
      },
      orderBy: [
        { unreadCount: 'desc' },
        { lastMessageAt: 'desc' },
      ],
    });

    // Buscar follow-ups pendentes para cada lead (só quando chegou a data/hora)
    const now = new Date();
    const conversationsWithFollowUps = await Promise.all(
      conversations.map(async (conv) => {
        const pendingFollowUps = await prisma.followUp.findMany({
          where: {
            leadId: conv.leadId,
            status: 'scheduled',
            scheduledFor: { lte: now },
          },
          orderBy: { scheduledFor: 'asc' },
          take: 1,
        });
        return {
          ...conv,
          pendingFollowUp: pendingFollowUps[0] || null,
        };
      })
    );

    return conversationsWithFollowUps;
  }

  async closeConversation(conversationId: number) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' },
    });
  }

  async updateTypebotSession(conversationId: number, sessionId: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { typebotSessionId: sessionId },
    });
  }

  /**
   * Finaliza automaticamente conversas que estão com o bot (lead status 'bot'),
   * sem handoff humano e sem resposta do cliente há mais de `hoursThreshold` horas.
   * A conversa é encerrada (status 'closed') e o lead recebe o status 'bot_no_return'.
   * Na próxima mensagem do cliente, uma nova conversa será criada e o bot recomeça.
   */
  async closeStaleBotConversations(hoursThreshold: number = 24) {
    const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    const candidates = await prisma.conversation.findMany({
      where: {
        status: 'active',
        isHumanHandoff: false,
        lead: { status: 'bot' },
      },
      select: {
        id: true,
        leadId: true,
        startedAt: true,
        messages: {
          where: { role: 'customer' },
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: { sentAt: true },
        },
      },
    });

    const closedConversationIds: number[] = [];

    for (const conv of candidates) {
      const lastCustomerMessageAt = conv.messages[0]?.sentAt || conv.startedAt;
      if (lastCustomerMessageAt >= cutoff) continue;

      try {
        await prisma.$transaction([
          prisma.conversation.update({
            where: { id: conv.id },
            data: { status: 'closed' },
          }),
          prisma.lead.update({
            where: { id: conv.leadId },
            data: { status: 'bot_no_return' },
          }),
        ]);
        closedConversationIds.push(conv.id);
      } catch (error) {
        console.error(`[closeStaleBotConversations] Erro ao finalizar conversa ${conv.id}:`, error);
      }
    }

    return closedConversationIds;
  }

  startCronJobs() {
    // Roda a cada hora (no minuto 15) para finalizar conversas do bot sem retorno do cliente
    cron.schedule('15 * * * *', async () => {
      console.log('[CRON] Verificando conversas do bot sem retorno do cliente...');
      try {
        const closed = await this.closeStaleBotConversations();
        if (closed.length > 0) {
          console.log(`[CRON] ${closed.length} conversa(s) finalizada(s) como "Bot Sem Retorno": ${closed.join(', ')}`);
        }
      } catch (error) {
        console.error('[CRON] Erro ao finalizar conversas sem retorno:', error);
      }
    });

    console.log('[CRON] Jobs de conversas iniciados');
  }
}

export const conversationService = new ConversationService();
