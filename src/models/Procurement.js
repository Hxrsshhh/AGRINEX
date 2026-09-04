import mongoose from "mongoose";

const procurementSchema = new mongoose.Schema(
  {
    procurementId: { type: String, required: true, unique: true, trim: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", required: true },
    commodityId: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity", required: true },
    expectedQuantity: { type: Number, required: true, min: 0 },
    actualQuantity: { type: Number, default: 0, min: 0 },
    quality: { type: String, trim: true },
    qualityStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "PARTIALLY_ACCEPTED"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    remarks: { type: String, trim: true, default: null },
    ratePerUnit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Officer", default: null },
  },
  { timestamps: true }
);

procurementSchema.index({ farmerId: 1, centreId: 1 });
procurementSchema.index({ bookingId: 1 });

export default mongoose.models.Procurement || mongoose.model("Procurement", procurementSchema);