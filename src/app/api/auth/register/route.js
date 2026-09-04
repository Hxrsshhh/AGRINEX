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
    } = body;

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

    if (!email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required",
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

    if (!confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Please confirm your password",
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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email address",
        },
        { status: 400 }
      );
    }

    await connectDB();

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

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const otpCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    const user = await User.create({

      name: fullName.trim(),

      mobile,

      email: normalizedEmail,

      password: hashedPassword,

      role: "FARMER",

      verification: {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        verifiedAtCentre: null,
      },


      isActive: true,

      otpCode,
      otpExpires,
      otpAttempts: 0,
    });

    console.log(
      `AGRINEX OTP for ${mobile}: ${otpCode}`
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Registration details saved. OTP sent to mobile.",

        userId: user._id.toString(),

        otp: otpCode,
      },
      { status: 201 }
    );
  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return NextResponse.json(
        {
          success: false,

          message:
            duplicateField === "mobile"
              ? "An account already exists with this mobile number"
              : duplicateField === "email"
              ? "An account already exists with this email"
              : "An account already exists with these details",
        },
        { status: 409 }
      );
    }

 
    if (
      error?.name ===
      "ValidationError"
    ) {
      const messages = Object.values(
        error.errors || {}
      )
        .map(
          (item) => item.message
        )
        .filter(Boolean);

      return NextResponse.json(
        {
          success: false,

          message:
            messages[0] ||
            "Invalid registration details",
        },
        { status: 400 }
      );
    }

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