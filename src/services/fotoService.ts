import { prisma } from "../lib/prisma";

export type FotoItem = {
  id: number;
  titulo: string;
  dataUpload: string;
  imagemUrl: string;
  instagramUrl: string | null;
};

type FotoInput = {
  titulo: string;
  imagemUrl: string;
  instagramUrl: string | null;
};

export async function getFotos(): Promise<FotoItem[]> {
  const rows = await prisma.photo.findMany({
    orderBy: { uploadedAt: "desc" }
  });

  return rows.map((row) => ({
    id: row.id,
    titulo: row.title,
    dataUpload: row.uploadedAt.toISOString(),
    imagemUrl: row.imageUrl,
    instagramUrl: row.instagramUrl
  }));
}

export async function createFoto(input: FotoInput): Promise<FotoItem> {
  const created = await prisma.photo.create({
    data: {
      title: input.titulo,
      imageUrl: input.imagemUrl,
      instagramUrl: input.instagramUrl
    }
  });

  return {
    id: created.id,
    titulo: created.title,
    dataUpload: created.uploadedAt.toISOString(),
    imagemUrl: created.imageUrl,
    instagramUrl: created.instagramUrl
  };
}

export async function getFotoById(id: number): Promise<FotoItem | null> {
  const row = await prisma.photo.findUnique({ where: { id } });
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    titulo: row.title,
    dataUpload: row.uploadedAt.toISOString(),
    imagemUrl: row.imageUrl,
    instagramUrl: row.instagramUrl
  };
}

export async function updateFoto(id: number, input: FotoInput): Promise<FotoItem | null> {
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const updated = await prisma.photo.update({
    where: { id },
    data: {
      title: input.titulo,
      imageUrl: input.imagemUrl,
      instagramUrl: input.instagramUrl
    }
  });

  return {
    id: updated.id,
    titulo: updated.title,
    dataUpload: updated.uploadedAt.toISOString(),
    imagemUrl: updated.imageUrl,
    instagramUrl: updated.instagramUrl
  };
}

export async function deleteFoto(id: number): Promise<boolean> {
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.photo.delete({ where: { id } });
  return true;
}
