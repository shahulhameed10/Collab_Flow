import { Router } from "express";
import { getStats } from "../controllers/statsController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/stats", authenticateToken, getStats);

export default router;
