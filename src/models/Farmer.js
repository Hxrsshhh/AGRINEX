import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    farmerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fatherName: {
      type: String,
      trim: true,
    },

    address: {
      village: String,
      district: String,
      state: String,
      pincode: String,
    },

    preferredCentre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementCentre",
    },

    landDetails: {
      totalArea: Number,
      unit: {
        type: String,
        enum: ["ACRE", "HECTARE"],
        default: "ACRE",
      },
    },

    bankDetails: {
      accountNumber: {
        type: String,
        select: false,
      },

      ifsc: String,

      bankName: String,

      accountHolderName: String,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Farmer ||
  mongoose.model("Farmer", farmerSchema);