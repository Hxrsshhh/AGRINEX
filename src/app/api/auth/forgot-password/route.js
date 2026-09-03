import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST(request) {
  try {
    const { identifier, identifierType } = await request.json();

    if (!identifier) return json(false, "Mobile number or email is required", 400);
    if (!["phone", "email"].includes(identifierType)) return json(false, "Invalid identifier type", 400);

    await connectDB();

    const normalized = identifierType === "phone" ? identifier.replace(/\D/g, "") : identifier.trim().toLowerCase();
    const query = identifierType === "phone" ? { mobile: normalized } : { email: normalized };

    const farmer = await Farmer.findOne(query).select("+resetPasswordToken +resetPasswordExpires");
    if (!farmer) return json(true, "If the account exists, recovery instructions have been generated.");

    const token = crypto.randomBytes(32).toString("hex");
    farmer.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    farmer.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await farmer.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log("RESET PASSWORD URL:", resetUrl);

    return json(true, "Recovery instructions generated successfully", 200, { resetUrl });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return json(false, "Unable to process recovery request", 500);
  }
}