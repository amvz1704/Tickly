import { Pool } from "pg";
import { config } from "./env.js";

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});
