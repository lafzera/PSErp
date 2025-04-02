import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

const sessionSchema = z.object({
  clientId: z.string().uuid(),
  date: z.string().datetime(),
  type: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
});

const updateSessionSchema = sessionSchema.partial();

const photoSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  description: z.string().optional(),
});

router.use(authMiddleware as RequestHandler);

// Listar sessões
router.get("/", (async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        client: true,
        photos: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Erro ao listar sessões:", error);
    res.status(500).json({ message: "Erro ao listar sessões" });
  }
}) as RequestHandler);

// Obter sessão por ID
router.get("/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        client: true,
        photos: true,
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Sessão não encontrada" });
    }

    res.json(session);
  } catch (error) {
    console.error("Erro ao obter sessão:", error);
    res.status(500).json({ message: "Erro ao obter sessão" });
  }
}) as RequestHandler);

// Criar sessão
router.post("/", (async (req: Request, res: Response) => {
  try {
    const data = sessionSchema.parse(req.body);
    const session = await prisma.session.create({
      data,
      include: {
        client: true,
        photos: true,
      },
    });
    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erro ao criar sessão:", error);
    res.status(500).json({ message: "Erro ao criar sessão" });
  }
}) as RequestHandler);

// Atualizar sessão
router.put("/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateSessionSchema.parse(req.body);
    const session = await prisma.session.update({
      where: { id },
      data,
      include: {
        client: true,
        photos: true,
      },
    });
    res.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erro ao atualizar sessão:", error);
    res.status(500).json({ message: "Erro ao atualizar sessão" });
  }
}) as RequestHandler);

// Excluir sessão
router.delete("/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.session.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir sessão:", error);
    res.status(500).json({ message: "Erro ao excluir sessão" });
  }
}) as RequestHandler);

// Atualizar status da sessão
router.patch("/:id/status", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const session = await prisma.session.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        photos: true,
      },
    });
    res.json(session);
  } catch (error) {
    console.error("Erro ao atualizar status da sessão:", error);
    res.status(500).json({ message: "Erro ao atualizar status da sessão" });
  }
}) as RequestHandler);

// Adicionar fotos à sessão
router.post("/:id/photos", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = photoSchema.parse(req.body);
    const photo = await prisma.photo.create({
      data: {
        ...data,
        sessionId: id,
      },
    });
    res.status(201).json(photo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erro ao adicionar foto:", error);
    res.status(500).json({ message: "Erro ao adicionar foto" });
  }
}) as RequestHandler);

// Remover foto da sessão
router.delete("/:id/photos/:photoId", (async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    await prisma.photo.delete({
      where: { id: photoId },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    res.status(500).json({ message: "Erro ao remover foto" });
  }
}) as RequestHandler);

export default router; 