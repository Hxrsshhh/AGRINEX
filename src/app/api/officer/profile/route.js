import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Officer from "@/models/Officer";
import ProcurementCentre from "@/models/ProcurementCentre";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}, headers = {}) =>
  NextResponse.json({ success, message, ...extra }, { status, headers });

const OFFICER_FIELDS = "_id name avatar mobile email role isActive designation officerCentre preferredLanguage notifications lastLogin createdAt updatedAt";
const ALLOWED_LANGUAGES = ["English", "हिन्दी (Hindi)", "ਪੰਜਾਬੀ (Punjabi)", "मराठी (Marathi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)"];

async function authenticateOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Authentication required", 401) };
  if (session.user.role !== "OFFICER") return { error: json(false, "Officer access required", 403) };
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) return { error: json(false, "Invalid officer session", 401) };

  const officer = await Officer.findOne({
    _id: session.user.id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true,
  }).select(OFFICER_FIELDS).populate({ path: "officerCentre", model: ProcurementCentre }).lean();

  if (!officer) return { error: json(false, "Officer account not found or inactive", 404) };
  return { officer };
}

const formatOfficer = (o) => ({
  _id: o._id, id: o._id, name: o.name,
  avatar: o.avatar || { url: null, publicId: null },
  mobile: o.mobile, email: o.email, role: o.role, isActive: o.isActive,
  designation: o.designation, preferredLanguage: o.preferredLanguage || "English",
  notifications: o.notifications || { sms: true, whatsapp: true, push: true },
  lastLogin: o.lastLogin || null, createdAt: o.createdAt, updatedAt: o.updatedAt,
  officerCentre: o.officerCentre || null,
});

export async function GET() {
  try {
    await connectDB();
    const { officer, error } = await authenticateOfficer();
    if (error) return error;

    const formatted = formatOfficer(officer);
    return json(true, undefined, 200, { officer: formatted, data: formatted }, { "Cache-Control": "no-store, max-age=0" });
  } catch (error) {
    console.error("GET /api/officer/profile error:", error);
    return json(false, "Failed to fetch officer profile", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const { officer, error } = await authenticateOfficer();
    if (error) return error;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return json(false, "Invalid request body", 400);
    if (body.mobile !== undefined) return json(false, "Mobile number cannot be changed from the profile endpoint", 400);

    const updates = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string") return json(false, "Name must be a string", 400);
      const name = body.name.trim();
      if (name.length < 2 || name.length > 100) return json(false, "Name must be between 2 and 100 characters", 400);
      updates.name = name;
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string") return json(false, "Email must be a string", 400);
      const email = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(false, "Please enter a valid email address", 400);
      if (email !== officer.email && await Officer.exists({ email, _id: { $ne: officer._id } })) {
        return json(false, "Email is already registered with another officer", 409);
      }
      updates.email = email;
    }

    if (body.avatar !== undefined) {
      if (body.avatar === null) {
        updates.avatar = { url: null, publicId: null };
      } else if (typeof body.avatar !== "object") {
        return json(false, "Invalid avatar data", 400);
      } else {
        updates.avatar = {
          url: typeof body.avatar.url === "string" ? body.avatar.url.trim() : null,
          publicId: typeof body.avatar.publicId === "string" ? body.avatar.publicId.trim() : null,
        };
      }
    }

    if (body.preferredLanguage !== undefined) {
      if (!ALLOWED_LANGUAGES.includes(body.preferredLanguage)) return json(false, "Invalid preferred language", 400);
      updates.preferredLanguage = body.preferredLanguage;
    }

    if (body.notifications !== undefined) {
      if (typeof body.notifications !== "object" || body.notifications === null) return json(false, "Invalid notification settings", 400);
      const cur = officer.notifications || {};
      updates.notifications = {
        sms: body.notifications.sms !== undefined ? Boolean(body.notifications.sms) : Boolean(cur.sms),
        whatsapp: body.notifications.whatsapp !== undefined ? Boolean(body.notifications.whatsapp) : Boolean(cur.whatsapp),
        push: body.notifications.push !== undefined ? Boolean(body.notifications.push) : Boolean(cur.push),
      };
    }

    if (!Object.keys(updates).length) return json(false, "No valid profile fields provided", 400);

    const updated = await Officer.findOneAndUpdate(
      { _id: officer._id, role: "OFFICER", designation: "CENTRE_MANAGER", isActive: true },
      { $set: updates },
      { new: true, runValidators: true }
    ).select(OFFICER_FIELDS).populate({ path: "officerCentre", model: ProcurementCentre }).lean();

    if (!updated) return json(false, "Officer profile could not be updated", 404);

    const formatted = formatOfficer(updated);
    return json(true, "Officer profile updated successfully", 200, { officer: formatted, data: formatted }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("PATCH /api/officer/profile error:", error);
    if (error?.code === 11000) return json(false, "An officer with the same unique information already exists", 409);
    if (error?.name === "ValidationError") {
      return json(false, "Invalid profile data", 400, { details: Object.values(error.errors || {}).map((e) => e.message) });
    }
    return json(false, "Failed to update officer profile", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}