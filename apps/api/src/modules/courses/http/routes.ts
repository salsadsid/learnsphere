import { Router } from "express";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";

export const coursesRouter = Router();

coursesRouter.post("/", requireAuth, requireRole({ roles: ["instructor", "admin"] }), (_req, res) => {
  res.status(501).json({
    message: "Course creation not implemented yet.",
  });
});
