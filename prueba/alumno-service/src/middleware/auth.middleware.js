import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ msg: "Token requerido" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ msg: "Token inválido o expirado" });
  }
};
