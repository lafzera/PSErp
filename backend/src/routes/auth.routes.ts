import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

router.post("/register", function(req, res) {
  const handleRegister = async () => {
    try {
      const { email, password, name } = userSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "default-secret",
        { expiresIn: "1d" }
      );

      res.status(201).json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  };
  handleRegister();
});

router.post("/login", (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativa de login:', { email });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    console.log('Usuário encontrado:', { id: user.id, email: user.email });
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Senha válida:', validPassword);

    if (!validPassword) {
      console.log('Senha inválida para o usuário:', email);
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "1d" }
    );

    console.log('Login bem-sucedido para:', email);
    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
}) as RequestHandler);

// Rota para criar usuário de teste
router.post("/create-test-user", async function(req, res) {
  try {
    const testUser = {
      email: "admin@admin.com",
      password: "admin123",
      name: "Administrador",
      role: "ADMIN"
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Usuário de teste já existe" });
    }

    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role
      }
    });

    res.status(201).json({ 
      message: "Usuário de teste criado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    res.status(500).json({ message: "Erro ao criar usuário de teste" });
  }
});

export default router;
