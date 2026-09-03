import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";
import ProcurementCentre from "@/models/ProcurementCentre";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const OFFICER_FIELDS = "name avatar mobile email role officerCentre preferredLanguage notifications isActive lastLogin createdAt updatedAt";

async function validateRequest(req, params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return { error: json(false, "Unauthorized", 401) };
  if (token.role !== "ADMIN") return { error: json(false, "Admin access required", 403) };

  const { id } = await params;
  if (!validId(id)) return { error: json(false, "Invalid officer ID", 400) };

  await connectDB();
  return { id };
}

export async function GET(req, { params }) {
  try {
    const { id, error } = await validateRequest(req, params);
    if (error) return error;

    const officer = await Officer.findById(id)
      .select(OFFICER_FIELDS)
      .populate({ path: "officerCentre", model: ProcurementCentre, select: "_id centreId name status address" })
      .lean();

    return officer ? json(true, undefined, 200, { officer }) : json(false, "Officer not found", 404);
  } catch (err) {
    return json(false, "Failed to fetch officer", 500, { error: err.message });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id, error } = await validateRequest(req, params);
    if (error) return error;

    const officer = await Officer.findById(id).select("+password");
    if (!officer) return json(false, "Officer not found", 404);

    const b = await req.json();

    if (b.name !== undefined) {
      const cleanName = String(b.name).trim();
      if (!cleanName) return json(false, "Officer name cannot be empty", 400);
      officer.name = cleanName;
    }

    if (b.mobile !== undefined) {
      const cleanMobile = String(b.mobile).replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) return json(false, "Enter a valid 10-digit Indian mobile number", 400);
      if (await Officer.exists({ mobile: cleanMobile, _id: { $ne: officer._id } })) {
        return json(false, "Another officer already uses this mobile number", 409);
      }
      officer.mobile = cleanMobile;
    }

    if (b.email !== undefined) {
      const cleanEmail = String(b.email).trim().toLowerCase();
      if (!cleanEmail) return json(false, "Email cannot be empty", 400);
      if (await Officer.exists({ email: cleanEmail, _id: { $ne: officer._id } })) {
        return json(false, "Another officer already uses this email", 409);
      }
      officer.email = cleanEmail;
    }

    if (b.officerCentre !== undefined) {
      const oldCentreId = officer.officerCentre ? String(officer.officerCentre) : null;

      if (!b.officerCentre) {
        if (oldCentreId) await ProcurementCentre.updateOne({ _id: oldCentreId, managedBy: officer._id }, { $set: { managedBy: null } });
        officer.officerCentre = null;
      } else {
        if (!validId(b.officerCentre)) return json(false, "Invalid procurement centre", 400);
        const newCentre = await ProcurementCentre.findById(b.officerCentre);
        if (!newCentre) return json(false, "Procurement centre not found", 404);
        if (newCentre.status !== "ACTIVE") return json(false, "Cannot assign officer to an inactive procurement centre", 400);

        if (oldCentreId !== String(newCentre._id)) {
          if (oldCentreId) await ProcurementCentre.updateOne({ _id: oldCentreId, managedBy: officer._id }, { $set: { managedBy: null } });
          if (newCentre.managedBy && String(newCentre.managedBy) !== String(officer._id)) {
            return json(false, "This procurement centre is already assigned to another officer", 409);
          }
        }

        newCentre.managedBy = officer._id;
        await newCentre.save();
        officer.officerCentre = newCentre._id;
      }
    }

    if (b.isActive !== undefined) officer.isActive = Boolean(b.isActive);

    if (b.password) {
      if (String(b.password).length < 6) return json(false, "Password must be at least 6 characters", 400);
      officer.password = await bcrypt.hash(String(b.password), 10);
    }

    await officer.save();

    const updatedOfficer = await Officer.findById(officer._id)
      .select(`${OFFICER_FIELDS} designation`)
      .populate({ path: "officerCentre", model: ProcurementCentre, select: "_id centreId name status address managedBy" })
      .lean();

    return json(true, "Officer and procurement centre updated successfully", 200, { officer: updatedOfficer });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return json(false, field === "mobile" ? "Another officer already uses this mobile number" : "Another officer already uses this email", 409);
    }
    return json(false, "Failed to update officer", 500, { error: err.message });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, error } = await validateRequest(req, params);
    if (error) return error;

    const officer = await Officer.findById(id);
    if (!officer) return json(false, "Officer not found", 404);

    officer.isActive = false;
    await officer.save();

    return json(true, "Officer deactivated successfully");
  } catch (err) {
    return json(false, "Failed to deactivate officer", 500, { error: err.message });
  }
}