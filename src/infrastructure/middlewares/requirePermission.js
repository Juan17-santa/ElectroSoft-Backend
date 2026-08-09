export const requirePermission = (...permissionsRequired) => {
    return (req, res, next) => {
        const permissions = req.user?.permissions;

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a este recurso",
            });
        }

        // Verifica si tiene AL MENOS UNO de los permisos requeridos
        const hasPermission = permissionsRequired.some(p => permissions.includes(p));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `No tienes el permiso requerido`,
            });
        }

        next();
    };
};