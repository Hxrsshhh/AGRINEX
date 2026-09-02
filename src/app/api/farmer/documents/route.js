import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/*
 * ---------------------------------------------------------
 * GET DOCUMENTS
 * ---------------------------------------------------------
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const farmer = await User.findById(
      session.user.id
    )
      .select("documents")
      .lean();

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: farmer.documents || [],
    });
  } catch (error) {
    console.error(
      "GET /api/farmer/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}

/*
 * ---------------------------------------------------------
 * POST DOCUMENT
 * ---------------------------------------------------------
 */

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const farmer = await User.findById(
      session.user.id
    );

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    if (farmer.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can upload documents",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const type = formData.get("type");
    const name = formData.get("name");

    /*
     * ---------------------------------------------------------
     * VALIDATE
     * ---------------------------------------------------------
     */

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Document file is required",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "IDENTITY_PROOF",
      "LAND_RECORD",
      "BANK_PROOF",
      "OTHER",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type",
        },
        { status: 400 }
      );
    }

    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Document name is required",
        },
        { status: 400 }
      );
    }

    /*
     * 10 MB maximum
     */
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document must be smaller than 10 MB",
        },
        { status: 400 }
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PDF, JPG, PNG and WEBP files are allowed",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * UPLOAD TO CLOUDINARY
     * ---------------------------------------------------------
     */

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const resourceType =
      file.type === "application/pdf"
        ? "raw"
        : "image";

    const uploadResult =
      await new Promise((resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "agrinex/farmers/documents",
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        stream.end(buffer);
      });

    /*
     * ---------------------------------------------------------
     * SAVE DOCUMENT
     * ---------------------------------------------------------
     */

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

    await farmer.save();

    /*
     * Return the newly created document
     */
    const savedDocument =
      farmer.documents[
        farmer.documents.length - 1
      ];

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        document: savedDocument,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/farmer/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload document",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/*
 * ---------------------------------------------------------
 * DELETE DOCUMENT
 * ---------------------------------------------------------
 */

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const documentId =
      searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Document ID is required",
        },
        { status: 400 }
      );
    }

    const farmer = await User.findById(
      session.user.id
    );

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    const document =
      farmer.documents.id(documentId);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    /*
     * Verified documents should not be deleted
     * by the farmer.
     */

    if (document.status === "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verified documents cannot be deleted",
        },
        { status: 403 }
      );
    }

    /*
     * Keep Cloudinary information before
     * removing the MongoDB subdocument.
     */

    const publicId = document.publicId;

    const resourceType =
      document.mimeType ===
      "application/pdf"
        ? "raw"
        : "image";

    /*
     * Remove from MongoDB
     */
    document.deleteOne();

    await farmer.save();

    /*
     * Remove from Cloudinary
     */
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: resourceType,
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary document deletion failed:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/farmer/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete document",
      },
      { status: 500 }
    );
  }
}