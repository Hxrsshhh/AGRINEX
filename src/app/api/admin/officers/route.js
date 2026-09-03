import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";
import ProcurementCentre from "@/models/ProcurementCentre";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const OFFICER_FIELDS = "name avatar mobile email role designation officerCentre preferredLanguage notifications isActive lastLogin createdAt updatedAt";
const validId = (id) => mongoose.Types.ObjectId.isValid(id);

async function requireAdmin(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return json(false, "Unauthorized", 401);
  if (token.role !== "ADMIN") return json(false, "Admin access required", 403);
  await connectDB();
  return null;
}

export async function GET(req) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const centre = searchParams.get("centre")?.trim();

    const query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = ["name", "mobile", "email", "designation"].map((k) => ({ [k]: regex }));
    }
    if (status === "ACTIVE") query.isActive = true;
    if (status === "INACTIVE") query.isActive = false;
    if (centre && validId(centre)) query.officerCentre = centre;

    const [officers, centres, counts] = await Promise.all([
      Officer.find(query)
        .select(OFFICER_FIELDS)
        .populate({ path: "officerCentre", model: ProcurementCentre, select: "_id centreId name status address" })
        .sort({ createdAt: -1 })
        .lean(),
      ProcurementCentre.find({}).select("_id centreId name status address createdAt updatedAt").sort({ name: 1, createdAt: -1 }).lean(),
      Officer.aggregate([
        { $match: { officerCentre: { $ne: null } } },
        { $group: { _id: "$officerCentre", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    const centresWithCounts = centres.map((c) => ({ ...c, officerCount: countMap.get(String(c._id)) || 0 }));

    return json(true, undefined, 200, {
      count: officers.length,
      officers,
      centres: centresWithCounts,
      centreCount: centresWithCounts.length,
    });
  } catch (err) {
    return json(false, "Failed to fetch officers and procurement centres", 500, { error: err.message });
  }
}

export async function POST(req) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const b = await req.json();
    const cleanName = b.name?.trim();
    const cleanMobile = b.mobile?.trim();
    const cleanEmail = b.email?.trim().toLowerCase();

    if (!cleanName) return json(false, "Officer name is required", 400);
    if (!cleanMobile) return json(false, "Mobile number is required", 400);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) return json(false, "Enter a valid 10-digit Indian mobile number", 400);
    if (!cleanEmail) return json(false, "Email is required", 400);
    if (!b.password) return json(false, "Password is required", 400);
    if (b.password.length < 6) return json(false, "Password must be at least 6 characters", 400);

    const existing = await Officer.findOne({ $or: [{ mobile: cleanMobile }, { email: cleanEmail }] }).select("mobile email");
    if (existing) {
      const field = existing.mobile === cleanMobile ? "mobile number" : "email";
      return json(false, `An officer with this ${field} already exists`, 409);
    }

    let centreId = null;
    if (b.officerCentre) {
      if (!validId(b.officerCentre)) return json(false, "Invalid procurement centre", 400);
      const targetCentre = await ProcurementCentre.findById(b.officerCentre).select("_id status");
      if (!targetCentre) return json(false, "Procurement centre not found", 404);
      if (targetCentre.status !== "ACTIVE") return json(false, "Officer can only be assigned to an active procurement centre", 400);
      centreId = targetCentre._id;
    }

    const hashedPassword = await bcrypt.hash(b.password, 10);
    const officer = await Officer.create({
      name: cleanName,
      mobile: cleanMobile,
      email: cleanEmail,
      password: hashedPassword,
      role: "OFFICER",
      designation: b.designation?.trim() || "CENTRE_MANAGER",
      officerCentre: centreId,
      isActive: b.isActive !== false,
    });

    const populated = await Officer.findById(officer._id)
      .select(OFFICER_FIELDS)
      .populate({ path: "officerCentre", model: ProcurementCentre, select: "centreId name status address.state address.district address.village address.pincode" })
      .lean();

    return json(true, "Officer created successfully", 201, { officer: populated });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] === "mobile" ? "mobile number" : "email";
      return json(false, `An officer with this ${field} already exists`, 409);
    }
    return json(false, "Failed to create officer", 500, { error: err.message });
  }
}