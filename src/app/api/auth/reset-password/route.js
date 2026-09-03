import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";

const json = (success, message, status = 200) =>
  NextResponse.json({ success, message }, { status });

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) return json(false, "All fields are required", 400);
    if (password.length < 6) return json(false, "Password must contain at least 6 characters", 400);
    if (password !== confirmPassword) return json(false, "Passwords do not match", 400);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await connectDB();

    const farmer = await Farmer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!farmer) return json(false, "Reset link is invalid or expired", 400);

    farmer.password = await bcrypt.hash(password, 12);
    farmer.resetPasswordToken = null;
    farmer.resetPasswordExpires = null;
    await farmer.save();

    return json(true, "Password reset successfully");
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return json(false, "Unable to reset password", 500);
  }
}