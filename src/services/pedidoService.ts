import { prisma } from "../lib/prisma";

export type PedidoItem = {
  id: number;
  nome: string;
  contato: string | null;
  pedido: string;
  enviadoPara: string | null;
  createdAt: string;
};

type PedidoInput = {
  nome: string;
  contato?: string | null;
  pedido: string;
  enviadoPara?: string | null;
};

export async function createPedido(input: PedidoInput): Promise<PedidoItem> {
  const created = await prisma.pedido.create({
    data: {
      nome: input.nome,
      contato: input.contato ?? null,
      pedido: input.pedido,
      enviadoPara: input.enviadoPara ?? null
    }
  });

  return {
    id: created.id,
    nome: created.nome,
    contato: created.contato,
    pedido: created.pedido,
    enviadoPara: created.enviadoPara,
    createdAt: created.createdAt.toISOString()
  };
}

export async function listPedidos(): Promise<PedidoItem[]> {
  const pedidos = await prisma.pedido.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return pedidos.map((pedido) => ({
    id: pedido.id,
    nome: pedido.nome,
    contato: pedido.contato,
    pedido: pedido.pedido,
    enviadoPara: pedido.enviadoPara,
    createdAt: pedido.createdAt.toISOString()
  }));
}
