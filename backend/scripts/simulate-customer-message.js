const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  // Encontrar uma conversa ativa
  const conversation = await prisma.conversation.findFirst({
    where: { status: 'active' },
    orderBy: { lastMessageAt: 'desc' },
  });

  if (!conversation) {
    console.log('Nenhuma conversa ativa encontrada');
    return;
  }

  // Adicionar mensagem do cliente (simulando nova mensagem)
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'customer',
      content: 'Olá, gostaria de mais informações sobre o veículo',
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

  console.log(`Mensagem de teste enviada na conversa ${conversation.id}`);
}

main().finally(() => prisma.$disconnect());
