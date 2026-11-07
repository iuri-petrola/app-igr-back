ALTER TABLE "inscricoes"
ADD COLUMN "nome" TEXT,
ADD COLUMN "nomeNormalizado" TEXT;

-- Preserva as inscricoes feitas pelo fluxo anterior.
UPDATE "inscricoes" AS i
SET "nome" = u."nome",
    "nomeNormalizado" = lower(trim(u."nome"))
FROM "usuarios" AS u
WHERE i."usuarioId" = u."id";

ALTER TABLE "inscricoes"
ALTER COLUMN "nome" SET NOT NULL,
ALTER COLUMN "nomeNormalizado" SET NOT NULL,
ALTER COLUMN "usuarioId" DROP NOT NULL;

DROP INDEX "inscricoes_eventoId_usuarioId_key";
CREATE UNIQUE INDEX "inscricoes_eventoId_nomeNormalizado_key"
ON "inscricoes"("eventoId", "nomeNormalizado");

ALTER TABLE "inscricoes" DROP CONSTRAINT "inscricoes_usuarioId_fkey";
ALTER TABLE "inscricoes"
ADD CONSTRAINT "inscricoes_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "convites_inscricao";
