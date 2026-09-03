"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  FileCheck2,
  RefreshCw,
  AlertCircle,
  Sprout,
  LogOut,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function WaitingVerificationPage() {
  const router = useRouter();

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking your verification status...");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const checkVerification = async () => {
    try {
      const response = await fetch("/api/farmer/verification-status", {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) return router.replace("/signin");
        throw new Error(data.message || "Unable to check verification status");
      }

      if (data?.data?.verification?.isVerified === true) {
        setStatus("verified");
        setMessage("Your account has been verified successfully.");
        return;
      }

      if (data?.data?.verification?.rejectionReason) {
        setStatus("rejected");
        setRejectionReason(data.data.verification.rejectionReason);
        setMessage("Your verification needs attention.");
        return;
      }

      setStatus("waiting");
      setMessage("Your details are being reviewed by the procurement centre officer.");
    } catch (error) {
      console.error("Verification status error:", error);
      setStatus("error");
      setMessage("Unable to check your verification status.");
    }
  };

  useEffect(() => {
    checkVerification();
    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== "verified") return;
    const timer = setTimeout(() => router.replace("/farmer/dashboard"), 1200);
    return () => clearTimeout(timer);
  }, [status, router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 h-full w-screen overflow-hidden bg-[#f6f9f7] font-sans antialiased text-slate-900 dark:bg-[#070c10] dark:text-slate-100 select-none flex flex-col justify-between">
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[130px]" />
        <div className="absolute -bottom-52 -right-32 h-[500px] w-[520px] rounded-full bg-teal-500/[0.08] blur-[140px]" />
        <div className="absolute -left-52 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-lime-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
          style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
      </div>

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-30 h-[68px] border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-[#070c10]/80">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 shadow-lg shadow-emerald-500/20">
              <div className="flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-[9px] bg-[#08100c]">
                <Sprout className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-black tracking-[-0.04em] text-slate-900 dark:text-white">
                  AGRI<span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">NEX</span>
                </span>
                <span className="hidden rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-emerald-500 sm:inline-flex">
                  Secure
                </span>
              </div>
              <p className="mt-1 hidden text-[8px] font-medium tracking-wide text-slate-400 sm:block">Digital Procurement Network</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/40 text-[9px] font-bold transition-all disabled:opacity-50"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="fixed inset-x-0 bottom-9 top-[68px] z-10 flex items-center justify-center overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
        <div className="w-full max-w-[620px]">
          <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/95 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-slate-800 dark:bg-[#0c1319]/95 dark:shadow-[0_25px_80px_rgba(0,0,0,0.40)]">
            <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500" />

            {/* VERIFIED SCREEN */}
            {status === "verified" && (
              <div className="p-7 sm:p-9 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">Verification Successful</h1>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Opening your dashboard...
                </div>
              </div>
            )}

            {/* REJECTED SCREEN */}
            {status === "rejected" && (
              <div className="p-7 sm:p-9 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400 mb-2">
                  <ShieldAlert className="h-3 w-3" /> Needs Attention
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">Verification Incomplete</h1>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your farmer verification could not be completed with the submitted documents.
                </p>

                {rejectionReason && (
                  <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Officer Feedback</p>
                    <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{rejectionReason}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding")}
                    className="w-full flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Update Profile Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full sm:w-auto px-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}

            {/* WAITING / CHECKING STATUS */}
            {status !== "verified" && status !== "rejected" && (
              <div>
                <div className="p-6 sm:p-8 text-center">
                  <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 opacity-75" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                      <Clock3 className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Review In Progress
                  </div>

                  <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    Your Account is Under Review
                  </h1>

                  <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Your registration and submitted documents have been queued for processing. A designated procurement officer will verify your details before activation.
                  </p>

                  <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-emerald-500" />
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      {status === "error" ? "Connection error. Retrying status check..." : "Waiting for procurement centre officer..."}
                    </p>
                  </div>
                </div>

                {/* PROGRESS PIPELINE */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:px-8 dark:border-slate-800/80 dark:bg-slate-900/40">
                  <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-4 text-center sm:text-left">
                    Verification Pipeline
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Account Created</p>
                        <p className="text-[10px] text-slate-400">Mobile credentials and preliminary data confirmed.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Details Submitted</p>
                        <p className="text-[10px] text-slate-400">Farm specifics and records forwarded to your regional centre.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Officer Approval</p>
                        <p className="text-[10px] text-slate-400">Centre officer confirms records against registry.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER NOTE */}
                <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400">
                    You may keep this tab open. Your browser will automatically proceed to your portal upon approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 inset-x-0 z-20 h-9 flex items-center justify-center px-4 text-center border-t border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-[#070c10]/40 backdrop-blur-md">
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