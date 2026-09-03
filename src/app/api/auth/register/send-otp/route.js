import { NextResponse } from "next/server";
import { saveOTP } from "@/lib/otpStore";

const err = (message) => NextResponse.json({ success: false, message }, { status: 400 });

export async function POST(request) {
  try {
    const { fullName, mobileNumber, email, password, confirmPassword } = await request.json();

    const name = String(fullName || "").trim();
    const mobile = String(mobileNumber || "").replace(/\D/g, "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name) return err("Full name is required");
    if (name.length < 2) return err("Enter a valid full name");
    if (!mobile) return err("Mobile number is required");
    if (!/^[6-9]\d{9}$/.test(mobile)) return err("Enter a valid Indian mobile number");
    if (!normalizedEmail) return err("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return err("Enter a valid email address");
    if (!password) return err("Password is required");
    if (password.length < 6) return err("Password must contain at least 6 characters");
    if (password !== confirmPassword) return err("Passwords do not match");

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    saveOTP(mobile, otp);
    console.log(`AGRINEX OTP for ${mobile}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp,
      registration: { name, mobile, email: normalizedEmail },
    });
  } catch (error) {
    console.error("SEND FARMER OTP ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to send OTP" }, { status: 500 });
  }
}