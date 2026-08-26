import mongoose from "mongoose";

const VALID_PERMISSIONS = [
  "categorias:acceso", "categorias:ver", "categorias:crear", "categorias:editar", "categorias:estado", "categorias:eliminar",
  "productos:acceso", "productos:ver", "productos:crear", "productos:editar", "productos:estado", "productos:eliminar", "productos:reporte",
  "proveedores:acceso", "proveedores:ver", "proveedores:crear", "proveedores:editar", "proveedores:estado", "proveedores:eliminar",
  "compras:acceso", "compras:ver", "compras:crear", "compras:anular", "compras:reporte",
  "clientes:acceso", "clientes:ver", "clientes:crear", "clientes:editar", "clientes:cupo", "clientes:eliminar", "clientes:reporte",
  "pedidos:acceso", "pedidos:ver", "pedidos:crear", "pedidos:editar", "pedidos:procesar", "pedidos:anular", "pedidos:reporte",
  "ventas:acceso", "ventas:ver", "ventas:crear", "ventas:anular", "ventas:devolver", "ventas:abonar", "ventas:reporte",
  "pagos:acceso", "pagos:ver", "pagos:abonar", "pagos:editar-cupo",
  "devoluciones:acceso", "devoluciones:ver", "devoluciones:editar", "devoluciones:anular", "devoluciones:reporte",
  "usuarios:acceso", "usuarios:ver", "usuarios:crear", "usuarios:editar", "usuarios:estado", "usuarios:eliminar",
  "dashboard:acceso",
  "roles:acceso", "roles:ver", "roles:crear", "roles:editar", "roles:estado", "roles:eliminar",
];

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    permissions: {
      type: [String],
      enum: VALID_PERMISSIONS,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const RoleModel = mongoose.model("Role", roleSchema);