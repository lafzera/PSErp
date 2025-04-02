import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

router.post("/", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Erro ao criar cliente" });
  }
}) as RequestHandler);

router.get("/", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        sessions: true
      }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
}) as RequestHandler);

router.get("/:id", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            photos: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar cliente" });
  }
}) as RequestHandler);

router.put("/:id", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = clientSchema.parse(req.body);

    const client = await prisma.client.update({
      where: { id },
      data
    });

    res.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
}) as RequestHandler);

router.delete("/:id", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir cliente" });
  }
}) as RequestHandler);

export default router;
