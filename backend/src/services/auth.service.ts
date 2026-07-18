import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, env } from '../config';
import { AppError } from '../utils/AppError';
import type { AuthPayload } from '../middleware/auth';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: AuthPayload }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const payload: AuthPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'seller',
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    return { token, user: payload };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'seller';
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email já cadastrado', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return user;
  }

  async listUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const authService = new AuthService();
