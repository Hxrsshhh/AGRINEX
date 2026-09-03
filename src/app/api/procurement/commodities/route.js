import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const COMMODITY_FIELDS = "_id name code description category unit minimumSupportPrice qualityParameters procurementStartDate procurementEndDate";

export async function GET() {
  try {
    await connectDB();
    const today = new Date();

    const commodities = await Commodity.find({
      isActive: true,
      $and: [
        { $or: [{ procurementStartDate: null }, { procurementStartDate: { $lte: today } }] },
        { $or: [{ procurementEndDate: null }, { procurementEndDate: { $gte: today } }] },
      ],
    })
      .select(COMMODITY_FIELDS)
      .sort({ name: 1 })
      .lean();

    return json(true, undefined, 200, { count: commodities.length, data: commodities });
  } catch (error) {
    console.error("GET /api/procurement/commodities error:", error);
    return json(false, "Failed to fetch commodities", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}