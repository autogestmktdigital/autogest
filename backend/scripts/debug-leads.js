const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  // Simular a query do service sem filtro de status
  const leads = await prisma.lead.findMany({
    where: {},
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, status: true },
  });
  console.log('All leads (no filter):', leads);

  // Simular com filtro bot
  const botLeads = await prisma.lead.findMany({
    where: { status: 'bot' },
    take: 10,
    select: { id: true, name: true, status: true },
  });
  console.log('Bot leads:', botLeads);
}

main().finally(() => prisma.$disconnect());
