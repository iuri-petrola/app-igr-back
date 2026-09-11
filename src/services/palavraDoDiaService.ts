import { config } from "../config";

export type PalavraDoDia = {
  texto: string;
  livro: string;
  capitulo: number;
  versiculo: number;
  referencia: string;
  traducao: string;
  fonte: string;
};

type BibleApiRandomVerseResponse = {
  translation?: {
    identifier?: string;
    name?: string;
  };
  random_verse?: {
    book?: string;
    chapter?: number;
    verse?: number;
    text?: string;
  };
};

type CacheEntry = {
  dayKey: string;
  value: PalavraDoDia;
};

let cache: CacheEntry | null = null;

function getDayKey(timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return fmt.format(new Date());
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Monta a URL do endpoint que devolve um versiculo aleatorio na traducao configurada.
function buildBibleApiRandomVerseUrl(baseUrl: string, translation: string): string {
  return `${baseUrl}/data/${encodeURIComponent(translation)}/random`;
}

// Faz a chamada externa e aborta a requisicao se o tempo limite for atingido.
async function fetchFromBibleApiWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Converte a resposta bruta da Bible API para o formato interno usado pelo frontend.
function mapBibleApiResponse(payload: BibleApiRandomVerseResponse): PalavraDoDia | null {
  const verse = payload.random_verse;
  const translation = payload.translation;

  if (!verse?.book || !verse.chapter || !verse.verse || !verse.text || !translation?.name) {
    return null;
  }

  return {
    texto: normalizeText(verse.text),
    livro: verse.book,
    capitulo: verse.chapter,
    versiculo: verse.verse,
    referencia: `${verse.book} ${verse.chapter}:${verse.verse}`,
    traducao: translation.name,
    fonte: "bible-api"
  };
}

export async function getPalavraDoDia(): Promise<PalavraDoDia> {
  const dayKey = getDayKey(config.bibleApi.timeZone);

  if (cache?.dayKey === dayKey) {
    return cache.value;
  }

  const response = await fetchFromBibleApiWithTimeout(
    buildBibleApiRandomVerseUrl(config.bibleApi.baseUrl, config.bibleApi.translation),
    config.bibleApi.timeoutMs
  );
  if (!response.ok) {
    throw new Error(`Falha ao buscar palavra do dia na Bible API: ${response.status}`);
  }

  const payload = (await response.json()) as BibleApiRandomVerseResponse;
  const parsed = mapBibleApiResponse(payload);

  if (!parsed) {
    throw new Error("Resposta da Bible API em formato inesperado");
  }

  cache = { dayKey, value: parsed };
  return parsed;
}
