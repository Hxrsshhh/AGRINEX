import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {


    const { userId, mobileNumber } = await request.json();

    if (!userId && !mobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID or mobile number is required",
        },
        { status: 400 }
      );
    }

   

    await connectDB();

   
    let query;

    if (userId) {
      query = {
        _id: userId,
      };
    } else {
      const mobile = mobileNumber
        .replace(/\D/g, "")
        .trim();

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Indian mobile number",
          },
          { status: 400 }
        );
      }

      query = {
        mobile,
      };
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

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has been disabled",
        },
        { status: 403 }
      );
    }

    if (user.verification?.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mobile number is already verified",
        },
        { status: 400 }
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

    return NextResponse.json(
      {
        success: true,

        message:
          "New OTP sent successfully",

        otp: otpCode,
      },
      { status: 200 }
    );
  } catch (error) {

    console.error(
      "RESEND OTP ERROR:",
      error
    );

    if (error?.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to resend OTP",
      },
      { status: 500 }
    );
  }
}