import assert from "node:assert";
import DeleteProductUseCase from "../src/modules/products/application/DeleteProductUseCase.js";

class MockProductRepository {
    constructor(product) {
        this.product = product;
        this.deleteCalled = false;
    }

    async findById(id) {
        if (id !== this.product.id && id !== this.product._id) {
            return null;
        }
        return this.product;
    }

    async delete(id) {
        this.deleteCalled = true;
        return { deletedId: id };
    }
}

describe("DeleteProductUseCase", () => {
    it("should not allow deleting a product with associated sales or orders", async () => {
        const product = {
            _id: "product-1",
            name: "Producto con asociación",
            canDelete: false,
        };
        const repository = new MockProductRepository(product);
        const useCase = new DeleteProductUseCase(repository);

        await assert.rejects(
            async () => {
                await useCase.execute(product._id);
            },
            {
                message: "No se puede eliminar el producto porque tiene ventas o pedidos asociados. Solo puede desactivarse."
            }
        );

        assert.strictEqual(repository.deleteCalled, false, "El repositorio no debe llamar a delete cuando canDelete es false");
    });

    it("should delete a product when it has no associated sales or orders", async () => {
        const product = {
            _id: "product-2",
            name: "Producto sin asociación",
            canDelete: true,
        };
        const repository = new MockProductRepository(product);
        const useCase = new DeleteProductUseCase(repository);

        const result = await useCase.execute(product._id);

        assert.strictEqual(repository.deleteCalled, true, "El repositorio debe llamar a delete cuando canDelete es true");
        assert.deepStrictEqual(result, { deletedId: product._id });
    });
});
