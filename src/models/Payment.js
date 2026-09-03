import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, trim: true },
    procurementId: { type: mongoose.Schema.Types.ObjectId, ref: "Procurement", required: true, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "NEFT", "RTGS", "OTHER"],
      required: true,
    },
    transactionId: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    initiatedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ farmerId: 1, status: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);