import { Request, Response } from "express";
import { getPalavraDoDia } from "../services/palavraDoDiaService";

export async function showPalavraDoDia(_req: Request, res: Response) {
  try {
    const payload = await getPalavraDoDia();
    return res.json(payload);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar palavra do dia" });
  }
}
