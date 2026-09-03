import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import Queue from "@/models/Queue";
import Booking from "@/models/Booking";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";
import Slot from "@/models/Slot";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const getDayBounds = (d = new Date()) => {
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setHours(23, 59, 59, 999);
  return { start, end };
};

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({
    _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
  }).populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "Officer is not assigned to a procurement centre", 400) };

  return { officer, centre: officer.officerCentre };
}

function formatQueueEntry(item, booking) {
  const farmer = item.farmerId || null;
  return {
    id: item._id, _id: item._id, queueId: item._id, tokenNumber: item.tokenNumber,
    position: item.position, status: item.status, arrived: Boolean(item.arrivalTime),
    arrivalTime: item.arrivalTime, calledTime: item.calledTime, processingStartTime: item.processingStartTime,
    completionTime: item.completionTime, queueDate: item.queueDate, estimatedWaitMin: item.estimatedWaitMin || 0,
    farmer: {
      id: farmer?._id || null, _id: farmer?._id || null, name: farmer?.name || "Unknown Farmer",
      mobile: farmer?.mobile || "", email: farmer?.email || "", avatar: farmer?.avatar || null,
      village: farmer?.farmLocation?.village || "—", district: farmer?.farmLocation?.district || "—",
      farmLocation: farmer?.farmLocation || null, farm: farmer?.farm || null, verification: farmer?.verification || null,
    },
    farmerId: farmer?._id?.toString() || "",
    booking: booking ? {
      id: booking._id, bookingId: booking.bookingId, status: booking.status,
      expectedQuantity: booking.expectedQuantity || 0, vehicleType: booking.vehicleType || null,
      vehicleNumber: booking.vehicleNumber || null, tokenNumber: booking.tokenNumber || null,
      commodity: booking.commodityId || null, slot: booking.slotId || null,
    } : null,
    bookingId: booking?._id?.toString() || "", commodity: booking?.commodityId || null,
    commodityId: booking?.commodityId?._id || null, slot: booking?.slotId || null,
    slotId: booking?.slotId?._id || null, expectedQuantity: booking?.expectedQuantity || 0,
    vehicleType: booking?.vehicleType || null, vehicleNumber: booking?.vehicleNumber || null,
    bookingStatus: booking?.status || null,
  };
}

export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { centre } = auth;
    const requestedDate = new URL(request.url).searchParams.get("date");
    let queueDate = getDayBounds().start;

    if (requestedDate) {
      const parsed = new Date(`${requestedDate}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) return json(false, "Invalid queue date", 400);
      queueDate = getDayBounds(parsed).start;
    }

    const nextDate = new Date(queueDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const queueEntries = await Queue.find({ centreId: centre._id, queueDate: { $gte: queueDate, $lt: nextDate } })
      .populate({ path: "farmerId", model: Farmer, select: "name mobile email farmLocation farm avatar verification isPhoneVerified isActive" })
      .populate({ path: "bookingId", model: Booking, select: "bookingId status expectedQuantity vehicleType vehicleNumber tokenNumber commodityId slotId" })
      .sort({ position: 1, createdAt: 1 }).lean();

    const bookingIds = queueEntries.map((item) => item.bookingId?._id).filter(Boolean);
    const bookings = bookingIds.length ? await Booking.find({ _id: { $in: bookingIds }, centreId: centre._id })
      .populate({ path: "commodityId", model: Commodity, select: "name code category unit minimumSupportPrice description" })
      .populate({ path: "slotId", model: Slot, select: "date startTime endTime capacity bookedCount status isActive" }).lean() : [];

    const bookingMap = new Map(bookings.map((b) => [String(b._id), b]));
    const formatted = queueEntries.map((item) => formatQueueEntry(item, item.bookingId?._id ? bookingMap.get(String(item.bookingId._id)) : null));
    const activeEntries = queueEntries.filter((item) => ["WAITING", "CALLED", "PROCESSING"].includes(item.status));

    return json(true, undefined, 200, {
      serverTime: new Date().toISOString(),
      date: queueDate.toISOString().slice(0, 10),
      centre: { id: centre._id, _id: centre._id, centreId: centre.centreId, name: centre.name, address: centre.address, status: centre.status },
      stats: {
        total: activeEntries.length,
        waiting: queueEntries.filter((item) => item.status === "WAITING").length,
        processing: queueEntries.filter((item) => item.status === "PROCESSING").length,
        called: queueEntries.filter((item) => item.status === "CALLED").length,
        arrived: activeEntries.filter((item) => Boolean(item.arrivalTime)).length,
        completed: queueEntries.filter((item) => item.status === "COMPLETED").length,
        skipped: queueEntries.filter((item) => item.status === "SKIPPED").length,
        cancelled: queueEntries.filter((item) => item.status === "CANCELLED").length,
      },
      currentProcessing: formatted.find((item) => item.status === "PROCESSING") || null,
      queue: formatted,
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/queue error:", error);
    return json(false, "Failed to fetch live officer queue", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { centre } = auth;
    const { queueId, action } = await request.json().catch(() => ({}));

    if (!queueId) return json(false, "queueId is required", 400);
    if (!mongoose.Types.ObjectId.isValid(queueId)) return json(false, "Invalid queueId", 400);
    if (!["CALL_NEXT", "ARRIVED", "START", "SKIP", "RESUME", "COMPLETE", "MOVE_UP", "MOVE_DOWN"].includes(action)) {
      return json(false, "Invalid queue action", 400);
    }

    const queue = await Queue.findOne({ _id: queueId, centreId: centre._id });
    if (!queue) return json(false, "Queue entry not found for this centre", 404);

    if (action === "CALL_NEXT") {
      const { start: dayStart, end: dayEnd } = getDayBounds(queue.queueDate);
      const next = await Queue.findOne({
        centreId: centre._id, queueDate: { $gte: dayStart, $lte: dayEnd }, status: "WAITING", arrivalTime: { $ne: null },
      }).sort({ position: 1 });

      if (!next) return json(false, "No arrived farmer is waiting", 409);

      await Queue.updateMany(
        { centreId: centre._id, queueDate: { $gte: dayStart, $lte: dayEnd }, status: "CALLED", _id: { $ne: next._id } },
        { $set: { status: "WAITING" } }
      );

      next.status = "CALLED";
      next.calledTime = new Date();
      await next.save();

      return json(true, `Token ${next.tokenNumber} called`, 200, { queueId: String(next._id), tokenNumber: next.tokenNumber });
    }

    if (action === "ARRIVED") {
      if (["COMPLETED", "SKIPPED", "CANCELLED"].includes(queue.status)) {
        return json(false, `Cannot mark ${queue.status.toLowerCase()} farmer as arrived`, 409);
      }
      queue.arrivalTime = queue.arrivalTime || new Date();
      await queue.save();
      return json(true, "Farmer marked as arrived", 200, {
        queue: { queueId: queue._id, status: queue.status, arrivalTime: queue.arrivalTime },
      });
    }

    if (action === "START") {
      if (!["WAITING", "CALLED"].includes(queue.status)) return json(false, `Cannot start processing from ${queue.status}`, 409);
      if (!queue.arrivalTime) return json(false, "Farmer must be marked arrived first", 409);

      await Queue.updateMany({ centreId: centre._id, status: "PROCESSING", _id: { $ne: queue._id } }, { $set: { status: "WAITING" } });
      queue.status = "PROCESSING";
      queue.processingStartTime = new Date();
      await queue.save();

      if (queue.bookingId) await Booking.updateOne({ _id: queue.bookingId, centreId: centre._id }, { $set: { status: "CHECKED_IN" } });
      return json(true, "Farmer processing started", 200, { queueId: String(queue._id) });
    }

    if (action === "SKIP") {
      if (["COMPLETED", "CANCELLED"].includes(queue.status)) return json(false, `Cannot skip ${queue.status.toLowerCase()} queue entry`, 409);
      queue.status = "SKIPPED";
      await queue.save();
      return json(true, "Farmer skipped", 200, { queueId: String(queue._id) });
    }

    if (action === "RESUME") {
      if (queue.status !== "SKIPPED") return json(false, "Only a skipped farmer can be resumed", 409);
      queue.status = "WAITING";
      queue.arrivalTime = null;
      queue.calledTime = null;
      queue.processingStartTime = null;
      await queue.save();
      return json(true, "Farmer returned to queue", 200, { queueId: String(queue._id) });
    }

    if (action === "COMPLETE") {
      if (queue.status !== "PROCESSING") return json(false, "Only a processing farmer can be completed", 409);
      queue.status = "COMPLETED";
      queue.completionTime = new Date();
      await queue.save();

      if (queue.bookingId) await Booking.updateOne({ _id: queue.bookingId, centreId: centre._id }, { $set: { status: "COMPLETED" } });
      return json(true, "Procurement completed", 200, { queueId: String(queue._id) });
    }

    if (action === "MOVE_UP" || action === "MOVE_DOWN") {
      const isUp = action === "MOVE_UP";
      const target = await Queue.findOne({
        centreId: centre._id, queueDate: queue.queueDate,
        position: { [isUp ? "$lt" : "$gt"]: queue.position },
        status: { $nin: ["COMPLETED", "SKIPPED", "CANCELLED"] },
      }).sort({ position: isUp ? -1 : 1 });

      if (!target) return json(true, isUp ? "Already at the top" : "Already at the bottom", 200);

      const oldPos = queue.position;
      queue.position = target.position;
      target.position = oldPos;
      await Promise.all([queue.save(), target.save()]);

      return json(true, isUp ? "Queue position moved up" : "Queue position moved down", 200);
    }
  } catch (error) {
    console.error("PATCH /api/officer/queue error:", error);
    return json(false, "Failed to update queue", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}