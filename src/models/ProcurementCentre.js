import mongoose from "mongoose";

const procurementCentreSchema = new mongoose.Schema(
  {
    centreId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    address: {
      village: { type: String, trim: true },
      district: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
    },
    contactNumber: { type: String, trim: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, lowercase: true, trim: true },
    operatingHours: {
      openingTime: { type: String, default: "09:00" },
      closingTime: { type: String, default: "17:00" },
    },
    workingDays: [{
      type: String,
      enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
    }],
    dailyCapacity: { type: Number, min: 0, default: 0 },
    processingCapacity: { type: Number, min: 1, default: 1 },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TEMPORARILY_CLOSED"],
      default: "ACTIVE",
      index: true,
    },
    description: { type: String, trim: true, default: null },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Officer", default: null, index: true },
  },
  { timestamps: true }
);

procurementCentreSchema.index({ "address.district": 1, "address.state": 1 });
procurementCentreSchema.index({ "address.pincode": 1 });

export default mongoose.models.ProcurementCentre || mongoose.model("ProcurementCentre", procurementCentreSchema);