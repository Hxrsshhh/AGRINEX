import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // BOOKING ID

    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // FARMER

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // PROCUREMENT CENTRE

    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementCentre",
      required: true,
      index: true,
    },

    // SLOT

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
      index: true,
    },

    // COMMODITY

    commodityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commodity",
      required: true,
    },

    // EXPECTED QUANTITY

    expectedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    vehicleType: {
      type: String,
      enum: ["TRACTOR", "TRACTOR_TROLLEY", "MINI_TRUCK", "TRUCK"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // QUEUE TOKEN

    tokenNumber: {
      type: String,
      trim: true,
      default: null,
    },

    // QR CODE

    qrCode: {
      type: String,
      default: null,
      trim: true,
    },

    // BOOKING STATUS

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "PENDING",
      index: true,
    },

    // CANCELLATION DETAILS

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// INDEXES

bookingSchema.index({
  farmerId: 1,
  createdAt: -1,
});

bookingSchema.index({
  centreId: 1,
  slotId: 1,
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
