import { RoleModel } from "./RoleModel.js";

const EMPLEADO_PERMISSIONS = [
  // Categorías
  "categorias:ver", "categorias:crear", "categorias:editar", "categorias:estado", "categorias:eliminar",
  // Productos
  "productos:ver", "productos:crear", "productos:editar", "productos:estado", "productos:eliminar", "productos:reporte",
  // Proveedores
  "proveedores:ver", "proveedores:crear", "proveedores:editar", "proveedores:estado", "proveedores:eliminar",
  // Compras
  "compras:ver", "compras:crear", "compras:anular", "compras:reporte",
  // Clientes
  "clientes:ver", "clientes:crear", "clientes:editar", "clientes:cupo", "clientes:eliminar", "clientes:reporte",
  // Pedidos
  "pedidos:ver", "pedidos:procesar", "pedidos:anular", "pedidos:reporte",
  // Ventas
  "ventas:ver", "ventas:crear", "ventas:anular", "ventas:devolver", "ventas:abonar", "ventas:reporte",
  // Pagos
  "pagos:ver", "pagos:abonar", "pagos:editar-cupo",
  // Devoluciones
  "devoluciones:ver", "devoluciones:editar", "devoluciones:anular", "devoluciones:reporte",
];

const ADMINISTRADOR_PERMISSIONS = [
  ...EMPLEADO_PERMISSIONS,
  // Usuarios
  "usuarios:ver", "usuarios:crear", "usuarios:editar", "usuarios:estado", "usuarios:eliminar",
  // Dashboard y Roles
  "dashboard:acceso",
  "roles:acceso",
];

export const seedRoles = async () => {
  const count = await RoleModel.countDocuments();
  if (count > 0) return;

  await RoleModel.insertMany([
    {
      name: "Administrador",
      description: "Acceso total al sistema",
      permissions: ADMINISTRADOR_PERMISSIONS,
      isActive: true,
    },
    {
      name: "Empleado",
      description: "Acceso completo a módulos de compras y ventas",
      permissions: EMPLEADO_PERMISSIONS,
      isActive: true,
    },
  ]);

  console.log("✅ Roles sembrados correctamente");
};