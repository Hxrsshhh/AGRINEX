import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    avatar: {
      url: { type: String, default: null, trim: true },
      publicId: { type: String, default: null, trim: true },
    },
    mobile: { type: String, required: true, unique: true, trim: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["ADMIN"], default: "ADMIN", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    preferredLanguage: {
      type: String,
      enum: ["English", "हिन्दी (Hindi)", "ਪੰਜਾਬੀ (Punjabi)", "मराठी (Marathi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)"],
      default: "English",
    },
    notifications: {
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    lastLogin: { type: Date, default: null },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);