import { prisma } from '../config';
import { AppError } from '../utils/AppError';
import type { Channel, ConversationStatus, MessageRole } from '../types';

export class ConversationService {
  async findOrCreateForLead(leadId: number, channel: Channel) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        leadId,
        channel,
        status: 'active',
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { leadId, channel, status: 'active' },
      });
    }

    return conversation;
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
    return prisma.conversation.findMany({
      where: { status: 'active' },
      include: {
        lead: { select: { id: true, name: true, phone: true, channel: true, status: true, assignedTo: { select: { id: true, name: true } } } },
        _count: { select: { messages: true } },
      },
      orderBy: [
        { unreadCount: 'desc' },
        { lastMessageAt: 'desc' },
      ],
    });
  }

  async closeConversation(conversationId: number) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' },
    });
  }
}

export const conversationService = new ConversationService();
