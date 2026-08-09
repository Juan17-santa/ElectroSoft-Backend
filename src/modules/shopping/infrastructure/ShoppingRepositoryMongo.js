/**
 * Repositorio MongoDB para compras.
 *
 * Responsabilidades:
 * - Encapsular el acceso a Mongoose.
 * - Exponer operaciones usadas por los casos de uso.
 * - Recibir session cuando el caso de uso trabaja con transacciones.
 *
 * Métodos:
 * - create: crea una compra dentro de una sesión.
 * - findById: busca una compra por ID.
 * - update: actualiza una compra y retorna el documento actualizado.
 * - findAll: lista compras ordenadas por fechaCreacion descendente.
 */
import { shoppingModel } from "./ShoppingModel.js";
import { providerModel } from "../../providers/infrastructure/ProviderModel.js";

const POPULATE_PROVIDER = { path: "providerId", select: "providerName" };
const POPULATE_PRODUCTS = { path: "products.productId", select: "name price" };

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class ShoppingRepositoryMongo {
    async create(data, session) {
        const [shopping] = await shoppingModel.create([data], { session });
        return shopping;
    }

    async findById(id, session = null) {
        return await shoppingModel
            .findById(id)
            .populate("providerId", "providerName")
            .populate("products.productId", "name price")
            .session(session);
    }


    async findActiveByInvoice(invoiceNumber, session = null) {
        return await shoppingModel
            .findOne({ invoiceNumber: String(invoiceNumber).trim(), estado: "ACTIVA" })
            .populate('providerId', 'providerName')
            .populate('products.productId', 'name')
            .session(session);
    }

    async findByProviderId(providerId) {
        return await shoppingModel.find({ providerId: providerId })
            .populate('providerId', 'providerName')
            .populate('products.productId', 'name');
    }

    async update(id, data, session) {
        return await shoppingModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            session,
            runValidators: true,
        });
    }

    async checkInvoiceExists(invoiceNumber) {
        const found = await shoppingModel
            .findOne({ invoiceNumber: String(invoiceNumber).trim(), estado: "ACTIVA" })
            .select("_id");
        return Boolean(found);
    }

    async findAll({ page = 1, limit = 15, search = "" } = {}) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));
        const filter = await this.buildSearchFilter(search);

        const total = await shoppingModel.countDocuments(filter);

        const items = await shoppingModel
            .find(filter)
            .populate(POPULATE_PROVIDER)
            .populate(POPULATE_PRODUCTS)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);

        return {
            items,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    async buildSearchFilter(search) {
        const term = String(search || "").trim();
        if (!term) return {};

        // Se asume que un término no numérico y con letras puede ser nombre de proveedor.
        const isProviderLike = /[a-zA-Z]/.test(term) && !/^\d{4}-\d{2}-\d{2}$/.test(term);
        const ors = [{ invoiceNumber: { $regex: term, $options: "i" } }];

        // purchaseDate se guarda como DD/MM/YYYY; se usa regex para permitir
        // búsquedas parciales (año, mes o fecha completa).
        if (/[0-9/]/.test(term)) {
            ors.push({ purchaseDate: { $regex: escapeRegex(term), $options: "i" } });
        }

        const estadoTerm = term.toLowerCase();
        if (estadoTerm.includes("anulad")) {
            ors.push({ estado: "ANULADA" });
        } else if (estadoTerm.includes("completa") || estadoTerm.includes("activa")) {
            ors.push({ estado: "ACTIVA" });
        }

        if (isProviderLike) {
            const providerIds = await providerModel
                .find({ providerName: { $regex: term, $options: "i" } })
                .distinct("_id");
            if (providerIds.length > 0) {
                ors.push({ providerId: { $in: providerIds } });
            }
        }

        return { $or: ors };
    }
}
