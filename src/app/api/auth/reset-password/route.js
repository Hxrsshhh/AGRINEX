import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const {
      token,
      password,
      confirmPassword,
    } = await request.json();

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
          message:
            "Passwords do not match",
        },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select(
      "+password +resetPasswordToken +resetPasswordExpires"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reset link is invalid or expired",
        },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(
      password,
      12
    );

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset password",
      },
      { status: 500 }
    );
  }
}