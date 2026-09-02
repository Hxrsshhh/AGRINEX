import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const DOCUMENT_TYPES = {
  identityProof: "IDENTITY_PROOF",
  landRecord: "LAND_RECORD",
  bankProof: "BANK_PROOF",
};

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

    uploadStream.end(buffer);
  });
}

export async function POST(request) {
  try {

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const documentType =
      formData.get("type");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Document file is required",
        },
        { status: 400 }
      );
    }

    if (
      !documentType ||
      !DOCUMENT_TYPES[documentType]
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PDF, JPG and PNG files are allowed",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File size must be under 5 MB",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(
      session.user.id
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const result =
      await uploadToCloudinary(buffer, {
        folder: `agrinex/farmers/${session.user.id}/documents`,

        resource_type: "auto",

        use_filename: true,

        unique_filename: true,

        overwrite: false,

        tags: [
          "agrinex",
          "farmer-document",
          documentType,
        ],
      });

    const documentEnum =
      DOCUMENT_TYPES[documentType];

    const existingDocuments =
      user.documents.filter(
        (document) =>
          document.type === documentEnum
      );

    for (const existing of existingDocuments) {
      if (existing.publicId) {
        try {
          await cloudinary.uploader.destroy(
            existing.publicId,
            {
              resource_type:
                existing.mimeType ===
                "application/pdf"
                  ? "raw"
                  : "image",
            }
          );
        } catch (deleteError) {
          console.warn(
            "Unable to remove previous Cloudinary document:",
            deleteError
          );
        }
      }
    }

    user.documents =
      user.documents.filter(
        (document) =>
          document.type !== documentEnum
      );

    user.documents.push({
      type: documentEnum,

      name: file.name,

      url: result.secure_url,

      publicId: result.public_id,

      mimeType: file.type,

      size: file.size,

      status: "PENDING",

      uploadedAt: new Date(),
    });

    user.onboardingSkipped = false;

    await user.save();

    const savedDocument =
      user.documents[
        user.documents.length - 1
      ];

    return NextResponse.json({
      success: true,

      message:
        "Document uploaded successfully",

      data: {
        id: savedDocument._id,

        type: savedDocument.type,

        name: savedDocument.name,

        url: savedDocument.url,

        publicId: savedDocument.publicId,

        mimeType:
          savedDocument.mimeType,

        size: savedDocument.size,

        status:
          savedDocument.status,

        uploadedAt:
          savedDocument.uploadedAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/onboarding/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to upload document",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const documentId =
      body.documentId;

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(
      session.user.id
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const document =
      user.documents.id(documentId);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found",
        },
        { status: 404 }
      );
    }

    if (document.publicId) {
      try {
        await cloudinary.uploader.destroy(
          document.publicId,
          {
            resource_type:
              document.mimeType ===
              "application/pdf"
                ? "raw"
                : "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary delete error:",
          cloudinaryError
        );
      }
    }

    user.documents.pull(documentId);

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Document removed successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/onboarding/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to remove document",
      },
      { status: 500 }
    );
  }
}