import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

const quoteItemSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unitPrice: z.number().min(0, "Valor unitário deve ser maior ou igual a 0"),
});

const quoteSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  validUntil: z.string().min(1, "Data de validade é obrigatória"),
  items: z.array(quoteItemSchema).min(1, "Adicione pelo menos um item"),
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
  total: z.number().min(0),
});

// Listar orçamentos
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(quotes);
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    res.status(500).json({ message: "Erro ao listar orçamentos" });
  }
});

// Obter orçamento por ID
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Orçamento não encontrado" });
    }

    res.json(quote);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    res.status(500).json({ message: "Erro ao buscar orçamento" });
  }
});

// Criar orçamento
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = quoteSchema.parse(req.body);

    const quote = await prisma.quote.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        validUntil: new Date(data.validUntil),
        status: data.status,
        total: data.total,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    res.status(201).json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erro ao criar orçamento:", error);
    res.status(500).json({ message: "Erro ao criar orçamento" });
  }
});

// Atualizar orçamento
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = quoteSchema.parse(req.body);

    // Primeiro, excluir todos os itens existentes
    await prisma.quoteItem.deleteMany({
      where: { quoteId: id },
    });

    // Depois, atualizar o orçamento e criar novos itens
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        validUntil: new Date(data.validUntil),
        status: data.status,
        total: data.total,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    res.json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erro ao atualizar orçamento:", error);
    res.status(500).json({ message: "Erro ao atualizar orçamento" });
  }
});

// Excluir orçamento
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Primeiro, excluir todos os itens
    await prisma.quoteItem.deleteMany({
      where: { quoteId: id },
    });

    // Depois, excluir o orçamento
    await prisma.quote.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    res.status(500).json({ message: "Erro ao excluir orçamento" });
  }
});

// Atualizar status do orçamento
router.patch("/:id/status", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        items: true,
      },
    });

    res.json(quote);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: "Erro ao atualizar status" });
  }
});

// Enviar orçamento por e-mail
router.post("/:id/send", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Atualizar o status para SENT
    const quote = await prisma.quote.update({
      where: { id },
      data: { status: "SENT" },
      include: {
        client: true,
        items: true,
      },
    });

    // TODO: Implementar o envio de e-mail

    res.json(quote);
  } catch (error) {
    console.error("Erro ao enviar orçamento:", error);
    res.status(500).json({ message: "Erro ao enviar orçamento" });
  }
});

export default router; 