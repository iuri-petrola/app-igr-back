import { Router } from "express";
import { createPedidoItem } from "../controllers/pedidoController";

export const pedidosRouter = Router();

pedidosRouter.post("/", createPedidoItem);
