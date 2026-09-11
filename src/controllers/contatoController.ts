import { Request, Response } from "express";
import { config } from "../config";

export function showContato(_req: Request, res: Response) {
  // Expõe somente o dado necessário ao front, sem revelar as demais configurações.
  const numeroWhatsApp = config.whatsAppPhoneNumber.replace(/\D/g, "");

  return res.json({
    whatsAppUrl: `https://wa.me/${numeroWhatsApp}`
  });
}
