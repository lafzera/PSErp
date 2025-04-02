import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';

export class UserController {
  async getProfile(req: Request, res: Response) {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return res.json(user);
  }

  async updateProfile(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verifica se o email já está em uso por outro usuário
    if (email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new AppError('Email já está em uso', 400);
      }
    }

    // Se estiver alterando a senha, verifica a senha atual
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError('Senha atual é necessária para alterar a senha', 400);
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        throw new AppError('Senha atual incorreta', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(updatedUser);
  }

  async updateAvatar(req: Request, res: Response) {
    const userId = req.user?.userId;
    const avatarFile = req.file;

    if (!avatarFile) {
      throw new AppError('Nenhum arquivo enviado', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Atualiza o avatar do usuário com o caminho do arquivo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: `/uploads/avatars/${avatarFile.filename}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(updatedUser);
  }
} 