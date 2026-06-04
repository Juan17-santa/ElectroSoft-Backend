/**
 * Caso de uso para actualizar un producto.
 * 
 * Responsabilidades:
 * - Verificar que el producto exista.
 * - Validar que la categoría exista (si se cambia).
 * - Aplicar las reglas de la entidad (validaciones).
 * - Para las características:
 *   ✔ Se puede cambiar la visibilidad (visible: true/false)
 *   ✔ Se pueden eliminar características (enviando el array sin ellas)
 *   ✘ NO se pueden editar los textos (nombre, medida, valor) de las existentes
 * - Actualizar el producto en la base de datos.
 */

import ProductEntity from "../domain/ProductEntity.js";

export default class UpdateProductUseCase {
    constructor(productRepository, productCategoryRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(id, productData) {
        const { name, categoryId, price, stock, typeStock, serial, warranty, characteristics } = productData;

        // Verificar que el producto existe
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            throw new Error("El producto no existe");
        }

        // Verificar que la categoría exista
        if (categoryId) {
            const category = await this.productCategoryRepository.findById(categoryId);
            if (!category) {
                throw new Error("La categoría seleccionada no existe");
            }
        }

        // Verificar que el serial sea único (si cambió)
        if (serial && serial !== existingProduct.serial) {
            const productWithSerial = await this.productRepository.findBySerial(serial);
            if (productWithSerial) {
                throw new Error("El serial ya existe en otro producto");
            }
        }

        // Validar las características editadas
        // Solo se permite: cambiar visible y eliminar. No editar textos.
        if (characteristics && Array.isArray(characteristics)) {
            const existingChars = existingProduct.characteristics || [];

            for (const newChar of characteristics) {
                // Buscar si la característica ya existía (por _id)
                const originalChar = existingChars.find(
                    c => c._id && newChar._id && c._id.toString() === newChar._id.toString()
                );

                if (originalChar) {
                    // Si existe, verificar que no se editaron los textos
                    if (
                        originalChar.name !== newChar.name ||
                        originalChar.unit !== newChar.unit ||
                        originalChar.value !== newChar.value
                    ) {
                        throw new Error("No se pueden editar los textos de las características existentes. Solo puede cambiar la visibilidad o eliminarlas.");
                    }
                }
            }
        }

        // Crear la entidad con los datos actualizados (aquí se validan reglas)
        const updatedProduct = new ProductEntity({
            id,
            name,
            categoryId,
            price: Number(price),
            stock: Number(stock),
            typeStock,
            serial,
            warranty,
            characteristics: characteristics || existingProduct.characteristics,
            status: existingProduct.status
        });

        // Actualizar en base de datos
        return await this.productRepository.update(id, {
            name: updatedProduct.name,
            categoryId: updatedProduct.categoryId,
            price: updatedProduct.price,
            stock: updatedProduct.stock,
            typeStock: updatedProduct.typeStock,
            serial: updatedProduct.serial,
            warranty: updatedProduct.warranty,
            characteristics: updatedProduct.characteristics
        });
    }
}
