/**
 * Repositorio de Medidas de Producto (MongoDB)
 * 
 * Se encarga de interactuar directamente con la base de datos.
 * Implementa las operaciones CRUD para las medidas.
 */

import { ProductMeasureModel } from "./ProductMeasureModel.js";

class ProductMeasureRepositoryMongo {

    async create(measureData) {
        const measure = new ProductMeasureModel(measureData);
        return await measure.save();
    }

    async findAll() {
        return await ProductMeasureModel.find({ status: true }).sort({ name: 1 });
    }

    async findById(id) {
        return await ProductMeasureModel.findById(id);
    }

    async findByName(name) {
        return await ProductMeasureModel.findOne({ name: name.trim() });
    }

    async update(id, measureData) {
        return await ProductMeasureModel.findByIdAndUpdate(id, measureData, { new: true });
    }

    async delete(id) {
        return await ProductMeasureModel.findByIdAndDelete(id);
    }

    async toggleStatus(id) {
        const measure = await this.findById(id);
        if (!measure) throw new Error("Medida no encontrada");
        measure.status = !measure.status;
        return await measure.save();
    }
}

export default ProductMeasureRepositoryMongo;
