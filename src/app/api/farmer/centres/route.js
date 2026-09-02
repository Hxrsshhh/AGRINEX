import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import ProcurementCentre from "@/models/ProcurementCentre";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const farmer = await User.findById(
      session.user.id
    )
      .select("role farmLocation preferredCentre")
      .lean();

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    if (farmer.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can access centres",
        },
        { status: 403 }
      );
    }

    /*
     * Optional query parameters:
     *
     * ?state=Jharkhand
     * ?district=Bokaro
     * ?search=centre
     */

    const { searchParams } =
      new URL(request.url);

    const state =
      searchParams.get("state")?.trim();

    const district =
      searchParams.get("district")?.trim();

    const search =
      searchParams.get("search")?.trim();

    const filter = {};

    /*
     * ---------------------------------------------------------
     * ACTIVE CENTRES
     * ---------------------------------------------------------
     *
     * Adjust these fields if your ProcurementCentre
     * schema uses different names.
     */

    if (
      Object.prototype.hasOwnProperty.call(
        ProcurementCentre.schema.paths,
        "isActive"
      )
    ) {
      filter.isActive = true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        ProcurementCentre.schema.paths,
        "status"
      )
    ) {
      filter.status = {
        $nin: ["INACTIVE", "CLOSED"],
      };
    }

    /*
     * ---------------------------------------------------------
     * LOCATION FILTERS
     * ---------------------------------------------------------
     */

    if (state) {
      if (
        Object.prototype.hasOwnProperty.call(
          ProcurementCentre.schema.paths,
          "state"
        )
      ) {
        filter.state = new RegExp(
          `^${escapeRegex(state)}$`,
          "i"
        );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          ProcurementCentre.schema.paths,
          "address.state"
        )
      ) {
        filter["address.state"] =
          new RegExp(
            `^${escapeRegex(state)}$`,
            "i"
          );
      }
    }

    if (district) {
      if (
        Object.prototype.hasOwnProperty.call(
          ProcurementCentre.schema.paths,
          "district"
        )
      ) {
        filter.district = new RegExp(
          `^${escapeRegex(district)}$`,
          "i"
        );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          ProcurementCentre.schema.paths,
          "address.district"
        )
      ) {
        filter["address.district"] =
          new RegExp(
            `^${escapeRegex(district)}$`,
            "i"
          );
      }
    }

    /*
     * ---------------------------------------------------------
     * SEARCH
     * ---------------------------------------------------------
     */

    if (search) {
      const searchRegex = new RegExp(
        escapeRegex(search),
        "i"
      );

      const searchConditions = [];

      const possibleFields = [
        "name",
        "code",
        "centreCode",
        "village",
        "district",
        "block",
        "state",
      ];

      for (const field of possibleFields) {
        if (
          Object.prototype.hasOwnProperty.call(
            ProcurementCentre.schema.paths,
            field
          )
        ) {
          searchConditions.push({
            [field]: searchRegex,
          });
        }
      }

      if (searchConditions.length) {
        filter.$or = searchConditions;
      }
    }

    /*
     * ---------------------------------------------------------
     * FETCH CENTRES
     * ---------------------------------------------------------
     */

    const centres =
      await ProcurementCentre.find(filter)
        .sort({
          name: 1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      centres,
      count: centres.length,
    });
  } catch (error) {
    console.error(
      "GET /api/farmer/centres error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch procurement centres",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Escape user-provided text before putting it into
 * a MongoDB RegExp.
 */
function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}