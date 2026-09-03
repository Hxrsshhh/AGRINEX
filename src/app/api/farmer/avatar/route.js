import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Unauthorized", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can upload avatars", 403);

    await connectDB();
    const farmer = await Farmer.findById(session.user.id);
    if (!farmer) return json(false, "Farmer not found", 404);
    if (!farmer.isActive) return json(false, "Farmer account is inactive", 403);

    const file = (await request.formData()).get("avatar");
    if (!file || typeof file === "string") return json(false, "Avatar image is required", 400);

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return json(false, "Only JPG, PNG and WEBP images are allowed", 400);
    if (file.size > 5 * 1024 * 1024) return json(false, "Avatar image must be smaller than 5 MB", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "agrinex/farmers/avatars",
          resource_type: "image",
          transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    if (farmer.avatar?.publicId && farmer.avatar.publicId !== result.public_id) {
      cloudinary.uploader.destroy(farmer.avatar.publicId, { resource_type: "image" }).catch((e) =>
        console.error("Failed to delete old farmer avatar:", e)
      );
    }

    farmer.avatar = { url: result.secure_url, publicId: result.public_id };
    await farmer.save();

    return json(true, "Avatar updated successfully", 200, { avatar: farmer.avatar });
  } catch (error) {
    console.error("POST /api/farmer/avatar error:", error);
    return json(false, "Failed to upload avatar", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}