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
export const revalidate = 0;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const validId = (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
const OFFICER_POP = "_id name mobile email designation role";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

function getDayRange(value) {
  if (!value) return null;
  const start = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !validId(session.user.id)) return { error: json(false, "Authentication required", 401) };
  if (String(session.user.role).toUpperCase() !== "OFFICER") return { error: json(false, "Officer access required", 403) };

  const officer = await Officer.findOne({ _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true })
    .select("_id name mobile email role designation officerCentre isActive")
    .populate({ path: "officerCentre", model: ProcurementCentre, select: "_id centreId name address contactNumber status dailyCapacity processingCapacity" })
    .lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "Officer is not assigned to a procurement centre", 400) };

  return { officer, centre: officer.officerCentre };
}

function formatSlot(slot) {
  if (!slot) return null;
  const commodity = slot.commodity && typeof slot.commodity === "object" ? slot.commodity : null;
  const centre = slot.centre && typeof slot.centre === "object" ? slot.centre : null;
  const capacity = Number(slot.capacity || 0);
  const bookedCount = Number(slot.bookedCount || 0);

  return {
    _id: slot._id,
    id: slot._id,
    centreId: centre?._id || slot.centre || null,
    centre,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity,
    bookedCount,
    available: Math.max(0, capacity - bookedCount),
    status: slot.status,
    isActive: slot.isActive,
    commodityId: commodity?._id || slot.commodity || null,
    commodity,
    createdBy: slot.createdBy?._id || slot.createdBy || null,
    updatedBy: slot.updatedBy?._id || slot.updatedBy || null,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
}

const populateSlot = (q) =>
  q.populate({ path: "centre", model: ProcurementCentre, select: "_id centreId name address contactNumber status dailyCapacity processingCapacity" })
   .populate({ path: "commodity", model: Commodity, select: "_id name code category unit minimumSupportPrice description isActive" })
   .populate({ path: "createdBy", model: Officer, select: OFFICER_POP })
   .populate({ path: "updatedBy", model: Officer, select: OFFICER_POP })
   .lean();

/* =========================================================
   GET
========================================================= */
export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim();
    const status = searchParams.get("status")?.trim();
    const commodityId = searchParams.get("commodityId")?.trim();
    const activeParam = searchParams.get("isActive")?.trim();

    const query = { centre: centre._id };

    if (date) {
      const range = getDayRange(date);
      if (!range) return json(false, "Invalid date", 400);
      query.date = { $gte: range.start, $lt: range.end };
    }
    if (status) query.status = status;
    if (commodityId) {
      if (!validId(commodityId)) return json(false, "Invalid commodity ID", 400);
      query.commodity = commodityId;
    }
    if (activeParam === "true") query.isActive = true;
    if (activeParam === "false") query.isActive = false;

    const [slots, commodities] = await Promise.all([
      populateSlot(Slot.find(query).sort({ date: 1, startTime: 1 })),
      Commodity.find({ isActive: true }).select("_id name code category unit minimumSupportPrice description isActive").sort({ name: 1 }).lean()
    ]);

    const formattedSlots = slots.map((s) => {
      let st = s.status;
      if (s.isActive && st === "AVAILABLE" && Number(s.bookedCount || 0) >= Number(s.capacity || 0)) st = "FULL";
      return formatSlot({ ...s, status: st });
    });

    const stats = formattedSlots.reduce(
      (acc, s) => {
        acc.totalSlots++;
        if (s.isActive && s.status === "AVAILABLE") acc.availableSlots++;
        if (s.status === "FULL") acc.fullSlots++;
        if (s.status === "CLOSED") acc.closedSlots++;
        if (s.status === "COMPLETED") acc.completedSlots++;
        acc.totalCapacity += s.capacity;
        acc.bookedCount += s.bookedCount;
        acc.availableCapacity += s.available;
        return acc;
      },
      { totalSlots: 0, availableSlots: 0, fullSlots: 0, closedSlots: 0, completedSlots: 0, totalCapacity: 0, bookedCount: 0, availableCapacity: 0 }
    );

    return json(true, "Slots loaded successfully", 200, {
      data: {
        centre: { _id: centre._id, centreId: centre.centreId, name: centre.name, address: centre.address, contactNumber: centre.contactNumber, status: centre.status },
        officer: { _id: officer._id, name: officer.name, mobile: officer.mobile, email: officer.email, role: officer.role, designation: officer.designation },
        date,
        slots: formattedSlots,
        commodities,
        stats
      }
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/slots ERROR:", error);
    return json(false, "Failed to fetch slots", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

/* =========================================================
   POST CREATE
========================================================= */
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
    const commodityId = body.commodityId;

    if (!date || !startTime || !endTime) return json(false, "Date, start time and end time are required", 400);

    const range = getDayRange(date);
    if (!range) return json(false, "Invalid slot date", 400);
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) return json(false, "Time must be in HH:mm format", 400);
    if (startTime >= endTime) return json(false, "End time must be after start time", 400);
    if (!Number.isInteger(capacity) || capacity <= 0) return json(false, "Capacity must be a positive integer", 400);
    if (!commodityId) return json(false, "Commodity is required", 400);
    if (!validId(commodityId)) return json(false, "Invalid commodity ID", 400);

    const [commodity, conflictingSlots] = await Promise.all([
      Commodity.findOne({ _id: commodityId, isActive: true }).select("_id name code").lean(),
      Slot.find({ centre: centre._id, date: { $gte: range.start, $lt: range.end }, isActive: true, startTime: { $lt: endTime }, endTime: { $gt: startTime } })
        .select("_id startTime endTime commodity")
        .lean()
    ]);

    if (!commodity) return json(false, "Commodity not found or inactive", 404);
    if (conflictingSlots.length) return json(false, "A slot already exists during this time period", 409, { conflictingSlots });

    const slot = await Slot.create({
      centre: centre._id,
      commodity: commodity._id,
      date: range.start,
      startTime,
      endTime,
      capacity,
      bookedCount: 0,
      status: "AVAILABLE",
      isActive: true,
      createdBy: officer._id,
      updatedBy: officer._id
    });

    const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
    return json(true, "Slot created successfully", 201, { slot: formatted, data: formatted });
  } catch (error) {
    console.error("POST /api/officer/slots ERROR:", error);
    if (error?.code === 11000) return json(false, "A slot with these details already exists", 409);
    return json(false, "Failed to create slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

/* =========================================================
   PATCH
========================================================= */
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

    const slot = await Slot.findOne({ _id: slotId, centre: centre._id });
    if (!slot) return json(false, "Slot not found in your assigned centre", 404);

    const action = String(body.action || "").trim().toUpperCase();

    // 1. OPEN / REOPEN / UNFULL
    if (["OPEN", "ACTIVATE", "REOPEN", "UNFULL"].includes(action)) {
      if (slot.status === "COMPLETED") return json(false, "Completed slots cannot be reopened", 409);

      slot.isActive = true;
      slot.status = action === "UNFULL" ? "AVAILABLE" : Number(slot.bookedCount || 0) >= Number(slot.capacity || 0) ? "FULL" : "AVAILABLE";
      slot.updatedBy = officer._id;
      await slot.save();

      const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
      return json(true, action === "UNFULL" ? "Slot marked available successfully" : "Slot opened successfully", 200, { slot: formatted, data: formatted });
    }

    // 2. FULL
    if (["FULL", "MARK_FULL"].includes(action)) {
      if (!slot.isActive) return json(false, "Closed slots cannot be marked full", 409);

      slot.status = "FULL";
      slot.isActive = true;
      slot.updatedBy = officer._id;
      await slot.save();

      const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
      return json(true, "Slot marked as full", 200, { slot: formatted, data: formatted });
    }

    // 3. CLOSE
    if (["CLOSE", "DEACTIVATE"].includes(action)) {
      slot.isActive = false;
      slot.status = "CLOSED";
      slot.updatedBy = officer._id;
      await slot.save();

      const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
      return json(true, "Slot closed successfully", 200, { slot: formatted, data: formatted });
    }

    // 4. COMPLETE
    if (action === "COMPLETE") {
      slot.status = "COMPLETED";
      slot.isActive = false;
      slot.updatedBy = officer._id;
      await slot.save();

      const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
      return json(true, "Slot completed successfully", 200, { slot: formatted, data: formatted });
    }

    // 5. UPDATE / RESCHEDULE
    if (["UPDATE", "RESCHEDULE", ""].includes(action)) {
      const updates = {};

      if (body.date !== undefined) {
        if (typeof body.date !== "string" || !body.date.trim()) return json(false, "Invalid date", 400);
        const range = getDayRange(body.date.trim());
        if (!range) return json(false, "Invalid slot date", 400);
        updates.date = range.start;
      }

      if (body.startTime !== undefined) {
        if (typeof body.startTime !== "string" || !timeRegex.test(body.startTime.trim())) return json(false, "Invalid start time", 400);
        updates.startTime = body.startTime.trim();
      }

      if (body.endTime !== undefined) {
        if (typeof body.endTime !== "string" || !timeRegex.test(body.endTime.trim())) return json(false, "Invalid end time", 400);
        updates.endTime = body.endTime.trim();
      }

      if (body.capacity !== undefined) {
        const capacity = Number(body.capacity);
        if (!Number.isInteger(capacity) || capacity <= 0) return json(false, "Capacity must be a positive integer", 400);
        if (capacity < Number(slot.bookedCount || 0)) return json(false, `Capacity cannot be less than current bookings (${slot.bookedCount})`, 409);
        updates.capacity = capacity;
      }

      if (body.commodityId !== undefined) {
        if (!validId(body.commodityId)) return json(false, "Invalid commodity ID", 400);
        const commodity = await Commodity.findOne({ _id: body.commodityId, isActive: true }).select("_id").lean();
        if (!commodity) return json(false, "Commodity not found or inactive", 404);
        updates.commodity = commodity._id;
      }

      const finalStart = updates.startTime || slot.startTime;
      const finalEnd = updates.endTime || slot.endTime;
      if (finalStart >= finalEnd) return json(false, "End time must be after start time", 400);

      if (updates.startTime || updates.endTime || updates.date) {
        const finalDate = updates.date || slot.date;
        const range = getDayRange(new Date(finalDate).toISOString());
        const conflicts = await Slot.find({
          _id: { $ne: slot._id },
          centre: centre._id,
          date: { $gte: range.start, $lt: range.end },
          isActive: true,
          startTime: { $lt: finalEnd },
          endTime: { $gt: finalStart }
        }).select("_id startTime endTime commodity").lean();

        if (conflicts.length) return json(false, "Updated slot time overlaps another slot", 409, { conflictingSlots: conflicts });
      }

      if (!Object.keys(updates).length) return json(false, "No valid slot changes provided", 400);

      Object.assign(slot, updates);
      slot.updatedBy = officer._id;
      await slot.save();

      const formatted = formatSlot(await populateSlot(Slot.findById(slot._id)));
      return json(true, action === "RESCHEDULE" ? "Slot rescheduled successfully" : "Slot updated successfully", 200, { slot: formatted, data: formatted });
    }

    return json(false, `Unsupported slot action: ${action}`, 400);
  } catch (error) {
    console.error("PATCH /api/officer/slots ERROR:", error);
    if (error?.code === 11000) return json(false, "A slot with these details already exists", 409);
    return json(false, "Failed to update slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}

/* =========================================================
   DELETE
========================================================= */
export async function DELETE(request) {
  try {
    await connectDB();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { centre } = auth;
    const params = new URL(request.url).searchParams;
    const slotId = params.get("slotId") || params.get("id");

    if (!slotId || !validId(slotId)) return json(false, "Valid slot ID is required", 400);

    const slot = await Slot.findOne({ _id: slotId, centre: centre._id });
    if (!slot) return json(false, "Slot not found in your assigned centre", 404);
    if (Number(slot.bookedCount || 0) > 0) return json(false, "Cannot delete a slot that has bookings", 409, { bookedCount: slot.bookedCount });

    await Slot.deleteOne({ _id: slot._id, centre: centre._id });
    return json(true, "Slot deleted successfully", 200, { slotId: slot._id });
  } catch (error) {
    console.error("DELETE /api/officer/slots ERROR:", error);
    return json(false, "Failed to delete slot", 500, { error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
}