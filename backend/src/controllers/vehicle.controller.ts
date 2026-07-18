import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import type { VehicleFilters } from '../services/vehicle.service';

export const vehicleController = {
  async publicList(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: VehicleFilters = {
        brand: req.query.brand as string | undefined,
        model: req.query.model as string | undefined,
        yearMin: req.query.yearMin ? Number(req.query.yearMin) : undefined,
        yearMax: req.query.yearMax ? Number(req.query.yearMax) : undefined,
        priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
        priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
        fuel: req.query.fuel as VehicleFilters['fuel'],
        transmission: req.query.transmission as VehicleFilters['transmission'],
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      const result = await vehicleService.list({ ...filters, status: 'available' });

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async publicGetById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const vehicle = await vehicleService.getPublicById(id);

      return res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: VehicleFilters = {
        brand: req.query.brand as string | undefined,
        model: req.query.model as string | undefined,
        plate: req.query.plate as string | undefined,
        yearMin: req.query.yearMin ? Number(req.query.yearMin) : undefined,
        yearMax: req.query.yearMax ? Number(req.query.yearMax) : undefined,
        priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
        priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
        fuel: req.query.fuel as VehicleFilters['fuel'],
        transmission: req.query.transmission as VehicleFilters['transmission'],
        status: req.query.status as VehicleFilters['status'],
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      const result = await vehicleService.list(filters);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const vehicle = await vehicleService.getById(id);

      return res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const images = files?.filter(f => f.fieldname === 'images').map((f) => f.filename) || [];
      const reportFile = files?.find(f => f.fieldname === 'reportFile')?.filename;
      const documentFile = files?.find(f => f.fieldname === 'documentFile')?.filename;

      const data = {
        ...req.body,
        year: Number(req.body.year),
        modelYear: req.body.modelYear ? Number(req.body.modelYear) : undefined,
        price: Number(req.body.price),
        mileageKm: Number(req.body.mileageKm),
        images: images.length > 0 ? JSON.stringify(images) : undefined,
        features: req.body.features ? req.body.features : undefined,
        ...(reportFile && { reportFile }),
        ...(documentFile && { documentFile }),
      };

      const vehicle = await vehicleService.create(data);

      return res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const files = req.files as Express.Multer.File[] | undefined;
      const newImages = files?.filter(f => f.fieldname === 'images').map((f) => f.filename) || [];
      const reportFile = files?.find(f => f.fieldname === 'reportFile')?.filename;
      const documentFile = files?.find(f => f.fieldname === 'documentFile')?.filename;

      // Remover campos que não existem no schema Prisma
      const { existingImages, ...bodyData } = req.body;

      const data: Record<string, unknown> = { ...bodyData };
      if (req.body.year) data.year = Number(req.body.year);
      if (req.body.modelYear) data.modelYear = Number(req.body.modelYear);
      if (req.body.price) data.price = Number(req.body.price);
      if (req.body.mileageKm) data.mileageKm = Number(req.body.mileageKm);
      
      // Combinar imagens existentes com novas
      const existingImagesList = existingImages ? JSON.parse(existingImages) : [];
      const allImages = [...existingImagesList, ...newImages];
      if (allImages.length > 0) data.images = JSON.stringify(allImages);
      
      if (reportFile) data.reportFile = reportFile;
      if (documentFile) data.documentFile = documentFile;

      const vehicle = await vehicleService.update(id, data);

      return res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await vehicleService.delete(id);

      return res.json({ success: true, message: 'Veículo removido com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const vehicle = await vehicleService.updateStatus(id, status);

      return res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async addExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = Number(req.params.id);
      const { type, description, amount, date } = req.body;
      
      const expense = await vehicleService.addExpense(vehicleId, {
        type,
        description,
        amount: Number(amount),
        date,
      });

      return res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  },

  async removeExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expenseId = Number(req.params.expenseId);
      await vehicleService.removeExpense(expenseId);

      return res.json({ success: true, message: 'Gasto removido com sucesso' });
    } catch (error) {
      next(error);
    }
  },
};
