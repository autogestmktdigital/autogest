const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  // Encontrar a conversa da Maria Santos
  const lead = await prisma.lead.findFirst({
    where: { name: 'Maria Santos' },
  });

  if (!lead) {
    console.log('Lead Maria Santos não encontrada');
    return;
  }

  const conversation = await prisma.conversation.findFirst({
    where: { leadId: lead.id, status: 'active' },
  });

  if (!conversation) {
    console.log('Nenhuma conversa ativa encontrada para Maria Santos');
    return;
  }

  // Adicionar mensagem do cliente (simulando nova mensagem)
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'customer',
      content: 'Olá, ainda está disponível?',
    },
  });

  // Incrementar contador de não lidas
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      unreadCount: { increment: 1 },
    },
  });

  console.log(`Mensagem de teste enviada para Maria Santos (conversa ${conversation.id})`);
}

main().finally(() => prisma.$disconnect());
