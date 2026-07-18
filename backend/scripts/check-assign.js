const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const lead = await prisma.lead.findUnique({
    where: { id: 7 },
    include: { assignedTo: true },
  });
  console.log('Lead 7:', lead);
}

main().finally(() => prisma.$disconnect());
