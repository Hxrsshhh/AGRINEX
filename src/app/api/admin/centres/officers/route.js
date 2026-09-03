import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Officer from "@/models/Officer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return json(false, "Unauthorized", 401);
    if (token.role !== "ADMIN") return json(false, "Admin access required", 403);

    await connectDB();

    const officers = await Officer.find({
      role: "OFFICER",
      designation: "CENTRE_MANAGER",
      isActive: true,
    })
      .select("name mobile email designation officerCentre isActive")
      .sort({ name: 1 })
      .lean();

    return json(true, undefined, 200, { count: officers.length, officers });
  } catch (err) {
    return json(false, "Failed to fetch officers", 500, { error: err.message });
  }
}