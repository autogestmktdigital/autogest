import { Request, Response, NextFunction } from 'express';
import { financingService } from '../services/financing.service';

export const financingController = {
  async simulate(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadId, vehicleId, downPayment, installments, interestRate } = req.body;

      const result = await financingService.simulate({
        leadId: Number(leadId),
        vehicleId: Number(vehicleId),
        downPayment: Number(downPayment),
        installments: Number(installments),
        interestRate: interestRate ? Number(interestRate) : undefined,
      });

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async quickSimulate(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, downPayment, installments } = req.body;

      const result = await financingService.quickSimulate(
        Number(vehicleId),
        Number(downPayment),
        Number(installments),
      );

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
