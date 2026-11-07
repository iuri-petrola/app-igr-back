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
    include: {
      _count: { select: { inscricoes: true } },
      inscricoes: {
        select: { nome: true },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { dataEvento: "desc" }
  });
}

export async function listInscricoesEvento(eventoId: number) {
  return prisma.inscricao.findMany({
    where: { eventoId },
    include: {
      usuario: { select: { id: true, nome: true, celular: true, email: true } }
    },
    orderBy: { createdAt: "asc" }
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

export async function searchUsuariosByName(nome: string) {
  return prisma.usuario.findMany({
    where: { nome: { contains: nome, mode: "insensitive" } },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
    take: 8
  });
}

export async function createUsuario(input: { nome: string; celular: string; email: string | null }) {
  return prisma.usuario.create({ data: input });
}

function normalizeNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export async function inscreverParticipantes(
  eventoId: number,
  participantesInput: Array<{ nome: string; usuarioId: number | null }>
) {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
  if (!evento) {
    return { status: "evento_nao_encontrado" as const };
  }

  const agora = new Date();
  if (!evento.inscricoesAbertas || (evento.prazoInscricao && evento.prazoInscricao < agora)) {
    return { status: "inscricoes_encerradas" as const };
  }

  const usuarioIds = participantesInput
    .map((participante) => participante.usuarioId)
    .filter((id): id is number => id !== null);
  const usuarios = usuarioIds.length > 0
    ? await prisma.usuario.findMany({ where: { id: { in: usuarioIds } } })
    : [];
  const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

  if (usuarios.length !== new Set(usuarioIds).size) {
    return { status: "usuario_invalido" as const };
  }

  const participantes = participantesInput.map((participante) => {
    const usuario = participante.usuarioId ? usuariosPorId.get(participante.usuarioId) : null;
    const nome = (usuario?.nome ?? participante.nome).trim().replace(/\s+/g, " ");
    return {
      nome,
      nomeNormalizado: normalizeNome(nome),
      usuarioId: usuario?.id ?? null
    };
  });

  const resultado = await prisma.inscricao.createMany({
    data: participantes.map((participante) => ({ eventoId, ...participante })),
    skipDuplicates: true
  });

  return {
    status: "criadas" as const,
    quantidade: resultado.count,
    duplicadas: participantes.length - resultado.count
  };
}
