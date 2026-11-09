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

type BibleBook = {
  id: string;
  name: string;
  numberOfChapters: number;
};

type BibleBooksResponse = {
  translation?: { name?: string };
  books?: BibleBook[];
};

type BibleVerseContent = {
  type?: string;
  number?: number;
  content?: unknown[];
};

type BibleChapterResponse = {
  chapter?: {
    number?: number;
    content?: BibleVerseContent[];
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

// Gera sempre a mesma posicao para uma data, mesmo que o servidor reinicie.
function getDailyIndex(dayKey: string, salt: string, total: number): number {
  let hash = 0;

  for (const character of `${dayKey}:${salt}`) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % total;
}

// Faz a chamada externa e aborta a requisicao se o tempo limite for atingido.
async function fetchFromBibleApiWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBibleApiJson<T>(path: string): Promise<T> {
  const response = await fetchFromBibleApiWithTimeout(
    `${config.bibleApi.baseUrl}${path}`,
    config.bibleApi.timeoutMs
  );

  if (!response.ok) {
    throw new Error(`Falha ao buscar palavra do dia na Bible API: ${response.status}`);
  }

  return (await response.json()) as T;
}

// Extrai somente o texto, ignorando marcacoes e notas presentes na resposta.
function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractText).join(" ");
  }

  if (content && typeof content === "object" && "text" in content) {
    return extractText((content as { text?: unknown }).text);
  }

  return "";
}

export async function getPalavraDoDia(): Promise<PalavraDoDia> {
  const dayKey = getDayKey(config.bibleApi.timeZone);

  if (cache?.dayKey === dayKey) {
    return cache.value;
  }

  const translation = encodeURIComponent(config.bibleApi.translation);
  const booksPayload = await fetchBibleApiJson<BibleBooksResponse>(
    `/api/${translation}/books.json`
  );
  // Mantem apenas os livros autorizados no config.json.
  const books = (booksPayload.books ?? []).filter((book) =>
    config.bibleApi.allowedBooks.includes(book.id.toUpperCase())
  );

  if (!books.length) {
    throw new Error("Nenhum dos livros configurados foi encontrado na Bible API");
  }

  const book = books[getDailyIndex(dayKey, "book", books.length)];
  const chapterNumber = getDailyIndex(dayKey, "chapter", book.numberOfChapters) + 1;
  const chapterPayload = await fetchBibleApiJson<BibleChapterResponse>(
    `/api/${translation}/${encodeURIComponent(book.id)}/${chapterNumber}.json`
  );
  const verses = (chapterPayload.chapter?.content ?? []).filter(
    (item) => item.type === "verse" && item.number && item.content
  );

  if (!verses.length) {
    throw new Error("A Bible API nao retornou versiculos para o capitulo selecionado");
  }

  const verse = verses[getDailyIndex(dayKey, "verse", verses.length)];
  const text = normalizeText(extractText(verse.content));

  if (!verse.number || !text) {
    throw new Error("Resposta da Bible API em formato inesperado");
  }

  const value: PalavraDoDia = {
    texto: text,
    livro: book.name,
    capitulo: chapterNumber,
    versiculo: verse.number,
    referencia: `${book.name} ${chapterNumber}:${verse.number}`,
    traducao: booksPayload.translation?.name ?? config.bibleApi.translation,
    fonte: "bible.helloao.org"
  };

  cache = { dayKey, value };
  return value;
}
