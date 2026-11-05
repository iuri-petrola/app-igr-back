import { Router } from "express";
import {
  confirmConvite,
  createInscricao,
  showConvite,
  showEventoPublico,
  showEventosPublicos
} from "../controllers/eventoController";

export const eventosRouter = Router();

eventosRouter.get("/", showEventosPublicos);
eventosRouter.get("/:id/convites/:token", showConvite);
eventosRouter.post("/:id/convites/:token/confirmar", confirmConvite);
eventosRouter.get("/:id", showEventoPublico);
eventosRouter.post("/:id/inscricoes", createInscricao);
