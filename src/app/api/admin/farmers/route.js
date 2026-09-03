import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";
import Officer from "@/models/Officer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const FARMER_FIELDS = "name avatar mobile email isActive isPhoneVerified farmLocation farm preferredCentre documents verification onboardingCompleted preferredLanguage lastLogin createdAt updatedAt";
const CENTRE_FIELDS = "centreId name status address";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return json(false, "Unauthorized", 401);
    if (token.role !== "ADMIN") return json(false, "Admin access required", 403);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const centre = searchParams.get("centre")?.trim();
    const docStatus = searchParams.get("documentStatus")?.trim();
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = ["name", "mobile", "email", "farmLocation.village", "farmLocation.district", "farmLocation.state"].map((k) => ({ [k]: regex }));
    }

    if (status === "VERIFIED") query["verification.isVerified"] = true;
    if (status === "PENDING") { query["verification.isVerified"] = false; query["verification.rejectionReason"] = null; }
    if (status === "REJECTED") query["verification.rejectionReason"] = { $nin: [null, ""] };
    if (status === "ACTIVE") query.isActive = true;
    if (status === "INACTIVE") query.isActive = false;

    if (centre && mongoose.Types.ObjectId.isValid(centre)) query.preferredCentre = centre;
    if (["PENDING", "VERIFIED", "REJECTED"].includes(docStatus)) query.documents = { $elemMatch: { status: docStatus } };

    const [farmers, centres, allFarmers] = await Promise.all([
      Farmer.find(query)
        .select(FARMER_FIELDS)
        .populate({ path: "preferredCentre", model: ProcurementCentre, select: CENTRE_FIELDS })
        .populate({ path: "verification.verifiedBy", model: Officer, select: "name mobile email designation" })
        .populate({ path: "verification.verifiedAtCentre", model: ProcurementCentre, select: "centreId name address" })
        .sort({ createdAt: -1 })
        .lean(),
      ProcurementCentre.find({}).select(CENTRE_FIELDS).sort({ name: 1 }).lean(),
      Farmer.find({}).select("isActive verification documents").lean(),
    ]);

    const countDocs = (st) => allFarmers.reduce((acc, f) => acc + (f.documents || []).filter((d) => d.status === st).length, 0);

    const statistics = {
      total: allFarmers.length,
      verified: allFarmers.filter((f) => f.verification?.isVerified === true).length,
      rejected: allFarmers.filter((f) => !!f.verification?.rejectionReason).length,
      pending: allFarmers.filter((f) => f.verification?.isVerified !== true && !f.verification?.rejectionReason).length,
      active: allFarmers.filter((f) => f.isActive !== false).length,
      inactive: allFarmers.filter((f) => f.isActive === false).length,
      documentsPending: countDocs("PENDING"),
      documentsVerified: countDocs("VERIFIED"),
      documentsRejected: countDocs("REJECTED"),
    };

    return json(true, undefined, 200, { count: farmers.length, farmers, centres, statistics });
  } catch (err) {
    return json(false, "Failed to fetch farmers", 500, { error: err.message });
  }
}