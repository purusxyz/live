import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://gearbox-ai-omega.vercel.app",
    ],
    credentials: true,
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
export default app;
