import { NextResponse } from "next/server";

import crypto from "crypto";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    // ======================================
    // READ REQUEST BODY
    // ======================================

    const {
      token,
      password,
      confirmPassword,
    } = await request.json();

    // ======================================
    // VALIDATE REQUIRED FIELDS
    // ======================================

    if (
      !token ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // ======================================
    // VALIDATE PASSWORD LENGTH
    // ======================================

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

    // ======================================
    // CONFIRM PASSWORD
    // ======================================

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
    // HASH RESET TOKEN
    // ======================================

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ======================================
    // CONNECT DATABASE
    // ======================================

    await connectDB();

    // ======================================
    // FIND VALID RESET TOKEN
    // resetPasswordToken and resetPasswordExpires
    // have select:false in User model.
    // ======================================

    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select(
      "+password +resetPasswordToken +resetPasswordExpires"
    );

    // ======================================
    // INVALID / EXPIRED TOKEN
    // ======================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset link is invalid or expired",
        },
        { status: 400 }
      );
    }

    // ======================================
    // UPDATE PASSWORD
    // ======================================

    user.password = await bcrypt.hash(
      password,
      12
    );

    // ======================================
    // CLEAR RESET TOKEN
    // ======================================

    user.resetPasswordToken = null;

    user.resetPasswordExpires = null;

    await user.save();

    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    // ======================================
    // GENERAL ERROR
    // ======================================

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset password",
      },
      { status: 500 }
    );
  }
}