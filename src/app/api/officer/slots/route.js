import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Officer from "@/models/Officer";
import Slot from "@/models/Slot";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const OFFICER_POP = "_id name mobile email designation";

function getDayRange(d) {
  const start = new Date(d.includes("T") ? d : `${d}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!validId(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({ _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true })
    .populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "Officer is not assigned to a procurement centre", 400) };

  return { officer, centre: officer.officerCentre };
}

const formatSlot = (s) => ({
  _id: s._id, id: s._id,
  centreId: s.centreId?._id || s.centreId || null,
  centre: typeof s.centreId === "object" ? s.centreId : null,
  date: s.date, startTime: s.startTime, endTime: s.endTime,
  capacity: s.capacity ?? 0, bookedCount: s.bookedCount ?? 0,
  available: Math.max(0, (s.capacity ?? 0) - (s.bookedCount ?? 0)),
  status: s.status, isActive: s.isActive,
  commodityId: s.commodityId?._id || s.commodityId || null,
  commodity: typeof s.commodityId === "object" ? s.commodityId : null,
  createdBy: s.createdBy?._id || s.createdBy || null,
  updatedBy: s.updatedBy?._id || s.updatedBy || null,
  createdAt: s.createdAt, updatedAt: s.updatedAt,
});

const populateSlot = (q) => q
  .populate({ path: "centreId", model: ProcurementCentre, select: "centreId name address contactNumber status dailyCapacity processingCapacity" })
  .populate({ path: "commodityId", model: Commodity, select: "name code category unit minimumSupportPrice description" })
  .populate({ path: "createdBy", model: Officer, select: OFFICER_POP })
  .populate({ path: "updatedBy", model: Officer, select: OFFICER_POP })
  .lean();

export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { centre } = auth;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim();
    const status = searchParams.get("status")?.trim();
    const commodityId = searchParams.get("commodityId")?.trim();
    const activeParam = searchParams.get("isActive")?.trim();

    const query = { centreId: centre._id };

    if (date) {
      const range = getDayRange(date);
      if (!range) return json(false, "Invalid date", 400);
      query.date = { $gte: range.start, $lt: range.end };
    }
    if (status) query.status = status;
    if (commodityId) {
      if (!validId(commodityId)) return json(false, "Invalid commodity ID", 400);
      query.commodityId = commodityId;
    }
    if (activeParam === "true") query.isActive = true;
    if (activeParam === "false") query.isActive = false;

    const slots = await populateSlot(Slot.find(query).sort({ date: 1, startTime: 1 }));
    const formatted = slots.map(formatSlot);

    return json(true, undefined, 200, {
      data: formatted, slots: formatted,
      centre: { _id: centre._id, centreId: centre.centreId, name: centre.name, status: centre.status },
      count: slots.length,
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/slots error:", error);
    return json(false, "Failed to fetch slots", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const body = await request.json().catch(() => null);
    if (!body) return json(false, "Invalid request body", 400);

    const date = typeof body.date === "string" ? body.date.trim() : "";
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
    const capacity = Number(body.capacity);
    const { commodityId } = body;

    if (!date || !startTime || !endTime) return json(false, "Date, start time and end time are required", 400);
    const range = getDayRange(date);
    if (!range) return json(false, "Invalid slot date", 400);
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) return json(false, "Time must be in HH:mm format", 400);
    if (startTime >= endTime) return json(false, "End time must be after start time", 400);
    if (!Number.isInteger(capacity) || capacity <= 0) return json(false, "Capacity must be a positive integer", 400);

    if (commodityId) {
      if (!validId(commodityId)) return json(false, "Invalid commodity ID", 400);
      if (!(await Commodity.exists({ _id: commodityId }))) return json(false, "Commodity not found", 404);
    }

    const conflictingSlots = await Slot.find({
      centreId: centre._id, date: { $gte: range.start, $lt: range.end }, isActive: true,
      startTime: { $lt: endTime }, endTime: { $gt: startTime },
    }).select("_id startTime endTime").lean();

    if (conflictingSlots.length) return json(false, "A slot already exists during this time period", 409, { conflictingSlots });

    const slot = await Slot.create({
      centreId: centre._id, date: range.start, startTime, endTime, capacity,
      bookedCount: 0, status: "AVAILABLE", isActive: true, commodityId: commodityId || null,
      createdBy: officer._id, updatedBy: officer._id,
    });

    const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
    return json(true, "Slot created successfully", 201, { slot: formatted, data: formatted });
  } catch (error) {
    console.error("POST /api/officer/slots error:", error);
    if (error?.code === 11000) return json(false, "A slot with these details already exists", 409);
    return json(false, "Failed to create slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const body = await request.json().catch(() => null);
    if (!body) return json(false, "Invalid request body", 400);

    const slotId = body.slotId || body.id;
    if (!slotId || !validId(slotId)) return json(false, "Valid slot ID is required", 400);

    const slot = await Slot.findOne({ _id: slotId, centreId: centre._id });
    if (!slot) return json(false, "Slot not found in your assigned centre", 404);

    if (body.action === "ACTIVATE") {
      if (slot.bookedCount > slot.capacity) return json(false, "Cannot activate a slot whose bookings exceed capacity", 400);
      slot.isActive = true; slot.status = "AVAILABLE"; slot.updatedBy = officer._id;
      await slot.save();
      return json(true, "Slot activated successfully");
    }

    if (body.action === "DEACTIVATE") {
      if (slot.bookedCount > 0) return json(false, "Cannot deactivate a slot that already has bookings", 409);
      slot.isActive = false; slot.status = "INACTIVE"; slot.updatedBy = officer._id;
      await slot.save();
      return json(true, "Slot deactivated successfully");
    }

    const updates = {};
    if (body.startTime !== undefined) {
      if (typeof body.startTime !== "string" || !timeRegex.test(body.startTime)) return json(false, "Invalid start time", 400);
      updates.startTime = body.startTime;
    }
    if (body.endTime !== undefined) {
      if (typeof body.endTime !== "string" || !timeRegex.test(body.endTime)) return json(false, "Invalid end time", 400);
      updates.endTime = body.endTime;
    }

    const finalStart = updates.startTime || slot.startTime;
    const finalEnd = updates.endTime || slot.endTime;
    if (finalStart >= finalEnd) return json(false, "End time must be after start time", 400);

    if (body.capacity !== undefined) {
      const cap = Number(body.capacity);
      if (!Number.isInteger(cap) || cap <= 0) return json(false, "Capacity must be a positive integer", 400);
      if (cap < slot.bookedCount) return json(false, `Capacity cannot be less than current bookings (${slot.bookedCount})`, 409);
      updates.capacity = cap;
    }

    if (body.commodityId !== undefined) {
      if (body.commodityId && !validId(body.commodityId)) return json(false, "Invalid commodity ID", 400);
      if (body.commodityId && !(await Commodity.exists({ _id: body.commodityId }))) return json(false, "Commodity not found", 404);
      updates.commodityId = body.commodityId || null;
    }

    if (updates.startTime || updates.endTime) {
      const range = getDayRange(slot.date.toISOString());
      const conflicts = await Slot.find({
        _id: { $ne: slot._id }, centreId: centre._id, date: { $gte: range.start, $lt: range.end },
        isActive: true, startTime: { $lt: finalEnd }, endTime: { $gt: finalStart },
      }).select("_id startTime endTime").lean();

      if (conflicts.length) return json(false, "Updated slot time overlaps another slot", 409, { conflictingSlots: conflicts });
    }

    if (!Object.keys(updates).length) return json(false, "No valid slot changes provided", 400);

    Object.assign(slot, updates, { updatedBy: officer._id });
    await slot.save();

    const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
    return json(true, "Slot updated successfully", 200, { slot: formatted, data: formatted });
  } catch (error) {
    console.error("PATCH /api/officer/slots error:", error);
    if (error?.code === 11000) return json(false, "A slot with these details already exists", 409);
    return json(false, "Failed to update slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const slotId = new URL(request.url).searchParams.get("slotId") || new URL(request.url).searchParams.get("id");
    if (!slotId || !validId(slotId)) return json(false, "Valid slot ID is required", 400);

    const slot = await Slot.findOne({ _id: slotId, centreId: auth.centre._id });
    if (!slot) return json(false, "Slot not found in your assigned centre", 404);
    if (slot.bookedCount > 0) return json(false, "Cannot delete a slot that has bookings", 409, { bookedCount: slot.bookedCount });

    slot.isActive = false; slot.status = "INACTIVE"; slot.updatedBy = auth.officer._id;
    await slot.save();

    return json(true, "Slot deactivated successfully", 200, { slotId: slot._id });
  } catch (error) {
    console.error("DELETE /api/officer/slots error:", error);
    return json(false, "Failed to delete slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}