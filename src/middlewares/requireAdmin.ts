import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    jwt.verify(token, config.jwt.secret);
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Token invalido" });
  }
}
