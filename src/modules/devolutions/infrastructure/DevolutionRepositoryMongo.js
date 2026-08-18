import mongoose from "mongoose";
import { devolutionModel } from "./DevolutionModel.js";
import { saleModel } from "../../sales/infrastructure/SaleModel.js";

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convierte un prefijo de fecha escrito por el usuario en formato
 * DD/MM/YYYY o DD-MM-YYYY a un patrón regex sobre el formato almacenado
 * YYYY-MM-DD. Soporta componentes parciales: cada componente incompleto se
 * completa con comodines \d{N} para filtrar de forma progresiva.
 * Retorna null si el término no es un prefijo de fecha válido (letras,
 * separador incorrecto o componente completo fuera de rango).
 */
function buildDatePrefixPattern(term, separator) {
    if (typeof term !== "string" || !term) return null;

    const parts = term.split(separator);
    if (parts.length > 3) return null;
    if (parts.some((p) => !/^\d*$/.test(p))) return null;

    const day = parts[0] ?? "";
    const month = parts[1] ?? "";
    const year = parts[2] ?? "";

    if (!day || day.length > 2) return null;
    if (day.length === 2) {
        const d = Number(day);
        if (d < 1 || d > 31) return null;
    }

    if (month.length > 2) return null;
    if (month.length === 2) {
        const m = Number(month);
        if (m < 1 || m > 12) return null;
    }

    if (year.length > 4) return null;

    const pad = (prefix, total) => {
        const len = String(prefix).length;
        if (len === 0) return `\\d{${total}}`;
        if (len === total) return String(prefix);
        const remaining = total - len;
        return `${prefix}${remaining === 1 ? "\\d" : `\\d{${remaining}}`}`;
    };

    return `^${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

export default class DevolutionRepositoryMongo {
    async create(data, session) {
        const [devolution] = await devolutionModel.create([data], { session });
        return devolution;
    }

    async findById(id, session = null) {
        return await devolutionModel.findById(id).session(session);
    }

    async findBySaleId(saleId, { includeAnuladas = true, session = null } = {}) {
        const filter = { saleId: String(saleId) };
        if (!includeAnuladas) filter.anulada = { $ne: true };

        return await devolutionModel.find(filter).sort({ fechaCreacion: -1 }).session(session);
    }

    async update(id, data, session = null, filter = {}) {
        return await devolutionModel.findOneAndUpdate(
            { _id: id, ...filter },
            data,
            {
                returnDocument: "after",
                session,
                runValidators: true,
            },
        );
    }

    // Paginación a nivel de grupo (venta): las filas de "Control de devoluciones"
    // son por saleId, no por devolución individual.
    async findAll({ page = 1, limit = 15, search = "", includeAnuladas = true } = {}) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));

        const match = includeAnuladas ? {} : { anulada: { $ne: true } };

        const term = String(search || "").trim();
        if (term) {
            match.$or = await this.buildSearchMatch(term);
        }

        const facet = await devolutionModel.aggregate([
            { $match: match },
            { $sort: { fechaCreacion: -1 } },
            {
                $group: {
                    _id: "$saleId",
                    devoluciones: { $push: "$$ROOT" },
                    fechaCreacionMax: { $max: "$fechaCreacion" },
                },
            },
            { $sort: { fechaCreacionMax: -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    groups: [
                        { $skip: (safePage - 1) * safeLimit },
                        { $limit: safeLimit },
                    ],
                },
            },
        ]);

        const facetResult = facet[0] ?? {};
        const total = facetResult.metadata?.[0]?.total ?? 0;
        const items = (facetResult.groups ?? []).map((group) => ({
            saleId: group._id,
            devoluciones: group.devoluciones,
            fechaCreacionMax: group.fechaCreacionMax,
        }));

        return {
            items,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    async exportAll({ from, to, includeAnuladas = true, page = 1, limit = 5000 } = {}) {
        const filter = {};
        if (!includeAnuladas) filter.anulada = { $ne: true };

        if (from || to) {
            filter.fechaDevolucion = {};
            if (from) filter.fechaDevolucion.$gte = String(from);
            if (to) filter.fechaDevolucion.$lte = String(to);
        }

        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(5000, Math.max(1, Number(limit) || 5000));

        const total = await devolutionModel.countDocuments(filter);

        const items = await devolutionModel
            .find(filter)
            .sort({ fechaDevolucion: -1, fechaCreacion: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean();

        return {
            data: items,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    async buildSearchMatch(term) {
        const regex = { $regex: escapeRegex(term), $options: "i" };
        const ors = [
            { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: escapeRegex(term), options: "i" } } },
            { saleId: regex },
            { "productos.nombre": regex },
            { "productos.motivo": regex },
            { "productos.responsable": regex },
            { estadoResolucion: regex },
        ];

        // Fecha inicio (DD/MM/YYYY) sobre fechaDevolucion (YYYY-MM-DD).
        // Modo estricto: si el término es un prefijo de fecha válido se reemplaza
        // la búsqueda genérica de fechaDevolucion por el patrón mapeado, para que
        // por ejemplo "17" no coincida también con años como "2017".
        const fechaInicioPattern = buildDatePrefixPattern(term, "/");
        if (fechaInicioPattern) {
            ors.push({ fechaDevolucion: { $regex: fechaInicioPattern } });
        } else {
            ors.push({ fechaDevolucion: regex });
        }

        // Última actualización (DD-MM-YYYY) sobre actualizadoEn (Date), comparado
        // en UTC para coincidir exactamente con la fecha mostrada en la columna.
        const ultimaActualizacionPattern = buildDatePrefixPattern(term, "-");
        if (ultimaActualizacionPattern) {
            ors.push({
                $expr: {
                    $regexMatch: {
                        input: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$actualizadoEn",
                                timezone: "UTC",
                            },
                        },
                        regex: ultimaActualizacionPattern,
                    },
                },
            });
        }

        if (mongoose.Types.ObjectId.isValid(term)) {
            ors.push({ _id: term });
        }

        // Búsqueda por número de venta (numeroFactura): mismo patrón del provider search de Shopping.
        const saleIds = await saleModel
            .find({ numeroFactura: { $regex: escapeRegex(term), $options: "i" } })
            .distinct("_id");

        if (saleIds.length > 0) {
            ors.push({ saleId: { $in: saleIds.map(String) } });
        }

        return ors;
    }
}
