import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
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

    await connectDB();

    const user =
      await User.findByIdAndUpdate(
        session.user.id,
        {
          $set: {
            onboardingSkipped: true,
            onboardingCompleted: false,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
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

    const response =
      NextResponse.json({
        success: true,
        message:
          "Onboarding skipped for now",
        data: {
          onboardingCompleted:
            user.onboardingCompleted === true,

          onboardingSkipped:
            user.onboardingSkipped === true,
        },
      });

    response.cookies.set(
      "agrinex-onboarding-skipped",
      "true",
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
      }
    );
    response.cookies.set(
      "agrinex-onboarding-completed",
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
      "ONBOARDING SKIP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to skip onboarding",
      },
      { status: 500 }
    );
  }
}
