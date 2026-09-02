import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["IDENTITY_PROOF", "LAND_RECORD", "BANK_PROOF", "OTHER"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: null,
      trim: true,
    },

    mimeType: {
      type: String,
      default: null,
      trim: true,
    },

    size: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC ACCOUNT DETAILS
    // ============================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    avatar: {
      url: {
        type: String,
        default: null,
        trim: true,
      },

      publicId: {
        type: String,
        default: null,
        trim: true,
      },
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

    // ============================================================
    // ROLE
    // ============================================================

    role: {
      type: String,
      enum: ["FARMER", "OFFICER", "ADMIN"],
      required: true,
      default: "FARMER",
      index: true,
    },

    // ============================================================
    // FARMER VERIFICATION
    // ============================================================

    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },

      isPhoneVerified: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      verifiedAtCentre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProcurementCentre",
        default: null,
      },
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ============================================================
    // OTP AUTHENTICATION
    // ============================================================

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

    // ============================================================
    // ONBOARDING STATUS
    // ============================================================

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingSkipped: {
      type: Boolean,
      default: false,
    },

    onboardingCompletedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // FARM LOCATION - FARMER
    // OPTIONAL DURING REGISTRATION
    // ============================================================

    farmLocation: {
      state: {
        type: String,
        trim: true,
        default: null,
      },

      district: {
        type: String,
        trim: true,
        default: null,
      },

      village: {
        type: String,
        trim: true,
        default: null,
      },

      pincode: {
        type: String,
        trim: true,
        match: /^\d{6}$/,
        default: null,
      },
    },

    // ============================================================
    // FARM INFORMATION - FARMER
    // ============================================================

    farm: {
      landArea: {
        type: Number,
        min: 0,
        default: null,
      },

      landUnit: {
        type: String,
        enum: ["Acre", "Hectare"],
        default: "Acre",
      },

      mainCrop: {
        type: String,
        trim: true,
        default: null,
      },
    },

    // ============================================================
    // PREFERRED PROCUREMENT CENTRE
    // ============================================================

    preferredCentre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementCentre",
      default: null,
    },

    // ============================================================
    // FARMER DOCUMENTS
    // ============================================================

    documents: {
      type: [documentSchema],
      default: [],
    },

    // ============================================================
    // OFFICER INFORMATION
    // ============================================================

    designation: {
      type: String,
      enum: [
        "CENTRE_MANAGER",
        "PROCUREMENT_OFFICER",
        "VERIFICATION_OFFICER",
        "SUPERVISOR",
      ],
      default: null,
    },

    officerCentre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementCentre",
      default: null,
    },

    // ============================================================
    // ADMIN INFORMATION
    // ============================================================

    adminLevel: {
      type: String,
      enum: ["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"],
      default: null,
    },

    // ============================================================
    // LANGUAGE PREFERENCE
    // ============================================================

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

    // ============================================================
    // NOTIFICATION PREFERENCES
    // ============================================================

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

    // ============================================================
    // LOGIN INFORMATION
    // ============================================================

    lastLogin: {
      type: Date,
      default: null,
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================

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
  },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
