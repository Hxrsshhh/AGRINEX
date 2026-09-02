import mongoose from "mongoose";

const procurementCentreSchema = new mongoose.Schema(
    {
        // CENTRE IDENTIFICATION

        centreId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        // LOCATION

        address: {
            village: {
                type: String,
                trim: true,
            },

            district: {
                type: String,
                required: true,
                trim: true,
            },

            state: {
                type: String,
                required: true,
                trim: true,
            },

            pincode: {
                type: String,
                required: true,
                trim: true,
                match: /^\d{6}$/,
            },
        },

        // CONTACT DETAILS

        contactNumber: {
            type: String,
            trim: true,
            match: /^[6-9]\d{9}$/,
        },

        email: {
            type: String,
            lowercase: true,
            trim: true,
        },

        // OPERATING HOURS

        operatingHours: {
            openingTime: {
                type: String,
                default: "09:00",
            },

            closingTime: {
                type: String,
                default: "17:00",
            },
        },

        // WORKING DAYS

        workingDays: [
            {
                type: String,
                enum: [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                ],
            },
        ],

        // CAPACITY

        dailyCapacity: {
            type: Number,
            min: 0,
            default: 0,
        },

        // Number of farmers that can be processed
        // at the same time
        processingCapacity: {
            type: Number,
            min: 1,
            default: 1,
        },

        // STATUS

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE",
                "TEMPORARILY_CLOSED",
            ],
            default: "ACTIVE",
            index: true,
        },

        // ADDITIONAL INFORMATION

        description: {
            type: String,
            trim: true,
            default: null,
        },

        // ADMIN / MANAGEMENT

        managedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// INDEXES

procurementCentreSchema.index({
    "address.district": 1,
    "address.state": 1,
});

procurementCentreSchema.index({
    "address.pincode": 1,
});

export default mongoose.models.ProcurementCentre ||
    mongoose.model(
        "ProcurementCentre",
        procurementCentreSchema
    );