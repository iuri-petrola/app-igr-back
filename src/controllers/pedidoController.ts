import { Request, Response } from "express";
import { config } from "../config";
import { createPedido, listPedidos } from "../services/pedidoService";

function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function buildWhatsAppMessage(input: { nome: string; contato?: string | null; pedido: string }): string {
  const parts = [
    "Novo pedido de oracao",
    "",
    `Nome: ${input.nome}`,
    `Contato: ${input.contato || "Nao informado"}`,
    "Pedido:",
    input.pedido
  ];

  return parts.join("\n");
}

export async function createPedidoItem(req: Request, res: Response) {
  const { nome, contato, pedido } = req.body as {
    nome?: string;
    contato?: string;
    pedido?: string;
  };

  if (!nome?.trim() || !pedido?.trim()) {
    return res.status(400).json({ error: "Campos obrigatorios: nome, pedido" });
  }

  try {
    const whatsAppNumber = config.whatsAppPhoneNumber;

    const created = await createPedido({
      nome: nome.trim(),
      contato: contato?.trim() || null,
      pedido: pedido.trim(),
      enviadoPara: whatsAppNumber ? normalizePhoneNumber(whatsAppNumber) : null
    });
    const message = buildWhatsAppMessage(created);

    return res.status(201).json({
      ...created,
      whatsAppUrl: whatsAppNumber
        ? `https://wa.me/${normalizePhoneNumber(whatsAppNumber)}?text=${encodeURIComponent(message)}`
        : null
    });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao criar pedido de oracao" });
  }
}

export async function showPedidos(_req: Request, res: Response) {
  try {
    const pedidos = await listPedidos();
    return res.json(pedidos);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar pedidos" });
  }
}
