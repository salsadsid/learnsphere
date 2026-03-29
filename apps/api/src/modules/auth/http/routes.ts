import { Router } from "express";
import { requireAuth } from "./middleware";
import { createRateLimiter } from "../../../shared/rate-limit";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
} from "./handlers";

export const authRouter = Router();

const authLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 8,
  keyPrefix: "auth",
});

authRouter.post("/register", authLimiter, registerHandler);
authRouter.post("/login", authLimiter, loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", requireAuth, meHandler);
