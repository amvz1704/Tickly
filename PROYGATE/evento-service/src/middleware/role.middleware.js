export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.tipo_usuario || req.headers["x-user-role"];
    
    if (!userRole) {
      return res.status(401).json({ msg: "Rol de usuario no encontrado" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
};

