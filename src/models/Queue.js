import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        // Booking associated with this queue entry
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },

        // Farmer in the queue
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Procurement centre
        centreId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcurementCentre",
            required: true,
        },

        // Token given to the farmer
        tokenNumber: {
            type: String,
            required: true,
            trim: true,
        },

        // Date of the queue
        queueDate: {
            type: Date,
            required: true,
        },

        // Current position in the queue
        position: {
            type: Number,
            required: true,
            min: 1,
        },

        // Current queue status
        status: {
            type: String,
            enum: [
                "WAITING",
                "CALLED",
                "PROCESSING",
                "COMPLETED",
                "SKIPPED",
                "CANCELLED",
            ],
            default: "WAITING",
        },

        // Time when farmer arrived at the centre
        arrivalTime: {
            type: Date,
            default: null,
        },

        // Time when farmer was called
        calledTime: {
            type: Date,
            default: null,
        },

        // Time when procurement processing started
        processingStartTime: {
            type: Date,
            default: null,
        },

        // Time when procurement was completed
        completionTime: {
            type: Date,
            default: null,
        },

        // Estimated waiting time in minutes
        estimatedWaitMin: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Queue ||
    mongoose.model("Queue", queueSchema);