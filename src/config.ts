import "dotenv/config";
import fs from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

export type AppConfig = {
  port: number;
  corsOrigin: string;
  databaseUrl: string;
  uploadsDir: string;
  uploadsPublicPath: string;
  bibleApi: {
    baseUrl: string;
    translation: string;
    timeoutMs: number;
    timeZone: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  whatsAppPhoneNumber: string;
};

function getObject(value: unknown, fieldName: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Configuracao invalida: ${fieldName} deve ser um objeto`);
  }

  return value as JsonObject;
}

function getString(config: JsonObject, fieldName: string): string {
  const value = config[fieldName];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Configuracao obrigatoria ausente: ${fieldName}`);
  }

  return value.trim();
}

function getPositiveNumber(config: JsonObject, fieldName: string): number {
  const value = config[fieldName];

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Configuracao numerica invalida: ${fieldName}`);
  }

  return value;
}

function loadConfig(): AppConfig {
  const configPath = process.env.CONFIG_PATH?.trim();

  if (!configPath) {
    throw new Error("CONFIG_PATH deve estar definido no .env");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(fs.readFileSync(path.resolve(configPath), "utf-8"));
  } catch (error) {
    throw new Error(`Nao foi possivel carregar o config.json: ${(error as Error).message}`);
  }

  const rawConfig = getObject(parsed, "config.json");
  const bibleApi = getObject(rawConfig.bibleApi, "bibleApi");
  const jwt = getObject(rawConfig.jwt, "jwt");

  return {
    port: getPositiveNumber(rawConfig, "port"),
    corsOrigin: getString(rawConfig, "corsOrigin"),
    databaseUrl: getString(rawConfig, "databaseUrl"),
    uploadsDir: getString(rawConfig, "uploadsDir"),
    uploadsPublicPath: getString(rawConfig, "uploadsPublicPath"),
    bibleApi: {
      baseUrl: getString(bibleApi, "baseUrl"),
      translation: getString(bibleApi, "translation"),
      timeoutMs: getPositiveNumber(bibleApi, "timeoutMs"),
      timeZone: getString(bibleApi, "timeZone")
    },
    jwt: {
      secret: getString(jwt, "secret"),
      expiresIn: getString(jwt, "expiresIn")
    },
    whatsAppPhoneNumber: getString(rawConfig, "whatsAppPhoneNumber")
  };
}

export const config = loadConfig();

// O Prisma Client ainda le DATABASE_URL do ambiente durante sua inicializacao.
process.env.DATABASE_URL = config.databaseUrl;
