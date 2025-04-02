import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

const configSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional()
});

// Listar todas as configurações
router.get("/configs", authenticateToken, async (req: Request, res: Response) => {
  try {
    const configs = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' }
    });
    res.json({ data: configs });
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ message: "Erro ao listar configurações" });
  }
});

// Obter uma configuração específica
router.get("/configs/:key", authenticateToken, async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: req.params.key }
    });

    if (!config) {
      return res.status(404).json({ message: "Configuração não encontrada" });
    }

    res.json({ data: config });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ message: "Erro ao obter configuração" });
  }
});

// Criar nova configuração
router.post("/configs", authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = configSchema.parse(req.body);

    const existingConfig = await prisma.systemConfig.findUnique({
      where: { key: data.key }
    });

    if (existingConfig) {
      return res.status(400).json({ message: "Configuração já existe" });
    }

    const config = await prisma.systemConfig.create({
      data
    });

    res.status(201).json({ data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ message: "Erro ao criar configuração" });
  }
});

// Atualizar configuração
router.put("/configs/:key", authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = configSchema.parse(req.body);

    const config = await prisma.systemConfig.update({
      where: { key: req.params.key },
      data
    });

    res.json({ data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ message: "Erro ao atualizar configuração" });
  }
});

// Deletar configuração
router.delete("/configs/:key", authenticateToken, async (req: Request, res: Response) => {
  try {
    await prisma.systemConfig.delete({
      where: { key: req.params.key }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ message: "Erro ao deletar configuração" });
  }
});

export default router; 