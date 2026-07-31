import { prisma } from '../config/database';

export const vehicleSaleService = {
  async create(rawData: Record<string, unknown>) {
    const data = {
      vehicleId: Number(rawData.vehicleId),
      salePrice: Number(rawData.salePrice),
      saleDate: new Date(String(rawData.saleDate)),
      buyerName: String(rawData.clientName || rawData.buyerName || ''),
      buyerPhone: rawData.clientPhone ? String(rawData.clientPhone) : undefined,
      buyerEmail: rawData.clientEmail ? String(rawData.clientEmail) : undefined,
      clientRg: rawData.clientRg ? String(rawData.clientRg) : undefined,
      clientCpfCnpj: rawData.clientCpfCnpj ? String(rawData.clientCpfCnpj) : undefined,
      clientAddress: rawData.clientAddress ? String(rawData.clientAddress) : undefined,
      clientStreet: rawData.clientStreet ? String(rawData.clientStreet) : undefined,
      clientNumber: rawData.clientNumber ? String(rawData.clientNumber) : undefined,
      clientNeighborhood: rawData.clientNeighborhood ? String(rawData.clientNeighborhood) : undefined,
      clientCity: rawData.clientCity ? String(rawData.clientCity) : undefined,
      clientState: rawData.clientState ? String(rawData.clientState) : undefined,
      clientZipCode: rawData.clientZipCode ? String(rawData.clientZipCode) : undefined,
      clientDocuments: rawData.clientDocuments ? String(rawData.clientDocuments) : undefined,
      paymentMethod: String(rawData.paymentMethod || ''),
      downPayment: rawData.downPayment ? Number(rawData.downPayment) : undefined,
      financeCompany: rawData.financeCompany ? String(rawData.financeCompany) : undefined,
      financeDate: rawData.financeDate ? new Date(String(rawData.financeDate)) : undefined,
      financedAmount: rawData.financedAmount ? Number(rawData.financedAmount) : undefined,
      installments: rawData.installments ? Number(rawData.installments) : undefined,
      installmentValue: rawData.installmentValue ? Number(rawData.installmentValue) : undefined,
      hasTradeIn: rawData.hasTradeIn === 'true' || rawData.hasTradeIn === true,
      tradeInBrand: rawData.tradeInBrand ? String(rawData.tradeInBrand) : undefined,
      tradeInModel: rawData.tradeInModel ? String(rawData.tradeInModel) : undefined,
      tradeInVersion: rawData.tradeInVersion ? String(rawData.tradeInVersion) : undefined,
      tradeInPlate: rawData.tradeInPlate ? String(rawData.tradeInPlate) : undefined,
      tradeInYear: rawData.tradeInYear ? Number(rawData.tradeInYear) : undefined,
      tradeInModelYear: rawData.tradeInModelYear ? Number(rawData.tradeInModelYear) : undefined,
      tradeInFuel: rawData.tradeInFuel ? String(rawData.tradeInFuel) : undefined,
      tradeInColor: rawData.tradeInColor ? String(rawData.tradeInColor) : undefined,
      tradeInChassis: rawData.tradeInChassis ? String(rawData.tradeInChassis) : undefined,
      tradeInRenavam: rawData.tradeInRenavam ? String(rawData.tradeInRenavam) : undefined,
      tradeInPurchasePrice: rawData.tradeInPurchasePrice ? Number(rawData.tradeInPurchasePrice) : undefined,
      tradeInDebts: rawData.tradeInDebts ? Number(rawData.tradeInDebts) : undefined,
      tradeInDebtsNotes: rawData.tradeInDebtsNotes ? String(rawData.tradeInDebtsNotes) : undefined,
      tradeInNetValue: rawData.tradeInNetValue ? Number(rawData.tradeInNetValue) : undefined,
      documentationNotes: rawData.documentationNotes ? String(rawData.documentationNotes) : undefined,
      sellerId: rawData.sellerId ? Number(rawData.sellerId) : undefined,
      sellerName: rawData.sellerName ? String(rawData.sellerName) : undefined,
      notes: rawData.notes ? String(rawData.notes) : undefined,
    };
    return prisma.vehicleSale.create({ data });
  },

  async getByVehicleId(vehicleId: number) {
    const sale = await prisma.vehicleSale.findFirst({
      where: { vehicleId },
    });
    if (!sale) return null;
    // Mapear campos do Prisma para nomes usados pela tela
    // clientDocuments vem como string JSON do banco, converter para array
    let clientDocs: string[] = [];
    if (sale.clientDocuments) {
      try {
        clientDocs = JSON.parse(sale.clientDocuments);
      } catch {
        clientDocs = [];
      }
    }
    return {
      ...sale,
      clientName: sale.buyerName,
      clientPhone: sale.buyerPhone,
      clientEmail: sale.buyerEmail,
      clientDocuments: clientDocs,
    };
  },

  async update(id: number, rawData: Record<string, unknown>) {
    const data = {
      salePrice: rawData.salePrice ? Number(rawData.salePrice) : undefined,
      saleDate: rawData.saleDate ? new Date(String(rawData.saleDate)) : undefined,
      buyerName: rawData.clientName ? String(rawData.clientName) : rawData.buyerName ? String(rawData.buyerName) : undefined,
      buyerPhone: rawData.clientPhone ? String(rawData.clientPhone) : rawData.buyerPhone ? String(rawData.buyerPhone) : undefined,
      buyerEmail: rawData.clientEmail ? String(rawData.clientEmail) : rawData.buyerEmail ? String(rawData.buyerEmail) : undefined,
      clientRg: rawData.clientRg ? String(rawData.clientRg) : undefined,
      clientCpfCnpj: rawData.clientCpfCnpj ? String(rawData.clientCpfCnpj) : undefined,
      clientAddress: rawData.clientAddress ? String(rawData.clientAddress) : undefined,
      clientStreet: rawData.clientStreet ? String(rawData.clientStreet) : undefined,
      clientNumber: rawData.clientNumber ? String(rawData.clientNumber) : undefined,
      clientNeighborhood: rawData.clientNeighborhood ? String(rawData.clientNeighborhood) : undefined,
      clientCity: rawData.clientCity ? String(rawData.clientCity) : undefined,
      clientState: rawData.clientState ? String(rawData.clientState) : undefined,
      clientZipCode: rawData.clientZipCode ? String(rawData.clientZipCode) : undefined,
      clientDocuments: rawData.clientDocuments ? String(rawData.clientDocuments) : undefined,
      paymentMethod: rawData.paymentMethod ? String(rawData.paymentMethod) : undefined,
      downPayment: rawData.downPayment ? Number(rawData.downPayment) : undefined,
      financeCompany: rawData.financeCompany ? String(rawData.financeCompany) : undefined,
      financeDate: rawData.financeDate ? new Date(String(rawData.financeDate)) : undefined,
      financedAmount: rawData.financedAmount ? Number(rawData.financedAmount) : undefined,
      installments: rawData.installments ? Number(rawData.installments) : undefined,
      installmentValue: rawData.installmentValue ? Number(rawData.installmentValue) : undefined,
      hasTradeIn: rawData.hasTradeIn === 'true' || rawData.hasTradeIn === true,
      tradeInBrand: rawData.tradeInBrand ? String(rawData.tradeInBrand) : undefined,
      tradeInModel: rawData.tradeInModel ? String(rawData.tradeInModel) : undefined,
      tradeInVersion: rawData.tradeInVersion ? String(rawData.tradeInVersion) : undefined,
      tradeInPlate: rawData.tradeInPlate ? String(rawData.tradeInPlate) : undefined,
      tradeInYear: rawData.tradeInYear ? Number(rawData.tradeInYear) : undefined,
      tradeInModelYear: rawData.tradeInModelYear ? Number(rawData.tradeInModelYear) : undefined,
      tradeInFuel: rawData.tradeInFuel ? String(rawData.tradeInFuel) : undefined,
      tradeInColor: rawData.tradeInColor ? String(rawData.tradeInColor) : undefined,
      tradeInChassis: rawData.tradeInChassis ? String(rawData.tradeInChassis) : undefined,
      tradeInRenavam: rawData.tradeInRenavam ? String(rawData.tradeInRenavam) : undefined,
      tradeInPurchasePrice: rawData.tradeInPurchasePrice ? Number(rawData.tradeInPurchasePrice) : undefined,
      tradeInDebts: rawData.tradeInDebts ? Number(rawData.tradeInDebts) : undefined,
      tradeInDebtsNotes: rawData.tradeInDebtsNotes ? String(rawData.tradeInDebtsNotes) : undefined,
      tradeInNetValue: rawData.tradeInNetValue ? Number(rawData.tradeInNetValue) : undefined,
      documentationNotes: rawData.documentationNotes ? String(rawData.documentationNotes) : undefined,
      sellerId: rawData.sellerId ? Number(rawData.sellerId) : undefined,
      sellerName: rawData.sellerName ? String(rawData.sellerName) : undefined,
      notes: rawData.notes ? String(rawData.notes) : undefined,
    };
    return prisma.vehicleSale.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.vehicleSale.delete({
      where: { id },
    });
  },
};
