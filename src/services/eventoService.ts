import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function listEventosPublicos() {
  return prisma.evento.findMany({
    where: { inscricoesAbertas: true },
    orderBy: { dataEvento: "asc" }
  });
}

export async function getEventoPublico(id: number) {
  return prisma.evento.findUnique({ where: { id } });
}

export async function listEventosAdmin() {
  return prisma.evento.findMany({
    include: { _count: { select: { inscricoes: true } } },
    orderBy: { dataEvento: "desc" }
  });
}

export async function createEvento(input: {
  titulo: string;
  descricao: string | null;
  local: string | null;
  dataEvento: Date;
  prazoInscricao: Date | null;
}) {
  return prisma.evento.create({ data: input });
}

export async function listUsuarios() {
  return prisma.usuario.findMany({ orderBy: { nome: "asc" } });
}

export async function createUsuario(input: { nome: string; celular: string; email: string | null }) {
  return prisma.usuario.create({ data: input });
}

export async function inscreverUsuario(eventoId: number, celular: string) {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });

  if (!evento) {
    return { status: "evento_nao_encontrado" as const };
  }

  const agora = new Date();
  if (!evento.inscricoesAbertas || (evento.prazoInscricao && evento.prazoInscricao < agora)) {
    return { status: "inscricoes_encerradas" as const };
  }

  const usuario = await prisma.usuario.findUnique({ where: { celular } });
  if (!usuario) {
    return { status: "usuario_nao_encontrado" as const };
  }

  try {
    const inscricao = await prisma.inscricao.create({
      data: { eventoId, usuarioId: usuario.id }
    });
    return { status: "criada" as const, inscricao, usuario };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "ja_inscrito" as const, usuario };
    }
    throw error;
  }
}

export async function createConviteInscricao(eventoId: number, usuarioId: number) {
  const [evento, usuario] = await Promise.all([
    prisma.evento.findUnique({ where: { id: eventoId } }),
    prisma.usuario.findUnique({ where: { id: usuarioId } })
  ]);

  if (!evento) {
    return { status: "evento_nao_encontrado" as const };
  }
  if (!usuario) {
    return { status: "usuario_nao_encontrado" as const };
  }

  const agora = new Date();
  const expiresAt = evento.prazoInscricao ?? evento.dataEvento;
  if (!evento.inscricoesAbertas || expiresAt <= agora) {
    return { status: "inscricoes_encerradas" as const };
  }

  // Somente o hash fica salvo; o token original aparece uma vez no link gerado.
  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.conviteInscricao.upsert({
    where: { eventoId_usuarioId: { eventoId, usuarioId } },
    create: { eventoId, usuarioId, tokenHash: hashToken(token), expiresAt },
    update: { tokenHash: hashToken(token), expiresAt, usedAt: null }
  });

  return { status: "criado" as const, token, evento, usuario, expiresAt };
}

export async function getConviteInscricao(eventoId: number, token: string) {
  const convite = await prisma.conviteInscricao.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { evento: true, usuario: true }
  });

  if (!convite || convite.eventoId !== eventoId) {
    return { status: "convite_invalido" as const };
  }
  if (convite.expiresAt <= new Date() || !convite.evento.inscricoesAbertas) {
    return { status: "convite_expirado" as const };
  }

  const inscricao = await prisma.inscricao.findUnique({
    where: { eventoId_usuarioId: { eventoId, usuarioId: convite.usuarioId } }
  });

  return {
    status: inscricao ? "ja_inscrito" as const : "valido" as const,
    evento: convite.evento,
    usuario: convite.usuario
  };
}

export async function confirmarConviteInscricao(eventoId: number, token: string) {
  const convite = await prisma.conviteInscricao.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { evento: true, usuario: true }
  });

  if (!convite || convite.eventoId !== eventoId) {
    return { status: "convite_invalido" as const };
  }
  if (convite.usedAt) {
    return { status: "ja_inscrito" as const, usuario: convite.usuario };
  }
  if (convite.expiresAt <= new Date() || !convite.evento.inscricoesAbertas) {
    return { status: "convite_expirado" as const };
  }

  try {
    await prisma.$transaction([
      prisma.inscricao.create({
        data: { eventoId, usuarioId: convite.usuarioId }
      }),
      prisma.conviteInscricao.update({
        where: { id: convite.id },
        data: { usedAt: new Date() }
      })
    ]);
    return { status: "criada" as const, usuario: convite.usuario };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "ja_inscrito" as const, usuario: convite.usuario };
    }
    throw error;
  }
}
