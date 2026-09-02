import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProcurementCentre from "@/models/ProcurementCentre";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const district = searchParams.get("district");
    const state = searchParams.get("state");
    const pincode = searchParams.get("pincode");

    const query = {
      status: "ACTIVE",
    };

    if (district) {
      query["address.district"] = district;
    }

    if (state) {
      query["address.state"] = state;
    }

    if (pincode) {
      query["address.pincode"] = pincode;
    }

    const centres = await ProcurementCentre.find(query)
      .select(
        "_id centreId name address contactNumber email operatingHours workingDays dailyCapacity processingCapacity status description"
      )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: centres.length,
        data: centres,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/procurement/centres error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch procurement centres",
      },
      { status: 500 }
    );
  }
}