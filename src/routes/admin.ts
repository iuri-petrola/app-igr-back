import { Router } from "express";
import { adminLogin } from "../controllers/admin/authController";
import { showPedidos } from "../controllers/pedidoController";
import { requireAdmin } from "../middlewares/requireAdmin";

export const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/pedidos", requireAdmin, showPedidos);
