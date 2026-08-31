import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,

      state,
      district,
      village,
      pincode,

      landArea,
      landUnit,
      mainCrop,

      preferredLanguage,
      notifications,

      termsAccepted,
      privacyAccepted,
    } = body;

    // ======================================
    // REQUIRED FIELDS
    // ======================================

    if (!fullName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 }
      );
    }

    if (!mobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number is required",
        },
        { status: 400 }
      );
    }

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

   

    // ======================================
    // NORMALIZE MOBILE
    // ======================================

    const mobile = mobileNumber.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Indian mobile number",
        },
        { status: 400 }
      );
    }

    // ======================================
    // NORMALIZE EMAIL
    // ======================================

    const normalizedEmail = email?.trim()
      ? email.trim().toLowerCase()
      : undefined;

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email address",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ======================================
    // CHECK MOBILE
    // ======================================

    const existingMobile = await User.findOne({
      mobile,
    });

    if (existingMobile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account already exists with this mobile number",
        },
        { status: 409 }
      );
    }

    // ======================================
    // CHECK EMAIL
    // ======================================

    if (normalizedEmail) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account already exists with this email",
          },
          { status: 409 }
        );
      }
    }

    // ======================================
    // HASH PASSWORD
    // ======================================

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // ======================================
    // CREATE OTP
    // ======================================

    const otpCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // ======================================
    // CREATE FARMER
    // ======================================

    const user = await User.create({
      name: fullName.trim(),

      mobile,

      email: normalizedEmail,

      password: hashedPassword,

      role: "FARMER",

      isVerified: false,

      isActive: true,

      otpCode,

      otpExpires,

      otpAttempts: 0,

      farmLocation: {
        state: state?.trim(),
        district: district?.trim(),
        village: village?.trim(),
        pincode: pincode?.trim(),
      },

      farm: {
        landArea: Number(landArea),
        landUnit,
        mainCrop: mainCrop?.trim(),
      },

      preferredLanguage,

      notifications: {
        sms: notifications?.sms ?? true,
        whatsapp: notifications?.whatsapp ?? true,
        push: notifications?.push ?? false,
      },

      termsAccepted:false,
      privacyAccepted:false,
    });

    // ======================================
    // DEVELOPMENT OTP
    // ======================================

    console.log(
      `AGRINEX OTP for ${mobile}: ${otpCode}`
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Registration details saved. OTP sent to mobile.",

        userId: user._id.toString(),

        // DEV ONLY
        otp: otpCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete registration",
      },
      { status: 500 }
    );
  }
}