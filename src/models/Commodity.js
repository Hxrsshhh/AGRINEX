import mongoose from "mongoose";

const qualityParameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    minimum: { type: Number, default: null },
    maximum: { type: Number, default: null },
    unit: { type: String, trim: true },
  },
  { _id: false }
);

const commoditySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, enum: ["CEREAL", "PULSE", "OILSEED", "VEGETABLE", "FRUIT", "OTHER"] },
    unit: { type: String, enum: ["KG", "QUINTAL", "TON"], default: "QUINTAL" },
    minimumSupportPrice: { type: Number, min: 0, default: 0 },
    qualityParameters: [qualityParameterSchema],
    isActive: { type: Boolean, default: true },
    procurementStartDate: { type: Date, default: null },
    procurementEndDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Commodity || mongoose.model("Commodity", commoditySchema);