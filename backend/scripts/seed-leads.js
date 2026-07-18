const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

async function main() {
  // 3 leads com status bot
  for (let i = 1; i <= 3; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: `Cliente Bot ${i}`,
        phone: `1199999${String(i).padStart(4, '0')}`,
        channel: 'whatsapp',
        channelUserId: `bot_user_${i}`,
        status: 'bot',
        interestNotes: 'Interesse em veículos',
      },
    });

    const conv = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        channel: 'whatsapp',
        status: 'active',
        isHumanHandoff: false,
      },
    });

    await prisma.message.createMany({
      data: [
        { conversationId: conv.id, role: 'customer', content: `Olá, quero comprar um carro ${i}` },
        { conversationId: conv.id, role: 'bot', content: 'Olá! Que tipo de veículo você procura?' },
        { conversationId: conv.id, role: 'customer', content: 'Estou procurando um SUV compacto' },
        { conversationId: conv.id, role: 'bot', content: 'Temos ótimas opções de SUVs compactos no nosso estoque!' },
      ],
    });
  }

  // 5 leads com status new
  for (let i = 1; i <= 5; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: `Cliente Novo ${i}`,
        phone: `1198888${String(i).padStart(4, '0')}`,
        channel: 'whatsapp',
        channelUserId: `new_user_${i}`,
        status: 'new',
        interestNotes: 'Quer falar com vendedor',
      },
    });

    const conv = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        channel: 'whatsapp',
        status: 'active',
        isHumanHandoff: true,
      },
    });

    await prisma.message.createMany({
      data: [
        { conversationId: conv.id, role: 'customer', content: `Quero falar com um vendedor ${i}` },
        { conversationId: conv.id, role: 'bot', content: 'Claro, vou transferir você para um de nossos vendedores.' },
        { conversationId: conv.id, role: 'customer', content: 'Obrigado, estou aguardando' },
      ],
    });
  }

  // 5 leads com status in_conversation
  for (let i = 1; i <= 5; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: `Cliente Em Conversa ${i}`,
        phone: `1197777${String(i).padStart(4, '0')}`,
        channel: 'whatsapp',
        channelUserId: `conv_user_${i}`,
        status: 'in_conversation',
        interestNotes: 'Negociando preço',
      },
    });

    const conv = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        channel: 'whatsapp',
        status: 'active',
        isHumanHandoff: true,
      },
    });

    await prisma.message.createMany({
      data: [
        { conversationId: conv.id, role: 'customer', content: `Qual o preço do Honda Civic? ${i}` },
        { conversationId: conv.id, role: 'agent', content: 'O Honda Civic está por R$ 89.900' },
        { conversationId: conv.id, role: 'customer', content: 'Tem como fazer por 85?' },
        { conversationId: conv.id, role: 'agent', content: 'Posso verificar com a gerência. Aguarde um momento.' },
        { conversationId: conv.id, role: 'customer', content: 'Ok, estou aguardando' },
      ],
    });
  }

  console.log('Dados de teste criados com sucesso!');
  console.log('- 3 leads com status Bot');
  console.log('- 5 leads com status Novo');
  console.log('- 5 leads com status Em Conversa');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
