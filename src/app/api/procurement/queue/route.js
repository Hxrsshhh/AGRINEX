import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";

import Booking from "@/models/Booking";
import Queue from "@/models/Queue";
import ProcurementCentre from "@/models/ProcurementCentre";

// IMPORTANT:
// These imports register the models with mongoose.
// Booking references Commodity, Slot and ProcurementCentre.
import Commodity from "@/models/Commodity";
import Slot from "@/models/Slot";

export async function GET() {
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

    // ============================================================
    // FARMER CHECK
    // ============================================================

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can access the queue",
        },
        { status: 403 }
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
    // FIND ACTIVE BOOKING
    // ============================================================

    const booking = await Booking.findOne({
      farmerId,
      status: {
        $in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
      },
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "centreId",
        select:
          "centreId name address contactNumber operatingHours processingCapacity dailyCapacity status",
      })
      .populate({
        path: "commodityId",
        select:
          "name code category unit minimumSupportPrice",
      })
      .populate({
        path: "slotId",
        select:
          "date startTime endTime capacity bookedCount status isActive",
      })
      .lean();

    // ============================================================
    // NO ACTIVE BOOKING
    // ============================================================

    if (!booking) {
      return NextResponse.json(
        {
          success: true,
          hasBooking: false,
          hasQueue: false,
          message: "No active procurement booking found",
          data: null,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ============================================================
    // FIND FARMER QUEUE ENTRY
    // ============================================================

    const myQueue = await Queue.findOne({
      bookingId: booking._id,
      farmerId,
    }).lean();

    // ============================================================
    // BOOKING EXISTS BUT QUEUE DOES NOT
    // ============================================================

    if (!myQueue) {
      return NextResponse.json(
        {
          success: true,
          hasBooking: true,
          hasQueue: false,
          message: "Queue entry not found",
          data: {
            booking: {
              bookingId: booking.bookingId,
              status: booking.status,
              expectedQuantity: booking.expectedQuantity,
              vehicleType: booking.vehicleType,
              vehicleNumber: booking.vehicleNumber,
              centre: booking.centreId,
              commodity: booking.commodityId,
              slot: booking.slotId,
            },
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ============================================================
    // QUEUE DATE
    // ============================================================

    const queueDate = new Date(myQueue.queueDate);

    queueDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(queueDate);

    nextDate.setDate(nextDate.getDate() + 1);

    // ============================================================
    // ACTIVE STATUSES
    // ============================================================

    const activeStatuses = [
      "WAITING",
      "CALLED",
      "PROCESSING",
    ];

    // ============================================================
    // GET ALL QUEUE ENTRIES FOR THIS CENTRE AND DATE
    // ============================================================

    const allQueueEntries = await Queue.find({
      centreId: myQueue.centreId,
      queueDate: {
        $gte: queueDate,
        $lt: nextDate,
      },
    })
      .sort({
        position: 1,
        createdAt: 1,
      })
      .lean();

    // ============================================================
    // ACTIVE QUEUE
    // ============================================================

    const activeEntries = allQueueEntries.filter((entry) =>
      activeStatuses.includes(entry.status)
    );

    // ============================================================
    // CURRENT FARMER POSITION
    //
    // The original position is stored when the booking is created.
    //
    // Current position = active farmers ahead + 1
    // ============================================================

    const myOriginalPosition = Number(
      myQueue.position || 0
    );

    const farmersAhead = activeEntries.filter(
      (entry) => {
        const entryPosition = Number(
          entry.position || 0
        );

        return (
          entryPosition < myOriginalPosition &&
          String(entry._id) !== String(myQueue._id)
        );
      }
    ).length;

    let currentPosition = null;

    if (
      myQueue.status === "WAITING" ||
      myQueue.status === "CALLED" ||
      myQueue.status === "PROCESSING"
    ) {
      currentPosition = farmersAhead + 1;
    }

    // ============================================================
    // ESTIMATED WAIT
    //
    // 10 minutes per active farmer ahead.
    //
    // CALLED / PROCESSING = 0
    // ============================================================

    let estimatedWait = 0;

    if (
      myQueue.status === "WAITING"
    ) {
      estimatedWait = farmersAhead * 10;
    }

    // ============================================================
    // RECENT QUEUE ACTIVITY
    // ============================================================

    const recentActivity = allQueueEntries
      .filter(
        (entry) =>
          activeStatuses.includes(entry.status) ||
          entry.status === "COMPLETED"
      )
      .sort((a, b) => {
        const aPosition = Number(
          a.position || 0
        );

        const bPosition = Number(
          b.position || 0
        );

        return aPosition - bPosition;
      })
      .slice(0, 8)
      .map((entry) => ({
        id: entry._id,

        tokenNumber:
          entry.tokenNumber,

        position:
          entry.position,

        status:
          entry.status,

        isYou:
          String(entry._id) ===
          String(myQueue._id),

        createdAt:
          entry.createdAt,

        arrivalTime:
          entry.arrivalTime,

        calledTime:
          entry.calledTime,

        processingStartTime:
          entry.processingStartTime,

        completionTime:
          entry.completionTime,
      }));

    // ============================================================
    // CENTRE CAPACITY
    // ============================================================

    const centre = booking.centreId;

    const activeQueueCount =
      activeEntries.length;

    const processingCapacity = Math.max(
      Number(
        centre?.processingCapacity || 1
      ),
      1
    );

    /*
     * Load represents how many active queue entries
     * exist compared with the centre processing capacity.
     *
     * Capped at 100%.
     */

    const loadPercent = Math.min(
      100,
      Math.round(
        (activeQueueCount /
          processingCapacity) *
          100
      )
    );

    // ============================================================
    // AVERAGE WAIT
    // ============================================================

    const waits = activeEntries
      .map((entry) =>
        Number(
          entry.estimatedWaitMin || 0
        )
      )
      .filter(
        (value) => value > 0
      );

    const averageWait =
      waits.length > 0
        ? Math.round(
            waits.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / waits.length
          )
        : 0;

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        hasBooking: true,

        hasQueue: true,

        data: {
          // ------------------------------------------------------
          // BOOKING IDENTIFICATION
          // ------------------------------------------------------

          bookingId:
            booking.bookingId,

          bookingMongoId:
            booking._id,

          // ------------------------------------------------------
          // QUEUE
          // ------------------------------------------------------

          tokenNumber:
            myQueue.tokenNumber,

          status:
            myQueue.status,

          position:
            currentPosition,

          originalPosition:
            myOriginalPosition,

          farmersAhead,

          estimatedWaitMin:
            estimatedWait,

          queueDate:
            myQueue.queueDate,

          arrivalTime:
            myQueue.arrivalTime,

          calledTime:
            myQueue.calledTime,

          processingStartTime:
            myQueue.processingStartTime,

          completionTime:
            myQueue.completionTime,

          // ------------------------------------------------------
          // BOOKING DETAILS
          // ------------------------------------------------------

          booking: {
            id:
              booking._id,

            bookingId:
              booking.bookingId,

            status:
              booking.status,

            expectedQuantity:
              booking.expectedQuantity,

            vehicleType:
              booking.vehicleType,

            vehicleNumber:
              booking.vehicleNumber,
          },

          // ------------------------------------------------------
          // CENTRE
          // ------------------------------------------------------

          centre:
            booking.centreId,

          // ------------------------------------------------------
          // COMMODITY
          // ------------------------------------------------------

          commodity:
            booking.commodityId,

          // ------------------------------------------------------
          // SLOT
          // ------------------------------------------------------

          slot:
            booking.slotId,

          // ------------------------------------------------------
          // CAPACITY
          // ------------------------------------------------------

          capacity: {
            activeQueueCount,

            processingCapacity,

            loadPercent,

            averageWaitMin:
              averageWait,
          },

          // ------------------------------------------------------
          // RECENT ACTIVITY
          // ------------------------------------------------------

          recentActivity,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/procurement/queue error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to fetch live queue",

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
