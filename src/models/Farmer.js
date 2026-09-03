import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["IDENTITY_PROOF", "LAND_RECORD", "BANK_PROOF", "OTHER"], required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: null, trim: true },
    mimeType: { type: String, default: null, trim: true },
    size: { type: Number, default: null },
    status: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "PENDING" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    avatar: {
      url: { type: String, default: null, trim: true },
      publicId: { type: String, default: null, trim: true },
    },
    mobile: { type: String, required: true, unique: true, trim: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["FARMER"], default: "FARMER", required: true, index: true },
    isPhoneVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false, default: null },
    otpExpires: { type: Date, select: false, default: null },
    otpAttempts: { type: Number, default: 0, select: false },
    isActive: { type: Boolean, default: true, index: true },
    farmLocation: {
      state: { type: String, trim: true, default: null },
      district: { type: String, trim: true, default: null },
      village: { type: String, trim: true, default: null },
      pincode: { type: String, trim: true, match: /^\d{6}$/, default: null },
    },
    farm: {
      landArea: { type: Number, min: 0, default: null },
      landUnit: { type: String, enum: ["Acre", "Hectare"], default: "Acre" },
      mainCrop: { type: String, trim: true, default: null },
    },
    preferredCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", default: null, index: true },
    documents: { type: [documentSchema], default: [] },
    verification: {
      isVerified: { type: Boolean, default: false, index: true },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Officer", default: null },
      verifiedAtCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementCentre", default: null },
      rejectionReason: { type: String, default: null, trim: true },
    },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingSkipped: { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date, default: null },
    preferredLanguage: {
      type: String,
      enum: ["English", "हिन्दी (Hindi)", "ਪੰਜਾਬੀ (Punjabi)", "मराठी (Marathi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)"],
      default: "English",
    },
    notifications: {
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
    lastLogin: { type: Date, default: null },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);