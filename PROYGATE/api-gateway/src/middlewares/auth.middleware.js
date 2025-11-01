import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir los datos del usuario a los headers para reenviarlos
    req.headers["x-user-id"] = decoded.sub;
    req.headers["x-user-role"] = decoded.tipo_usuario;
    req.headers["x-user-email"] = decoded.correo;

    // También guardarlo en req.user por si se necesita más adelante
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Error en authMiddleware:", err.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
