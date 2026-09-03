import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const DOCUMENT_TYPES = {
  identityProof: "IDENTITY_PROOF",
  landRecord: "LAND_RECORD",
  bankProof: "BANK_PROOF",
};

const destroyCloudinary = (publicId, mimeType) =>
  publicId && cloudinary.uploader.destroy(publicId, {
    resource_type: mimeType === "application/pdf" ? "raw" : "image",
  }).catch((err) => console.warn("Cloudinary document deletion failed:", err));

async function getAuthFarmer(actionDesc) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: json(false, "Unauthorized", 401) };
  if (session.user.role !== "FARMER") return { error: json(false, `Only farmers can ${actionDesc}`, 403) };

  await connectDB();
  const farmer = await Farmer.findById(session.user.id);
  if (!farmer) return { error: json(false, "Farmer not found", 404) };

  return { session, farmer };
}

export async function POST(request) {
  try {
    const { session, farmer, error } = await getAuthFarmer("upload farmer documents");
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("type");

    if (!file || typeof file === "string") return json(false, "Document file is required", 400);
    const documentEnum = DOCUMENT_TYPES[documentType];
    if (!documentEnum) return json(false, "Invalid document type", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return json(false, "Only PDF, JPG and PNG files are allowed", 400);
    if (file.size > MAX_FILE_SIZE) return json(false, "File size must be under 5 MB", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    await Promise.all(
      farmer.documents
        .filter((d) => d.type === documentEnum && d.publicId)
        .map((d) => destroyCloudinary(d.publicId, d.mimeType))
    );

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `agrinex/farmers/${session.user.id}/documents`,
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          tags: ["agrinex", "farmer-document", documentEnum],
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    farmer.documents = farmer.documents.filter((d) => d.type !== documentEnum);
    farmer.documents.push({
      type: documentEnum,
      name: file.name,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: file.type,
      size: file.size,
      status: "PENDING",
      uploadedAt: new Date(),
    });
    farmer.onboardingSkipped = false;
    await farmer.save();

    const saved = farmer.documents[farmer.documents.length - 1];
    return json(true, "Document uploaded successfully", 200, {
      data: {
        id: saved._id,
        type: saved.type,
        name: saved.name,
        url: saved.url,
        publicId: saved.publicId,
        mimeType: saved.mimeType,
        size: saved.size,
        status: saved.status,
        uploadedAt: saved.uploadedAt,
      },
    });
  } catch (err) {
    console.error("POST /api/onboarding/documents error:", err);
    return json(false, err?.message || "Failed to upload document", 500);
  }
}

export async function DELETE(request) {
  try {
    const { farmer, error } = await getAuthFarmer("remove farmer documents");
    if (error) return error;

    const { documentId } = await request.json().catch(() => ({}));
    if (!documentId) return json(false, "Document ID is required", 400);

    const doc = farmer.documents.id(documentId);
    if (!doc) return json(false, "Document not found", 404);

    await destroyCloudinary(doc.publicId, doc.mimeType);
    farmer.documents.pull(documentId);
    await farmer.save();

    return json(true, "Document removed successfully");
  } catch (err) {
    console.error("DELETE /api/onboarding/documents error:", err);
    return json(false, err?.message || "Failed to remove document", 500);
  }
}