import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Commodity from "@/models/Commodity";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();

    const commodities = await Commodity.find({
      isActive: true,

      $and: [
        {
          $or: [
            { procurementStartDate: null },
            { procurementStartDate: { $lte: today } },
          ],
        },
        {
          $or: [
            { procurementEndDate: null },
            { procurementEndDate: { $gte: today } },
          ],
        },
      ],
    })
      .select(
        "_id name code description category unit minimumSupportPrice qualityParameters procurementStartDate procurementEndDate"
      )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: commodities.length,
        data: commodities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/procurement/commodities error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch commodities",
      },
      { status: 500 }
    );
  }
}