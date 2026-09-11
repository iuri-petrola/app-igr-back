import { Request, Response } from "express";
import { loginAdmin } from "../../services/admin/authService";

export async function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: "Campos obrigatorios: username, password" });
  }

  try {
    const result = await loginAdmin({ username: username.trim(), password });
    if (!result) {
      return res.status(401).json({ error: "Credenciais invalidas" });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao autenticar admin" });
  }
}
