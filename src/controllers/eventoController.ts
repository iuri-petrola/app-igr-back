import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { normalizeCelular } from "../lib/celular";
import {
  createEvento,
  createUsuario,
  getEventoPublico,
  inscreverUsuario,
  listEventosAdmin,
  listEventosPublicos,
  listUsuarios
} from "../services/eventoService";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function showEventosPublicos(_req: Request, res: Response) {
  try {
    return res.json(await listEventosPublicos());
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar eventos" });
  }
}

export async function showEventoPublico(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const evento = await getEventoPublico(id);
    return evento ? res.json(evento) : res.status(404).json({ error: "Evento nao encontrado" });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar evento" });
  }
}

export async function createInscricao(req: Request, res: Response) {
  const eventoId = parseId(req.params.id);
  const celular = normalizeCelular(String(req.body?.celular ?? ""));

  if (!eventoId || !celular) {
    return res.status(400).json({ error: "Informe um celular valido com DDD" });
  }

  try {
    const result = await inscreverUsuario(eventoId, celular);

    if (result.status === "evento_nao_encontrado") {
      return res.status(404).json({ error: "Evento nao encontrado" });
    }
    if (result.status === "inscricoes_encerradas") {
      return res.status(409).json({ error: "As inscricoes para este evento estao encerradas" });
    }
    if (result.status === "usuario_nao_encontrado") {
      return res.status(404).json({ error: "Celular nao encontrado no cadastro da igreja" });
    }
    if (result.status === "ja_inscrito") {
      return res.status(409).json({ error: `${result.usuario.nome}, sua inscricao ja foi realizada` });
    }

    return res.status(201).json({
      message: `${result.usuario.nome}, sua inscricao foi realizada com sucesso`
    });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao realizar inscricao" });
  }
}

export async function showEventosAdmin(_req: Request, res: Response) {
  try {
    return res.json(await listEventosAdmin());
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar eventos" });
  }
}

export async function createEventoAdmin(req: Request, res: Response) {
  const { titulo, descricao, local, dataEvento, prazoInscricao } = req.body as Record<string, unknown>;
  const data = parseDate(dataEvento);
  const prazo = prazoInscricao ? parseDate(prazoInscricao) : null;

  if (typeof titulo !== "string" || !titulo.trim() || !data) {
    return res.status(400).json({ error: "Campos obrigatorios: titulo e data do evento" });
  }
  if (prazoInscricao && !prazo) {
    return res.status(400).json({ error: "Prazo de inscricao invalido" });
  }

  try {
    const evento = await createEvento({
      titulo: titulo.trim(),
      descricao: typeof descricao === "string" && descricao.trim() ? descricao.trim() : null,
      local: typeof local === "string" && local.trim() ? local.trim() : null,
      dataEvento: data,
      prazoInscricao: prazo
    });
    return res.status(201).json(evento);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao criar evento" });
  }
}

export async function showUsuariosAdmin(_req: Request, res: Response) {
  try {
    return res.json(await listUsuarios());
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar usuarios" });
  }
}

export async function createUsuarioAdmin(req: Request, res: Response) {
  const { nome, celular: celularInput, email } = req.body as Record<string, unknown>;
  const celular = normalizeCelular(String(celularInput ?? ""));

  if (typeof nome !== "string" || !nome.trim() || !celular) {
    return res.status(400).json({ error: "Informe nome e celular valido com DDD" });
  }

  try {
    const usuario = await createUsuario({
      nome: nome.trim(),
      celular,
      email: typeof email === "string" && email.trim() ? email.trim() : null
    });
    return res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Este celular ja esta cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao cadastrar usuario" });
  }
}
