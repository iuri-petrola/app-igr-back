import { Router } from "express";
import { showPalavraDoDia } from "../controllers/palavraDoDiaController";

export const palavraDoDiaRouter = Router();

palavraDoDiaRouter.get("/", showPalavraDoDia);
