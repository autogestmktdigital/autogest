import { Request, Response } from 'express';
import { prisma } from '../config';

export async function cleanupData(req: Request, res: Response) {
  const { confirm } = req.body;
  if (confirm !== 'LIMPAR_TUDO') {
    return res.status(400).json({ success: false, error: 'Confirmação inválida' });
  }
  try {
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.followUp.deleteMany({});
    await prisma.lead.deleteMany({});
    return res.json({ success: true, message: 'Dados limpos' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
