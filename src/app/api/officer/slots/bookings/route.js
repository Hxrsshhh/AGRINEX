import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Officer from "@/models/Officer";
import Farmer from "@/models/Farmer";
import Slot from "@/models/Slot";
import Booking from "@/models/Booking";
import ProcurementCentre from "@/models/ProcurementCentre";
import Commodity from "@/models/Commodity";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

export async function GET(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Authentication required", 401);
    if (session.user.role !== "OFFICER") return json(false, "Officer access required", 403);
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) return json(false, "Invalid officer session", 401);

    const officer = await Officer.findOne({
      _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
    }).select("_id name mobile email role designation officerCentre isActive")
      .populate({
        path: "officerCentre",
        model: ProcurementCentre,
        select: "_id centreId name address contactNumber status dailyCapacity processingCapacity",
      }).lean();

    if (!officer) return json(false, "Officer account not found or inactive", 404);
    const centre = officer.officerCentre;
    if (!centre?._id) return json(false, "No procurement centre is assigned to this officer", 400);

    const slotId = new URL(request.url).searchParams.get("slotId")?.trim();
    if (!slotId) return json(false, "slotId is required", 400);
    if (!mongoose.Types.ObjectId.isValid(slotId)) return json(false, "Invalid slotId", 400);

    const slot = await Slot.findOne({ _id: slotId, centreId: centre._id })
      .populate({ path: "commodityId", model: Commodity, select: "_id name code unit category minimumSupportPrice description" })
      .populate({ path: "centreId", model: ProcurementCentre, select: "_id centreId name address contactNumber status" })
      .lean();

    if (!slot) return json(false, "Slot not found for your assigned centre", 404);

    const bookings = await Booking.find({
      slotId: slot._id,
      centreId: centre._id,
      status: { $nin: ["CANCELLED", "EXPIRED"] },
    }).populate({
      path: "farmerId",
      model: Farmer,
      select: "_id name mobile email avatar farmLocation farm verification isPhoneVerified isActive",
    }).populate({
      path: "commodityId",
      model: Commodity,
      select: "_id name code unit category minimumSupportPrice description",
    }).sort({ createdAt: 1 }).lean();

    const formattedBookings = bookings.map((b) => {
      const f = b.farmerId;
      const c = b.commodityId;
      return {
        id: b._id.toString(),
        _id: b._id,
        bookingId: b.bookingId,
        expectedQuantity: b.expectedQuantity ?? 0,
        vehicle: { type: b.vehicleType || null, number: b.vehicleNumber || null },
        vehicleType: b.vehicleType || null,
        vehicleNumber: b.vehicleNumber || null,
        tokenNumber: b.tokenNumber || null,
        qrCode: b.qrCode || null,
        status: b.status,
        farmer: f ? {
          _id: f._id, id: f._id, name: f.name, mobile: f.mobile, email: f.email || null,
          avatar: f.avatar || null, isActive: f.isActive, isPhoneVerified: f.isPhoneVerified,
          farmLocation: f.farmLocation || null, farm: f.farm || null, verification: f.verification || null,
        } : null,
        farmerId: f?._id || null,
        commodity: c ? {
          _id: c._id, id: c._id, name: c.name, code: c.code, unit: c.unit,
          category: c.category, minimumSupportPrice: c.minimumSupportPrice, description: c.description,
        } : null,
        commodityId: c?._id || null,
        slot: {
          _id: slot._id, id: slot._id, date: slot.date, startTime: slot.startTime,
          endTime: slot.endTime, capacity: slot.capacity, bookedCount: slot.bookedCount,
          status: slot.status, isActive: slot.isActive,
        },
        slotId: slot._id,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    const countStatus = (st) => formattedBookings.filter((b) => b.status === st).length;
    const availableCapacity = Math.max(0, Number(slot.capacity || 0) - Number(slot.bookedCount || 0));

    const stats = {
      total: formattedBookings.length,
      confirmed: countStatus("CONFIRMED"),
      checkedIn: countStatus("CHECKED_IN"),
      completed: countStatus("COMPLETED"),
      pending: countStatus("PENDING"),
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
      expired: bookings.filter((b) => b.status === "EXPIRED").length,
    };

    const slotPayload = {
      _id: slot._id, id: slot._id, date: slot.date, startTime: slot.startTime,
      endTime: slot.endTime, capacity: slot.capacity, bookedCount: slot.bookedCount,
      availableCapacity, status: slot.status, isActive: slot.isActive,
      commodity: slot.commodityId ? {
        _id: slot.commodityId._id, name: slot.commodityId.name,
        code: slot.commodityId.code, unit: slot.commodityId.unit,
      } : null,
    };

    return json(true, undefined, 200, {
      data: {
        slot: slotPayload,
        centre: {
          _id: centre._id, centreId: centre.centreId, name: centre.name,
          address: centre.address, contactNumber: centre.contactNumber, status: centre.status,
        },
        bookings: formattedBookings,
        stats: { ...stats, availableCapacity },
      },
      bookings: formattedBookings,
      stats,
    }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("OFFICER SLOT BOOKINGS ERROR:", error);
    return json(false, "Failed to load slot bookings", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}