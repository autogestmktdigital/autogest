import { Request, Response, NextFunction } from 'express';
import { vehicleSaleService } from '../services/vehicle-sale.service';

export const vehicleSaleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const sale = await vehicleSaleService.create(data);
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
