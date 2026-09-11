import { Router } from "express";
import { createFotoItem, deleteFotoItem, listFotos, updateFotoItem } from "../controllers/fotoController";
import { upload } from "../lib/upload";
import { requireAdmin } from "../middlewares/requireAdmin";

export const fotosRouter = Router();

fotosRouter.get("/", listFotos);
fotosRouter.post("/", requireAdmin, upload.single("image"), createFotoItem);
fotosRouter.put("/:id", requireAdmin, upload.single("image"), updateFotoItem);
fotosRouter.delete("/:id", requireAdmin, deleteFotoItem);
