import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // PAYMENT ID

        paymentId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // PROCUREMENT

        procurementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Procurement",
            required: true,
            unique: true,
        },

        // FARMER

        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // PAYMENT AMOUNT

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // PAYMENT METHOD

        paymentMethod: {
            type: String,
            enum: [
                "BANK_TRANSFER",
                "UPI",
                "NEFT",
                "RTGS",
                "OTHER",
            ],
            required: true,
        },

        // TRANSACTION

        transactionId: {
            type: String,
            trim: true,
            default: null,
        },

        // PAYMENT STATUS

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "COMPLETED",
                "FAILED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        // PAYMENT TIMESTAMPS

        initiatedAt: {
            type: Date,
            default: null,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        // FAILURE INFORMATION

        failureReason: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({
    farmerId: 1,
    status: 1,
});

export default mongoose.models.Payment ||
    mongoose.model("Payment", paymentSchema);