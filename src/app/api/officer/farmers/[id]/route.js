import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const CENTRE_SELECT = "centreId name address contactNumber status dailyCapacity processingCapacity";

async function getOfficerAndValidate(params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!validId(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({
    _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
  }).select("_id name role designation officerCentre").populate({ path: "officerCentre", model: ProcurementCentre, select: CENTRE_SELECT }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "No procurement centre is assigned to this officer", 400) };

  const { id } = await params;
  if (!validId(id)) return { error: json(false, "Invalid farmer ID", 400) };

  return { officer, centre: officer.officerCentre, id };
}

function serializeFarmer(f) {
  return {
    _id: f._id, name: f.name, mobile: f.mobile, email: f.email || null,
    role: f.role, isActive: f.isActive, isPhoneVerified: f.isPhoneVerified,
    avatar: f.avatar || { url: null, publicId: null },
    farmLocation: f.farmLocation || { state: null, district: null, village: null, pincode: null },
    farm: f.farm || { landArea: null, landUnit: "Acre", mainCrop: null },
    preferredCentre: f.preferredCentre || null,
    documents: f.documents || [],
    verification: f.verification || { isVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null, rejectionReason: null },
    onboardingCompleted: f.onboardingCompleted, onboardingSkipped: f.onboardingSkipped,
    onboardingCompletedAt: f.onboardingCompletedAt, preferredLanguage: f.preferredLanguage || "English",
    notifications: f.notifications || {}, lastLogin: f.lastLogin || null,
    createdAt: f.createdAt, updatedAt: f.updatedAt,
  };
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { officer, centre, id, error } = await getOfficerAndValidate(params);
    if (error) return error;

    const farmer = await Farmer.findOne({ _id: id, role: "FARMER", preferredCentre: centre._id })
      .populate({ path: "preferredCentre", model: ProcurementCentre, select: CENTRE_SELECT })
      .lean();

    if (!farmer) return json(false, "Farmer not found in your assigned centre", 404);

    return json(true, undefined, 200, {
      farmer: serializeFarmer(farmer),
      centre: {
        _id: centre._id, centreId: centre.centreId, name: centre.name,
        address: centre.address, contactNumber: centre.contactNumber, status: centre.status,
      },
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/farmers/[id] error:", error);
    return json(false, "Failed to load farmer details", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { officer, centre, id, error } = await getOfficerAndValidate(params);
    if (error) return error;

    const { action } = await request.json().catch(() => ({}));
    if (action !== "VERIFY_FARMER") return json(false, "Unsupported verification action", 400);

    const farmer = await Farmer.findOne({ _id: id, role: "FARMER", preferredCentre: centre._id });
    if (!farmer) return json(false, "Farmer not found in your assigned centre", 404);
    if (!farmer.isActive) return json(false, "Inactive farmer cannot be verified", 400);

    if (farmer.verification?.isVerified) {
      return json(true, "Farmer is already verified", 200, {
        farmer: { _id: farmer._id, name: farmer.name, verification: farmer.verification },
      });
    }

    farmer.verification = {
      ...(farmer.verification || {}),
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: officer._id,
      verifiedAtCentre: centre._id,
      rejectionReason: null,
    };

    await farmer.save();

    return json(true, "Farmer verified successfully", 200, {
      farmer: { _id: farmer._id, name: farmer.name, mobile: farmer.mobile, verification: farmer.verification },
    }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("PATCH /api/officer/farmers/[id] error:", error);
    return json(false, "Failed to verify farmer", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}