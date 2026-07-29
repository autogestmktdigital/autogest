import { Request, Response } from 'express';
import { prisma } from '../config';

export async function cleanupData(req: Request, res: Response) {
  const { confirm } = req.body;

  if (confirm !== 'LIMPAR_TUDO') {
    return res.status(400).json({
      success: false,
      error: 'Confirmação inválida. Envie { "confirm": "LIMPAR_TUDO" }',
    });
  }

  try {
    // Deletar na ordem correta para respeitar foreign keys
    const deletedMessages = await prisma.message.deleteMany({});
    const deletedConversations = await prisma.conversation.deleteMany({});
    const deletedLeads = await prisma.lead.deleteMany({});
    const deletedFollowUps = await prisma.followUp.deleteMany({});

    return res.json({
      success: true,
      deleted: {
        messages: deletedMessages.count,
        conversations: deletedConversations.count,
        leads: deletedLeads.count,
        followUps: deletedFollowUps.count,
      },
    });
  } catch (error: any) {
    console.error('Erro ao limpar dados:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
