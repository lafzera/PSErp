import { Router } from "express";
import authRoutes from "./auth.routes";
import clientRoutes from "./client.routes";
import userRoutes from "./users.routes";
import quotesRoutes from "./quotes.routes";
import sessionsRoutes from "./sessions.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/users", userRoutes);
router.use("/quotes", quotesRoutes);
router.use("/sessions", sessionsRoutes);

export default router; 