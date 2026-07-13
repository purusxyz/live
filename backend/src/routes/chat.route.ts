import { Router } from "express";

import { chatWithAI } from "../controllers/chat.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, chatWithAI);

export default router;