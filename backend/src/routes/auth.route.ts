import { Router } from "express";

import {
  googleLogin,
  googleCallback,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", verifyToken, getCurrentUser);

export default router;