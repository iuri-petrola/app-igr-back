import { Router } from "express";
import { searchUsuariosPublicos } from "../controllers/eventoController";

export const usuariosRouter = Router();

usuariosRouter.get("/busca", searchUsuariosPublicos);
