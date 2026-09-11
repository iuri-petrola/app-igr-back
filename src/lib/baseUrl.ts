import { Request } from "express";

export function getRequestBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}
