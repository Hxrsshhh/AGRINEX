import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import {
  authOptions,
} from "@/app/api/auth/[...nextauth]/route";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sessionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication session could not be identified",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user =
      await User.findById(
        session.user.id
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.farmLocation?.state) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Farm state is required before completing onboarding",
        },
        { status: 400 }
      );
    }

    if (!user.farmLocation?.district) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Farm district is required before completing onboarding",
        },
        { status: 400 }
      );
    }

    if (!user.farmLocation?.village) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Farm village/town is required before completing onboarding",
        },
        { status: 400 }
      );
    }

    if (!user.farmLocation?.pincode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Farm pincode is required before completing onboarding",
        },
        { status: 400 }
      );
    }

    if (
      user.farm?.landArea === null ||
      user.farm?.landArea === undefined ||
      user.farm.landArea <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid cultivated land area is required",
        },
        { status: 400 }
      );
    }

    if (!user.farm?.mainCrop) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Primary crop is required",
        },
        { status: 400 }
      );
    }

    user.onboardingCompleted = true;
    user.onboardingSkipped = false;
    user.onboardingCompletedAt = new Date();

    await user.save();

    const response =
      NextResponse.json({
        success: true,

        message:
          "Onboarding completed successfully",

        data: {
          onboardingCompleted:
            user.onboardingCompleted,

          onboardingSkipped:
            user.onboardingSkipped,

          onboardingCompletedAt:
            user.onboardingCompletedAt,
        },
      });

    response.cookies.set(
      "agrinex-onboarding-completed",
      token.sessionId,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
      }
    );

    response.cookies.set(
      "agrinex-onboarding-skipped",
      "",
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "POST /api/onboarding/complete error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to complete onboarding",
      },
      { status: 500 }
    );
  }
}
