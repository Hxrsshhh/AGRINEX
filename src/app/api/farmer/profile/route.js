import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return json(false, "Unauthorized. Please login again.", 401);
    }

    if (String(session.user.role || "").toUpperCase() !== "FARMER") {
      return json(false, "Access denied. Farmer account required.", 403);
    }

    await connectDB();

    const farmer = await Farmer.findById(session.user.id)
      .populate({
        path: "preferredCentre",
        model: ProcurementCentre,
        select:
          "_id centreId name code centreCode address state district block village pincode location status isActive contactNumber email",
      })
      .lean();

    if (!farmer) {
      return json(false, "Farmer profile not found.", 404);
    }

    if (farmer.isActive === false) {
      return json(false, "Your farmer account is inactive.", 403);
    }

    return json(true, "Profile loaded successfully", 200, {
      farmer,
      data: farmer,
    });
  } catch (error) {
    console.error("FARMER PROFILE API ERROR:", error);
    return json(false, "Failed to load farmer profile.", 500, {
      error: process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
}