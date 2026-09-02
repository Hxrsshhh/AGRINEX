import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

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
          message: "Only farmers can upload avatars",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("avatar");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Avatar image is required",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * VALIDATE FILE
     * ---------------------------------------------------------
     */

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and WEBP images are allowed",
        },
        { status: 400 }
      );
    }

    /*
     * 5 MB maximum
     */
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Avatar image must be smaller than 5 MB",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * CONVERT FILE TO BUFFER
     * ---------------------------------------------------------
     */

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    /*
     * ---------------------------------------------------------
     * CLOUDINARY UPLOAD
     * ---------------------------------------------------------
     */

    const uploadResult =
      await new Promise((resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "agrinex/farmers/avatars",
              resource_type: "image",
              transformation: [
                {
                  width: 500,
                  height: 500,
                  crop: "fill",
                  gravity: "face",
                },
              ],
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
     * DELETE OLD AVATAR
     * ---------------------------------------------------------
     */

    if (
      farmer.avatar?.publicId &&
      farmer.avatar.publicId !==
        uploadResult.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          farmer.avatar.publicId,
          {
            resource_type: "image",
          }
        );
      } catch (deleteError) {
        console.error(
          "Failed to delete old avatar:",
          deleteError
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * SAVE AVATAR
     * ---------------------------------------------------------
     */

    farmer.avatar = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await farmer.save();

    return NextResponse.json({
      success: true,
      message: "Avatar updated successfully",
      avatar: farmer.avatar,
    });
  } catch (error) {
    console.error(
      "POST /api/farmer/avatar error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload avatar",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}