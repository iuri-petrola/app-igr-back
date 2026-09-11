import fs from "fs";
import multer from "multer";
import path from "path";
import { config } from "../config";

const photosDir = path.join(config.uploadsDir, "fotos");

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

function sanitizeOriginalFilename(originalName: string): string {
  // Mantem o nome original, removendo separadores de pasta e caracteres inseguros.
  const safeName = path.basename(originalName)
    .replace(/[^\p{L}\p{N}._ -]/gu, "-")
    .replace(/\s+/g, " ")
    .trim();

  return safeName || "imagem.jpg";
}

function getAvailableFilename(originalName: string): string {
  const safeName = sanitizeOriginalFilename(originalName);
  const extension = path.extname(safeName);
  const nameWithoutExtension = path.basename(safeName, extension);
  let filename = safeName;
  let suffix = 2;

  // Evita substituir uma imagem quando outro arquivo possui o mesmo nome.
  while (fs.existsSync(path.join(photosDir, filename))) {
    filename = `${nameWithoutExtension}-${suffix}${extension}`;
    suffix += 1;
  }

  return filename;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, photosDir);
  },
  filename: (_req, file, cb) => {
    cb(null, getAvailableFilename(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});
