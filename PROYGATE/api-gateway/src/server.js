import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";

const app = express();

// (opcional) health-check
app.get("/health", (_, res) => res.json({ ok: true, service: "api-gateway" }));

registerRoutes(app);

const PORT = process.env.GATEWAY_PORT || 8080;
app.listen(PORT, () => {
  console.log(`API GATEWAY UP! API Gateway escuchando en puerto ${PORT}`);
});
