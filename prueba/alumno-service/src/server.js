import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(`🚀 Servicio alumno escuchando en puerto ${config.port}`);
});
