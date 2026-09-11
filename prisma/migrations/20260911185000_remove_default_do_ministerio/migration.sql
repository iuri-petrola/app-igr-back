-- Obriga o cadastro a informar explicitamente a galeria de destino.
ALTER TABLE "photos"
ALTER COLUMN "ministerio" DROP DEFAULT;
