import mongoose from "mongoose";

const procurementSchema = new mongoose.Schema(
    {
        // PROCUREMENT ID

        procurementId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // RELATED BOOKING

        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },

        // FARMER

        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // PROCUREMENT CENTRE

        centreId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementCentre",
            required: true,
        },

        // COMMODITY

        commodityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commodity",
            required: true,
        },

        // QUANTITY

        expectedQuantity: {
            type: Number,
            required: true,
            min: 0,
        },

        actualQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },

        // QUALITY

        quality: {
            type: String,
            trim: true,
        },

        qualityStatus: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "PARTIALLY_ACCEPTED",
            ],
            default: "PENDING",
        },
        // PROCUREMENT STATUS

        status: {
            type: String,
            enum: [
                "PENDING",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        // REMARKS

        remarks: {
            type: String,
            trim: true,
            default: null,
        },

        // PRICE

        ratePerUnit: {
            type: Number,
            required: true,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // PROCESSED BY

        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

procurementSchema.index({
    farmerId: 1,
    centreId: 1,
});

procurementSchema.index({
    bookingId: 1,
});

export default mongoose.models.Procurement ||
    mongoose.model("Procurement", procurementSchema);