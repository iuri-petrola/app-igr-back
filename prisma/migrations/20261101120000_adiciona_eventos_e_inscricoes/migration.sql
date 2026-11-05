CREATE TABLE "usuarios" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "celular" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "eventos" (
  "id" SERIAL NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "local" TEXT,
  "dataEvento" TIMESTAMP(3) NOT NULL,
  "prazoInscricao" TIMESTAMP(3),
  "inscricoesAbertas" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscricoes" (
  "id" SERIAL NOT NULL,
  "eventoId" INTEGER NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inscricoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_celular_key" ON "usuarios"("celular");
CREATE UNIQUE INDEX "inscricoes_eventoId_usuarioId_key" ON "inscricoes"("eventoId", "usuarioId");

ALTER TABLE "inscricoes"
ADD CONSTRAINT "inscricoes_eventoId_fkey"
FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inscricoes"
ADD CONSTRAINT "inscricoes_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
