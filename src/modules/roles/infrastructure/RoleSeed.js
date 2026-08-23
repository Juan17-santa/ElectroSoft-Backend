import { RoleModel } from "./RoleModel.js";

const EMPLEADO_PERMISSIONS = [
  "dashboard:acceso",

  "categorias:acceso",
  "categorias:ver",
  "categorias:crear",
  "categorias:editar",
  "categorias:estado",
  "categorias:eliminar",

  "productos:acceso",
  "productos:ver",
  "productos:editar",
  "productos:estado",
  "productos:eliminar",
  "productos:reporte",

  "proveedores:acceso",
  "proveedores:ver",
  "proveedores:crear",
  "proveedores:editar",
  "proveedores:estado",
  "proveedores:eliminar",

  "compras:acceso",
  "compras:ver",
  "compras:crear",
  "compras:anular",
  "compras:reporte",

  "clientes:acceso",
  "clientes:ver",
  "clientes:crear",
  "clientes:editar",
  "clientes:cupo",
  "clientes:eliminar",
  "clientes:reporte",

  "pedidos:acceso",
  "pedidos:ver",
  "pedidos:crear",
  "pedidos:procesar",
  "pedidos:anular",
  "pedidos:reporte",

  "ventas:acceso",
  "ventas:ver",
  "ventas:crear",
  "ventas:anular",
  "ventas:devolver",
  "ventas:abonar",
  "ventas:reporte",

  "pagos:acceso",
  "pagos:ver",
  "pagos:abonar",
  "pagos:editar-cupo",

  "devoluciones:acceso",
  "devoluciones:ver",
  "devoluciones:editar",
  "devoluciones:anular",
  "devoluciones:reporte",
];

const ADMINISTRADOR_PERMISSIONS = [
  ...EMPLEADO_PERMISSIONS,

  // Permisos adicionales del administrador
  "productos:crear",

  "usuarios:acceso",
  "usuarios:ver",
  "usuarios:crear",
  "usuarios:editar",
  "usuarios:estado",
  "usuarios:eliminar",

  "roles:acceso",
  "roles:ver",
  "roles:crear",
  "roles:editar",
  "roles:estado",
  "roles:eliminar",
];

export const seedRoles = async () => {
  try {
    await RoleModel.findOneAndUpdate(
      { name: "Administrador" },
      {
        $set: {
          description: "Acceso total al sistema",
          permissions: ADMINISTRADOR_PERMISSIONS,
          isActive: true,
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await RoleModel.findOneAndUpdate(
      { name: "Empleado" },
      {
        $set: {
          description: "Acceso completo a módulos de compras y ventas",
          permissions: EMPLEADO_PERMISSIONS,
          isActive: true,
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (error) {
    console.error("Error al sincronizar roles:", error);
  }
};