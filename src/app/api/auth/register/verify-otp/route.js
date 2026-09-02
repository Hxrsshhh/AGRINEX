import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";

import User from "@/models/User";

import {
  getOTP,
  deleteOTP,
} from "@/lib/otpStore";

export async function POST(request) {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      otp,
    } = await request.json();

    // ============================================================
    // 1. VALIDATE OTP FORMAT
    // ============================================================

    if (!otp || !/^\d{4}$/.test(String(otp))) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 4-digit OTP",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 2. NORMALIZE MOBILE
    // ============================================================

    const mobile = String(mobileNumber || "")
      .replace(/\D/g, "")
      .trim();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid Indian mobile number",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. CHECK STORED OTP
    // ============================================================

    const storedOTP = getOTP(mobile);

    if (!storedOTP) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP expired or not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. CHECK OTP EXPIRY
    // ============================================================

    if (Date.now() > storedOTP.expiresAt) {
      deleteOTP(mobile);

      return NextResponse.json(
        {
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. VERIFY OTP
    // ============================================================

    if (String(otp) !== String(storedOTP.otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. OTP VERIFIED
    //
    // OTP can no longer be reused.
    // ============================================================

    deleteOTP(mobile);

    // ============================================================
    // 7. VALIDATE NAME
    // ============================================================

    if (!fullName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 }
      );
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid full name",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 8. NORMALIZE EMAIL
    // ============================================================

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 9. VALIDATE PASSWORD
    // ============================================================

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 6 characters",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 10. OTP IS CORRECT
    //
    // ONLY NOW CONNECT TO DATABASE
    // ============================================================

    await connectDB();

    // ============================================================
    // 11. CHECK EXISTING MOBILE
    // ============================================================

    const existingMobile = await User.findOne({
      mobile,
    });

    if (existingMobile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this mobile number already exists",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 12. CHECK EXISTING EMAIL
    // ============================================================

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 13. HASH PASSWORD
    // ============================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // ============================================================
    // 14. CREATE USER
    //
    // OTP SUCCESSFUL
    //       ↓
    // USER CREATED
    //       ↓
    // PHONE VERIFIED
    // ============================================================

    const user = await User.create({
      name: fullName.trim(),

      mobile,

      email: normalizedEmail,

      password: hashedPassword,

      role: "FARMER",

      // ========================================================
      // VERIFICATION
      // ========================================================

      verification: {
        // Official/admin verification
        isVerified: false,

        // Mobile OTP verification
        isPhoneVerified: true,

        verifiedAt: null,

        verifiedBy: null,

        verifiedAtCentre: null,
      },

      // ========================================================
      // ACCOUNT STATUS
      // ========================================================

      isActive: true,

      // ========================================================
      // ONBOARDING
      // ========================================================

      onboardingCompleted: false,

      onboardingSkipped: false,

      onboardingCompletedAt: null,
    });

    // ============================================================
    // 15. SUCCESS RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Account created and mobile number verified successfully",

        userId: user._id.toString(),

        user: {
          id: user._id.toString(),

          name: user.name,

          mobile: user.mobile,

          email: user.email,

          role: user.role,

          // ======================================================
          // VERIFICATION
          // ======================================================

          verification: {
            isVerified:
              user.verification?.isVerified ??
              false,

            isPhoneVerified:
              user.verification?.isPhoneVerified ??
              true,

            verifiedAt:
              user.verification?.verifiedAt ??
              null,
          },

          // Convenience property
          isPhoneVerified: true,

          // ======================================================
          // ACCOUNT
          // ======================================================

          isActive: user.isActive,

          // ======================================================
          // ONBOARDING
          // ======================================================

          onboardingCompleted:
            user.onboardingCompleted,

          onboardingSkipped:
            user.onboardingSkipped,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "VERIFY OTP / CREATE USER ERROR:",
      error
    );

    // ============================================================
    // DUPLICATE KEY ERROR
    // ============================================================

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      if (duplicateField === "mobile") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Mobile number is already registered",
          },
          { status: 409 }
        );
      }

      if (duplicateField === "email") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Email is already registered",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "An account with these details already exists",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // GENERAL ERROR
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to create account",
      },
      { status: 500 }
    );
  }
}