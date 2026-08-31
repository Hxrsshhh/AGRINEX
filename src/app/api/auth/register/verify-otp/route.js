import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const {
      userId,
      mobileNumber,
      otp,
      termsAccepted,
      privacyAccepted,
    } = await request.json();

    // =====================================
    // VALIDATE REQUEST
    // =====================================

    if (!otp || !/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 4-digit OTP",
        },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must accept the Terms & Conditions",
        },
        { status: 400 }
      );
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must accept the Privacy Policy",
        },
        { status: 400 }
      );
    }

    if (!userId && !mobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "User information is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // =====================================
    // FIND USER WITH OTP FIELDS
    // =====================================

    let query = {};

    if (userId) {
      query = { _id: userId };
    } else {
      const mobile = mobileNumber.replace(
        /\D/g,
        ""
      );

      query = { mobile };
    }

    const user = await User.findOne(query).select(
      "+otpCode +otpExpires +otpAttempts"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration account not found",
        },
        { status: 404 }
      );
    }

    console.log("VERIFY USER:", {
      id: user._id.toString(),
      mobile: user.mobile,
      otpFromDB: user.otpCode,
      otpExpires: user.otpExpires,
      attempts: user.otpAttempts,
      receivedOtp: otp,
    });

    // =====================================
    // CHECK OTP EXISTS
    // =====================================

    if (!user.otpCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No active OTP found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // CHECK EXPIRY
    // =====================================

    if (
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // CHECK ATTEMPTS
    // =====================================

    if (user.otpAttempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Request a new OTP.",
        },
        { status: 429 }
      );
    }

    // =====================================
    // COMPARE OTP
    // =====================================

    if (user.otpCode !== otp) {
      user.otpAttempts += 1;

      await user.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // =====================================
    // VERIFY ACCOUNT
    // =====================================

    user.isVerified = true;
    user.isActive = true;

    user.termsAccepted = true;
    user.privacyAccepted = true;

    // Clear OTP
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Mobile number verified successfully",

      userId: user._id.toString(),

      user: {
        id: user._id.toString(),
        name: user.name,
        mobile: user.mobile,
        email: user.email || null,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify OTP",
      },
      { status: 500 }
    );
  }
}