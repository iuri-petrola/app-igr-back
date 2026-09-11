export const MINISTERIOS = ["geral", "posso-orar-por-voce", "koynonia"] as const;

export type Ministerio = (typeof MINISTERIOS)[number];

export function isMinisterio(value: unknown): value is Ministerio {
  return typeof value === "string" && MINISTERIOS.includes(value as Ministerio);
}
