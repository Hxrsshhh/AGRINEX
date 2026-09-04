import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Officer from "@/models/Officer";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function response(success, message, status = 200, data = {}) {
  return NextResponse.json(
    {
      success,
      message,
      data,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return response(
        false,
        "Authentication required",
        401
      );
    }

    if (session.user.role !== "OFFICER") {
      return response(
        false,
        "Officer access required",
        403
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        session.user.id
      )
    ) {
      return response(
        false,
        "Invalid officer session",
        401
      );
    }

    const officer = await Officer.findOne({
      _id: session.user.id,
      role: "OFFICER",
      isActive: true,
    })
      .select("_id name designation officerCentre isActive")
      .lean();

    if (!officer) {
      return response(
        false,
        "Officer account not found or inactive",
        404
      );
    }

    if (!officer.officerCentre) {
      return response(
        false,
        "No procurement centre is assigned to this officer",
        400
      );
    }

    /*
     * Return all ACTIVE commodities.
     *
     * Commodity schema:
     * name
     * code
     * category
     * unit
     * minimumSupportPrice
     * isActive
     */
    const commodities =
      await Commodity.find({
        isActive: true,
      })
        .select(
          "_id name code description category unit minimumSupportPrice procurementStartDate procurementEndDate isActive"
        )
        .sort({
          name: 1,
        })
        .lean();

    return response(
      true,
      "Commodities loaded successfully",
      200,
      {
        commodities,
        count: commodities.length,
      }
    );
  } catch (error) {
    console.error(
      "OFFICER COMMODITIES ERROR:",
      error
    );

    return response(
      false,
      "Failed to load commodities",
      500,
      {
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      }
    );
  }
}