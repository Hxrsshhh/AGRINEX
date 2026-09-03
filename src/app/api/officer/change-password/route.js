import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Authentication required", 401);
    if (session.user.role !== "OFFICER") return json(false, "Officer access required", 403);
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) return json(false, "Invalid officer session", 401);

    const { currentPassword = "", newPassword = "", confirmPassword = "" } = await request.json().catch(() => ({}));

    if (!currentPassword || !newPassword || !confirmPassword) {
      return json(false, "Current password, new password and confirm password are required", 400);
    }
    if (newPassword.length < 8) return json(false, "New password must contain at least 8 characters", 400);
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return json(false, "Password must contain at least one uppercase letter, one lowercase letter and one number", 400);
    }
    if (newPassword !== confirmPassword) return json(false, "New passwords do not match", 400);
    if (currentPassword === newPassword) return json(false, "New password must be different from current password", 400);

    const officer = await Officer.findOne({
      _id: session.user.id,
      role: "OFFICER",
      designation: "CENTRE_MANAGER",
    }).select("+password");

    if (!officer) return json(false, "Officer account not found", 404);
    if (!officer.isActive) return json(false, "Your officer account is inactive", 403);
    if (!officer.password) return json(false, "Password login is not configured for this officer account", 400);

    const passwordMatches = await bcrypt.compare(currentPassword, officer.password);
    if (!passwordMatches) return json(false, "Current password is incorrect", 401);

    officer.password = await bcrypt.hash(newPassword, 12);
    await officer.save();

    return json(true, "Password changed successfully", 200);
  } catch (error) {
    console.error("OFFICER CHANGE PASSWORD ERROR:", error);
    return json(false, "Failed to change password", 500, {
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}