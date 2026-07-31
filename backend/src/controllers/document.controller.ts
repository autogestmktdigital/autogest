import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

function convertDocxToPdf(docxBuffer: Buffer, outputName: string): Buffer {
  const tmpDir = path.resolve('/tmp', `doc_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const docxPath = path.join(tmpDir, `${outputName}.docx`);
  fs.writeFileSync(docxPath, docxBuffer);

  const pdfDir = path.join(tmpDir, 'pdf');
  fs.mkdirSync(pdfDir, { recursive: true });

  try {
    execSync(
      `libreoffice --headless --convert-to pdf --outdir "${pdfDir}" "${docxPath}"`,
      { timeout: 30000, stdio: 'pipe' }
    );
  } catch (err: any) {
    console.error('Erro ao converter para PDF:', err.message);
    console.error('stderr:', err.stderr?.toString());
    console.error('stdout:', err.stdout?.toString());
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error('Falha na conversão para PDF. O LibreOffice pode não estar instalado.');
  }

  const pdfPath = path.join(pdfDir, `${outputName}.pdf`);
  if (!fs.existsSync(pdfPath)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error('Arquivo PDF não foi gerado pelo LibreOffice.');
  }

  const pdfBuffer = fs.readFileSync(pdfPath);

  // Limpar arquivos temporários
  fs.rmSync(tmpDir, { recursive: true, force: true });

  return pdfBuffer;
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
    delimiters: { start: '{', end: '}' },
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

  // Parse endereço do cliente - prioriza campos separados, fallback para split do campo antigo
  let addressParts = {
    rua: sale.clientStreet || '',
    numero: sale.clientNumber || '',
    bairro: sale.clientNeighborhood || '',
    cidade: sale.clientCity || '',
    estado: sale.clientState || '',
    cep: sale.clientZipCode || '',
  };
  // Se não tiver campos separados, tenta fazer split do campo antigo clientAddress
  if (!addressParts.rua && sale.clientAddress) {
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
    'Cor Troca': sale.tradeInColor || sale.tradeInFuel || '',
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

  try {
    doc.render(data);
  } catch (error: any) {
    console.error('Erro ao renderizar documento:', error);
    console.error('Dados usados:', JSON.stringify(data, null, 2));
    throw new Error(`Erro ao gerar documento: ${error.message}`);
  }
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
          fileName = `Contrato_Venda_${vehicle.plate || vehicle.id}`;
          break;
        case 'recibo':
          templateName = 'recibo_venda.docx';
          fileName = `Recibo_Venda_${vehicle.plate || vehicle.id}`;
          break;
        case 'termo':
          templateName = 'termo_garantia.docx';
          fileName = `Termo_Garantia_${vehicle.plate || vehicle.id}`;
          break;
        default:
          return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
      }

      const docxBuffer = await generateDocument(templateName, vehicle, sale);
      const pdfBuffer = convertDocxToPdf(docxBuffer, fileName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },
};
