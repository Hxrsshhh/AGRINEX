import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import Booking from "@/models/Booking";
import Queue from "@/models/Queue";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";
import Slot from "@/models/Slot";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const NO_CACHE = { "Cache-Control": "no-store, max-age=0" };
const ACTIVE_STATUSES = ["WAITING", "CALLED", "PROCESSING"];

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Authentication required", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can access the queue", 403);
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) return json(false, "Invalid farmer session", 401);

    const farmer = await Farmer.findOne({ _id: session.user.id, role: "FARMER", isActive: true })
      .select("_id name mobile preferredCentre").lean();
    if (!farmer) return json(false, "Farmer account not found or inactive", 401);

    const booking = await Booking.findOne({
      farmerId: farmer._id,
      status: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
    })
      .sort({ createdAt: -1 })
      .populate({ path: "centreId", select: "centreId name address contactNumber operatingHours processingCapacity dailyCapacity status" })
      .populate({ path: "commodityId", select: "name code category unit minimumSupportPrice" })
      .populate({ path: "slotId", select: "date startTime endTime capacity bookedCount status isActive" })
      .lean();

    if (!booking) {
      return json(true, "No active procurement booking found", 200, { hasBooking: false, hasQueue: false, data: null }, NO_CACHE);
    }

    const myQueue = await Queue.findOne({ bookingId: booking._id, farmerId: farmer._id }).lean();
    if (!myQueue) {
      return json(true, "Queue entry not found", 200, {
        hasBooking: true, hasQueue: false,
        data: {
          booking: {
            id: booking._id, bookingId: booking.bookingId, status: booking.status,
            expectedQuantity: booking.expectedQuantity, vehicleType: booking.vehicleType,
            vehicleNumber: booking.vehicleNumber, centre: booking.centreId,
            commodity: booking.commodityId, slot: booking.slotId,
          },
        },
      }, NO_CACHE);
    }

    const queueDate = new Date(myQueue.queueDate);
    if (!myQueue.queueDate || Number.isNaN(queueDate.getTime())) return json(false, "Invalid queue date", 500);
    queueDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(queueDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const allEntries = await Queue.find({
      centreId: myQueue.centreId,
      queueDate: { $gte: queueDate, $lt: nextDate },
    }).sort({ position: 1, createdAt: 1 }).lean();

    const activeEntries = allEntries.filter((e) => ACTIVE_STATUSES.includes(e.status));
    const myPos = Number(myQueue.position || 0);
    const farmersAhead = activeEntries.filter((e) => Number(e.position || 0) < myPos && String(e._id) !== String(myQueue._id)).length;
    const currentPosition = ACTIVE_STATUSES.includes(myQueue.status) ? farmersAhead + 1 : null;
    const estimatedWait = myQueue.status === "WAITING" ? farmersAhead * 10 : 0;

    const recentActivity = allEntries
      .filter((e) => ACTIVE_STATUSES.includes(e.status) || e.status === "COMPLETED")
      .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))
      .slice(0, 8)
      .map((e) => ({
        id: e._id, tokenNumber: e.tokenNumber, position: e.position, status: e.status,
        isYou: String(e._id) === String(myQueue._id), createdAt: e.createdAt,
        arrivalTime: e.arrivalTime, calledTime: e.calledTime,
        processingStartTime: e.processingStartTime, completionTime: e.completionTime,
      }));

    const processingCapacity = Math.max(Number(booking.centreId?.processingCapacity || 1), 1);
    const waits = activeEntries.map((e) => Number(e.estimatedWaitMin || 0)).filter((v) => v > 0);
    const averageWait = waits.length ? Math.round(waits.reduce((sum, v) => sum + v, 0) / waits.length) : 0;

    return json(true, undefined, 200, {
      hasBooking: true,
      hasQueue: true,
      data: {
        farmer: { id: farmer._id, name: farmer.name, mobile: farmer.mobile },
        bookingId: booking.bookingId,
        bookingMongoId: booking._id,
        tokenNumber: myQueue.tokenNumber,
        status: myQueue.status,
        position: currentPosition,
        originalPosition: myPos,
        farmersAhead,
        estimatedWaitMin: estimatedWait,
        queueDate: myQueue.queueDate,
        arrivalTime: myQueue.arrivalTime,
        calledTime: myQueue.calledTime,
        processingStartTime: myQueue.processingStartTime,
        completionTime: myQueue.completionTime,
        booking: {
          id: booking._id, bookingId: booking.bookingId, status: booking.status,
          expectedQuantity: booking.expectedQuantity, vehicleType: booking.vehicleType, vehicleNumber: booking.vehicleNumber,
        },
        centre: booking.centreId,
        commodity: booking.commodityId,
        slot: booking.slotId,
        capacity: {
          activeQueueCount: activeEntries.length,
          processingCapacity,
          loadPercent: Math.min(100, Math.round((activeEntries.length / processingCapacity) * 100)),
          averageWaitMin: averageWait,
        },
        recentActivity,
      },
    }, NO_CACHE);
  } catch (error) {
    console.error("GET /api/procurement/queue error:", error);
    return json(false, "Failed to fetch live queue", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}