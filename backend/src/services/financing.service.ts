import { prisma } from '../config';
import { AppError } from '../utils/AppError';

export interface FinancingInput {
  leadId: number;
  vehicleId: number;
  downPayment: number;
  installments: number;
  interestRate?: number;
}

export interface FinancingResult {
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  installments: number;
  interestRate: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
}

export class FinancingService {
  private readonly DEFAULT_INTEREST_RATE = 1.49; // 1.49% a.m. (taxa média mercado)

  calculatePrice(
    vehiclePrice: number,
    downPayment: number,
    installments: number,
    annualOrMonthlyRate?: number,
  ): FinancingResult {
    if (downPayment >= vehiclePrice) {
      throw new AppError('Entrada deve ser menor que o valor do veículo', 400);
    }

    if (installments < 6 || installments > 72) {
      throw new AppError('Número de parcelas deve ser entre 6 e 72', 400);
    }

    if (downPayment < 0) {
      throw new AppError('Valor de entrada inválido', 400);
    }

    const monthlyRate = (annualOrMonthlyRate ?? this.DEFAULT_INTEREST_RATE) / 100;
    const financedAmount = vehiclePrice - downPayment;

    // Tabela Price: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const factor = Math.pow(1 + monthlyRate, installments);
    const monthlyPayment = financedAmount * ((monthlyRate * factor) / (factor - 1));

    const totalPaid = downPayment + monthlyPayment * installments;
    const totalInterest = totalPaid - vehiclePrice;

    return {
      vehiclePrice,
      downPayment,
      financedAmount,
      installments,
      interestRate: annualOrMonthlyRate ?? this.DEFAULT_INTEREST_RATE,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
    };
  }

  async simulate(input: FinancingInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
    if (!vehicle) throw new AppError('Veículo não encontrado', 404);

    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (!lead) throw new AppError('Lead não encontrado', 404);

    const result = this.calculatePrice(
      vehicle.price,
      input.downPayment,
      input.installments,
      input.interestRate,
    );

    const simulation = await prisma.financingSimulation.create({
      data: {
        leadId: input.leadId,
        vehicleId: input.vehicleId,
        vehiclePrice: result.vehiclePrice,
        downPayment: result.downPayment,
        installments: result.installments,
        interestRate: result.interestRate,
        monthlyPayment: result.monthlyPayment,
        totalPaid: result.totalPaid,
      },
    });

    return { ...simulation, financedAmount: result.financedAmount, totalInterest: result.totalInterest };
  }

  async quickSimulate(vehicleId: number, downPayment: number, installments: number) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError('Veículo não encontrado', 404);

    const result = this.calculatePrice(vehicle.price, downPayment, installments);

    return {
      veiculo: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      valorVeiculo: `R$ ${vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      entrada: `R$ ${downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      valorFinanciado: `R$ ${result.financedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      parcelas: `${installments}x de R$ ${result.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      taxaMensal: `${result.interestRate}% a.m.`,
      totalPago: `R$ ${result.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      totalJuros: `R$ ${result.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    };
  }
}

export const financingService = new FinancingService();
