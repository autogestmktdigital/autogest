import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Criar usuário admin ───
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autorevenda.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@autorevenda.com',
      passwordHash: adminPassword,
      role: 'admin',
      active: true,
    },
  });
  console.log(`Admin criado: ${admin.email}`);

  // ─── Criar vendedor ───
  const sellerPassword = await bcrypt.hash('vendedor123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@autorevenda.com' },
    update: {},
    create: {
      name: 'Carlos Silva',
      email: 'vendedor@autorevenda.com',
      passwordHash: sellerPassword,
      role: 'seller',
      active: true,
    },
  });
  console.log(`Vendedor criado: ${seller.email}`);

  // ─── Veículos de exemplo ───
  const vehicles = [
    {
      brand: 'Toyota',
      model: 'Corolla XEi 2.0',
      year: 2023,
      price: 139900,
      mileageKm: 22000,
      fuel: 'flex',
      color: 'Prata',
      transmission: 'automatic',
      description:
        'Toyota Corolla XEi 2.0 Flex, completo, único dono. Revisões em dia na concessionária. IPVA 2024 pago. Pneus novos.',
      features: JSON.stringify([
        'Ar condicionado digital',
        'Direção elétrica',
        'Câmera de ré',
        'Central multimídia',
        'Piloto automático',
        'Bancos em couro',
        'Sensor de estacionamento',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Honda',
      model: 'Civic Touring 1.5 Turbo',
      year: 2022,
      price: 159900,
      mileageKm: 35000,
      fuel: 'flex',
      color: 'Preto',
      transmission: 'automatic',
      description:
        'Honda Civic Touring 1.5 Turbo, top de linha. Teto solar, interior bege. Segundo dono, sem sinistro.',
      features: JSON.stringify([
        'Teto solar',
        'Bancos em couro',
        'Ar condicionado dual zone',
        'Apple CarPlay / Android Auto',
        'Honda Sensing (ADAS)',
        'Faróis Full LED',
        'Rodas 18 polegadas',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Hyundai',
      model: 'HB20S Diamond Plus 1.0 Turbo',
      year: 2024,
      price: 109900,
      mileageKm: 5000,
      fuel: 'flex',
      color: 'Branco',
      transmission: 'automatic',
      description:
        'Hyundai HB20S Diamond Plus, praticamente zero! Garantia de fábrica até 2029.',
      features: JSON.stringify([
        'Central multimídia 8 polegadas',
        'Câmera de ré',
        'Carregador wireless',
        'Alerta de colisão frontal',
        'Ar condicionado automático',
        'Chave presencial',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Volkswagen',
      model: 'T-Cross Highline 1.4 TSI',
      year: 2023,
      price: 149900,
      mileageKm: 18000,
      fuel: 'flex',
      color: 'Cinza',
      transmission: 'automatic',
      description:
        'VW T-Cross Highline 1.4 TSI Flex, SUV compacto completo. Único dono.',
      features: JSON.stringify([
        'Teto solar panorâmico',
        'Painel digital',
        'ACC (Cruise Control Adaptativo)',
        'Park Pilot',
        'Ar condicionado Climatronic',
        'Rodas 17 polegadas',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Chevrolet',
      model: 'Tracker Premier 1.2 Turbo',
      year: 2022,
      price: 119900,
      mileageKm: 42000,
      fuel: 'flex',
      color: 'Vermelho',
      transmission: 'automatic',
      description:
        'Chevrolet Tracker Premier 1.2 Turbo, completo com Wi-Fi nativo.',
      features: JSON.stringify([
        'Wi-Fi nativo',
        'OnStar',
        'Central multimídia 8 polegadas',
        'Câmera de ré',
        'Alerta de ponto cego',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Fiat',
      model: 'Pulse Abarth 1.3 Turbo',
      year: 2024,
      price: 134900,
      mileageKm: 8000,
      fuel: 'flex',
      color: 'Azul',
      transmission: 'automatic',
      description:
        'Fiat Pulse Abarth 1.3 Turbo 185cv, o SUV mais potente do segmento!',
      features: JSON.stringify([
        '185cv',
        'Suspensão esportiva',
        'Bancos Abarth exclusivos',
        'Rodas 17 diamantadas',
        'Central Uconnect 10.1 polegadas',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Toyota',
      model: 'Hilux SRV 2.8 Diesel 4x4',
      year: 2023,
      price: 269900,
      mileageKm: 30000,
      fuel: 'diesel',
      color: 'Prata',
      transmission: 'automatic',
      description:
        'Toyota Hilux SRV 2.8 Diesel 4x4, a picape mais vendida do Brasil.',
      features: JSON.stringify([
        'Tração 4x4',
        'Controle de tração e estabilidade',
        'Câmera de ré',
        'Central multimídia 9 polegadas',
        'Bancos em couro',
      ]),
      images: JSON.stringify([]),
      status: 'available',
    },
    {
      brand: 'Jeep',
      model: 'Compass Limited 1.3 Turbo',
      year: 2022,
      price: 159900,
      mileageKm: 38000,
      fuel: 'flex',
      color: 'Branco',
      transmission: 'automatic',
      description:
        'Jeep Compass Limited 1.3 Turbo T270, SUV premium com teto solar.',
      features: JSON.stringify([
        'Teto solar panorâmico',
        'Ar condicionado dual zone',
        'Bancos em couro',
        'Central Uconnect 10.1"',
        'Carregador wireless',
      ]),
      images: JSON.stringify([]),
      status: 'reserved',
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle });
  }
  console.log(`${vehicles.length} veículos criados`);

  // ─── Leads de exemplo ───
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Maria Santos',
      phone: '11999887766',
      channel: 'whatsapp',
      channelUserId: '5511999887766',
      interestNotes: 'Interesse em SUVs compactos',
      status: 'contacted',
      assignedToId: seller.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'João Oliveira',
      phone: '11988776655',
      channel: 'instagram',
      channelUserId: 'joao.oliveira.ig',
      interestNotes: 'Procurando sedan até R$ 150.000',
      status: 'new_lead',
    },
  });

  console.log('2 leads de exemplo criados');

  // ─── Conversa de exemplo ───
  const conv = await prisma.conversation.create({
    data: {
      leadId: lead1.id,
      channel: 'whatsapp',
      status: 'active',
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conv.id, role: 'customer', content: 'Olá, gostaria de ver SUVs disponíveis' },
      { conversationId: conv.id, role: 'bot', content: 'Olá Maria! Temos ótimas opções de SUVs. Temos o VW T-Cross, Chevrolet Tracker e Jeep Compass. Qual faixa de preço te interessa?' },
      { conversationId: conv.id, role: 'customer', content: 'Até uns 150 mil' },
      { conversationId: conv.id, role: 'bot', content: 'Perfeito! Nessa faixa temos o VW T-Cross Highline por R$ 149.900 e o Tracker Premier por R$ 119.900. Quer simular o financiamento de algum deles?' },
    ],
  });

  console.log('Conversa de exemplo criada');
  console.log('');
  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
