import fs from "fs";
import multer from "multer";
import path from "path";
import { config } from "../config";

const photosDir = path.join(config.uploadsDir, "fotos");

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, photosDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, filename);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});
