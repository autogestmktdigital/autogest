const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const total = await prisma.lead.count();
  console.log('Total leads:', total);
}

main().finally(() => prisma.$disconnect());
