import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    centre: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", required: true, index: true },
    commodity: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["AVAILABLE", "FULL", "CLOSED", "COMPLETED"],
      default: "AVAILABLE",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

slotSchema.index({ centre: 1, commodity: 1, date: 1 });

export default mongoose.models.Slot || mongoose.model("Slot", slotSchema);