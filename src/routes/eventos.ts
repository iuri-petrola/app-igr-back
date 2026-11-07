import { Router } from "express";
import { createInscricao, showEventoPublico, showEventosPublicos } from "../controllers/eventoController";

export const eventosRouter = Router();

eventosRouter.get("/", showEventosPublicos);
eventosRouter.get("/:id", showEventoPublico);
eventosRouter.post("/:id/inscricoes", createInscricao);
