import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const ALLOWED_LANGUAGES = ["English", "हिन्दी (Hindi)", "বাংলা (Bengali)", "ਪੰਜਾਬੀ (Punjabi)", "मराठी (Marathi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)"];
const FARMER_SELECT = "name mobile email role isPhoneVerified onboardingCompleted onboardingSkipped onboardingCompletedAt farmLocation farm preferredCentre preferredLanguage notifications documents";
const CENTRE_SELECT = "centreId name address contactNumber status";

const normalize = (val) => String(val || "").trim();
const escapeRegex = (val) => String(val).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getAuthFarmer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Unauthorized", 401) };
  if (session.user.role !== "FARMER") return { error: json(false, "Only farmers can access onboarding", 403) };

  await connectDB();
  const farmer = await Farmer.findById(session.user.id);
  if (!farmer) return { error: json(false, "Farmer not found", 404) };

  return { farmer };
}

export async function GET() {
  try {
    const { farmer, error } = await getAuthFarmer();
    if (error) return error;

    const populated = await Farmer.findById(farmer._id)
      .select(FARMER_SELECT)
      .populate({ path: "preferredCentre", model: ProcurementCentre, select: CENTRE_SELECT })
      .lean();

    return json(true, undefined, 200, {
      data: {
        farmerId: populated._id,
        name: populated.name,
        mobile: populated.mobile,
        email: populated.email,
        isPhoneVerified: populated.isPhoneVerified,
        onboardingCompleted: populated.onboardingCompleted,
        onboardingSkipped: populated.onboardingSkipped,
        onboardingCompletedAt: populated.onboardingCompletedAt,
        farmLocation: populated.farmLocation,
        farm: populated.farm,
        preferredCentre: populated.preferredCentre,
        preferredLanguage: populated.preferredLanguage,
        notifications: populated.notifications,
        documents: populated.documents,
      },
    }, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("GET /api/onboarding error:", err);
    return json(false, "Failed to load onboarding data", 500);
  }
}

export async function PATCH(request) {
  try {
    const { farmer, error } = await getAuthFarmer();
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const update = {};

    if (body.farmLocation !== undefined) {
      if (!body.farmLocation || typeof body.farmLocation !== "object" || Array.isArray(body.farmLocation)) {
        return json(false, "Invalid farm location", 400);
      }
      const { state, district, village, pincode } = body.farmLocation;
      for (const [key, val] of Object.entries({ state, district, village })) {
        if (val !== undefined && typeof val !== "string") return json(false, `Invalid ${key}`, 400);
      }
      if (pincode !== undefined && pincode !== null && !/^\d{6}$/.test(String(pincode))) {
        return json(false, "Pincode must contain exactly 6 digits", 400);
      }

      update.farmLocation = {
        state: state !== undefined ? normalize(state) : farmer.farmLocation?.state || null,
        district: district !== undefined ? normalize(district) : farmer.farmLocation?.district || null,
        village: village !== undefined ? normalize(village) : farmer.farmLocation?.village || null,
        pincode: pincode !== undefined ? (pincode ? String(pincode) : null) : farmer.farmLocation?.pincode || null,
      };
    }

    if (body.farm !== undefined) {
      if (!body.farm || typeof body.farm !== "object" || Array.isArray(body.farm)) {
        return json(false, "Invalid farm information", 400);
      }
      const { landArea, landUnit, mainCrop } = body.farm;
      if (landArea !== undefined && landArea !== null && (Number.isNaN(Number(landArea)) || Number(landArea) < 0)) {
        return json(false, "Invalid land area", 400);
      }
      if (landUnit !== undefined && !["Acre", "Hectare"].includes(landUnit)) {
        return json(false, "Invalid land unit", 400);
      }

      update.farm = {
        landArea: landArea !== undefined ? (landArea === null || landArea === "" ? null : Number(landArea)) : farmer.farm?.landArea ?? null,
        landUnit: landUnit !== undefined ? landUnit : farmer.farm?.landUnit || "Acre",
        mainCrop: mainCrop !== undefined ? (mainCrop ? normalize(mainCrop) : null) : farmer.farm?.mainCrop || null,
      };
    }

    if (body.preferredLanguage !== undefined) {
      if (typeof body.preferredLanguage !== "string") return json(false, "Invalid preferred language", 400);
      if (!ALLOWED_LANGUAGES.includes(body.preferredLanguage)) return json(false, "Unsupported preferred language", 400);
      update.preferredLanguage = body.preferredLanguage;
    }

    if (body.preferredCentre !== undefined) {
      const pc = body.preferredCentre;
      if (pc === null || pc === "") {
        update.preferredCentre = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(pc)) return json(false, "Invalid procurement centre", 400);

        const loc = update.farmLocation || farmer.farmLocation || {};
        const state = normalize(loc.state);
        const district = normalize(loc.district);
        if (!state || !district) {
          return json(false, "Please save your farm state and district before selecting a procurement centre", 400);
        }

        const centre = await ProcurementCentre.findOne({
          _id: pc,
          status: "ACTIVE",
          "address.state": { $regex: `^${escapeRegex(state)}$`, $options: "i" },
          "address.district": { $regex: `^${escapeRegex(district)}$`, $options: "i" },
        }).lean();

        if (!centre) {
          return json(false, "Selected procurement centre is not available in your state and district", 400);
        }
        update.preferredCentre = centre._id;
      }
    }

    if (body.notifications !== undefined) {
      if (!body.notifications || typeof body.notifications !== "object" || Array.isArray(body.notifications)) {
        return json(false, "Invalid notification settings", 400);
      }
      update.notifications = {
        ...(farmer.notifications?.toObject?.() || farmer.notifications || {}),
        ...body.notifications,
      };
    }

    Object.assign(farmer, update);
    await farmer.save();

    const savedFarmer = await Farmer.findById(farmer._id)
      .select(`_id ${FARMER_SELECT}`)
      .populate({ path: "preferredCentre", model: ProcurementCentre, select: CENTRE_SELECT })
      .lean();

    return json(true, "Onboarding data saved successfully", 200, { data: savedFarmer }, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("PATCH /api/onboarding error:", err);
    return json(false, "Failed to save onboarding data", 500, {
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
}