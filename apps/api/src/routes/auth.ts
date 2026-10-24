import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { register, login } from "../controllers/auth.js";
export const authRouter = Router();
authRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: { message: "Too many authentication attempts; try again later" },
    },
  }),
);
authRouter.post("/register", register);
authRouter.post("/login", login);
