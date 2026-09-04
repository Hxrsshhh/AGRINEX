import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";

import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import Slot from "@/models/Slot";
import Booking from "@/models/Booking";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const json = (
  success,
  message,
  status = 200,
  extra = {}
) =>
  NextResponse.json(
    {
      success,
      message,
      ...extra,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );

export async function GET(request) {
  try {
    await dbConnect();

    /* =====================================================
       AUTH
    ===================================================== */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return json(
        false,
        "Authentication required",
        401
      );
    }

    if (
      String(session.user.role).toUpperCase() !==
      "OFFICER"
    ) {
      return json(
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
      return json(
        false,
        "Invalid officer session",
        401
      );
    }

    /* =====================================================
       OFFICER
    ===================================================== */

    const officer =
      await Officer.findOne({
        _id: session.user.id,
        role: "OFFICER",
        isActive: true,
      })
        .select(
          "_id name mobile email role designation officerCentre isActive"
        )
        .populate({
          path: "officerCentre",
          model: ProcurementCentre,
          select:
            "_id centreId name address contactNumber status dailyCapacity processingCapacity",
        })
        .lean();

    if (!officer) {
      return json(
        false,
        "Officer account not found or inactive",
        404
      );
    }

    const centre =
      officer.officerCentre;

    if (!centre?._id) {
      return json(
        false,
        "No procurement centre is assigned to this officer",
        400
      );
    }

    /* =====================================================
       SLOT ID
    ===================================================== */

    const slotId =
      new URL(request.url)
        .searchParams
        .get("slotId")
        ?.trim();

    if (!slotId) {
      return json(
        false,
        "slotId is required",
        400
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        slotId
      )
    ) {
      return json(
        false,
        "Invalid slotId",
        400
      );
    }

    console.log(
      "========== OFFICER SLOT BOOKINGS =========="
    );

    console.log(
      "Officer:",
      officer._id.toString()
    );

    console.log(
      "Officer centre:",
      centre._id.toString()
    );

    console.log(
      "Requested slot:",
      slotId
    );

    /* =====================================================
       LOAD SLOT

       IMPORTANT:
       Slot schema uses `centre` and `commodity`.
    ===================================================== */

    const slot =
      await Slot.findOne({
        _id: slotId,
        centre: centre._id,
      })
        .populate({
          path: "commodity",
          model: Commodity,
          select:
            "_id name code unit category minimumSupportPrice description",
        })
        .populate({
          path: "centre",
          model: ProcurementCentre,
          select:
            "_id centreId name address contactNumber status",
        })
        .lean();

    if (!slot) {
      console.error(
        "SLOT NOT FOUND",
        {
          slotId,
          centreId:
            centre._id.toString(),
        }
      );

      return json(
        false,
        "Slot not found for your assigned centre",
        404
      );
    }

    console.log(
      "Slot found:",
      slot._id.toString()
    );

    /* =====================================================
       BOOKINGS

       Booking schema still uses:
       slotId
       centreId
       commodityId
       farmerId
    ===================================================== */

    const bookings =
      await Booking.find({
        slotId: slot._id,

        centreId: centre._id,

        status: {
          $nin: [
            "CANCELLED",
            "EXPIRED",
          ],
        },
      })
        .populate({
          path: "farmerId",
          model: Farmer,
          select:
            "_id name mobile email avatar farmLocation farm verification isPhoneVerified isActive",
        })
        .populate({
          path: "commodityId",
          model: Commodity,
          select:
            "_id name code unit category minimumSupportPrice description",
        })
        .sort({
          createdAt: 1,
        })
        .lean();

    console.log(
      "Bookings found:",
      bookings.length
    );

    /* =====================================================
       FORMAT BOOKINGS
    ===================================================== */

    const formattedBookings =
      bookings.map((booking) => {
        const farmer =
          booking.farmerId;

        const commodity =
          booking.commodityId;

        return {
          id:
            booking._id.toString(),

          _id:
            booking._id,

          bookingId:
            booking.bookingId,

          expectedQuantity:
            booking.expectedQuantity ??
            0,

          vehicle: {
            type:
              booking.vehicleType ||
              null,

            number:
              booking.vehicleNumber ||
              null,
          },

          vehicleType:
            booking.vehicleType ||
            null,

          vehicleNumber:
            booking.vehicleNumber ||
            null,

          tokenNumber:
            booking.tokenNumber ||
            null,

          qrCode:
            booking.qrCode ||
            null,

          status:
            booking.status,

          /* ---------------- FARMER ---------------- */

          farmer: farmer
            ? {
                _id: farmer._id,

                id: farmer._id,

                name:
                  farmer.name ||
                  "Unknown Farmer",

                mobile:
                  farmer.mobile ||
                  "",

                email:
                  farmer.email ||
                  null,

                avatar:
                  farmer.avatar ||
                  null,

                isActive:
                  farmer.isActive,

                isPhoneVerified:
                  farmer.isPhoneVerified,

                farmLocation:
                  farmer.farmLocation ||
                  null,

                farm:
                  farmer.farm ||
                  null,

                verification:
                  farmer.verification ||
                  null,
              }
            : null,

          farmerId:
            farmer?._id ||
            null,

          /* ---------------- COMMODITY ---------------- */

          commodity: commodity
            ? {
                _id:
                  commodity._id,

                id:
                  commodity._id,

                name:
                  commodity.name,

                code:
                  commodity.code,

                unit:
                  commodity.unit,

                category:
                  commodity.category,

                minimumSupportPrice:
                  commodity.minimumSupportPrice,

                description:
                  commodity.description,
              }
            : null,

          commodityId:
            commodity?._id ||
            null,

          /* ---------------- SLOT ---------------- */

          slot: {
            _id:
              slot._id,

            id:
              slot._id,

            date:
              slot.date,

            startTime:
              slot.startTime,

            endTime:
              slot.endTime,

            capacity:
              slot.capacity,

            bookedCount:
              slot.bookedCount,

            availableCapacity:
              Math.max(
                0,
                Number(
                  slot.capacity || 0
                ) -
                  Number(
                    slot.bookedCount || 0
                  )
              ),

            status:
              slot.status,

            isActive:
              slot.isActive,
          },

          slotId:
            slot._id,

          createdAt:
            booking.createdAt,

          updatedAt:
            booking.updatedAt,
        };
      });

    /* =====================================================
       STATS
    ===================================================== */

    const countStatus = (
      status
    ) =>
      formattedBookings.filter(
        (booking) =>
          booking.status === status
      ).length;

    const availableCapacity =
      Math.max(
        0,
        Number(slot.capacity || 0) -
          Number(
            slot.bookedCount || 0
          )
      );

    const stats = {
      total:
        formattedBookings.length,

      confirmed:
        countStatus("CONFIRMED"),

      checkedIn:
        countStatus("CHECKED_IN"),

      completed:
        countStatus("COMPLETED"),

      pending:
        countStatus("PENDING"),

      cancelled:
        countStatus("CANCELLED"),

      expired:
        countStatus("EXPIRED"),

      availableCapacity,
    };

    /* =====================================================
       SLOT PAYLOAD

       IMPORTANT:
       Slot uses `commodity`, not `commodityId`.
    ===================================================== */

    const slotPayload = {
      _id:
        slot._id,

      id:
        slot._id,

      date:
        slot.date,

      startTime:
        slot.startTime,

      endTime:
        slot.endTime,

      capacity:
        slot.capacity,

      bookedCount:
        slot.bookedCount,

      availableCapacity,

      status:
        slot.status,

      isActive:
        slot.isActive,

      commodity:
        slot.commodity
          ? {
              _id:
                slot.commodity._id,

              id:
                slot.commodity._id,

              name:
                slot.commodity.name,

              code:
                slot.commodity.code,

              unit:
                slot.commodity.unit,

              category:
                slot.commodity.category,

              minimumSupportPrice:
                slot.commodity
                  .minimumSupportPrice,
            }
          : null,
    };

    console.log(
      "==========================================="
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return json(
      true,
      "Slot bookings loaded successfully",
      200,
      {
        data: {
          slot:
            slotPayload,

          centre: {
            _id:
              centre._id,

            centreId:
              centre.centreId,

            name:
              centre.name,

            address:
              centre.address,

            contactNumber:
              centre.contactNumber,

            status:
              centre.status,
          },

          bookings:
            formattedBookings,

          stats,
        },

        // Keep these aliases for frontend compatibility
        bookings:
          formattedBookings,

        stats,
      }
    );
  } catch (error) {
    console.error(
      "========== OFFICER SLOT BOOKINGS ERROR =========="
    );

    console.error(error);

    return json(
      false,
      "Failed to load slot bookings",
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