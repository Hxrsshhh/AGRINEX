import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const escapeRegex = (val) => val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CENTRE_FIELDS = "_id centreId name address contactNumber email operatingHours workingDays dailyCapacity processingCapacity status description managedBy";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state")?.trim() || "";
    const district = searchParams.get("district")?.trim() || "";
    const pincode = searchParams.get("pincode")?.trim() || "";

    const query = { status: "ACTIVE" };
    if (state) query["address.state"] = { $regex: `^${escapeRegex(state)}$`, $options: "i" };
    if (district) query["address.district"] = { $regex: `^${escapeRegex(district)}$`, $options: "i" };

    const centres = await ProcurementCentre.find(query)
      .select(CENTRE_FIELDS)
      .sort({ name: 1 })
      .lean();

    return json(true, undefined, 200, {
      count: centres.length,
      data: centres,
      centres,
      filters: {
        state: state || null,
        district: district || null,
        pincode: pincode || null,
        pincodeUsedForFiltering: false,
      },
    }, { "Cache-Control": "no-store, no-cache, must-revalidate" });
  } catch (error) {
    console.error("GET /api/procurement/centres ERROR:", error);
    return json(false, "Failed to fetch procurement centres", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}