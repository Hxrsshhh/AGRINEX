"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle,
  ShieldCheck, User, ArrowLeft, RefreshCw, Tractor, Building2, KeyRound,
  BadgeCheck, Shield, Wifi, Database, Activity, Info,
} from "lucide-react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

function AuthContent() {
  const [authMode, setAuthMode] = useState("login");
  const [identifierType, setIdentifierType] = useState("phone");
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({ name: "", identifier: "", password: "", confirmPassword: "", rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name] || errors.general) setErrors((prev) => ({ ...prev, [name]: null, general: null }));
  };

  const validate = () => {
    const newErrors = {};
    const id = formData.identifier.trim();
    if (!id) {
      newErrors.identifier = identifierType === "phone" ? "Enter your 10-digit mobile number" : "Enter your email address";
    } else if (identifierType === "phone") {
      if (!/^[6-9]\d{9}$/.test(id.replace(/\D/g, ""))) newErrors.identifier = "Enter a valid Indian mobile number";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
      newErrors.identifier = "Enter a valid email address";
    }

    if (authMode === "login") {
      if (!formData.password) newErrors.password = "Enter your password";
      else if (formData.password.length < 6) newErrors.password = "Password must contain at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "signup") return (window.location.href = "/signup");
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (authMode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: formData.identifier.trim(), identifierType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to process recovery request");
        if (data.resetUrl) console.log("AGRINEX RESET PASSWORD URL:", data.resetUrl);
        return setResetSent(true);
      }

      const result = await signIn("credentials", {
        identifier: formData.identifier.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error === "CredentialsSignin" ? "Invalid mobile/email or password" : result.error);

      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await sessionRes.json();
      if (!sessionRes.ok || !session?.user) throw new Error("Unable to retrieve user session");

      if (!session.user.isActive) {
        await signOut({ redirect: false });
        throw new Error("Your account has been disabled");
      }

      const selectedRole = role === "officer" ? "OFFICER" : role === "admin" ? "ADMIN" : "FARMER";
      if (session.user.role !== selectedRole) {
        await signOut({ redirect: false });
        throw new Error(`This account is registered as ${session.user.role.toLowerCase()}, not ${selectedRole.toLowerCase()}`);
      }

      if (session.user.role === "FARMER") {
        const obRes = await fetch("/api/onboarding", { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const obData = await obRes.json();
        if (!obRes.ok || !obData.success) throw new Error(obData.message || "Unable to check onboarding status");

        const onboardingCompleted = obData.data?.onboardingCompleted === true;
        console.log("AGRINEX LOGIN ONBOARDING:", { userId: session.user.id, onboardingCompleted });

        setAuthSuccess(true);
        setTimeout(() => window.location.replace(onboardingCompleted ? "/farmer/dashboard" : "/onboarding"), 1000);
        return;
      }

      if (session.user.role === "OFFICER" || session.user.role === "ADMIN") {
        setAuthSuccess(true);
        setTimeout(() => window.location.replace(session.user.role === "OFFICER" ? "/officer/dashboard" : "/admin/dashboard"), 1000);
        return;
      }

      await signOut({ redirect: false });
      throw new Error("Invalid account role");
    } catch (err) {
      console.error(`${authMode.toUpperCase()} ERROR:`, err);
      setErrors({ general: err?.message || "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const changeMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setResetSent(false);
    setFormData((prev) => ({ ...prev, identifier: "", password: "", confirmPassword: "" }));
  };

  if (authSuccess) {
    return (
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-[#080d12] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 12 }} className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </motion.div>
          <h2 className="mt-5 text-xl font-black">Access Verified</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Your AGRINEX credentials have been verified successfully.</p>
          <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                Opening {role === "farmer" ? "Farmer Dashboard" : "Centre Dashboard"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen max-w-[100vw] max-h-screen overflow-hidden bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 font-sans select-none">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-162.5 h-90 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-45 -right-25 w-112.5 h-100 rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -left-50 w-[320px] h-80 rounded-full bg-lime-500/5 blur-[110px]" />
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
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight">
                  AGRI<span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-lime-500">NEX</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500">SECURE</span>
              </div>
              <p className="hidden sm:block text-[9px] text-slate-400">Digital Procurement Network</p>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="absolute inset-0 z-10 flex items-center justify-center px-3 sm:px-4 pt-14 pb-10 overflow-hidden">
        <div className="w-full max-w-110 max-h-full">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="rounded-[28px] sm:rounded-[30px] bg-white/95 dark:bg-[#0d141b]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-950/10 dark:shadow-black/50 overflow-hidden relative max-h-[calc(100vh-105px)]">
            <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-emerald-500 via-teal-500 to-lime-500" />
            <div className="p-4 sm:p-6">
              <motion.div variants={fadeUp} className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Secure Procurement Portal
                </div>
                <h1 className="mt-2.5 text-xl sm:text-2xl font-black tracking-tight">
                  {authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Your AGRINEX Account" : "Recover Your Account"}
                </h1>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {authMode === "login" ? "Access your procurement schedule, queue and payment information." : authMode === "signup" ? "Register once to book and manage your procurement visits." : "Enter your registered details to receive recovery instructions."}
                </p>
              </motion.div>

              {authMode !== "forgot" && (
                <>
                  <motion.div variants={fadeUp} className="mt-4">
                    <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      {[
                        { id: "farmer", label: "Farmer", icon: Tractor },
                        { id: "officer", label: "Procurement Officer", icon: Building2 },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setRole(id)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${
                            role === id ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[8px] text-slate-400">
                      <Info className="w-2.5 h-2.5" />
                      {role === "farmer" ? "Book slots, track queues and monitor payments." : "Manage centre schedules, queues and procurement."}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="mt-3">
                    <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {[
                        { id: "phone", label: "Mobile Number", icon: Phone },
                        { id: "email", label: "Email", icon: Mail },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setIdentifierType(id); setErrors({}); }}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                            identifierType === id ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm" : "text-slate-400"
                          }`}
                        >
                          <Icon className="w-3 h-3" /> {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              {authMode === "forgot" && resetSent ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-7 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="mt-4 text-base font-black">Recovery Instructions Sent</h3>
                  <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Instructions have been sent to<br />
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formData.identifier}</span>
                  </p>
                  <button type="button" onClick={() => changeMode("login")} className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Back to Sign In
                  </button>
                </motion.div>
              ) : (
                <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-3 space-y-2.5">
                  {authMode === "signup" && (
                    <FormField icon={User} name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" error={errors.name} />
                  )}

                  <FormField
                    icon={identifierType === "phone" ? Phone : Mail}
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    type={identifierType === "phone" ? "tel" : "email"}
                    placeholder={identifierType === "phone" ? "10-digit mobile number" : "Registered email address"}
                    prefix={identifierType === "phone" ? "+91" : null}
                    error={errors.identifier}
                  />

                  {authMode !== "forgot" && (
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                            errors.password ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

                      {authMode === "signup" && formData.password && (
                        <div className="mt-1.5">
                          <div className="flex items-center justify-between mb-1">
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
                    </div>
                  )}

                  {authMode === "signup" && (
                    <div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                            errors.confirmPassword ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500">
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                    </div>
                  )}

                  {authMode === "login" && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-[9px] text-slate-500">Remember me</span>
                      </label>
                      <button type="button" onClick={() => changeMode("forgot")} className="text-[9px] font-black text-emerald-500 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {errors.general && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.general}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-linear-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying access...</>
                    ) : (
                      <>
                        {authMode === "login" ? "Sign In Securely" : authMode === "signup" ? "Create AGRINEX Account" : "Send Recovery Link"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                {authMode === "login" && (
                  <p className="text-[9px] text-slate-500">
                    Don't have an AGRINEX account?
                    <Link href="/signup" className="ml-1 font-black text-emerald-500 hover:underline">Create Account</Link>
                  </p>
                )}
                {authMode !== "login" && (
                  <p className="text-[9px] text-slate-500">
                    {authMode === "signup" ? "Already registered?" : "Remember your password?"}
                    <button type="button" onClick={() => changeMode("login")} className="ml-1 font-black text-emerald-500 hover:underline">
                      {authMode === "signup" ? "Sign In" : "Back to Sign In"}
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-7 py-3 bg-slate-50/80 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <SecurityBadge icon={Shield} text="Secure" />
                <SecurityBadge icon={BadgeCheck} text="Verified" />
                <SecurityBadge icon={Activity} text="Protected" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 flex items-center justify-center gap-3 text-[8px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Portal Operational
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-2.5 h-2.5" /> Secure Connection
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Database className="w-2.5 h-2.5" /> AGRINEX
            </span>
          </motion.div>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-20 h-9 px-4 flex items-center justify-center text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-[8px] text-slate-400">
          <span>© 2026 AGRINEX</span>
          <span className="hidden sm:block">•</span>
          <span>SIH 2026 Prototype</span>
          <span className="hidden sm:block">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Smart Procurement • Less Waiting
          </span>
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
          className={`w-full ${prefix ? "pl-15" : "pl-9"} pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
            error ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
          }`}
        />
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

function SecurityBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold text-slate-400">
      <Icon className="w-3 h-3 text-emerald-500" />
      {text}
    </div>
  );
}

export default function LoginPage() {
  return <AuthContent />;
}