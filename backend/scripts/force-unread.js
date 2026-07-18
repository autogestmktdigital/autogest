const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const conv = await prisma.conversation.findUnique({
    where: { id: 1 },
  });
  console.log('unreadCount:', conv?.unreadCount);

  // Forçar unreadCount = 3
  await prisma.conversation.update({
    where: { id: 1 },
    data: { unreadCount: 3 },
  });

  const updated = await prisma.conversation.findUnique({
    where: { id: 1 },
  });
  console.log('Novo unreadCount:', updated?.unreadCount);
}

main().finally(() => prisma.$disconnect());
