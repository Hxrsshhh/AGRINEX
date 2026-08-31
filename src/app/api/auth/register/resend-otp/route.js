import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { userId, mobileNumber } =
      await request.json();

    await connectDB();

    const query = userId
      ? { _id: userId }
      : {
          mobile: mobileNumber.replace(
            /\D/g,
            ""
          ),
        };

    const user = await User.findOne(
      query
    ).select(
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

    const otpCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    user.otpCode = otpCode;

    user.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    user.otpAttempts = 0;

    await user.save();

    console.log(
      `NEW AGRINEX OTP for ${user.mobile}: ${otpCode}`
    );

    return NextResponse.json({
      success: true,
      message: "New OTP sent successfully",

      // DEV ONLY
      otp: otpCode,
    });
  } catch (error) {
    console.error(
      "RESEND OTP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to resend OTP",
      },
      { status: 500 }
    );
  }
}