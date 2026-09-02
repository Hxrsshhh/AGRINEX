import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      [
        "name",
        "mobile",
        "email",
        "role",
        "onboardingCompleted",
        "onboardingSkipped",
        "onboardingCompletedAt",
        "farmLocation",
        "farm",
        "preferredLanguage",
        "notifications",
        "documents",
      ].join(" "),
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        onboardingCompleted: user.onboardingCompleted,
        onboardingSkipped: user.onboardingSkipped,
        onboardingCompletedAt: user.onboardingCompletedAt,

        farmLocation: user.farmLocation,
        farm: user.farm,

        preferredLanguage: user.preferredLanguage,

        notifications: user.notifications,

        documents: user.documents,
      },
    });
  } catch (error) {
    console.error("GET /api/onboarding error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load onboarding data",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await request.json();

    const update = {};

    if (body.farmLocation) {
      const { state, district, village, pincode } = body.farmLocation;

      if (state !== undefined && typeof state !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid state",
          },
          { status: 400 },
        );
      }

      if (district !== undefined && typeof district !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district",
          },
          { status: 400 },
        );
      }

      if (village !== undefined && typeof village !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid village",
          },
          { status: 400 },
        );
      }

      if (pincode !== undefined && !/^\d{6}$/.test(pincode)) {
        return NextResponse.json(
          {
            success: false,
            message: "Pincode must be 6 digits",
          },
          { status: 400 },
        );
      }

      update.farmLocation = {
        state: state?.trim() || null,
        district: district?.trim() || null,
        village: village?.trim() || null,
        pincode: pincode || null,
      };
    }

    if (body.farm) {
      const { landArea, landUnit, mainCrop } = body.farm;

      const parsedLandArea =
        landArea === "" || landArea === null || landArea === undefined
          ? null
          : Number(landArea);

      if (
        parsedLandArea !== null &&
        (!Number.isFinite(parsedLandArea) || parsedLandArea < 0)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid land area",
          },
          { status: 400 },
        );
      }

      if (landUnit !== undefined && !["Acre", "Hectare"].includes(landUnit)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid land unit",
          },
          { status: 400 },
        );
      }

      update.farm = {
        landArea: parsedLandArea,
        landUnit: landUnit || "Acre",
        mainCrop: typeof mainCrop === "string" ? mainCrop.trim() || null : null,
      };
    }

    const allowedLanguages = [
      "English",
      "हिन्दी (Hindi)",
      "ਪੰਜਾਬੀ (Punjabi)",
      "मराठी (Marathi)",
      "తెలుగు (Telugu)",
      "தமிழ் (Tamil)",
    ];

    if (body.preferredLanguage !== undefined) {
      if (!allowedLanguages.includes(body.preferredLanguage)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid language",
          },
          { status: 400 },
        );
      }

      update.preferredLanguage = body.preferredLanguage;
    }

    if (body.notifications) {
      const { sms, whatsapp, push } = body.notifications;

      update.notifications = {
        sms: typeof sms === "boolean" ? sms : true,

        whatsapp: typeof whatsapp === "boolean" ? whatsapp : true,

        push: typeof push === "boolean" ? push : false,
      };
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No onboarding data provided",
        },
        { status: 400 },
      );
    }

    update.onboardingSkipped = false;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select(
      "farmLocation farm preferredLanguage notifications onboardingSkipped onboardingCompleted",
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Onboarding data saved",
      data: {
        farmLocation: user.farmLocation,
        farm: user.farm,
        preferredLanguage: user.preferredLanguage,
        notifications: user.notifications,
        onboardingSkipped: user.onboardingSkipped,
        onboardingCompleted: user.onboardingCompleted,
      },
    });

    response.cookies.set("agrinex-onboarding-skipped", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("PATCH /api/onboarding error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save onboarding data",
      },
      { status: 500 },
    );
  }
}
