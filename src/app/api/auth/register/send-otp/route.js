import { NextResponse } from "next/server";

import { saveOTP } from "@/lib/otpStore";

export async function POST(request) {
  try {
    const { fullName, mobileNumber, email, password, confirmPassword } =
      await request.json();

    // ============================================================
    // 1. VALIDATE NAME
    // ============================================================

    if (!fullName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 },
      );
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid full name",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // 2. NORMALIZE MOBILE NUMBER
    // ============================================================

    const mobile = String(mobileNumber || "")
      .replace(/\D/g, "")
      .trim();

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number is required",
        },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid Indian mobile number",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // 3. NORMALIZE EMAIL
    // ============================================================

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // 4. VALIDATE PASSWORD
    // ============================================================

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 6 characters",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // 5. DEVELOPMENT OTP
    // ============================================================
    //
    // IMPORTANT:
    //
    // NO USER IS CREATED HERE.
    // NO MONGODB OPERATION IS PERFORMED HERE.
    //
    // The OTP is temporary for development.
    //
    // Later replace this with an SMS provider.
    // ============================================================

    const DEVELOPMENT_OTP = String(Math.floor(1000 + Math.random() * 9000));

    saveOTP(mobile, DEVELOPMENT_OTP);

    console.log(`AGRINEX OTP for ${mobile}: ${DEVELOPMENT_OTP}`);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",

        // Development only
        otp: DEVELOPMENT_OTP,
      },
      { status: 200 },
    );

    console.log(`AGRINEX OTP for ${mobile}: ${DEVELOPMENT_OTP}`);

    // ============================================================
    // 6. RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",

        // Development only.
        // Remove this when real SMS OTP is implemented.
        otp: DEVELOPMENT_OTP,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send OTP",
      },
      { status: 500 },
    );
  }
}
