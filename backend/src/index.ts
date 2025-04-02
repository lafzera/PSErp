import express from "express";
import cors from "cors";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes";
import systemRoutes from "./routes/system.routes";
import path from 'path';

config();

const app = express();

// Configuração do CORS usando origens do ambiente
const corsOrigins = [
  'http://localhost:3000',
  'http://192.168.168.114:3000',
  'http://fw.itlaf.com.br:3000'
];

console.log('Configurando CORS para as origens:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota de teste para verificar se o servidor está respondendo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('CORS habilitado para:', corsOrigins);
});
