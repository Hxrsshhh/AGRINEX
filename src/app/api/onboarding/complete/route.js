import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Unauthorized", 401);

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sessionId) return json(false, "Authentication session could not be identified", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can complete farmer onboarding", 403);

    await connectDB();
    const farmer = await Farmer.findById(session.user.id);
    if (!farmer) return json(false, "Farmer not found", 404);
    if (!farmer.isActive) return json(false, "Your account has been disabled", 403);
    if (!farmer.isPhoneVerified) return json(false, "Please verify your mobile number before completing onboarding", 400);

    const loc = farmer.farmLocation || {};
    if (!loc.state?.trim()) return json(false, "Farm state is required before completing onboarding", 400);
    if (!loc.district?.trim()) return json(false, "Farm district is required before completing onboarding", 400);
    if (!loc.village?.trim()) return json(false, "Farm village/town is required before completing onboarding", 400);
    if (!/^\d{6}$/.test(String(loc.pincode || "").trim())) return json(false, "Valid 6-digit farm pincode is required", 400);

    const farm = farmer.farm || {};
    if (farm.landArea == null || Number(farm.landArea) <= 0) return json(false, "Valid cultivated land area is required", 400);
    if (!farm.mainCrop?.trim()) return json(false, "Primary crop is required", 400);

    farmer.onboardingCompleted = true;
    farmer.onboardingSkipped = false;
    farmer.onboardingCompletedAt = new Date();

    if (farmer.verification?.isVerified !== true) {
      farmer.verification = {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        verifiedAtCentre: null,
        rejectionReason: null,
      };
    } else {
      farmer.verification.rejectionReason = null;
    }

    await farmer.save();

    const response = json(true, "Onboarding completed. Your account is now waiting for officer verification.", 200, {
      data: {
        farmerId: farmer._id.toString(),
        onboardingCompleted: farmer.onboardingCompleted,
        onboardingSkipped: farmer.onboardingSkipped,
        onboardingCompletedAt: farmer.onboardingCompletedAt,
        verification: {
          isVerified: farmer.verification?.isVerified === true,
          verifiedAt: farmer.verification?.verifiedAt || null,
          rejectionReason: farmer.verification?.rejectionReason || null,
        },
        nextRoute: "/waiting-verification",
      },
    });

    const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" };
    response.cookies.set("agrinex-onboarding-completed", token.sessionId, cookieOpts);
    response.cookies.set("agrinex-onboarding-skipped", "", { ...cookieOpts, maxAge: 0 });

    return response;
  } catch (error) {
    console.error("POST /api/onboarding/complete error:", error);
    const msg = process.env.NODE_ENV === "development" ? error?.message || "Failed to complete onboarding" : "Failed to complete onboarding";
    return json(false, msg, 500);
  }
}