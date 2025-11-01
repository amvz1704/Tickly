import dotenv from "dotenv";
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ ERROR: Faltan variables de entorno requeridas:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("\n💡 Crea un archivo .env en la raíz del proyecto con estas variables.");
  console.error("💡 Puedes usar .env.example como referencia.\n");
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 3002,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Ahora garantizado que existe
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
};

