import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
    {
        // PROCUREMENT CENTRE

        centre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementCentre",
            required: true,
            index: true,
        },

        // COMMODITY

        commodity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commodity",
            required: true,
            index: true,
        },

        // SLOT DATE

        date: {
            type: Date,
            required: true,
            index: true,
        },

        // SLOT TIME

        startTime: {
            type: String,
            required: true,
            trim: true,
        },

        endTime: {
            type: String,
            required: true,
            trim: true,
        },

        // SLOT CAPACITY

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },

        bookedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // SLOT STATUS

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "FULL",
                "CLOSED",
                "COMPLETED",
            ],
            default: "AVAILABLE",
        },

        // SLOT CONTROL

        isActive: {
            type: Boolean,
            default: true,
        },

        // AUDIT

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// INDEX

slotSchema.index({
    centre: 1,
    commodity: 1,
    date: 1,
});

export default mongoose.models.Slot ||
    mongoose.model("Slot", slotSchema);