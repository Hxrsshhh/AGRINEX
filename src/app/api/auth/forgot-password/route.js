import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const {
      identifier,
      identifierType,
    } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mobile number or email is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalized =
      identifierType === "phone"
        ? identifier.replace(/\D/g, "")
        : identifier.trim().toLowerCase();

    const query =
      identifierType === "phone"
        ? { mobile: normalized }
        : { email: normalized };

    const user = await User.findOne(query).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    // Don't reveal whether account exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If the account exists, recovery instructions have been generated.",
      });
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires =
      new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl =
      `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Prototype testing
    console.log(
      "RESET PASSWORD URL:",
      resetUrl
    );

    return NextResponse.json({
      success: true,
      message:
        "Recovery instructions generated successfully",
      resetUrl,
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process recovery request",
      },
      { status: 500 }
    );
  }
}