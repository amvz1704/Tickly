import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ msg: "Token requerido" });
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ msg: "Formato de autorización inválido" });
  }
  try {
    req.user = verifyToken(token); // { sub, correo, tipo_usuario }
    next();
  } catch (e) {
    return res.status(403).json({ msg: "Token inválido o expirado" });
  }
};
