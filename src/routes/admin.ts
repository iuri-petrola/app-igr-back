import { Router } from "express";
import { adminLogin } from "../controllers/admin/authController";
import {
  createEventoAdmin,
  createConviteAdmin,
  createUsuarioAdmin,
  showEventosAdmin,
  showInscricoesEventoAdmin,
  showUsuariosAdmin
} from "../controllers/eventoController";
import { showPedidos } from "../controllers/pedidoController";
import { requireAdmin } from "../middlewares/requireAdmin";

export const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/pedidos", requireAdmin, showPedidos);
adminRouter.get("/eventos", requireAdmin, showEventosAdmin);
adminRouter.post("/eventos", requireAdmin, createEventoAdmin);
adminRouter.post("/eventos/:id/convites", requireAdmin, createConviteAdmin);
adminRouter.get("/eventos/:id/inscricoes", requireAdmin, showInscricoesEventoAdmin);
adminRouter.get("/usuarios", requireAdmin, showUsuariosAdmin);
adminRouter.post("/usuarios", requireAdmin, createUsuarioAdmin);
