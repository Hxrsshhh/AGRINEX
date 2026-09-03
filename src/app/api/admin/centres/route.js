import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import ProcurementCentre from "@/models/ProcurementCentre";
import Officer from "@/models/Officer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const OFFICER_FIELDS = "name mobile email designation isActive";

async function requireAdmin(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return json(false, "Unauthorized", 401);
  if (token.role !== "ADMIN") return json(false, "Admin access required", 403);
  await connectDB();
  return null;
}

export async function GET(req) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        "centreId", "name", "address.village", "address.district",
        "address.state", "address.pincode", "contactNumber",
      ].map((k) => ({ [k]: regex }));
    }

    if (["ACTIVE", "INACTIVE", "TEMPORARILY_CLOSED"].includes(status)) {
      query.status = status;
    }

    const centres = await ProcurementCentre.find(query)
      .populate({ path: "managedBy", model: Officer, select: OFFICER_FIELDS })
      .sort({ createdAt: -1 })
      .lean();

    return json(true, undefined, 200, { count: centres.length, centres });
  } catch (err) {
    return json(false, "Failed to fetch procurement centres", 500, { error: err.message });
  }
}

export async function POST(req) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const b = await req.json();
    const cleanId = b.centreId?.trim().toUpperCase();

    if (!cleanId) return json(false, "Centre ID is required", 400);
    if (!b.name?.trim()) return json(false, "Centre name is required", 400);
    if (!b.address?.district?.trim()) return json(false, "District is required", 400);
    if (!b.address?.state?.trim()) return json(false, "State is required", 400);
    if (!/^\d{6}$/.test(b.address?.pincode?.trim() || "")) return json(false, "Enter a valid 6-digit pincode", 400);
    if (b.contactNumber && !/^[6-9]\d{9}$/.test(b.contactNumber.trim())) {
      return json(false, "Enter a valid 10-digit contact number", 400);
    }

    if (await ProcurementCentre.exists({ centreId: cleanId })) {
      return json(false, "Centre ID already exists", 409);
    }

    const centre = await ProcurementCentre.create({
      centreId: cleanId,
      name: b.name.trim(),
      address: {
        village: b.address.village?.trim() || "",
        district: b.address.district.trim(),
        state: b.address.state.trim(),
        pincode: b.address.pincode.trim(),
      },
      contactNumber: b.contactNumber?.trim() || "",
      email: b.email?.trim().toLowerCase() || "",
      operatingHours: {
        openingTime: b.operatingHours?.openingTime || "09:00",
        closingTime: b.operatingHours?.closingTime || "17:00",
      },
      workingDays: Array.isArray(b.workingDays)
        ? b.workingDays
        : ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      dailyCapacity: Number(b.dailyCapacity) || 0,
      processingCapacity: Number(b.processingCapacity) || 1,
      status: b.status || "ACTIVE",
      description: b.description?.trim() || null,
      managedBy: null,
    });

    const populatedCentre = await ProcurementCentre.findById(centre._id)
      .populate({ path: "managedBy", model: Officer, select: OFFICER_FIELDS })
      .lean();

    return json(true, "Procurement centre created successfully", 201, { centre: populatedCentre });
  } catch (err) {
    if (err.code === 11000) return json(false, "Centre ID already exists", 409);
    return json(false, "Failed to create procurement centre", 500, { error: err.message });
  }
}