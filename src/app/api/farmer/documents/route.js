import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const ALLOWED_DOC_TYPES = ["IDENTITY_PROOF", "LAND_RECORD", "BANK_PROOF", "OTHER"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

async function getAuthenticatedFarmer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { response: json(false, "Unauthorized", 401) };
  if (session.user.role !== "FARMER") return { response: json(false, "Only farmers can access documents", 403) };

  await connectDB();
  const farmer = await Farmer.findById(session.user.id);
  if (!farmer) return { response: json(false, "Farmer not found", 404) };
  if (!farmer.isActive) return { response: json(false, "Farmer account is inactive", 403) };

  return { farmer };
}

export async function GET() {
  try {
    const { farmer, response } = await getAuthenticatedFarmer();
    if (response) return response;

    const documents = farmer.documents || [];
    return json(true, undefined, 200, { documents, count: documents.length });
  } catch (error) {
    console.error("GET /api/farmer/documents error:", error);
    return json(false, "Failed to fetch documents", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}

export async function POST(request) {
  try {
    const { farmer, response } = await getAuthenticatedFarmer();
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const name = formData.get("name");

    if (!file || typeof file === "string") return json(false, "Document file is required", 400);
    if (!ALLOWED_DOC_TYPES.includes(type)) return json(false, "Invalid document type", 400);
    if (!name || typeof name !== "string" || name.trim().length < 2) return json(false, "Document name is required", 400);
    if (file.size > 10 * 1024 * 1024) return json(false, "Document must be smaller than 10 MB", 400);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) return json(false, "Only PDF, JPG, PNG and WEBP files are allowed", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type === "application/pdf" ? "raw" : "image";

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `agrinex/farmers/${farmer._id}/documents`,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          tags: ["agrinex", "farmer-document", String(farmer._id), type],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(buffer);
    });

    const document = {
      type,
      name: name.trim(),
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType: file.type,
      size: file.size,
      status: "PENDING",
      uploadedAt: new Date(),
    };

    farmer.documents.push(document);
    farmer.onboardingSkipped = false;
    await farmer.save();

    return json(true, "Document uploaded successfully", 201, {
      document: farmer.documents[farmer.documents.length - 1],
    });
  } catch (error) {
    console.error("POST /api/farmer/documents error:", error);
    return json(false, "Failed to upload document", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}

export async function DELETE(request) {
  try {
    const { farmer, response } = await getAuthenticatedFarmer();
    if (response) return response;

    const documentId = new URL(request.url).searchParams.get("id");
    if (!documentId) return json(false, "Document ID is required", 400);

    const document = farmer.documents.id(documentId);
    if (!document) return json(false, "Document not found", 404);
    if (document.status === "VERIFIED") return json(false, "Verified documents cannot be deleted", 403);

    const { publicId, mimeType } = document;
    document.deleteOne();
    await farmer.save();

    if (publicId) {
      cloudinary.uploader
        .destroy(publicId, { resource_type: mimeType === "application/pdf" ? "raw" : "image" })
        .catch((err) => console.error("Cloudinary document deletion failed:", err));
    }

    return json(true, "Document deleted successfully");
  } catch (error) {
    console.error("DELETE /api/farmer/documents error:", error);
    return json(false, "Failed to delete document", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}