import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import Booking from "@/models/Booking";
import Queue from "@/models/Queue";
import Slot from "@/models/Slot";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

async function getAuthFarmer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "FARMER") return { error: json(false, "Only farmers can access procurement bookings", 403) };
  if (!validId(session.user.id)) return { error: json(false, "Invalid farmer session", 401) };

  await connectDB();
  const farmer = await Farmer.findOne({ _id: session.user.id, role: "FARMER", isActive: true }).lean();
  if (!farmer) return { error: json(false, "Farmer account not found or inactive", 404) };

  return { farmer };
}

async function generateUniqueId(model, field, prefix, bytesOrMax, isInt = false) {
  let val;
  do {
    val = isInt
      ? `${prefix}${crypto.randomInt(100000, 999999)}`
      : `${prefix}${crypto.randomBytes(bytesOrMax).toString("hex").toUpperCase()}`;
  } while (await model.exists({ [field]: val }));
  return val;
}

export async function POST(request) {
  try {
    const { farmer, error } = await getAuthFarmer();
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const { centreId, slotId, commodityId, expectedQuantity, vehicleType, vehicleNumber } = body;

    if (!centreId || !slotId || !commodityId || expectedQuantity === undefined || expectedQuantity === null || !vehicleType || !vehicleNumber) {
      return json(false, "centreId, slotId, commodityId, expectedQuantity, vehicleType and vehicleNumber are required", 400);
    }
    if (!validId(centreId)) return json(false, "Invalid centreId", 400);
    if (!validId(slotId)) return json(false, "Invalid slotId", 400);
    if (!validId(commodityId)) return json(false, "Invalid commodityId", 400);

    const quantity = Number(expectedQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return json(false, "Expected quantity must be greater than zero", 400);

    const allowedVehicles = ["TRACTOR", "TRACTOR_TROLLEY", "MINI_TRUCK", "TRUCK"];
    const normVehicleType = String(vehicleType).trim().toUpperCase();
    if (!allowedVehicles.includes(normVehicleType)) return json(false, "Invalid vehicle type", 400);

    const normVehicleNumber = String(vehicleNumber).trim().toUpperCase();
    if (!normVehicleNumber) return json(false, "Vehicle number is required", 400);

    const centre = await ProcurementCentre.findOne({ _id: centreId, status: "ACTIVE" }).lean();
    if (!centre) return json(false, "Procurement centre is not available", 404);

    if (farmer.preferredCentre && String(farmer.preferredCentre) !== String(centreId)) {
      return json(false, "You can only book at your preferred procurement centre", 403);
    }

    const commodity = await Commodity.findOne({ _id: commodityId, isActive: true }).lean();
    if (!commodity) return json(false, "Commodity is not available for procurement", 404);

    const slot = await Slot.findOne({ _id: slotId, centre: centreId, commodity: commodityId, isActive: true });
    if (!slot) return json(false, "Selected slot does not exist or is not available for this centre/commodity", 404);
    if (["CLOSED", "COMPLETED"].includes(slot.status)) return json(false, "Selected slot is closed", 409);

    if (Number(slot.bookedCount || 0) >= Number(slot.capacity || 0)) {
      if (slot.status !== "FULL") {
        slot.status = "FULL";
        await slot.save();
      }
      return json(false, "Selected slot is full", 409);
    }

    const existingBooking = await Booking.findOne({ farmerId: farmer._id, slotId, status: { $in: ["PENDING", "CONFIRMED"] } }).lean();
    if (existingBooking) {
      return json(false, "You already have a booking for this slot", 409, {
        data: { bookingId: existingBooking.bookingId, tokenNumber: existingBooking.tokenNumber },
      });
    }

    const bookingId = await generateUniqueId(Booking, "bookingId", "AGR-BKG-", 4);
    const tokenNumber = await generateUniqueId(Booking, "tokenNumber", "AGR-TK-", null, true);

    const booking = await Booking.create({
      bookingId, farmerId: farmer._id, centreId, slotId, commodityId,
      expectedQuantity: quantity, tokenNumber, status: "CONFIRMED",
      vehicleType: normVehicleType, vehicleNumber: normVehicleNumber,
    });

    slot.bookedCount = Number(slot.bookedCount || 0) + 1;
    if (slot.bookedCount >= slot.capacity) slot.status = "FULL";
    await slot.save();

    const queueDate = new Date(slot.date);
    queueDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queueDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const queueCount = await Queue.countDocuments({ centreId, queueDate: { $gte: queueDate, $lt: nextDay } });
    const queue = await Queue.create({
      bookingId: booking._id, farmerId: farmer._id, centreId, tokenNumber,
      queueDate, position: queueCount + 1, status: "WAITING", estimatedWaitMin: Math.max(0, queueCount) * 10,
    });

    return json(true, "Procurement booking confirmed", 201, {
      data: {
        bookingId: booking.bookingId, bookingMongoId: booking._id, tokenNumber: booking.tokenNumber,
        queueId: queue._id, queuePosition: queue.position, estimatedWaitMin: queue.estimatedWaitMin,
        status: booking.status,
        farmer: { id: farmer._id, name: farmer.name, mobile: farmer.mobile },
        centre: { id: centre._id, centreId: centre.centreId, name: centre.name, address: centre.address },
        commodity: { id: commodity._id, name: commodity.name, code: commodity.code, unit: commodity.unit },
        slot: { id: slot._id, date: slot.date, startTime: slot.startTime, endTime: slot.endTime },
        quantity,
        vehicle: { type: normVehicleType, number: normVehicleNumber },
      },
    });
  } catch (err) {
    console.error("POST /api/procurement/bookings error:", err);
    if (err?.code === 11000) return json(false, "A booking with this information already exists. Please try again.", 409);
    return json(false, "Failed to create procurement booking", 500, {
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
}

export async function GET() {
  try {
    const { farmer, error } = await getAuthFarmer();
    if (error) return error;

    const bookings = await Booking.find({ farmerId: farmer._id })
      .populate({ path: "centreId", select: "centreId name address contactNumber email operatingHours status isActive" })
      .populate({ path: "commodityId", select: "name code description category unit minimumSupportPrice" })
      .populate({ path: "slotId", select: "date startTime endTime capacity bookedCount status isActive" })
      .sort({ createdAt: -1 })
      .lean();

    const bookingIds = bookings.map((b) => b._id);
    const queues = bookingIds.length
      ? await Queue.find({ bookingId: { $in: bookingIds } })
          .select("bookingId tokenNumber queueDate position status estimatedWaitMin arrivalTime calledAt processingTime completionTime")
          .sort({ position: 1 })
          .lean()
      : [];

    const queueMap = new Map(queues.map((q) => [String(q.bookingId), q]));

    const formatted = bookings.map((b) => {
      const q = queueMap.get(String(b._id)) || null;
      return {
        ...b,
        centre: b.centreId || null,
        commodity: b.commodityId || null,
        slot: b.slotId || null,
        date: b.slotId?.date || null,
        queue: q,
        queuePosition: q?.position ?? null,
        estimatedWaitMin: q?.estimatedWaitMin ?? 0,
        vehicle: { type: b.vehicleType || null, number: b.vehicleNumber || null },
      };
    });

    return json(true, undefined, 200, { count: formatted.length, bookings: formatted, data: formatted });
  } catch (err) {
    console.error("GET /api/procurement/bookings error:", err);
    return json(false, "Failed to fetch procurement bookings", 500, {
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
}