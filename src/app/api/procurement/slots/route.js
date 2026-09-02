import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Slot from "@/models/Slot";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const centreId = searchParams.get("centreId");
    const commodityId = searchParams.get("commodityId");
    const date = searchParams.get("date");

    /* ============================================================
       VALIDATE CENTRE
    ============================================================ */

    if (!centreId) {
      return NextResponse.json(
        {
          success: false,
          message: "centreId is required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(centreId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid centreId",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       BASE QUERY
    ============================================================ */

    const query = {
      centre: centreId,
      isActive: true,
      status: {
        $in: ["AVAILABLE", "FULL"],
      },
    };

    /* ============================================================
       COMMODITY FILTER
    ============================================================ */

    if (commodityId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          commodityId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid commodityId",
          },
          { status: 400 }
        );
      }

      query.commodity = commodityId;
    }

    /* ============================================================
       DATE FILTER
    ============================================================ */

    if (date) {
      const selectedDate = new Date(
        `${date}T00:00:00`
      );

      if (
        Number.isNaN(
          selectedDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date",
          },
          { status: 400 }
        );
      }

      const startOfDay =
        new Date(selectedDate);

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date(selectedDate);

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    /* ============================================================
       FETCH SLOTS
    ============================================================ */

    const slots = await Slot.find(query)
      .populate({
        path: "commodity",
        select:
          "name code unit minimumSupportPrice",
      })
      .populate({
        path: "centre",
        select:
          "centreId name address operatingHours workingDays status",
      })
      .sort({
        date: 1,
        startTime: 1,
      })
      .lean();

    /* ============================================================
       FORMAT RESPONSE
    ============================================================ */

    const formattedSlots =
      slots.map((slot) => {
        const capacity =
          Number(slot.capacity || 0);

        const bookedCount =
          Number(slot.bookedCount || 0);

        const remaining =
          Math.max(
            0,
            capacity - bookedCount
          );

        const status =
          remaining <= 0
            ? "FULL"
            : slot.status;

        return {
          _id: slot._id,

          /* CENTRE */
          centreId:
            slot.centre?._id ||
            slot.centre,

          centreCode:
            slot.centre?.centreId ||
            null,

          centreName:
            slot.centre?.name ||
            "Procurement Centre",

          centreAddress:
            slot.centre?.address ||
            null,

          /* COMMODITY */
          commodityId:
            slot.commodity?._id ||
            slot.commodity,

          commodityName:
            slot.commodity?.name ||
            "Commodity",

          commodityCode:
            slot.commodity?.code ||
            null,

          unit:
            slot.commodity?.unit ||
            "QUINTAL",

          /*
           * IMPORTANT:
           * This was missing from the old response.
           */
          minimumSupportPrice:
            Number(
              slot.commodity
                ?.minimumSupportPrice || 0
            ),

          /* SLOT */
          date: slot.date,

          startTime:
            slot.startTime,

          endTime:
            slot.endTime,

          capacity,

          bookedCount,

          remaining,

          status,

          isActive:
            Boolean(
              slot.isActive
            ),
        };
      });

    /* ============================================================
       RESPONSE
    ============================================================ */

    return NextResponse.json(
      {
        success: true,
        count:
          formattedSlots.length,
        data: formattedSlots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/procurement/slots error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch procurement slots",
      },
      { status: 500 }
    );
  }
}