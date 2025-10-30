export function authorizeRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.user?.tipo_usuario;
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        message: `Acceso denegado. Requiere rol: ${rolesPermitidos.join(", ")}`
      });
    }
    next();
  };
}
