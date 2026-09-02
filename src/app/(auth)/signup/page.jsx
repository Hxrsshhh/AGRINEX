"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout, User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, KeyRound, RefreshCw, Tractor, Check,
} from "lucide-react";
import Link from "next/link";

const stagger = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };

function SignupContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", mobileNumber: "", email: "", password: "", confirmPassword: "", otp: ["", "", "", ""] });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, label: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return { score, label: score <= 2 ? "Weak" : score <= 3 ? "Moderate" : "Strong" };
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "mobileNumber" ? value.replace(/\D/g, "").slice(0, 10) : value }));
    if (errors[name] || errors.general) setErrors((prev) => ({ ...prev, [name]: null, general: null }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
    if (value && index < 3) document.getElementById(`otp-input-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if ((e.key === "Backspace" && !formData.otp[index] && index > 0) || (e.key === "ArrowLeft" && index > 0)) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) document.getElementById(`otp-input-${index + 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newOtp = ["", "", "", ""];
    pasted.split("").forEach((d, i) => (newOtp[i] = d));
    setFormData((prev) => ({ ...prev, otp: newOtp }));
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
    document.getElementById(`otp-input-${Math.min(pasted.length, 3)}`)?.focus();
  };

  const validateStep = (step) => {
    const err = {};
    if (step === 1) {
      const name = formData.fullName.trim();
      const phone = formData.mobileNumber.replace(/\D/g, "");
      const email = formData.email.trim();
      if (!name) err.fullName = "Full name is required";
      else if (name.length < 2) err.fullName = "Enter a valid full name";

      if (!phone) err.mobileNumber = "Mobile number is required";
      else if (!/^[6-9]\d{9}$/.test(phone)) err.mobileNumber = "Enter a valid 10-digit mobile number";

      if (!email) err.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = "Enter a valid email address";

      if (!formData.password) err.password = "Password is required";
      else if (formData.password.length < 6) err.password = "Password must contain at least 6 characters";

      if (!formData.confirmPassword) err.confirmPassword = "Confirm your password";
      else if (formData.password !== formData.confirmPassword) err.confirmPassword = "Passwords do not match";
    }

    if (step === 2 && formData.otp.join("").length !== 4) err.otp = "Enter the 4-digit OTP";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const postAuth = async (url, extra = {}) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, "").trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        ...extra,
      }),
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) throw new Error("Server returned an invalid response");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep) || currentStep !== 1) return;
    setIsLoading(true);
    setErrors({});
    try {
      const data = await postAuth("/api/auth/register/send-otp");
      if (data.otp) console.log("AGRINEX DEVELOPMENT OTP:", data.otp);
      setCurrentStep(2);
      setTimeout(() => document.getElementById("otp-input-0")?.focus(), 100);
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      setErrors({ general: err.message || "Unable to send OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setIsLoading(true);
    setErrors({});
    try {
      const data = await postAuth("/api/auth/register/verify-otp", { otp: formData.otp.join("") });
      console.log("AGRINEX USER CREATED:", data.user);
      setSignupSuccess(true);
      setTimeout(() => (window.location.href = "/onboarding"), 1000);
    } catch (err) {
      console.error("OTP VERIFICATION ERROR:", err);
      setErrors({ otp: err.message || "Unable to verify OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-[#080d12] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 shadow-2xl p-7 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-xl font-black">Account Created</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your mobile number has been verified and your AGRINEX account has been created successfully.
          </p>
          <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Opening Your Profile Setup</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen max-w-[100vw] max-h-screen overflow-hidden bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-162.5 h-87.5 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-25 w-112.5 h-87.5 rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <header className="absolute top-0 left-0 right-0 z-30 h-16 sm:h-17.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 via-teal-500 to-lime-500 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[9px] bg-slate-950 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">
                AGRI<span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-lime-500">NEX</span>
              </div>
              <p className="hidden sm:block text-[9px] text-slate-400">Digital Procurement Network</p>
            </div>
          </Link>
          <Link href="/signin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <span>Already registered?</span>
            <span className="text-emerald-500">Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="absolute inset-0 z-10 flex items-center justify-center px-3 sm:px-4 pt-14 pb-10 overflow-hidden">
        <div className="w-full max-w-130 max-h-full">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative rounded-[28px] bg-white/95 dark:bg-[#0d141b]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-950/10 dark:shadow-black/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-emerald-500 via-teal-500 to-lime-500" />
            <div className="p-4 sm:p-6">
              <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                  <Tractor className="w-3 h-3" /> Farmer Registration
                </div>
                <h1 className="mt-2.5 text-xl sm:text-2xl font-black tracking-tight">Create Your AGRINEX Account</h1>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Create your account to access the AGRINEX procurement network.</p>
              </motion.div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                  <span className={currentStep >= 1 ? "text-emerald-500" : ""}>Account</span>
                  <span className={currentStep >= 2 ? "text-emerald-500" : ""}>Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {[1, 2].map((step) => (
                    <div key={step} className={`h-1 rounded-full transition-all duration-300 ${currentStep >= step ? "bg-linear-to-r from-emerald-500 to-lime-500" : "bg-slate-200 dark:bg-slate-800"}`} />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                {currentStep === 1 && (
                  <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-2.5">
                    <FormField icon={User} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" error={errors.fullName} />
                    <FormField icon={Phone} name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} type="tel" placeholder="Mobile Number" error={errors.mobileNumber} prefix="+91" />
                    <FormField icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" error={errors.email} />

                    <div className="grid grid-cols-2 gap-2">
                      <PasswordField value={formData.password} onChange={handleChange} name="password" placeholder="Password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} error={errors.password} />
                      <PasswordField value={formData.confirmPassword} onChange={handleChange} name="confirmPassword" placeholder="Confirm Password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} error={errors.confirmPassword} />
                    </div>

                    {formData.password && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] font-bold text-slate-400">Password strength</span>
                          <span className="text-[8px] font-black text-emerald-500">{passwordStrength.label}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div key={bar} className={`h-1 flex-1 rounded-full ${bar <= passwordStrength.score ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="mx-auto w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="mt-2.5 text-sm font-black">Verify Your Mobile Number</h3>
                      <p className="mt-1 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Enter the 4-digit OTP sent to<br />
                        <span className="font-bold text-slate-700 dark:text-slate-200">+91 {formData.mobileNumber || "XXXXXXXXXX"}</span>
                      </p>

                      <div className="flex justify-center gap-2 mt-4">
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            className="w-11 h-11 text-center text-sm font-black rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        ))}
                      </div>
                      {errors.otp && <ErrorMessage>{errors.otp}</ErrorMessage>}

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-[8px] text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure mobile verification
                      </div>
                    </div>
                    {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
                  </motion.div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  {currentStep > 1 && (
                    <button type="button" onClick={handleBack} disabled={isLoading} className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-all">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type={currentStep === 1 ? "button" : "submit"}
                    onClick={currentStep === 1 ? handleNext : undefined}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  >
                    {isLoading ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {currentStep === 1 ? "Sending OTP..." : "Creating Account..."}</>
                    ) : currentStep === 1 ? (
                      <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
                    ) : (
                      <><Check className="w-3.5 h-3.5" /> Verify & Create Account</>
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4 text-[8px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Registration</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> OTP Protected</span>
              </div>
            </div>
          </motion.div>

          <div className="mt-3 flex items-center justify-center gap-3 text-[8px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AGRINEX Portal Operational
            </span>
            <span>Smart Procurement • Less Waiting</span>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-20 h-9 flex items-center justify-center px-4 text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-[8px] text-slate-400">
          <span>© 2026 AGRINEX</span>
          <span className="hidden sm:block">•</span>
          <span>SIH 2026 Prototype</span>
          <span className="hidden sm:block">•</span>
          <span>Digital Procurement Network</span>
        </div>
      </footer>
    </div>
  );
}

function FormField({ icon: Icon, name, value, onChange, placeholder, error, type = "text", prefix = null }) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        {prefix && <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">{prefix}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === "fullName" ? "name" : name === "mobileNumber" ? "tel" : name === "email" ? "email" : "off"}
          className={`w-full ${prefix ? "pl-15" : "pl-9"} pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
            error ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
          }`}
        />
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function PasswordField({ name, value, onChange, placeholder, show, onToggle, error }) {
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
            error ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
          }`}
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function ErrorMessage({ children }) {
  return (
    <p className="mt-0.5 flex items-center gap-1 text-[8px] font-medium text-rose-500">
      <AlertCircle className="w-2.5 h-2.5" />
      {children}
    </p>
  );
}

export default function SignupPage() {
  return <SignupContent />;
}