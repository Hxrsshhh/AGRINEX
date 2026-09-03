import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", required: true, index: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
    commodityId: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity", required: true },
    expectedQuantity: { type: Number, required: true, min: 0 },
    vehicleType: { type: String, enum: ["TRACTOR", "TRACTOR_TROLLEY", "MINI_TRUCK", "TRUCK"], required: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
    tokenNumber: { type: String, trim: true, default: null },
    qrCode: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: ["CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"],
      default: "CONFIRMED",
      index: true,
    },
    cancellationReason: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: null },
    rejecteddAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ farmerId: 1, createdAt: -1 });
bookingSchema.index({ centreId: 1, slotId: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);