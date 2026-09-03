import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Officer from "@/models/Officer";
import ProcurementCentre from "@/models/ProcurementCentre";
import Booking from "@/models/Booking";
import Slot from "@/models/Slot";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

function getDateRange(dateString) {
  const d = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({
    _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
  }).select("_id name mobile email role designation officerCentre isActive")
    .populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  if (!officer.officerCentre?._id) return { error: json(false, "No procurement centre is assigned to this officer", 400) };

  return { officer, centre: officer.officerCentre };
}

export async function GET(request) {
  try {
    await dbConnect();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer, centre } = auth;
    const dateString = new URL(request.url).searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const range = getDateRange(dateString);
    if (!range) return json(false, "Invalid date", 400);

    const matchingSlots = await Slot.find({
      centre: centre._id, date: { $gte: range.start, $lte: range.end },
    }).select("_id").lean();

    const slotIds = matchingSlots.map((s) => s._id);
    const bookings = slotIds.length ? await Booking.find({
      centreId: centre._id, slotId: { $in: slotIds }, status: { $nin: ["CANCELLED", "EXPIRED"] },
    }).select("_id bookingId expectedQuantity status slotId createdAt").lean() : [];

    const usedCapacity = bookings.reduce((sum, b) => sum + Number(b.expectedQuantity || 0), 0);
    const dailyCapacity = Number(centre.dailyCapacity || 0);

    return json(true, undefined, 200, {
      data: {
        centre: {
          _id: centre._id, centreId: centre.centreId, name: centre.name,
          address: centre.address || {}, operatingHours: centre.operatingHours || {},
          dailyCapacity, processingCapacity: centre.processingCapacity || 0,
          status: centre.status || "INACTIVE", contactNumber: centre.contactNumber || null,
          email: centre.email || null, managedBy: centre.managedBy || null,
          isActive: centre.isActive ?? true,
        },
        officer: {
          _id: officer._id, name: officer.name, mobile: officer.mobile,
          email: officer.email, role: officer.role, designation: officer.designation,
        },
        capacity: {
          date: dateString, dailyCapacity, usedCapacity,
          availableCapacity: Math.max(0, dailyCapacity - usedCapacity),
          percentage: dailyCapacity > 0 ? Math.min(100, Math.round((usedCapacity / dailyCapacity) * 100)) : 0,
          isFull: dailyCapacity > 0 && usedCapacity >= dailyCapacity,
          bookingCount: bookings.length,
        },
      },
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/centre ERROR:", error);
    return json(false, "Failed to load centre information", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const auth = await authenticateOfficer();
    if (auth.error) return auth.error;

    const { officer } = auth;
    const body = await request.json();
    const status = body?.status;
    const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

    if (!["ACTIVE", "INACTIVE", "TEMPORARILY_CLOSED"].includes(status)) {
      return json(false, "Invalid centre status", 400);
    }
    if (status === "TEMPORARILY_CLOSED" && !reason) {
      return json(false, "A reason is required for temporary closure", 400);
    }
    if (reason && reason.length > 500) {
      return json(false, "Closure reason cannot exceed 500 characters", 400);
    }

    const assignedCentre = await ProcurementCentre.findById(officer.officerCentre);
    if (!assignedCentre) return json(false, "Assigned procurement centre not found", 404);

    assignedCentre.status = status;
    await assignedCentre.save();

    const messages = {
      ACTIVE: "Centre opened successfully",
      INACTIVE: "Centre closed successfully",
      TEMPORARILY_CLOSED: "Centre temporarily closed successfully",
    };

    return json(true, messages[status], 200, {
      data: {
        centre: { _id: assignedCentre._id, centreId: assignedCentre.centreId, name: assignedCentre.name, status: assignedCentre.status },
        officer: { _id: officer._id, name: officer.name, designation: officer.designation },
      },
    });
  } catch (error) {
    console.error("PATCH /api/officer/centre ERROR:", error);
    return json(false, "Failed to update centre status", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}