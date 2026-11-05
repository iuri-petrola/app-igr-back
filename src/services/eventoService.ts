import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

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
