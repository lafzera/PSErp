import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/db-status", async (req: Request, res: Response) => {
  try {
    // Tenta fazer uma consulta simples no banco
    await prisma.$queryRaw`SELECT 1`;
    
    // Verifica a quantidade de registros em cada tabela
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.client.count(),
      prisma.session.count(),
      prisma.photo.count()
    ]);

    res.json({
      status: "Conectado",
      databaseStats: {
        users: stats[0],
        clients: stats[1],
        sessions: stats[2],
        photos: stats[3]
      }
    });
  } catch (error) {
    console.error("Erro ao verificar status do banco:", error);
    res.status(500).json({
      status: "Erro",
      message: "Não foi possível conectar ao banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

export default router; 