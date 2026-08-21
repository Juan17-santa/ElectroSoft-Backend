import mongoose from "mongoose";

export default class PaymentTransactionManagerMongo {
    async startSession() {
        return await mongoose.startSession();
    }
}
