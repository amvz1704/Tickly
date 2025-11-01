import app from "./app.js";
import { config } from "./config/env.js";
import { pool } from "./config/db.js";

async function bootstrap() {
  // prueba de conexión a DB
  await pool.query("SELECT 1");
  app.listen(config.port, () => {
    console.log(`SERVICIO UP! usuario-service escuchando en puerto ${config.port}`);
  });
}

bootstrap().catch((e) => {
  console.error("No se pudo iniciar el servicio:", e);
  process.exit(1);
});
