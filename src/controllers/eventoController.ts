import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { config } from "../config";
import { normalizeCelular } from "../lib/celular";
import {
  createEvento,
  createUsuario,
  getEventoPublico,
  inscreverParticipantes,
  listEventosAdmin,
  listEventosPublicos,
  listInscricoesEvento,
  searchUsuariosByName,
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
  const participantes = Array.isArray(req.body?.participantes)
    ? req.body.participantes.filter((participante: unknown) => {
        if (!participante || typeof participante !== "object") {
          return false;
        }
        const item = participante as { nome?: unknown };
        return typeof item.nome === "string" && !!item.nome.trim();
      }) as Array<{ nome: string; usuarioId?: unknown }>
    : [];

  if (!eventoId || participantes.length === 0 || participantes.length > 20) {
    return res.status(400).json({ error: "Informe entre 1 e 20 participantes" });
  }
  if (participantes.some((participante) => participante.nome.trim().length < 2 || participante.nome.trim().length > 120)) {
    return res.status(400).json({ error: "Cada nome deve ter entre 2 e 120 caracteres" });
  }

  const participantesValidos = participantes.map((participante) => ({
    nome: participante.nome,
    usuarioId: Number.isInteger(participante.usuarioId) && Number(participante.usuarioId) > 0
      ? Number(participante.usuarioId)
      : null
  }));

  try {
    const result = await inscreverParticipantes(eventoId, participantesValidos);

    if (result.status === "evento_nao_encontrado") {
      return res.status(404).json({ error: "Evento nao encontrado" });
    }
    if (result.status === "inscricoes_encerradas") {
      return res.status(409).json({ error: "As inscricoes para este evento estao encerradas" });
    }
    if (result.status === "usuario_invalido") {
      return res.status(400).json({ error: "Um dos usuarios selecionados nao foi encontrado" });
    }
    if (result.quantidade === 0) {
      return res.status(409).json({ error: "Todos os nomes informados ja estao inscritos" });
    }
    return res.status(201).json({
      message: result.quantidade === 1
        ? "Inscricao realizada com sucesso"
        : `${result.quantidade} inscricoes realizadas com sucesso`,
      quantidade: result.quantidade,
      duplicadas: result.duplicadas
    });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao realizar inscricao" });
  }
}

export async function searchUsuariosPublicos(req: Request, res: Response) {
  const nome = typeof req.query.nome === "string" ? req.query.nome.trim() : "";
  if (nome.length < 3) {
    return res.json([]);
  }

  try {
    return res.json(await searchUsuariosByName(nome.slice(0, 80)));
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao pesquisar usuarios" });
  }
}

export async function showEventosAdmin(_req: Request, res: Response) {
  try {
    const eventos = await listEventosAdmin();
    return res.json(eventos.map((evento) => ({
      ...evento,
      linkInscricao: `${config.frontendBaseUrl}/eventos/${evento.id}/inscricao`
    })));
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

export async function showInscricoesEventoAdmin(req: Request, res: Response) {
  const eventoId = parseId(req.params.id);
  if (!eventoId) {
    return res.status(400).json({ error: "Evento invalido" });
  }

  try {
    const evento = await getEventoPublico(eventoId);
    if (!evento) {
      return res.status(404).json({ error: "Evento nao encontrado" });
    }

    return res.json(await listInscricoesEvento(eventoId));
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar inscritos" });
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
