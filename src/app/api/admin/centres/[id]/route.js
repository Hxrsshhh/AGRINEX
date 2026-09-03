import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import ProcurementCentre from "@/models/ProcurementCentre";
import Officer from "@/models/Officer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const OFFICER_FIELDS = "name mobile email designation isActive";

async function requireAdmin(request) {
  const { getToken } = await import("next-auth/jwt");
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return { error: json(false, "Unauthorized", 401) };
  if (token.role !== "ADMIN") return { error: json(false, "Admin access required", 403) };
  return { token };
}

async function validateRequest(request, params) {
  const auth = await requireAdmin(request);
  if (auth.error) return { error: auth.error };
  const { id } = await params;
  if (!validId(id)) return { error: json(false, "Invalid centre ID", 400) };
  await connectDB();
  return { id };
}

export async function GET(request, { params }) {
  try {
    const { id, error } = await validateRequest(request, params);
    if (error) return error;

    const centre = await ProcurementCentre.findById(id)
      .populate({ path: "managedBy", model: Officer, select: OFFICER_FIELDS })
      .lean();

    return centre ? json(true, undefined, 200, { centre }) : json(false, "Procurement centre not found", 404);
  } catch (err) {
    return json(false, "Failed to fetch centre", 500, { error: err.message });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id, error } = await validateRequest(request, params);
    if (error) return error;

    const body = await request.json();
    const centre = await ProcurementCentre.findById(id);
    if (!centre) return json(false, "Procurement centre not found", 404);

    if (body.status !== undefined) {
      if (!["ACTIVE", "INACTIVE", "TEMPORARILY_CLOSED"].includes(body.status)) {
        return json(false, "Invalid centre status", 400);
      }
      centre.status = body.status;
    }

    if (body.officerId !== undefined) {
      const oldOfficerId = centre.managedBy ? String(centre.managedBy) : null;

      if (!body.officerId) {
        if (oldOfficerId) await Officer.findByIdAndUpdate(oldOfficerId, { $set: { officerCentre: null } });
        centre.managedBy = null;
      } else {
        if (!validId(body.officerId)) return json(false, "Invalid officer ID", 400);
        const officer = await Officer.findById(body.officerId);
        if (!officer) return json(false, "Officer not found", 404);
        if (!officer.isActive) return json(false, "Inactive officer cannot be assigned", 400);
        if (officer.designation !== "CENTRE_MANAGER") return json(false, "Only Centre Manager officers can be assigned", 400);

        await ProcurementCentre.updateOne({ managedBy: officer._id, _id: { $ne: centre._id } }, { $set: { managedBy: null } });
        if (oldOfficerId && oldOfficerId !== String(officer._id)) {
          await Officer.findByIdAndUpdate(oldOfficerId, { $set: { officerCentre: null } });
        }

        officer.officerCentre = centre._id;
        await officer.save();
        centre.managedBy = officer._id;
      }
    }

    if (body.centreId !== undefined) {
      const newCentreId = body.centreId.trim().toUpperCase();
      if (!newCentreId) return json(false, "Centre ID is required", 400);
      if (await ProcurementCentre.exists({ centreId: newCentreId, _id: { $ne: centre._id } })) {
        return json(false, "Centre ID already exists", 409);
      }
      centre.centreId = newCentreId;
    }

    if (body.name !== undefined) centre.name = body.name.trim();
    if (body.address) {
      centre.address = {
        village: body.address.village?.trim() || "",
        district: body.address.district?.trim() || centre.address?.district,
        state: body.address.state?.trim() || centre.address?.state,
        pincode: body.address.pincode?.trim() || centre.address?.pincode,
      };
    }
    if (body.contactNumber !== undefined) centre.contactNumber = body.contactNumber?.trim() || "";
    if (body.email !== undefined) centre.email = body.email?.trim().toLowerCase() || "";
    if (body.operatingHours) {
      centre.operatingHours = {
        openingTime: body.operatingHours.openingTime || "09:00",
        closingTime: body.operatingHours.closingTime || "17:00",
      };
    }
    if (Array.isArray(body.workingDays)) centre.workingDays = body.workingDays;
    if (body.dailyCapacity !== undefined) centre.dailyCapacity = Number(body.dailyCapacity) || 0;
    if (body.processingCapacity !== undefined) centre.processingCapacity = Number(body.processingCapacity) || 1;
    if (body.description !== undefined) centre.description = body.description?.trim() || null;

    await centre.save();
    const updatedCentre = await ProcurementCentre.findById(centre._id)
      .populate({ path: "managedBy", model: Officer, select: OFFICER_FIELDS })
      .lean();

    return json(true, "Procurement centre updated successfully", 200, { centre: updatedCentre });
  } catch (err) {
    return json(false, "Failed to update procurement centre", 500, { error: err.message });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, error } = await validateRequest(request, params);
    if (error) return error;

    const centre = await ProcurementCentre.findById(id);
    if (!centre) return json(false, "Procurement centre not found", 404);

    if (centre.managedBy) {
      await Officer.findByIdAndUpdate(centre.managedBy, { $set: { officerCentre: null } });
    }
    centre.managedBy = null;
    centre.status = "INACTIVE";
    await centre.save();

    return json(true, "Procurement centre deactivated successfully");
  } catch (err) {
    return json(false, "Failed to deactivate procurement centre", 500, { error: err.message });
  }
}