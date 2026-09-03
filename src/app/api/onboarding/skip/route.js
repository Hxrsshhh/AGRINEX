import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Unauthorized", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can skip farmer onboarding", 403);

    await connectDB();
    const farmer = await Farmer.findByIdAndUpdate(
      session.user.id,
      { $set: { onboardingSkipped: true, onboardingCompleted: false } },
      { new: true, runValidators: true }
    );

    if (!farmer) return json(false, "Farmer not found", 404);
    if (!farmer.isActive) return json(false, "Your account has been disabled", 403);

    const response = json(true, "Onboarding skipped for now", 200, {
      data: {
        farmerId: farmer._id.toString(),
        onboardingCompleted: farmer.onboardingCompleted === true,
        onboardingSkipped: farmer.onboardingSkipped === true,
      },
    });

    const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" };
    response.cookies.set("agrinex-onboarding-skipped", "true", cookieOpts);
    response.cookies.set("agrinex-onboarding-completed", "", { ...cookieOpts, maxAge: 0 });

    return response;
  } catch (error) {
    console.error("POST /api/onboarding/skip error:", error);
    return json(false, error?.message || "Unable to skip onboarding", 500);
  }
}