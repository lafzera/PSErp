import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "USER", "PHOTOGRAPHER"], {
    errorMap: () => ({ message: "Função inválida" }),
  }),
});

const updateUserSchema = userSchema.partial().omit({ password: true });

// Criar usuário (sem autenticação para o primeiro admin)
router.post("/", (async (req: Request, res: Response) => {
  try {
    const data = userSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
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

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Erro ao criar usuário" });
  }
}) as RequestHandler);

// Listar usuários
router.get("/", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar usuários" });
  }
}) as RequestHandler);

// Obter usuário atual
router.get("/me", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    
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
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    res.status(500).json({ message: "Erro ao obter usuário atual" });
  }
}) as RequestHandler);

// Atualizar usuário
router.put("/:id", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: {
            id,
          },
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
}) as RequestHandler);

// Excluir usuário
router.delete("/:id", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir usuário" });
  }
}) as RequestHandler);

export default router; 