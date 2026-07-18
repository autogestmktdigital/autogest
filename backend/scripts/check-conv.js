const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const conv = await prisma.conversation.findUnique({
    where: { id: 1 },
    include: { lead: true },
  });
  console.log('Conversation 1:', conv);
}

main().finally(() => prisma.$disconnect());
