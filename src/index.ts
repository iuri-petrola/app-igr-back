import cors from "cors";
import express from "express";
import { config } from "./config";
import { adminRouter } from "./routes/admin";
import { contatoRouter } from "./routes/contato";
import { fotosRouter } from "./routes/fotos";
import { palavraDoDiaRouter } from "./routes/palavraDoDia";
import { pedidosRouter } from "./routes/pedidos";

const app = express();

app.set("trust proxy", true);

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(config.uploadsPublicPath, express.static(config.uploadsDir));

app.use("/api/contato", contatoRouter);
app.use("/api/fotos", fotosRouter);
app.use("/api/pedidos", pedidosRouter);
app.use("/api/palavra-do-dia", palavraDoDiaRouter);
app.use("/api/admin", adminRouter);

app.listen(config.port, () => {
  console.log(`API rodando na porta ${config.port}`);
});
