import { Request, Response, NextFunction } from 'express';
import { vehicleSaleService } from '../services/vehicle-sale.service';
import { uploadToCloudinary, hasCloudinaryConfig } from '../middleware/upload';

export const vehicleSaleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      
      // Upload client documents to Cloudinary if configured
      let clientDocuments: string[] = [];
      const documentFiles = files?.filter(f => f.fieldname === 'clientDocuments') || [];
      
      if (hasCloudinaryConfig) {
        for (const file of documentFiles) {
          const url = await uploadToCloudinary(file, 'sale-documents');
          clientDocuments.push(url);
        }
      } else {
        clientDocuments = documentFiles.map((f) => f.filename);
      }

      const data: Record<string, unknown> = { ...req.body };
      
      // Converter campos numéricos
      if (req.body.salePrice) data.salePrice = Number(req.body.salePrice);
      if (req.body.downPayment) data.downPayment = Number(req.body.downPayment);
      if (req.body.financedAmount) data.financedAmount = Number(req.body.financedAmount);
      if (req.body.installments) data.installments = Number(req.body.installments);
      if (req.body.installmentValue) data.installmentValue = Number(req.body.installmentValue);
      if (req.body.hasTradeIn) data.hasTradeIn = req.body.hasTradeIn === 'true';
      if (req.body.tradeInYear) data.tradeInYear = Number(req.body.tradeInYear);
      if (req.body.tradeInModelYear) data.tradeInModelYear = Number(req.body.tradeInModelYear);
      if (req.body.tradeInPurchasePrice) data.tradeInPurchasePrice = Number(req.body.tradeInPurchasePrice);
      if (req.body.tradeInDebts) data.tradeInDebts = Number(req.body.tradeInDebts);
      if (req.body.tradeInNetValue) data.tradeInNetValue = Number(req.body.tradeInNetValue);
      if (req.body.sellerId) data.sellerId = Number(req.body.sellerId);
      if (req.body.vehicleId) data.vehicleId = Number(req.body.vehicleId);
      
      if (clientDocuments.length > 0) data.clientDocuments = JSON.stringify(clientDocuments);

      const sale = await vehicleSaleService.create(data as any);
      return res.status(201).json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  },

  async getByVehicleId(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const sale = await vehicleSaleService.getByVehicleId(vehicleId);
      return res.json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const sale = await vehicleSaleService.update(id, data);
      return res.json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await vehicleSaleService.delete(id);
      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
