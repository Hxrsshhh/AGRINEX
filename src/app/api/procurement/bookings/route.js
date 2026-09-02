import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";

import User from "@/models/User";
import Booking from "@/models/Booking";
import Queue from "@/models/Queue";
import Slot from "@/models/Slot";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

function generateBookingId() {
  return `AGR-BKG-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

function generateTokenNumber() {
  return `AGR-TK-${crypto
    .randomInt(100000, 999999)
    .toString()}`;
}

export async function POST(request) {
  try {
    await connectDB();

    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const farmerId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid farmer session",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // ONLY FARMERS CAN CREATE BOOKINGS
    // ============================================================

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can create procurement bookings",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body = await request.json();

    const {
      centreId,
      slotId,
      commodityId,
      expectedQuantity,
      vehicleType,
      vehicleNumber,
    } = body;

    // ============================================================
    // REQUIRED FIELDS
    // ============================================================

    if (
      !centreId ||
      !slotId ||
      !commodityId ||
      expectedQuantity === undefined ||
      expectedQuantity === null ||
      !vehicleType ||
      !vehicleNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "centreId, slotId, commodityId, expectedQuantity, vehicleType and vehicleNumber are required",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALIDATE OBJECT IDS
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(centreId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid centreId",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid slotId",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(commodityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid commodityId",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALIDATE QUANTITY
    // ============================================================

    const quantity = Number(expectedQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Expected quantity must be greater than zero",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALIDATE VEHICLE
    // ============================================================

    const allowedVehicleTypes = [
      "TRACTOR",
      "TRACTOR_TROLLEY",
      "MINI_TRUCK",
      "TRUCK",
    ];

    const normalizedVehicleType =
      String(vehicleType).toUpperCase();

    if (!allowedVehicleTypes.includes(normalizedVehicleType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid vehicle type",
        },
        { status: 400 }
      );
    }

    const normalizedVehicleNumber =
      String(vehicleNumber)
        .trim()
        .toUpperCase();

    if (!normalizedVehicleNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle number is required",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // LOAD FARMER
    // ============================================================

    const farmer = await User.findOne({
      _id: farmerId,
      role: "FARMER",
      isActive: true,
    }).lean();

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer account not found or inactive",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // LOAD CENTRE
    // ============================================================

    const centre = await ProcurementCentre.findOne({
      _id: centreId,
      status: "ACTIVE",
    }).lean();

    if (!centre) {
      return NextResponse.json(
        {
          success: false,
          message: "Procurement centre is not available",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // LOAD COMMODITY
    // ============================================================

    const commodity = await Commodity.findOne({
      _id: commodityId,
      isActive: true,
    }).lean();

    if (!commodity) {
      return NextResponse.json(
        {
          success: false,
          message: "Commodity is not available for procurement",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // LOAD SLOT
    // ============================================================

    const slot = await Slot.findOne({
      _id: slotId,
      centre: centreId,
      commodity: commodityId,
      isActive: true,
    });

    if (!slot) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected slot does not exist",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // SLOT STATUS
    // ============================================================

    if (
      slot.status === "CLOSED" ||
      slot.status === "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected slot is closed",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // CAPACITY CHECK
    // ============================================================

    if (slot.bookedCount >= slot.capacity) {
      slot.status = "FULL";
      await slot.save();

      return NextResponse.json(
        {
          success: false,
          message: "Selected slot is full",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // PREVENT DUPLICATE ACTIVE BOOKING
    // ============================================================

    const existingBooking = await Booking.findOne({
      farmerId,
      slotId,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    }).lean();

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have a booking for this slot",
          data: {
            bookingId: existingBooking.bookingId,
            tokenNumber: existingBooking.tokenNumber,
          },
        },
        { status: 409 }
      );
    }

    // ============================================================
    // GENERATE IDs
    // ============================================================

    let bookingId;
    let tokenNumber;

    // Ensure uniqueness
    do {
      bookingId = generateBookingId();
    } while (
      await Booking.exists({ bookingId })
    );

    do {
      tokenNumber = generateTokenNumber();
    } while (
      await Booking.exists({ tokenNumber })
    );

    // ============================================================
    // CREATE BOOKING
    // ============================================================

    const booking = await Booking.create({
      bookingId,

      farmerId,

      centreId,

      slotId,

      commodityId,

      expectedQuantity: quantity,

      tokenNumber,

      status: "CONFIRMED",

      vehicleType: normalizedVehicleType,

      vehicleNumber: normalizedVehicleNumber,
    });

    // ============================================================
    // UPDATE SLOT
    // ============================================================

    slot.bookedCount += 1;

    if (slot.bookedCount >= slot.capacity) {
      slot.status = "FULL";
    }

    await slot.save();

    // ============================================================
    // CREATE QUEUE ENTRY
    // ============================================================

    const queueDate = new Date(slot.date);
    queueDate.setHours(0, 0, 0, 0);

    const queueCount = await Queue.countDocuments({
      centreId,
      queueDate: {
        $gte: queueDate,
        $lt: new Date(
          queueDate.getTime() + 24 * 60 * 60 * 1000
        ),
      },
    });

    const queue = await Queue.create({
      bookingId: booking._id,

      farmerId,

      centreId,

      tokenNumber,

      queueDate,

      position: queueCount + 1,

      status: "WAITING",

      estimatedWaitMin:
        Math.max(0, queueCount) * 10,
    });

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Procurement booking confirmed",

        data: {
          bookingId: booking.bookingId,

          bookingMongoId: booking._id,

          tokenNumber: booking.tokenNumber,

          queueId: queue._id,

          queuePosition: queue.position,

          estimatedWaitMin:
            queue.estimatedWaitMin,

          status: booking.status,

          farmer: {
            id: farmer._id,
            name: farmer.name,
            mobile: farmer.mobile,
          },

          centre: {
            id: centre._id,
            centreId: centre.centreId,
            name: centre.name,
            address: centre.address,
          },

          commodity: {
            id: commodity._id,
            name: commodity.name,
            code: commodity.code,
            unit: commodity.unit,
          },

          slot: {
            id: slot._id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },

          quantity,

          vehicle: {
            type: normalizedVehicleType,
            number: normalizedVehicleNumber,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/procurement/bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create procurement booking",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   GET MY BOOKINGS
============================================================ */

export async function GET() {
  try {
    await connectDB();

    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required",
        },
        { status: 401 }
      );
    }

    const farmerId =
      session.user.id;

    // ============================================================
    // VALIDATE FARMER ID
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        farmerId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid farmer session",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // ONLY FARMERS
    // ============================================================

    if (
      session.user.role !==
      "FARMER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only farmers can access procurement bookings",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // FETCH BOOKINGS
    // ============================================================

    const bookings =
      await Booking.find({
        farmerId,
      })
        .populate({
          path: "centreId",
          select:
            "centreId name address contactNumber email operatingHours status",
        })
        .populate({
          path: "commodityId",
          select:
            "name code description category unit minimumSupportPrice",
        })
        .populate({
          path: "slotId",
          select:
            "date startTime endTime capacity bookedCount status isActive",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ============================================================
    // FETCH QUEUE ENTRIES
    //
    // Queue.bookingId stores Booking._id
    // ============================================================

    const bookingMongoIds =
      bookings.map(
        (booking) =>
          booking._id
      );

    const queues =
      bookingMongoIds.length > 0
        ? await Queue.find({
            bookingId: {
              $in: bookingMongoIds,
            },
          })
            .select(
              "bookingId tokenNumber queueDate position status estimatedWaitMin arrivalTime calledAt processingTime completionTime"
            )
            .sort({
              position: 1,
            })
            .lean()
        : [];

    // ============================================================
    // QUEUE MAP
    // ============================================================

    const queueMap =
      new Map();

    queues.forEach(
      (queue) => {
        queueMap.set(
          String(
            queue.bookingId
          ),
          queue
        );
      }
    );

    // ============================================================
    // FORMAT BOOKINGS
    // ============================================================

    const formattedBookings =
      bookings.map(
        (booking) => {
          const queue =
            queueMap.get(
              String(
                booking._id
              )
            );

          return {
            ...booking,

            // ----------------------------------------------------
            // CENTRE
            // ----------------------------------------------------

            centre:
              booking.centreId,

            // ----------------------------------------------------
            // COMMODITY
            // ----------------------------------------------------

            commodity:
              booking.commodityId,

            // ----------------------------------------------------
            // SLOT
            // ----------------------------------------------------

            slot:
              booking.slotId,

            // ----------------------------------------------------
            // DATE
            // ----------------------------------------------------

            date:
              booking.slotId?.date ||
              null,

            // ----------------------------------------------------
            // QUEUE
            // ----------------------------------------------------

            queue:
              queue || null,

            queuePosition:
              queue?.position ??
              null,

            estimatedWaitMin:
              queue?.estimatedWaitMin ??
              0,

            // ----------------------------------------------------
            // VEHICLE
            // ----------------------------------------------------

            vehicle: {
              type:
                booking.vehicleType ||
                null,

              number:
                booking.vehicleNumber ||
                null,
            },
          };
        }
      );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        count:
          formattedBookings.length,

        bookings:
          formattedBookings,

        data:
          formattedBookings,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/procurement/bookings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch procurement bookings",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}