import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";
import Officer from "@/models/Officer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

async function validateRequest(req, params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return { error: json(false, "Unauthorized", 401) };
  if (token.role !== "ADMIN") return { error: json(false, "Admin access required", 403) };

  const { id } = await params;
  if (!validId(id)) return { error: json(false, "Invalid farmer ID", 400) };

  await connectDB();
  return { id };
}

export async function GET(req, { params }) {
  try {
    const { id, error } = await validateRequest(req, params);
    if (error) return error;

    const farmer = await Farmer.findById(id)
      .populate({ path: "preferredCentre", model: ProcurementCentre, select: "centreId name status address contactNumber email operatingHours" })
      .populate({ path: "verification.verifiedBy", model: Officer, select: "name mobile email designation" })
      .populate({ path: "verification.verifiedAtCentre", model: ProcurementCentre, select: "centreId name address" })
      .lean();

    return farmer ? json(true, undefined, 200, { farmer }) : json(false, "Farmer not found", 404);
  } catch (err) {
    return json(false, "Failed to fetch farmer", 500, { error: err.message });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id, error } = await validateRequest(req, params);
    if (error) return error;

    const body = await req.json();
    const farmer = await Farmer.findById(id);
    if (!farmer) return json(false, "Farmer not found", 404);

    if (body.documentId !== undefined) {
      if (!validId(body.documentId)) return json(false, "Invalid document ID", 400);
      const doc = farmer.documents.id(body.documentId);
      if (!doc) return json(false, "Document not found", 404);

      const statusMap = { APPROVE: "VERIFIED", REJECT: "REJECTED", PENDING: "PENDING" };
      if (!statusMap[body.documentAction]) return json(false, "Invalid document action", 400);

      doc.status = statusMap[body.documentAction];
      await farmer.save();

      const msgs = { APPROVE: "Document approved successfully", REJECT: "Document rejected successfully", PENDING: "Document reset to pending" };
      return json(true, msgs[body.documentAction], 200, { farmer });
    }

    if (body.action === "VERIFY") {
      const required = ["IDENTITY_PROOF", "LAND_RECORD", "BANK_PROOF"];
      const missingDocuments = required.filter(
        (t) => !farmer.documents.some((d) => d.type === t && d.status === "VERIFIED")
      );
      if (missingDocuments.length) {
        return json(false, "All required documents must be approved before verifying the farmer", 400, { missingDocuments });
      }

      farmer.verification = {
        ...farmer.verification?.toObject?.(),
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: null,
        verifiedAtCentre: farmer.preferredCentre || null,
        rejectionReason: null,
      };
      await farmer.save();
      return json(true, "Farmer verified successfully", 200, { farmer });
    }

    if (body.action === "REJECT") {
      const reason = body.reason?.trim();
      if (!reason) return json(false, "Rejection reason is required", 400);

      farmer.verification = { isVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null, rejectionReason: reason };
      await farmer.save();
      return json(true, "Farmer rejected successfully", 200, { farmer });
    }

    if (body.action === "RESET_REVIEW") {
      farmer.verification = { isVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null, rejectionReason: null };
      await farmer.save();
      return json(true, "Farmer moved back to pending review", 200, { farmer });
    }

    if (body.isActive !== undefined) farmer.isActive = Boolean(body.isActive);

    await farmer.save();
    return json(true, "Farmer updated successfully", 200, { farmer });
  } catch (err) {
    return json(false, "Failed to update farmer", 500, { error: err.message });
  }
}