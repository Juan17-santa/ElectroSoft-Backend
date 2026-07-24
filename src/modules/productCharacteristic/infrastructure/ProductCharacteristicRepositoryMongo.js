/**
 * Repositorio de Características de Producto (MongoDB)
 * 
 * Se encarga de interactuar directamente con la base de datos.
 * Implementa las operaciones CRUD para las características.
 */

import { ProductCharacteristicModel } from "./ProductCharacteristicModel.js";

class ProductCharacteristicRepositoryMongo {

    async create(characteristicData) {
        const characteristic = new ProductCharacteristicModel(characteristicData);
        return await characteristic.save();
    }

    async findAll() {
        return await ProductCharacteristicModel.find({ status: true }).sort({ name: 1 });
    }

    async findById(id) {
        return await ProductCharacteristicModel.findById(id);
    }

    async findByName(name) {
        return await ProductCharacteristicModel.findOne({ name: name.trim() });
    }

    async update(id, characteristicData) {
        return await ProductCharacteristicModel.findByIdAndUpdate(id, characteristicData, { returnDocument: "after" });
    }

    async delete(id) {
        return await ProductCharacteristicModel.findByIdAndDelete(id);
    }

    async toggleStatus(id) {
        const characteristic = await this.findById(id);
        if (!characteristic) throw new Error("Característica no encontrada");
        characteristic.status = !characteristic.status;
        return await characteristic.save();
    }
}

export default ProductCharacteristicRepositoryMongo;
