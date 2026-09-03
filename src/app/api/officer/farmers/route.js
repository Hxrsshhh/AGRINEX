import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({
    _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
  }).populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 403) };
  if (!officer.officerCentre?._id) return { error: json(false, "No procurement centre is assigned to this officer", 400) };

  return { officer, centre: officer.officerCentre };
}

const formatFarmer = (f) => ({
  id: f._id, _id: f._id, name: f.name, mobile: f.mobile, email: f.email || null,
  role: f.role, isActive: f.isActive, isPhoneVerified: f.isPhoneVerified,
  avatar: f.avatar || { url: null, publicId: null },
  farmLocation: f.farmLocation || { state: null, district: null, village: null, pincode: null },
  farm: f.farm || { landArea: null, landUnit: "Acre", mainCrop: null },
  preferredCentre: f.preferredCentre || null,
  documents: f.documents || [],
  verification: f.verification || { isVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null, rejectionReason: null },
  onboardingCompleted: f.onboardingCompleted, onboardingSkipped: f.onboardingSkipped,
  onboardingCompletedAt: f.onboardingCompletedAt, preferredLanguage: f.preferredLanguage,
  notifications: f.notifications, lastLogin: f.lastLogin, createdAt: f.createdAt, updatedAt: f.updatedAt,
});

export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const verification = searchParams.get("verification")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const query = { role: "FARMER", preferredCentre: centre._id };

    if (status === "ACTIVE") query.isActive = true;
    if (status === "INACTIVE") query.isActive = false;
    if (verification === "VERIFIED") query["verification.isVerified"] = true;
    if (verification === "PENDING") query["verification.isVerified"] = false;

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = ["name", "mobile", "email", "farmLocation.village", "farmLocation.district", "farmLocation.pincode", "farm.mainCrop"].map((k) => ({ [k]: rx }));
    }

    const [total, farmers] = await Promise.all([
      Farmer.countDocuments(query),
      Farmer.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    const formattedFarmers = farmers.map(formatFarmer);

    return json(true, undefined, 200, {
      data: formattedFarmers,
      farmers: formattedFarmers,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      centre: { id: centre._id, _id: centre._id, name: centre.name || null, code: centre.code || null },
      officer: { id: officer._id, name: officer.name, designation: officer.designation },
    });
  } catch (error) {
    console.error("OFFICER FARMERS GET ERROR:", error);
    return json(false, "Failed to fetch farmers", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}