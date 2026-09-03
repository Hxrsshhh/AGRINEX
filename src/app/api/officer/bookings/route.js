import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import Booking from "@/models/Booking";
import Queue from "@/models/Queue";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";
import Slot from "@/models/Slot";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const getStartOfDay = (d = new Date()) => { const v = new Date(d); v.setHours(0, 0, 0, 0); return v; };
const getEndOfDay = (d = new Date()) => { const v = new Date(d); v.setHours(23, 59, 59, 999); return v; };

async function generateUniqueBookingId() {
  let id;
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  do { id = `AGR-${ym}-${crypto.randomInt(1000, 9999)}`; } while (await Booking.exists({ bookingId: id }));
  return id;
}

async function generateUniqueToken() {
  let token;
  do { token = `AGR-TK-${crypto.randomInt(100000, 999999)}`; } while (await Queue.exists({ tokenNumber: token }));
  return token;
}

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({ _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true })
    .populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "No procurement centre is assigned to this officer", 400) };

  return { officer, centre: officer.officerCentre };
}

async function formatBooking(b) {
  const q = await Queue.findOne({ bookingId: b._id }).lean();
  return {
    id: b.bookingId,
    mongoId: b._id,
    bookingId: b.bookingId,
    farmer: {
      id: b.farmerId?._id || null,
      name: b.farmerId?.name || "Unknown Farmer",
      mobile: b.farmerId?.mobile || "",
      email: b.farmerId?.email || "",
      farmLocation: b.farmerId?.farmLocation || null,
      farm: b.farmerId?.farm || null,
      avatar: b.farmerId?.avatar || null,
      verification: b.farmerId?.verification || { isVerified: false },
      documents: b.farmerId?.documents || [],
    },
    farmerId: b.farmerId?._id?.toString() || "",
    centre: {
      id: b.centreId?._id || null,
      centreId: b.centreId?.centreId || "",
      name: b.centreId?.name || "",
      address: b.centreId?.address || null,
    },
    centreId: b.centreId?._id?.toString() || "",
    commodity: {
      id: b.commodityId?._id || null,
      name: b.commodityId?.name || "Unknown",
      code: b.commodityId?.code || "",
      category: b.commodityId?.category || "",
      unit: b.commodityId?.unit || "QUINTAL",
      minimumSupportPrice: b.commodityId?.minimumSupportPrice ?? 0,
    },
    commodityId: b.commodityId?._id?.toString() || "",
    slot: b.slotId ? {
      id: b.slotId._id, date: b.slotId.date, startTime: b.slotId.startTime,
      endTime: b.slotId.endTime, capacity: b.slotId.capacity, bookedCount: b.slotId.bookedCount,
      status: b.slotId.status, isActive: b.slotId.isActive,
    } : null,
    slotId: b.slotId?._id?.toString() || "",
    date: b.slotId?.date || null,
    startTime: b.slotId?.startTime || null,
    endTime: b.slotId?.endTime || null,
    expectedQuantity: b.expectedQuantity,
    vehicleType: b.vehicleType,
    vehicleNumber: b.vehicleNumber,
    tokenNumber: b.tokenNumber,
    qrCode: b.qrCode,
    status: b.status,
    cancellationReason: b.cancellationReason,
    cancelledAt: b.cancelledAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    queue: q ? {
      id: q._id, tokenNumber: q.tokenNumber, queueDate: q.queueDate, position: q.position,
      status: q.status, arrivalTime: q.arrivalTime, calledTime: q.calledTime,
      processingStartTime: q.processingStartTime, completionTime: q.completionTime,
      estimatedWaitMin: q.estimatedWaitMin,
    } : null,
    queuePosition: q?.position ?? null,
    estimatedWaitMin: q?.estimatedWaitMin ?? 0,
    arrived: Boolean(q?.arrivalTime),
  };
}

const populateBookingQuery = (q) => q
  .populate({ path: "farmerId", model: Farmer, select: "name mobile email avatar farmLocation farm verification documents preferredCentre isActive" })
  .populate({ path: "centreId", model: ProcurementCentre, select: "centreId name address contactNumber email operatingHours processingCapacity dailyCapacity status" })
  .populate({ path: "commodityId", model: Commodity, select: "name code category unit minimumSupportPrice description" })
  .populate({ path: "slotId", model: Slot, select: "date startTime endTime capacity bookedCount status isActive" })
  .lean();

const loadBooking = (bookingId, centreId) => populateBookingQuery(Booking.findOne({ bookingId, centreId }));

async function handleCheckInOrQueue(booking, centre) {
  let q = await Queue.findOne({ bookingId: booking._id });
  if (!q) {
    const slot = await Slot.findById(booking.slotId).lean();
    const queueDate = getStartOfDay(slot?.date || new Date());
    const nextDay = new Date(queueDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingCount = await Queue.countDocuments({
      centreId: centre._id,
      queueDate: { $gte: queueDate, $lt: nextDay },
      status: { $nin: ["CANCELLED", "COMPLETED", "SKIPPED"] },
    });

    const tokenNumber = await generateUniqueToken();
    q = await Queue.create({
      bookingId: booking._id, farmerId: booking.farmerId, centreId: booking.centreId,
      tokenNumber, queueDate, position: existingCount + 1, status: "WAITING",
      arrivalTime: new Date(), estimatedWaitMin: existingCount * 10,
    });
    booking.tokenNumber = tokenNumber;
  } else {
    if (q.status === "CANCELLED") return { error: json(false, "This queue entry has been cancelled", 409) };
    q.status = "WAITING";
    if (!q.arrivalTime) q.arrivalTime = new Date();
    await q.save();
    booking.tokenNumber = q.tokenNumber;
  }
  booking.status = "CHECKED_IN";
  await booking.save();
  return { success: true };
}

export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { centre } = auth;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const query = { centreId: centre._id };

    if (date) {
      const selected = new Date(date);
      if (!Number.isNaN(selected.getTime())) {
        const slots = await Slot.find({ centre: centre._id, date: { $gte: getStartOfDay(selected), $lte: getEndOfDay(selected) } }).select("_id").lean();
        query.slotId = { $in: slots.map((s) => s._id) };
      }
    }

    if (status && ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "EXPIRED"].includes(status)) {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const farmers = await Farmer.find({ $or: [{ name: regex }, { mobile: regex }, { email: regex }] }).select("_id").lean();
      query.$or = [{ bookingId: regex }, { tokenNumber: regex }];
      if (farmers.length) query.$or.push({ farmerId: { $in: farmers.map((f) => f._id) } });
    }

    const bookings = await populateBookingQuery(Booking.find(query).sort({ createdAt: -1 }));
    const formatted = await Promise.all(bookings.map(formatBooking));

    return json(true, undefined, 200, {
      count: formatted.length,
      centre: { id: centre._id, centreId: centre.centreId, name: centre.name, address: centre.address, status: centre.status },
      bookings: formatted,
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/bookings error:", error);
    return json(false, "Failed to load officer bookings", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const { bookingId, action, cancellationReason, slotId, expectedQuantity, vehicleType, vehicleNumber } = await request.json();

    if (!bookingId) return json(false, "bookingId is required", 400);
    const booking = await Booking.findOne({ bookingId, centreId: centre._id });
    if (!booking) return json(false, "Booking not found for your centre", 404);

    if (action === "CONFIRM") {
      if (booking.status !== "PENDING") return json(false, `Booking cannot be confirmed from ${booking.status} status`, 409);
      booking.status = "CONFIRMED";
      await booking.save();
    } else if (action === "VERIFY_FARMER") {
      const farmer = await Farmer.findOne({ _id: booking.farmerId, role: "FARMER", preferredCentre: centre._id });
      if (!farmer) return json(false, "Farmer not found in your assigned centre", 404);
      if (!farmer.isActive) return json(false, "Inactive farmer cannot be verified", 400);

      farmer.verification = {
        ...(farmer.verification || {}),
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: officer._id,
        verifiedAtCentre: centre._id,
        rejectionReason: null,
      };
      await farmer.save();
    } else if (action === "ARRIVE" || action === "CHECK_IN") {
      if (booking.status !== "CONFIRMED") return json(false, `Booking must be CONFIRMED before check-in. Current status: ${booking.status}`, 409);
      const res = await handleCheckInOrQueue(booking, centre);
      if (res.error) return res.error;
    } else if (action === "QUEUE") {
      if (!["CONFIRMED", "CHECKED_IN"].includes(booking.status)) return json(false, "Only confirmed or checked-in bookings can enter the queue", 409);
      const res = await handleCheckInOrQueue(booking, centre);
      if (res.error) return res.error;
    } else if (action === "REJECT" || action === "CANCEL") {
      if (["COMPLETED", "CANCELLED"].includes(booking.status)) return json(false, `Booking is already ${booking.status}`, 409);
      booking.status = "CANCELLED";
      booking.cancellationReason = cancellationReason?.trim() || (action === "REJECT" ? "Booking rejected by procurement officer" : "Cancelled by procurement officer");
      booking.cancelledAt = new Date();
      await booking.save();
      await Queue.updateMany({ bookingId: booking._id }, { $set: { status: "CANCELLED" } });
    } else if (action === "NO_SHOW") {
      const queue = await Queue.findOne({ bookingId: booking._id });
      if (!queue) return json(false, "No queue entry exists for this booking", 404);
      if (queue.status === "COMPLETED") return json(false, "Completed booking cannot be marked no-show", 409);
      queue.status = "SKIPPED";
      await queue.save();
    } else if (action === "ACCEPT_PROCUREMENT") {
      if (booking.status !== "CHECKED_IN") return json(false, "Farmer must be checked in before procurement", 409);
      const queue = await Queue.findOne({ bookingId: booking._id });
      if (queue && !["CALLED", "PROCESSING"].includes(queue.status)) {
        return json(false, "Booking must be called or processing before procurement can be accepted", 409);
      }
    } else if (action === "COMPLETE") {
      if (booking.status !== "CHECKED_IN") return json(false, `Booking must be CHECKED_IN before completion. Current status: ${booking.status}`, 409);
      booking.status = "COMPLETED";
      await booking.save();
      await Queue.updateMany({ bookingId: booking._id }, { $set: { status: "COMPLETED", completionTime: new Date() } });
    } else if (action === "REBOOK") {
      if (!slotId || !mongoose.Types.ObjectId.isValid(slotId)) return json(false, "A valid new slot is required", 400);
      const newSlot = await Slot.findOne({ _id: slotId, centre: centre._id, isActive: true });
      if (!newSlot) return json(false, "Selected slot is not available", 404);
      if (newSlot.status !== "AVAILABLE") return json(false, "Selected slot is not open for booking", 409);
      if (Number(newSlot.bookedCount) >= Number(newSlot.capacity)) return json(false, "Selected slot is full", 409);

      const farmer = await Farmer.findOne({ _id: booking.farmerId, role: "FARMER", preferredCentre: centre._id }).lean();
      if (!farmer) return json(false, "Farmer is not assigned to this centre", 403);

      const newBooking = await Booking.create({
        bookingId: await generateUniqueBookingId(),
        farmerId: booking.farmerId,
        centreId: centre._id,
        slotId: newSlot._id,
        commodityId: booking.commodityId,
        expectedQuantity: Number(expectedQuantity ?? booking.expectedQuantity),
        vehicleType: vehicleType || booking.vehicleType,
        vehicleNumber: vehicleNumber || booking.vehicleNumber,
        tokenNumber: null,
        qrCode: null,
        status: "CONFIRMED",
      });

      newSlot.bookedCount = Number(newSlot.bookedCount || 0) + 1;
      if (newSlot.bookedCount >= newSlot.capacity) newSlot.status = "FULL";
      await newSlot.save();

      const populated = await loadBooking(newBooking.bookingId, centre._id);
      return json(true, "Farmer rebooked successfully", 201, { booking: await formatBooking(populated) });
    } else {
      return json(false, "Invalid booking action", 400);
    }

    const updated = await loadBooking(booking.bookingId, centre._id);
    if (!updated) return json(false, "Booking was updated but could not be reloaded", 500);

    return json(true, "Booking updated successfully", 200, { booking: await formatBooking(updated) });
  } catch (error) {
    console.error("PATCH /api/officer/bookings error:", error);
    return json(false, "Failed to update booking", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}