import { Request, Response } from "express";
import { config } from "../config";
import { getRequestBaseUrl } from "../lib/baseUrl";
import { isMinisterio } from "../lib/ministerios";
import { createFoto, deleteFoto, getFotoById, getFotos, updateFoto } from "../services/fotoService";

export async function listFotos(req: Request, res: Response) {
  const ministerio = req.query.ministerio;

  if (ministerio !== undefined && !isMinisterio(ministerio)) {
    return res.status(400).json({ error: "Ministerio invalido" });
  }

  try {
    const items = await getFotos(ministerio);
    const baseUrl = getRequestBaseUrl(req);

    const normalized = items.map((item) => ({
      ...item,
      imagemUrl: item.imagemUrl.startsWith("/")
        ? `${baseUrl}${item.imagemUrl}`
        : item.imagemUrl
    }));

    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar fotos" });
  }
}

export async function createFotoItem(req: Request, res: Response) {
  const { titulo, instagramUrl, ministerio } = req.body as {
    titulo?: string;
    instagramUrl?: string;
    ministerio?: string;
  };
  const file = (req as Request & { file?: { filename: string } }).file;

  if (!titulo || !file || !isMinisterio(ministerio)) {
    return res.status(400).json({ error: "Campos obrigatorios: titulo, ministerio, image(file)" });
  }

  try {
    const imagemUrl = `${config.uploadsPublicPath}/fotos/${file.filename}`;
    const created = await createFoto({
      titulo: titulo.trim(),
      imagemUrl,
      instagramUrl: instagramUrl?.trim() || null,
      ministerio
    });
    return res.status(201).json(created);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao criar foto" });
  }
}

export async function updateFotoItem(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { titulo, instagramUrl, ministerio } = req.body as {
    titulo?: string;
    instagramUrl?: string;
    ministerio?: string;
  };
  const file = (req as Request & { file?: { filename: string } }).file;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalido" });
  }

  if (!titulo || !isMinisterio(ministerio)) {
    return res.status(400).json({ error: "Campos obrigatorios: titulo, ministerio" });
  }

  try {
    const current = await getFotoById(id);
    if (!current) {
      return res.status(404).json({ error: "Foto nao encontrada" });
    }

    const imagemUrl = file ? `${config.uploadsPublicPath}/fotos/${file.filename}` : current.imagemUrl;

    const updated = await updateFoto(id, {
      titulo: titulo.trim(),
      imagemUrl,
      instagramUrl: instagramUrl?.trim() || null,
      ministerio
    });
    return res.json(updated);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao atualizar foto" });
  }
}

export async function deleteFotoItem(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const deleted = await deleteFoto(id);
    if (!deleted) {
      return res.status(404).json({ error: "Foto nao encontrada" });
    }
    return res.status(204).send();
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao remover foto" });
  }
}
