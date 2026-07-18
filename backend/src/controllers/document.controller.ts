import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { vehicleSaleService } from '../services/vehicle-sale.service';
import { VehicleService } from '../services/vehicle.service';

const vehicleService = new VehicleService();

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

async function generateDocument(
  templateName: string,
  vehicle: any,
  sale: any
): Promise<Buffer> {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Parse clientDocuments se for string JSON
  let clientDocs: string[] = [];
  if (sale.clientDocuments) {
    try {
      clientDocs = JSON.parse(sale.clientDocuments);
    } catch {
      clientDocs = [];
    }
  }

  // Parse endereço do cliente
  let addressParts = {
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  };
  if (sale.clientAddress) {
    const parts = sale.clientAddress.split(',').map((p: string) => p.trim());
    addressParts.rua = parts[0] || '';
    addressParts.numero = parts[1] || '';
    addressParts.bairro = parts[2] || '';
    addressParts.cidade = parts[3] || '';
    addressParts.estado = parts[4] || '';
    addressParts.cep = parts[5] || '';
  }

  const data: Record<string, any> = {
    // Cliente
    'Nome do Cliente': sale.clientName || '',
    'Nome do cliente': sale.clientName || '',
    'RG': sale.clientRg || '',
    'CPF': sale.clientCpfCnpj || '',
    'CPF/CNPJ': sale.clientCpfCnpj || '',
    'Celular': sale.clientPhone || '',
    'Email': sale.clientEmail || '',
    'Rua/Av': addressParts.rua,
    'Número': addressParts.numero,
    'Bairro': addressParts.bairro,
    'Cidade': addressParts.cidade,
    'Estado': addressParts.estado,
    'Cep': addressParts.cep,

    // Veículo vendido
    'Marca': vehicle.brand || '',
    'Modelo': vehicle.model || '',
    'Versão': vehicle.version || '',
    'Ano Fabricação': vehicle.year || '',
    'Ano Modelo': vehicle.modelYear || vehicle.year || '',
    'Ano': vehicle.year || '',
    'Cor': vehicle.color || '',
    'cor': vehicle.color || '',
    'Placa': vehicle.plate || '',
    'Chassi': vehicle.chassis || '',
    'Renavam': vehicle.renavam || '',
    'Renavan': vehicle.renavam || '',
    'Combustível': vehicle.fuel || '',
    'KM': vehicle.mileageKm || '',

    // Venda
    'Valor da Venda': formatCurrency(sale.salePrice),
    'Data da Venda': formatDate(sale.saleDate),
    'Forma de Pagamento': sale.paymentMethod === 'cash' ? 'À vista' : 'Financiado',
    'Valor de Venda': formatCurrency(sale.salePrice),

    // Financiamento
    'Valor da Entrada Financiamento': formatCurrency(sale.downPayment),
    'Financeira': sale.financeCompany || '',
    'Data do Financiamento': formatDate(sale.financeDate),
    'Valor Financiado': formatCurrency(sale.financedAmount),
    'N° de Parcelas': sale.installments || '',
    'Valor das Parcelas': formatCurrency(sale.installmentValue),

    // Veículo na troca
    'Veículo na Troca': sale.hasTradeIn ? 'Sim' : 'Não',
    'Marca Troca': sale.tradeInBrand || '',
    'Modelo Troca': sale.tradeInModel || '',
    'Versão Troca': sale.tradeInVersion || '',
    'Ano Troca': sale.tradeInYear || '',
    'Cor Troca': sale.tradeInFuel || '', // fallback
    'Placa Troca': sale.tradeInPlate || '',
    'Renavam Troca': sale.tradeInRenavam || '',
    'Renavan Troca': sale.tradeInRenavam || '',
    'Combustível Troca': sale.tradeInFuel || '',
    'KM Troca': sale.tradeInPurchasePrice || '', // fallback
    'Valor da Compra': formatCurrency(sale.tradeInPurchasePrice),
    'Débitos': formatCurrency(sale.tradeInDebts),
    'Observação sobre Débitos': sale.tradeInDebtsNotes || '',
    'Valor da Entrada Veículo Troca': formatCurrency(sale.tradeInNetValue),

    // Documentação
    'Documentação Veículo': sale.documentationNotes || '',

    // Vendedor
    'Vendedor': sale.sellerName || '',
  };

  doc.render(data);
  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  return buf;
}

export const documentController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, type } = req.params;
      const vid = Number(vehicleId);

      const vehicle = await vehicleService.getById(vid);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
      }

      const sale = await vehicleSaleService.getByVehicleId(vid);
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada para este veículo' });
      }

      let templateName: string;
      let fileName: string;

      switch (type) {
        case 'contrato':
          templateName = 'contrato_venda.docx';
          fileName = `Contrato_Venda_${vehicle.plate || vehicle.id}.docx`;
          break;
        case 'recibo':
          templateName = 'recibo_venda.docx';
          fileName = `Recibo_Venda_${vehicle.plate || vehicle.id}.docx`;
          break;
        case 'termo':
          templateName = 'termo_garantia.docx';
          fileName = `Termo_Garantia_${vehicle.plate || vehicle.id}.docx`;
          break;
        default:
          return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
      }

      const buffer = await generateDocument(templateName, vehicle, sale);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};
