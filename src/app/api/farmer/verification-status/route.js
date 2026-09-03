import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return json(false, "Authentication required", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can access this route", 403);

    const farmer = await Farmer.findById(session.user.id)
      .select("_id name mobile verification onboardingCompleted onboardingSkipped")
      .lean();

    if (!farmer) return json(false, "Farmer not found", 404);

    return json(
      true,
      undefined,
      200,
      {
        data: {
          id: farmer._id,
          name: farmer.name,
          mobile: farmer.mobile,
          verification: {
            isVerified: farmer.verification?.isVerified === true,
            verifiedAt: farmer.verification?.verifiedAt || null,
            rejectionReason: farmer.verification?.rejectionReason || null,
          },
          onboardingCompleted: farmer.onboardingCompleted,
          onboardingSkipped: farmer.onboardingSkipped,
        },
      },
      { "Cache-Control": "no-store, max-age=0" }
    );
  } catch (error) {
    console.error("GET /api/farmer/verification-status error:", error);
    return json(false, "Failed to check verification status", 500);
  }
}