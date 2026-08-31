import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==============================
    // BASIC ACCOUNT DETAILS
    // ==============================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    // ==============================
    // ROLE
    // ==============================

    role: {
      type: String,
      enum: ["FARMER", "OFFICER", "ADMIN"],
      required: true,
      default: "FARMER",
    },

    // ==============================
    // VERIFICATION
    // ==============================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    otpCode: {
      type: String,
      select: false,
      default: null,
    },

    otpExpires: {
      type: Date,
      select: false,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // ==============================
    // FARM LOCATION
    // ==============================

    farmLocation: {
      state: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
      },

      village: {
        type: String,
        trim: true,
      },

      pincode: {
        type: String,
        trim: true,
        match: /^\d{6}$/,
      },
    },

    // ==============================
    // FARM INFORMATION
    // ==============================

    farm: {
      landArea: {
        type: Number,
        min: 0,
      },

      landUnit: {
        type: String,
        enum: ["Acre", "Hectare"],
        default: "Acre",
      },

      mainCrop: {
        type: String,
        trim: true,
      },
    },

    // ==============================
    // PREFERENCES
    // ==============================

    preferredLanguage: {
      type: String,
      enum: [
        "English",
        "हिन्दी (Hindi)",
        "ਪੰਜਾਬੀ (Punjabi)",
        "मराठी (Marathi)",
        "తెలుగు (Telugu)",
        "தமிழ் (Tamil)",
      ],
      default: "English",
    },

    notifications: {
      sms: {
        type: Boolean,
        default: true,
      },

      whatsapp: {
        type: Boolean,
        default: true,
      },

      push: {
        type: Boolean,
        default: false,
      },
    },

    // ==============================
    // CONSENTS
    // ==============================

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    privacyAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // ==============================
    // LOGIN INFORMATION
    // ==============================

    lastLogin: {
      type: Date,
      default: null,
    },

    // ==============================
    // PASSWORD RESET
    // ==============================

    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", userSchema);