const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

async function main() {
  const convs = await prisma.conversation.findMany({
    where: { status: 'active' },
    include: {
      lead: { select: { id: true, name: true, assignedTo: { select: { id: true, name: true } } } },
    },
    take: 5,
  });
  console.log(JSON.stringify(convs, null, 2));
}

main().finally(() => prisma.$disconnect());
