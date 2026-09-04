import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Farmer from "@/models/Farmer";
import Officer from "@/models/Officer";
import Slot from "@/models/Slot";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";

/* ============================================================
   HELPERS
============================================================ */

function startOfDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateString) {
  const date = new Date(`${dateString}T23:59:59.999`);
  date.setHours(23, 59, 59, 999);
  return date;
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

/* ============================================================
   GET BOOKINGS
============================================================ */

export async function GET(request) {
  try {
    await dbConnect();

    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

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

    if (session.user.role !== "OFFICER") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Officer account required.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------------------------------
       GET OFFICER
    -------------------------------------------------------- */

    const officer = await Officer.findById(session.user.id)
      .populate("officerCentre")
      .lean();

    if (!officer) {
      return NextResponse.json(
        {
          success: false,
          message: "Officer not found.",
        },
        { status: 404 }
      );
    }

    if (officer.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Officer account is inactive.",
        },
        { status: 403 }
      );
    }

    if (!officer.officerCentre?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "No procurement centre is assigned to this officer.",
        },
        { status: 400 }
      );
    }

    const centreId = officer.officerCentre._id;

    /* --------------------------------------------------------
       QUERY PARAMS
    -------------------------------------------------------- */

    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date")?.trim() || "ALL";
    const status = searchParams.get("status")?.trim() || "ALL";
    const search = normalizeSearch(searchParams.get("search"));

    /* --------------------------------------------------------
       BASE BOOKING QUERY
       
       IMPORTANT:
       Booking.centreId is the authoritative centre relation.
    -------------------------------------------------------- */

    const query = {
      centreId,
    };

    /* --------------------------------------------------------
       DATE FILTER
       
       IMPORTANT:
       Booking does NOT contain bookingDate.

       The date belongs to Slot.date.

       Slot relation:
         Booking.slotId -> Slot
         Slot.centre -> ProcurementCentre
    -------------------------------------------------------- */

    if (date && date !== "ALL") {
      const start = startOfDay(date);
      const end = endOfDay(date);

      const slots = await Slot.find({
        centre: centreId,
        date: {
          $gte: start,
          $lte: end,
        },
      })
        .select("_id")
        .lean();

      const slotIds = slots.map((slot) => slot._id);

      if (slotIds.length === 0) {
        return NextResponse.json({
          success: true,
          bookings: [],
          total: 0,
          centre: officer.officerCentre,
          filters: {
            date,
            status,
            search,
          },
        });
      }

      query.slotId = {
        $in: slotIds,
      };
    }

    /* --------------------------------------------------------
       STATUS FILTER
       
       Booking schema statuses:
         CONFIRMED
         CHECKED_IN
         COMPLETED
         CANCELLED
         EXPIRED
         REJECTED
    -------------------------------------------------------- */

    if (status && status !== "ALL") {
      query.status = status;
    }

    /* --------------------------------------------------------
       SEARCH
       
       Search:
         - bookingId
         - tokenNumber
         - farmer name
         - farmer mobile
         - farmer email
    -------------------------------------------------------- */

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const farmers = await Farmer.find({
        $or: [
          { name: regex },
          { mobile: regex },
          { email: regex },
        ],
      })
        .select("_id")
        .lean();

      const farmerIds = farmers.map((farmer) => farmer._id);

      query.$or = [
        { bookingId: regex },
        { tokenNumber: regex },
      ];

      if (farmerIds.length > 0) {
        query.$or.push({
          farmerId: {
            $in: farmerIds,
          },
        });
      }
    }

    /* --------------------------------------------------------
       FETCH BOOKINGS
    -------------------------------------------------------- */

    const bookings = await Booking.find(query)
      .populate({
        path: "farmerId",
        select:
          "_id name mobile email avatar farmLocation farm documents verification isActive",
      })
      .populate({
        path: "centreId",
        select:
          "_id name code centreCode address state district block village pincode location status isActive",
      })
      .populate({
        path: "commodityId",
        select:
          "_id name code commodityCode unit rate price isActive",
      })
      .populate({
        path: "slotId",
        select:
          "_id centre commodityId date startTime endTime capacity bookedCount status isActive",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    /* --------------------------------------------------------
       FORMAT RESPONSE
    -------------------------------------------------------- */

    const formattedBookings = bookings.map((booking) => {
      const slot = booking.slotId || null;
      const farmer = booking.farmerId || null;
      const centre = booking.centreId || null;
      const commodity = booking.commodityId || null;

      return {
        _id: booking._id,

        bookingId: booking.bookingId,

        tokenNumber: booking.tokenNumber,

        qrCode: booking.qrCode || null,

        status: booking.status,

        expectedQuantity: booking.expectedQuantity,

        vehicleType: booking.vehicleType,

        vehicleNumber: booking.vehicleNumber,

        cancellationReason: booking.cancellationReason || null,

        cancelledAt: booking.cancelledAt || null,

        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,

        /* ----------------------------------------------------
           SLOT DATE IS THE BOOKING DATE
        ---------------------------------------------------- */

        date: slot?.date || null,

        startTime: slot?.startTime || null,

        endTime: slot?.endTime || null,

        slot: slot
          ? {
              _id: slot._id,
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              capacity: slot.capacity,
              bookedCount: slot.bookedCount,
              status: slot.status,
              isActive: slot.isActive,
            }
          : null,

        farmer: farmer
          ? {
              _id: farmer._id,
              name: farmer.name,
              mobile: farmer.mobile,
              email: farmer.email || null,
              avatar: farmer.avatar || null,
              farmLocation: farmer.farmLocation || null,
              farm: farmer.farm || null,
              documents: farmer.documents || [],
              verification: farmer.verification || null,
              isActive: farmer.isActive,
            }
          : null,

        centre: centre
          ? {
              _id: centre._id,
              name: centre.name,
              code: centre.code,
              centreCode: centre.centreCode,
              address: centre.address,
              state: centre.state,
              district: centre.district,
              block: centre.block,
              village: centre.village,
              pincode: centre.pincode,
              location: centre.location,
              status: centre.status,
              isActive: centre.isActive,
            }
          : null,

        commodity: commodity
          ? {
              _id: commodity._id,
              name: commodity.name,
              code: commodity.code,
              commodityCode: commodity.commodityCode,
              unit: commodity.unit,
              rate: commodity.rate,
              price: commodity.price,
              isActive: commodity.isActive,
            }
          : null,
      };
    });

    /* --------------------------------------------------------
       RESPONSE
    -------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      bookings: formattedBookings,

      total: formattedBookings.length,

      centre: officer.officerCentre,

      filters: {
        date,
        status,
        search,
      },
    });
  } catch (error) {
    console.error(
      "========== OFFICER BOOKINGS GET ERROR =========="
    );
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   PATCH BOOKING
   Used for officer actions such as:
     CONFIRMED
     CHECKED_IN
     COMPLETED
     CANCELLED
     EXPIRED
     REJECTED
============================================================ */

export async function PATCH(request) {
  try {
    await dbConnect();

    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

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

    if (session.user.role !== "OFFICER") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Officer account required.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------------------------------
       OFFICER
    -------------------------------------------------------- */

    const officer = await Officer.findById(session.user.id)
      .populate("officerCentre")
      .lean();

    if (!officer) {
      return NextResponse.json(
        {
          success: false,
          message: "Officer not found.",
        },
        { status: 404 }
      );
    }

    if (officer.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Officer account is inactive.",
        },
        { status: 403 }
      );
    }

    if (!officer.officerCentre?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "No procurement centre is assigned to this officer.",
        },
        { status: 400 }
      );
    }

    const centreId = officer.officerCentre._id;

    /* --------------------------------------------------------
       BODY
    -------------------------------------------------------- */

    const body = await request.json();

    const bookingId = String(body.bookingId || "").trim();
    const newStatus = String(body.status || "").trim();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid booking status. Allowed statuses: ${allowedStatuses.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       FIND BOOKING ONLY IN OFFICER'S CENTRE
    -------------------------------------------------------- */

    const booking = await Booking.findOne({
      bookingId,
      centreId,
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking not found or this booking does not belong to your procurement centre.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------
       UPDATE
    -------------------------------------------------------- */

    booking.status = newStatus;

    if (newStatus === "CANCELLED" || newStatus === "REJECTED") {
      if (body.cancellationReason) {
        booking.cancellationReason = String(
          body.cancellationReason
        ).trim();
      }

      booking.cancelledAt = new Date();
    }

    await booking.save();

    /* --------------------------------------------------------
       RETURN UPDATED BOOKING
    -------------------------------------------------------- */

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "farmerId",
        select:
          "_id name mobile email avatar farmLocation farm documents verification isActive",
      })
      .populate({
        path: "centreId",
        select:
          "_id name code centreCode address state district block village pincode location status isActive",
      })
      .populate({
        path: "commodityId",
        select:
          "_id name code commodityCode unit rate price isActive",
      })
      .populate({
        path: "slotId",
        select:
          "_id centre commodityId date startTime endTime capacity bookedCount status isActive",
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${newStatus}.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "========== OFFICER BOOKINGS PATCH ERROR =========="
    );
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}