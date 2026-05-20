export const requirePermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso",
      });
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `No tienes el permiso requerido: ${permission}`,
      });
    }

    next();
  };
};