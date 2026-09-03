import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import { getOTP, deleteOTP } from "@/lib/otpStore";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

export async function POST(request) {
  try {
    const { fullName, mobileNumber, email, password, confirmPassword, otp } = await request.json();

    if (!otp || !/^\d{4}$/.test(String(otp))) return json(false, "Enter a valid 4-digit OTP", 400);

    const mobile = String(mobileNumber || "").replace(/\D/g, "").trim();
    if (!mobile) return json(false, "Mobile number is required", 400);
    if (!/^[6-9]\d{9}$/.test(mobile)) return json(false, "Enter a valid Indian mobile number", 400);

    const stored = getOTP(mobile);
    if (!stored) return json(false, "OTP expired or not found. Please request a new OTP.", 400);
    if (Date.now() > stored.expiresAt) {
      deleteOTP(mobile);
      return json(false, "OTP has expired. Please request a new OTP.", 400);
    }
    if (String(otp) !== String(stored.otp)) return json(false, "Invalid OTP", 400);
    deleteOTP(mobile);

    const name = String(fullName || "").trim();
    if (!name || name.length < 2) return json(false, !name ? "Full name is required" : "Enter a valid full name", 400);

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return json(false, "Email is required", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return json(false, "Enter a valid email address", 400);

    if (!password) return json(false, "Password is required", 400);
    if (password.length < 6) return json(false, "Password must contain at least 6 characters", 400);
    if (password !== confirmPassword) return json(false, "Passwords do not match", 400);

    await connectDB();

    if (await Farmer.exists({ mobile })) return json(false, "An account with this mobile number already exists", 409);
    if (await Farmer.exists({ email: normalizedEmail })) return json(false, "An account with this email already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const farmer = await Farmer.create({
      name,
      mobile,
      email: normalizedEmail,
      password: hashedPassword,
      role: "FARMER",
      isPhoneVerified: true,
      isActive: true,
      verification: { isVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null, rejectionReason: null },
      onboardingCompleted: false,
      onboardingSkipped: false,
      onboardingCompletedAt: null,
      farmLocation: { state: null, district: null, village: null, pincode: null },
      farm: { landArea: null, landUnit: "Acre", mainCrop: null },
      preferredCentre: null,
      documents: [],
    });

    return json(true, "Account created and mobile number verified successfully", 201, {
      userId: farmer._id.toString(),
      farmer: {
        id: farmer._id.toString(),
        name: farmer.name,
        mobile: farmer.mobile,
        email: farmer.email,
        role: farmer.role,
        isPhoneVerified: farmer.isPhoneVerified,
        verification: {
          isVerified: farmer.verification?.isVerified ?? false,
          verifiedAt: farmer.verification?.verifiedAt ?? null,
        },
        isActive: farmer.isActive,
        onboardingCompleted: farmer.onboardingCompleted,
        onboardingSkipped: farmer.onboardingSkipped,
        preferredCentre: farmer.preferredCentre || null,
      },
    });
  } catch (error) {
    console.error("VERIFY OTP / CREATE FARMER ERROR:", error);
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const msg = field === "mobile" ? "Mobile number is already registered" : field === "email" ? "Email is already registered" : "An account with these details already exists";
      return json(false, msg, 409);
    }
    return json(false, error?.message || "Unable to create farmer account", 500);
  }
}