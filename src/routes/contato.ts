import { Router } from "express";
import { showContato } from "../controllers/contatoController";

export const contatoRouter = Router();

contatoRouter.get("/", showContato);
