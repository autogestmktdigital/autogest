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
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const images = files?.images ? files.images.map((f) => f.filename) : [];
      const reportFile = files?.reportFile?.[0]?.filename;
      const documentFile = files?.documentFile?.[0]?.filename;

      const data = {
        ...req.body,
        year: Number(req.body.year),
        modelYear: req.body.modelYear ? Number(req.body.modelYear) : undefined,
        price: Number(req.body.price),
        mileageKm: Number(req.body.mileageKm),
        images,
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
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const images = files?.images && files.images.length > 0 ? files.images.map((f) => f.filename) : undefined;
      const reportFile = files?.reportFile?.[0]?.filename;
      const documentFile = files?.documentFile?.[0]?.filename;

      const data: Record<string, unknown> = { ...req.body };
      if (req.body.year) data.year = Number(req.body.year);
      if (req.body.modelYear) data.modelYear = Number(req.body.modelYear);
      if (req.body.price) data.price = Number(req.body.price);
      if (req.body.mileageKm) data.mileageKm = Number(req.body.mileageKm);
      if (images) data.images = images;
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
