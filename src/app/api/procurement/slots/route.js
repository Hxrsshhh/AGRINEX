import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Slot from "@/models/Slot";
import Commodity from "@/models/Commodity";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const CENTRE_SELECT = "centreId name address contactNumber email operatingHours workingDays dailyCapacity processingCapacity status";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get("centreId");
    const commodityId = searchParams.get("commodityId");
    const date = searchParams.get("date");

    if (!centreId) return json(false, "centreId is required", 400);
    if (!validId(centreId)) return json(false, "Invalid centreId", 400);

    const centre = await ProcurementCentre.findOne({ _id: centreId, status: "ACTIVE" })
      .select(`_id ${CENTRE_SELECT}`).lean();
    if (!centre) return json(false, "Procurement centre not found or inactive", 404);

    const query = { centre: centreId, isActive: true, status: { $in: ["AVAILABLE", "FULL"] } };

    if (commodityId) {
      if (!validId(commodityId)) return json(false, "Invalid commodityId", 400);
      const commodity = await Commodity.findOne({ _id: commodityId, isActive: true })
        .select("_id name code category unit minimumSupportPrice").lean();
      if (!commodity) return json(false, "Commodity not found or inactive", 404);
      query.commodity = commodityId;
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(false, "Invalid date. Expected format YYYY-MM-DD", 400);
      const start = new Date(`${date}T00:00:00`);
      if (Number.isNaN(start.getTime())) return json(false, "Invalid date", 400);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const slots = await Slot.find(query)
      .populate({ path: "commodity", select: "name code category unit minimumSupportPrice" })
      .populate({ path: "centre", select: CENTRE_SELECT })
      .sort({ date: 1, startTime: 1 })
      .lean();

    const formattedSlots = slots.map((s) => {
      const cap = Number(s.capacity || 0);
      const booked = Number(s.bookedCount || 0);
      const remaining = Math.max(0, cap - booked);

      return {
        _id: s._id,
        centreId: s.centre?._id || s.centre,
        centreCode: s.centre?.centreId || centre.centreId || null,
        centreName: s.centre?.name || centre.name || "Procurement Centre",
        centreAddress: s.centre?.address || centre.address || null,
        centreContactNumber: s.centre?.contactNumber || centre.contactNumber || null,
        commodityId: s.commodity?._id || s.commodity,
        commodityName: s.commodity?.name || "Commodity",
        commodityCode: s.commodity?.code || null,
        category: s.commodity?.category || null,
        unit: s.commodity?.unit || "QUINTAL",
        minimumSupportPrice: Number(s.commodity?.minimumSupportPrice || 0),
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: cap,
        bookedCount: booked,
        remaining,
        status: remaining <= 0 ? "FULL" : s.status,
        isActive: Boolean(s.isActive),
      };
    });

    return json(true, undefined, 200, { count: formattedSlots.length, data: formattedSlots }, {
      "Cache-Control": "no-store, max-age=0",
    });
  } catch (error) {
    console.error("GET /api/procurement/slots error:", error);
    return json(false, "Failed to fetch procurement slots", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}