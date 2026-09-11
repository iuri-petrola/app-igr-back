-- As mídias existentes pertenciam à galeria do ministério Posso Orar por Você.
ALTER TABLE "photos"
ADD COLUMN "ministerio" TEXT NOT NULL DEFAULT 'posso-orar-por-voce';
