import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", required: true },
    tokenNumber: { type: String, required: true, trim: true },
    queueDate: { type: Date, required: true },
    position: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["WAITING", "CALLED", "PROCESSING", "COMPLETED", "SKIPPED", "CANCELLED"],
      default: "WAITING",
    },
    arrivalTime: { type: Date, default: null },
    calledTime: { type: Date, default: null },
    processingStartTime: { type: Date, default: null },
    completionTime: { type: Date, default: null },
    estimatedWaitMin: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Queue || mongoose.model("Queue", queueSchema);