import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const ALLOWED_LANGUAGES = ["English", "हिन्दी (Hindi)", "ਪੰਜਾਬੀ (Punjabi)", "मराठी (Marathi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)"];
const POPULATE_FIELDS = "name code centreCode address state district block village pincode location status isActive";

async function getAuthFarmer(select) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { res: json(false, "Unauthorized", 401) };
  if (session.user.role !== "FARMER") return { res: json(false, "Only farmers can access this profile", 403) };

  await connectDB();
  const query = Farmer.findById(session.user.id);
  if (select) query.select(select);
  const farmer = await query;
  if (!farmer) return { res: json(false, "Farmer not found", 404) };
  if (!farmer.isActive) return { res: json(false, "Farmer account is inactive", 403) };

  return { farmer };
}

export async function GET() {
  try {
    const { farmer, res } = await getAuthFarmer();
    if (res) return res;

    await farmer.populate({ path: "preferredCentre", select: POPULATE_FIELDS });
    return json(true, undefined, 200, { farmer: farmer.toObject() });
  } catch (error) {
    console.error("GET /api/farmer/profile error:", error);
    return json(false, "Failed to fetch farmer profile", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}

export async function PATCH(request) {
  try {
    const { farmer, res } = await getAuthFarmer();
    if (res) return res;

    const b = await request.json();

    if (b.name !== undefined) {
      if (typeof b.name !== "string" || b.name.trim().length < 2 || b.name.trim().length > 100) {
        return json(false, "Name must be between 2 and 100 characters", 400);
      }
      farmer.name = b.name.trim();
    }

    if (b.email !== undefined) {
      if (!b.email) {
        farmer.email = null;
      } else {
        if (typeof b.email !== "string") return json(false, "Invalid email", 400);
        const email = b.email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(false, "Invalid email address", 400);
        if (await Farmer.exists({ email, _id: { $ne: farmer._id } })) return json(false, "Email is already in use", 409);
        farmer.email = email;
      }
    }

    if (b.farmLocation !== undefined) {
      if (!b.farmLocation || typeof b.farmLocation !== "object") return json(false, "Invalid farm location", 400);
      const loc = b.farmLocation;

      for (const field of ["state", "district", "village"]) {
        if (loc[field] !== undefined) {
          if (loc[field] !== null && typeof loc[field] !== "string") return json(false, `Invalid ${field}`, 400);
          farmer.farmLocation[field] = loc[field]?.trim() || null;
        }
      }

      if (loc.pincode !== undefined) {
        const pin = loc.pincode === null ? "" : String(loc.pincode).trim();
        if (pin && !/^\d{6}$/.test(pin)) return json(false, "Pincode must contain exactly 6 digits", 400);
        farmer.farmLocation.pincode = pin || null;
      }
    }

    if (b.farm !== undefined) {
      if (!b.farm || typeof b.farm !== "object") return json(false, "Invalid farm information", 400);
      const { landArea, landUnit, mainCrop } = b.farm;

      if (landArea !== undefined) {
        if (landArea === null || landArea === "") {
          farmer.farm.landArea = null;
        } else {
          const num = Number(landArea);
          if (!Number.isFinite(num) || num < 0) return json(false, "Invalid land area", 400);
          farmer.farm.landArea = num;
        }
      }

      if (landUnit !== undefined) {
        if (landUnit !== null && !["Acre", "Hectare"].includes(landUnit)) return json(false, "Land unit must be Acre or Hectare", 400);
        if (landUnit !== null) farmer.farm.landUnit = landUnit;
      }

      if (mainCrop !== undefined) {
        if (mainCrop !== null && typeof mainCrop !== "string") return json(false, "Invalid main crop", 400);
        farmer.farm.mainCrop = mainCrop?.trim() || null;
      }
    }

    if (b.preferredCentre !== undefined) {
      const cId = b.preferredCentre;
      if (!cId) {
        farmer.preferredCentre = null;
      } else {
        if (typeof cId !== "string" || !mongoose.Types.ObjectId.isValid(cId)) return json(false, "Invalid procurement centre", 400);
        const centre = await ProcurementCentre.findById(cId).select("_id isActive status");
        if (!centre) return json(false, "Procurement centre not found", 404);
        if (centre.isActive === false || ["INACTIVE", "CLOSED"].includes(centre.status)) {
          return json(false, "Selected procurement centre is not active", 400);
        }
        farmer.preferredCentre = centre._id;
      }
    }

    if (b.preferredLanguage !== undefined) {
      if (!ALLOWED_LANGUAGES.includes(b.preferredLanguage)) return json(false, "Invalid preferred language", 400);
      farmer.preferredLanguage = b.preferredLanguage;
    }

    if (b.notifications !== undefined) {
      if (!b.notifications || typeof b.notifications !== "object") return json(false, "Invalid notifications data", 400);
      for (const ch of ["sms", "whatsapp", "push"]) {
        if (b.notifications[ch] !== undefined) {
          if (typeof b.notifications[ch] !== "boolean") return json(false, `${ch.toUpperCase()} notification must be true or false`, 400);
          farmer.notifications[ch] = b.notifications[ch];
        }
      }
    }

    await farmer.save();
    const updatedFarmer = await Farmer.findById(farmer._id)
      .populate({ path: "preferredCentre", select: POPULATE_FIELDS })
      .lean();

    return json(true, "Profile updated successfully", 200, { farmer: updatedFarmer });
  } catch (error) {
    console.error("PATCH /api/farmer/profile error:", error);
    if (error?.code === 11000) return json(false, "The provided information already exists", 409);
    return json(false, "Failed to update farmer profile", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}