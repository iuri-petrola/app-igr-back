CREATE TABLE "convites_inscricao" (
  "id" SERIAL NOT NULL,
  "eventoId" INTEGER NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "usedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "convites_inscricao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "convites_inscricao_tokenHash_key" ON "convites_inscricao"("tokenHash");
CREATE UNIQUE INDEX "convites_inscricao_eventoId_usuarioId_key" ON "convites_inscricao"("eventoId", "usuarioId");

ALTER TABLE "convites_inscricao"
ADD CONSTRAINT "convites_inscricao_eventoId_fkey"
FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "convites_inscricao"
ADD CONSTRAINT "convites_inscricao_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
