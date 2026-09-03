import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "BOOKING_CONFIRMED",
        "BOOKING_CANCELLED",
        "QUEUE_UPDATE",
        "TURN_APPROACHING",
        "PROCUREMENT_STARTED",
        "PROCUREMENT_COMPLETED",
        "PAYMENT_PENDING",
        "PAYMENT_COMPLETED",
        "PAYMENT_FAILED",
        "GENERAL",
      ],
      required: true,
    },
    relatedBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ farmerId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);