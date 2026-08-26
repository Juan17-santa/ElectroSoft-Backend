/**
 * Entidad de rol.
 * Valida las reglas de negocio para los roles del sistema.
 */

const VALID_PERMISSIONS = [
  // Categorías
  "categorias:acceso", "categorias:ver", "categorias:crear", "categorias:editar", "categorias:estado", "categorias:eliminar",
  // Productos
  "productos:acceso", "productos:ver", "productos:crear", "productos:editar", "productos:estado", "productos:eliminar", "productos:reporte",
  // Proveedores
  "proveedores:acceso", "proveedores:ver", "proveedores:crear", "proveedores:editar", "proveedores:estado", "proveedores:eliminar",
  // Compras
  "compras:acceso", "compras:ver", "compras:crear", "compras:anular", "compras:reporte",
  // Clientes
  "clientes:acceso", "clientes:ver", "clientes:crear", "clientes:editar", "clientes:cupo", "clientes:eliminar", "clientes:reporte",
  // Pedidos
  "pedidos:acceso", "pedidos:ver", "pedidos:crear", "pedidos:editar", "pedidos:procesar", "pedidos:anular", "pedidos:reporte",
  // Ventas
  "ventas:acceso", "ventas:ver", "ventas:crear", "ventas:anular", "ventas:devolver", "ventas:abonar", "ventas:reporte",
  // Pagos
  "pagos:acceso", "pagos:ver", "pagos:abonar", "pagos:editar-cupo",
  // Devoluciones
  "devoluciones:acceso", "devoluciones:ver", "devoluciones:editar", "devoluciones:anular", "devoluciones:reporte",
  // Usuarios
  "usuarios:acceso", "usuarios:ver", "usuarios:crear", "usuarios:editar", "usuarios:estado", "usuarios:eliminar",
  // Dashboard
  "dashboard:acceso",
  // Roles
  "roles:acceso", "roles:ver", "roles:crear", "roles:editar", "roles:estado", "roles:eliminar",
];
export default class RoleEntity {
  constructor({ id, name, description, permissions }) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      throw new Error("El nombre del rol es obligatorio y debe tener al menos 2 caracteres");
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error("El rol debe tener al menos un permiso");
    }

    const invalidPermissions = permissions.filter(
      (p) => !VALID_PERMISSIONS.includes(p)
    );
    if (invalidPermissions.length > 0) {
      throw new Error(`Permisos inválidos: ${invalidPermissions.join(", ")}`);
    }

    this.id = id;
    this.name = name.trim();
    this.description = description ? description.trim() : "";
    this.permissions = [...new Set(permissions)]; // elimina duplicados
  }

  static get validPermissions() {
    return VALID_PERMISSIONS;
  }

  // Devuelve los permisos agrupados por módulo (útil para el frontend)
  static get permissionsByModule() {
    return {
      categorias: ["categorias:acceso", "categorias:ver", "categorias:crear", "categorias:editar", "categorias:estado", "categorias:eliminar"],
      productos: ["productos:acceso", "productos:ver", "productos:crear", "productos:editar", "productos:estado", "productos:eliminar", "productos:reporte"],
      proveedores: ["proveedores:acceso", "proveedores:ver", "proveedores:crear", "proveedores:editar", "proveedores:estado", "proveedores:eliminar"],
      compras: ["compras:acceso", "compras:ver", "compras:crear", "compras:anular", "compras:reporte"],
      clientes: ["clientes:acceso", "clientes:ver", "clientes:crear", "clientes:editar", "clientes:cupo", "clientes:eliminar", "clientes:reporte"],
      pedidos: ["pedidos:acceso", "pedidos:ver", "pedidos:crear", "pedidos:editar", "pedidos:procesar", "pedidos:anular", "pedidos:reporte"],
      ventas: ["ventas:acceso", "ventas:ver", "ventas:crear", "ventas:anular", "ventas:devolver", "ventas:abonar", "ventas:reporte"],
      pagos: ["pagos:acceso", "pagos:ver", "pagos:abonar", "pagos:editar-cupo"],
      devoluciones: ["devoluciones:acceso", "devoluciones:ver", "devoluciones:editar", "devoluciones:anular", "devoluciones:reporte"],
      usuarios: ["usuarios:acceso", "usuarios:ver", "usuarios:crear", "usuarios:editar", "usuarios:estado", "usuarios:eliminar"],
      dashboard: ["dashboard:acceso"],
      roles: ["roles:acceso", "roles:ver", "roles:crear", "roles:editar", "roles:estado", "roles:eliminar"],
    };
  }
}