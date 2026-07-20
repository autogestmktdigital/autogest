import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  // ─── Criar usuário admin ───
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autogest.store' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@autogest.store',
      passwordHash: adminPassword,
      role: 'admin',
      active: true,
    },
  });
  console.log(`Admin criado: ${admin.email}`);

  // ─── Criar vendedores ───
  const sellers = [
    { name: 'Carlos Silva', email: 'carlos@autogest.store', password: 'vendedor123' },
    { name: 'Maria Santos', email: 'maria@autogest.store', password: 'vendedor123' },
    { name: 'João Pereira', email: 'joao@autogest.store', password: 'vendedor123' },
  ];

  const createdSellers = [];
  for (const seller of sellers) {
    const hash = await bcrypt.hash(seller.password, 10);
    const created = await prisma.user.upsert({
      where: { email: seller.email },
      update: {},
      create: {
        name: seller.name,
        email: seller.email,
        passwordHash: hash,
        role: 'seller',
        active: true,
      },
    });
    createdSellers.push(created);
    console.log(`Vendedor criado: ${created.email}`);
  }

  // ─── Veículos de exemplo ───
  const vehicles = [
    {
      brand: 'Toyota',
      model: 'Corolla XEi 2.0',
      version: 'XEi',
      plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: 2023,
      modelYear: 2023,
      price: 139900,
      mileageKm: 22000,
      fuel: 'flex',
      color: 'Prata',
      transmission: 'automatic',
      description: 'Toyota Corolla XEi 2.0 Flex, completo, único dono. Revisões em dia na concessionária. IPVA 2024 pago. Pneus novos.',
      features: JSON.stringify(['Ar condicionado digital', 'Direção elétrica', 'Câmera de ré', 'Central multimídia', 'Piloto automático', 'Bancos em couro', 'Sensor de estacionamento']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Honda',
      model: 'Civic Touring 1.5 Turbo',
      version: 'Touring',
      plate: 'DEF2G34',
      chassis: '93HFB2670LZ660471',
      renavam: '23456789012',
      year: 2022,
      modelYear: 2022,
      price: 159900,
      mileageKm: 35000,
      fuel: 'flex',
      color: 'Preto',
      transmission: 'automatic',
      description: 'Honda Civic Touring 1.5 Turbo, top de linha. Teto solar, interior bege. Segundo dono, sem sinistro.',
      features: JSON.stringify(['Teto solar', 'Bancos em couro', 'Ar condicionado dual zone', 'Apple CarPlay / Android Auto', 'Honda Sensing (ADAS)', 'Faróis Full LED', 'Rodas 18 polegadas']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Hyundai',
      model: 'HB20S Diamond Plus 1.0 Turbo',
      version: 'Diamond Plus',
      plate: 'GHI3J45',
      chassis: '9BHBG51ZALP123456',
      renavam: '34567890123',
      year: 2024,
      modelYear: 2024,
      price: 109900,
      mileageKm: 5000,
      fuel: 'flex',
      color: 'Branco',
      transmission: 'automatic',
      description: 'Hyundai HB20S Diamond Plus, praticamente zero! Garantia de fábrica até 2029. Todas as revisões em dia.',
      features: JSON.stringify(['Central multimídia 8 polegadas', 'Câmera de ré', 'Carregador wireless', 'Alerta de colisão frontal', 'Ar condicionado automático', 'Chave presencial']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Volkswagen',
      model: 'T-Cross Highline 1.4 TSI',
      version: 'Highline',
      plate: 'JKL4M56',
      chassis: '9BWCB05W0LP123456',
      renavam: '45678901234',
      year: 2023,
      modelYear: 2023,
      price: 149900,
      mileageKm: 18000,
      fuel: 'flex',
      color: 'Cinza',
      transmission: 'automatic',
      description: 'VW T-Cross Highline 1.4 TSI Flex, SUV compacto completo. Único dono, todas as revisões na concessionária.',
      features: JSON.stringify(['Teto solar panorâmico', 'Painel digital', 'ACC (Cruise Control Adaptativo)', 'Park Pilot', 'Ar condicionado Climatronic', 'Rodas 17 polegadas']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Chevrolet',
      model: 'Tracker Premier 1.2 Turbo',
      version: 'Premier',
      plate: 'MNO5P67',
      chassis: '9BGJK12Z0LG123456',
      renavam: '56789012345',
      year: 2022,
      modelYear: 2022,
      price: 119900,
      mileageKm: 42000,
      fuel: 'flex',
      color: 'Vermelho',
      transmission: 'automatic',
      description: 'Chevrolet Tracker Premier 1.2 Turbo, completo com Wi-Fi nativo. Segundo dono, sem detalhes.',
      features: JSON.stringify(['Wi-Fi nativo', 'OnStar', 'Central multimídia 8 polegadas', 'Câmera de ré', 'Alerta de ponto cego', 'Sensor de estacionamento dianteiro e traseiro']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Fiat',
      model: 'Pulse Abarth 1.3 Turbo',
      version: 'Abarth',
      plate: 'PQR6S78',
      chassis: '9BD197A1XNY123456',
      renavam: '67890123456',
      year: 2024,
      modelYear: 2024,
      price: 134900,
      mileageKm: 8000,
      fuel: 'flex',
      color: 'Azul',
      transmission: 'automatic',
      description: 'Fiat Pulse Abarth 1.3 Turbo 185cv, o SUV mais potente do segmento! Garantia de fábrica.',
      features: JSON.stringify(['185cv', 'Suspensão esportiva', 'Bancos Abarth exclusivos', 'Rodas 17 diamantadas', 'Central Uconnect 10.1 polegadas', 'Piloto automático']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Toyota',
      model: 'Hilux SRV 2.8 Diesel 4x4',
      version: 'SRV',
      plate: 'STU7V89',
      chassis: '9BWMW23F0NR123456',
      renavam: '78901234567',
      year: 2023,
      modelYear: 2023,
      price: 269900,
      mileageKm: 30000,
      fuel: 'diesel',
      color: 'Prata',
      transmission: 'automatic',
      description: 'Toyota Hilux SRV 2.8 Diesel 4x4, a picape mais vendida do Brasil. Completa, único dono, revisada.',
      features: JSON.stringify(['Tração 4x4', 'Controle de tração e estabilidade', 'Câmera de ré', 'Central multimídia 9 polegadas', 'Bancos em couro', 'Capota marítima']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Jeep',
      model: 'Compass Limited 1.3 Turbo',
      version: 'Limited',
      plate: 'VWX8Y90',
      chassis: '9BD265W23NY123456',
      renavam: '89012345678',
      year: 2022,
      modelYear: 2022,
      price: 159900,
      mileageKm: 38000,
      fuel: 'flex',
      color: 'Branco',
      transmission: 'automatic',
      description: 'Jeep Compass Limited 1.3 Turbo T270, SUV premium. Pack Premium com teto solar e carregador wireless.',
      features: JSON.stringify(['Teto solar panorâmico', 'Ar condicionado dual zone', 'Bancos em couro', 'Quadro de instrumentos digital 10.25"', 'Central Uconnect 10.1"', 'Carregador wireless', 'Frenagem autônoma de emergência']),
      images: JSON.stringify([]),
      status: 'reserved',
    },
    // Veículos na faixa de 70-90 mil para testar IA
    {
      brand: 'Chevrolet',
      model: 'Onix Plus LTZ 1.0 Turbo',
      version: 'LTZ',
      plate: 'XYZ9A01',
      chassis: '9BGJK12Z0LG654321',
      renavam: '90123456789',
      year: 2021,
      modelYear: 2021,
      price: 79900,
      mileageKm: 45000,
      fuel: 'flex',
      color: 'Preto',
      transmission: 'automatic',
      description: 'Chevrolet Onix Plus LTZ 1.0 Turbo, sedan completo. Segundo dono, revisões em dia.',
      features: JSON.stringify(['Central multimídia 8 polegadas', 'Câmera de ré', 'Ar condicionado digital', 'Rodas 16 polegadas', 'Sensor de estacionamento']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Volkswagen',
      model: 'Polo Highline 1.0 TSI',
      version: 'Highline',
      plate: 'BCD2E34',
      chassis: '9BWCB05W0LP654321',
      renavam: '01234567890',
      year: 2021,
      modelYear: 2021,
      price: 84900,
      mileageKm: 38000,
      fuel: 'flex',
      color: 'Cinza',
      transmission: 'automatic',
      description: 'VW Polo Highline 1.0 TSI, hatch premium. Único dono, todas as revisões na concessionária.',
      features: JSON.stringify(['Painel digital', 'Ar condicionado digital', 'Rodas 17 polegadas', 'Câmera de ré', 'Sensor de estacionamento']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Fiat',
      model: 'Argo HGT 1.8',
      version: 'HGT',
      plate: 'EFG4H56',
      chassis: '9BD197A1XNY654321',
      renavam: '11234567891',
      year: 2020,
      modelYear: 2020,
      price: 72900,
      mileageKm: 52000,
      fuel: 'flex',
      color: 'Vermelho',
      transmission: 'automatic',
      description: 'Fiat Argo HGT 1.8, hatch esportivo. Segundo dono, em ótimo estado.',
      features: JSON.stringify(['Central multimídia 7 polegadas', 'Ar condicionado digital', 'Rodas 17 polegadas', 'Câmera de ré']),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Hyundai',
      model: 'HB20 Vision 1.6',
      version: 'Vision',
      plate: 'IJK6L78',
      chassis: '9BHBG51ZALP654321',
      renavam: '22345678912',
      year: 2022,
      modelYear: 2022,
      price: 75900,
      mileageKm: 30000,
      fuel: 'flex',
      color: 'Branco',
      transmission: 'automatic',
      description: 'Hyundai HB20 Vision 1.6, hatch completo. Único dono, revisões em dia.',
      features: JSON.stringify(['Central multimídia 8 polegadas', 'Câmera de ré', 'Ar condicionado digital', 'Rodas 16 polegadas']),
      images: JSON.stringify([]),
      status: 'available',
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle });
  }
  console.log(`${vehicles.length} veículos criados`);

  // ─── Criar leads de teste ───
  const leads = [
    {
      name: 'Cliente Teste Bot',
      phone: '5511999999991',
      email: 'bot@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999991',
      interestNotes: 'Interesse em carros entre 70-90 mil',
      status: 'bot',
      assignedToId: null,
    },
    {
      name: 'Cliente Novo 1',
      phone: '5511999999992',
      email: 'novo1@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999992',
      interestNotes: 'Quer um SUV',
      status: 'new',
      assignedToId: null,
    },
    {
      name: 'Maria Santos',
      phone: '5511999999993',
      email: 'maria@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999993',
      interestNotes: 'Procura carro automático',
      status: 'in_conversation',
      assignedToId: createdSellers[0].id, // Carlos
    },
    {
      name: 'Cliente Em Conversa 1',
      phone: '5511999999994',
      email: 'conversa1@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999994',
      interestNotes: 'Quer financiamento',
      status: 'in_conversation',
      assignedToId: createdSellers[1].id, // Maria
    },
    {
      name: 'Cliente Convertido',
      phone: '5511999999995',
      email: 'convertido@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999995',
      interestNotes: 'Comprou Corolla',
      status: 'converted',
      assignedToId: createdSellers[0].id,
    },
    {
      name: 'Cliente Desistiu',
      phone: '5511999999996',
      email: 'desistiu@teste.com',
      channel: 'whatsapp',
      channelUserId: '5511999999996',
      interestNotes: 'Achou caro',
      status: 'desistiu',
      assignedToId: createdSellers[2].id,
    },
  ];

  const createdLeads = [];
  for (const lead of leads) {
    const created = await prisma.lead.create({ data: lead });
    createdLeads.push(created);
    console.log(`Lead criado: ${created.name}`);
  }

  // ─── Criar conversas e mensagens ───
  const conversations = [
    {
      leadId: createdLeads[0].id, // Bot
      channel: 'whatsapp',
      status: 'active',
      messages: [
        { role: 'customer', content: 'Oi, quero comprar um carro' },
        { role: 'bot', content: 'Olá! Sou o assistente da Brothers Multimarcas. Posso ajudar você a encontrar o carro ideal! Qual é a sua faixa de preço?' },
        { role: 'customer', content: 'Entre 70 e 90 mil' },
        { role: 'bot', content: 'Temos ótimas opções nessa faixa! Onix Plus LTZ por R$ 79.900, Polo Highline por R$ 84.900, Argo HGT por R$ 72.900 e HB20 Vision por R$ 75.900. Gostaria de mais detalhes de algum?' },
      ],
    },
    {
      leadId: createdLeads[2].id, // Maria Santos - Em conversa
      channel: 'whatsapp',
      status: 'active',
      messages: [
        { role: 'customer', content: 'Bom dia, vi o Corolla no site' },
        { role: 'seller', content: 'Bom dia Maria! O Corolla XEi 2023 está disponível por R$ 139.900. Tem apenas 22.000 km. Quer agendar uma visita?' },
        { role: 'customer', content: 'Pode ser amanhã à tarde?' },
      ],
    },
    {
      leadId: createdLeads[3].id, // Cliente Em Conversa 1
      channel: 'whatsapp',
      status: 'active',
      messages: [
        { role: 'customer', content: 'Oi, quero simular financiamento do Tracker' },
        { role: 'seller', content: 'Claro! O Tracker Premier está R$ 119.900. Qual seria o valor da entrada?' },
      ],
    },
  ];

  for (const conv of conversations) {
    const messages = conv.messages;
    delete (conv as any).messages;
    
    const created = await prisma.conversation.create({
      data: {
        ...conv,
        lastMessageAt: new Date(),
      },
    });

    for (const msg of messages) {
      await prisma.message.create({
        data: {
          conversationId: created.id,
          role: msg.role,
          content: msg.content,
          sentAt: new Date(),
        },
      });
    }
    console.log(`Conversa criada para lead ${conv.leadId}`);
  }

  // ─── Criar agendamentos ───
  const followUps = [
    {
      leadId: createdLeads[2].id, // Maria Santos
      type: 'Retornar ao Cliente',
      messageContent: 'Ligar para confirmar visita',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
    },
    {
      leadId: createdLeads[3].id, // Cliente Em Conversa 1
      type: 'Agendar Visita',
      messageContent: 'Enviar proposta de financiamento',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 48 * 60 * 60 * 1000), // Depois de amanhã
    },
  ];

  for (const followUp of followUps) {
    await prisma.followUp.create({ data: followUp });
    console.log(`Agendamento criado para lead ${followUp.leadId}`);
  }

  console.log('Seed concluído com sucesso!');
  console.log('\n=== DADOS DE ACESSO ===');
  console.log('Admin: admin@autogest.store / admin123');
  console.log('Vendedores:');
  sellers.forEach(s => console.log(`  ${s.email} / ${s.password}`));
  console.log('\nLeads criados: 6');
  console.log('Veículos criados: 12');
  console.log('Conversas criadas: 3');
  console.log('Agendamentos criados: 2');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
