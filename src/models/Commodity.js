import mongoose from "mongoose";

const commoditySchema = new mongoose.Schema(
    {
        // BASIC COMMODITY DETAILS

        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        description: {
            type: String,
            trim: true,
        },

        // COMMODITY CATEGORY

        category: {
            type: String,
            enum: [
                "CEREAL",
                "PULSE",
                "OILSEED",
                "VEGETABLE",
                "FRUIT",
                "OTHER",
            ],
            required: true,
        },

        // MEASUREMENT

        unit: {
            type: String,
            enum: ["KG", "QUINTAL", "TON"],
            default: "QUINTAL",
        },

        // PROCUREMENT PRICE

        minimumSupportPrice: {
            type: Number,
            min: 0,
            default: 0,
        },

        // QUALITY REQUIREMENTS

        qualityParameters: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                minimum: {
                    type: Number,
                    default: null,
                },

                maximum: {
                    type: Number,
                    default: null,
                },

                unit: {
                    type: String,
                    trim: true,
                },
            },
        ],

        // PROCUREMENT STATUS

        isActive: {
            type: Boolean,
            default: true,
        },

        procurementStartDate: {
            type: Date,
            default: null,
        },

        procurementEndDate: {
            type: Date,
            default: null,
        },

        // AUDIT INFORMATION

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

export default mongoose.models.Commodity ||
    mongoose.model("Commodity", commoditySchema);