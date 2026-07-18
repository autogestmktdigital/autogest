const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const counts = await prisma.lead.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  console.log('Status counts:', counts);

  const botLeads = await prisma.lead.findMany({
    where: { status: 'bot' },
    select: { id: true, name: true, status: true },
  });
  console.log('Bot leads:', botLeads);
}

main().finally(() => prisma.$disconnect());
