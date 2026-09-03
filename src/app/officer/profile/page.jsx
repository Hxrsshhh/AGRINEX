"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Building2, Check, Eye, EyeOff, IdCard, KeyRound, Lock, LogOut,
  Mail, MapPin, Pencil, Phone, ShieldCheck, User, X, Loader2,
  AlertCircle, CheckCircle2, Sun, Moon
} from "lucide-react";

const getInitials = (n = "") => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "O";
const fmtDesignation = (d = "") => d ? d.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Officer";
const fmtAddress = (a) => !a ? "No address" : typeof a === "string" ? a : [a.village, a.city, a.district, a.state, a.pincode].filter(Boolean).join(", ");

export default function OfficerProfilePage() {
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }
  const [editForm, setEditForm] = useState({ name: "", mobile: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({});

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/officer/profile", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok || !d?.officer) throw new Error(d?.message || "Profile not found");
      setOfficer(d.officer);
      setEditForm({ name: d.officer.name || "", mobile: d.officer.mobile || "", email: d.officer.email || "" });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); loadProfile(); }, []);

  const saveProfile = async () => {
    const { name, mobile, email } = editForm;
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile.trim()) || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return showToast("Enter a valid name, 10-digit mobile, and email", "error");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/officer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || "Failed to update profile");
      setOfficer(d.officer || { ...officer, ...editForm });
      setEditMode(false);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const { current, newPassword, confirmPassword } = passwords;
    if (!current || newPassword.length < 8) return showToast("New password must be at least 8 chars", "error");
    if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");

    setChangingPw(true);
    try {
      const res = await fetch("/api/officer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword, confirmPassword }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || "Failed to change password");
      setPasswords({ current: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-slate-400 text-xs font-bold">
        <Loader2 size={20} className="animate-spin text-emerald-500" /> Loading Officer Profile...
      </div>
    );
  }

  const centre = officer?.centre;
  const isVerified = officer?.verification?.isVerified === true;
  const curTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="min-h-full w-full select-none p-4 sm:p-6 space-y-4">
      {/* Toast Bar */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-[10px] font-bold text-white shadow-xl border border-white/10">
          {toast.type === "error" ? <AlertCircle size={14} className="text-rose-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-wider">Account Settings</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Officer Profile</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold dark:border-slate-800 dark:bg-slate-900">
            <MapPin size={13} className="text-emerald-500" />
            <span>{centre?.name || "Assigned Centre"}</span>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(curTheme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-500"
            >
              {curTheme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Bio Card (4 Cols) */}
        <aside className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="relative mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {getInitials(officer?.name)}
              {isVerified && <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 text-white border-2 border-white dark:border-slate-900"><Check size={10} /></span>}
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">{officer?.name}</h2>
            <p className="text-[9px] text-slate-400">{fmtDesignation(officer?.designation)}</p>
            <span className="mt-2 inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[8px] font-mono font-bold text-slate-500">
              {String(officer?.id || "").slice(-8).toUpperCase()}
            </span>

            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[9px] space-y-2 text-left">
              {[
                { label: "Account State", val: isVerified ? "Verified" : "Pending", c: "text-emerald-600" },
                { label: "Mobile Sync", val: officer?.verification?.isPhoneVerified ? "Verified" : "Pending", c: "text-emerald-600" },
                { label: "Centre Allocation", val: centre ? "Allocated" : "Unassigned", c: "text-slate-500" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center text-slate-500">
                  <span>{s.label}</span>
                  <span className={`font-bold ${s.c}`}>{s.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-[9px] font-bold text-red-600 hover:bg-red-50 dark:border-red-950/60 dark:hover:bg-red-950/20"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 space-y-1 text-[9px]">
            <span className="font-bold text-slate-400 uppercase text-[7px]">Facility Assignment</span>
            <p className="font-black text-slate-800 dark:text-slate-200">{centre?.name || "Unassigned"}</p>
            <p className="text-slate-400">{fmtAddress(centre?.address)}</p>
          </div>
        </aside>

        {/* Right Column: Edit Profile & Password (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Identity Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User size={14} className="text-blue-500" />
                <h3 className="text-xs font-black">Personal Particulars</h3>
              </div>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">
                  <Pencil size={10} /> Edit
                </button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3 pt-3 text-[9px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className="text-[7px] uppercase font-bold text-slate-400">Full Name</span>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1 h-8 w-full rounded-lg border px-2.5 outline-none font-bold dark:border-slate-700 dark:bg-slate-800" />
                  </label>
                  <label className="block">
                    <span className="text-[7px] uppercase font-bold text-slate-400">Mobile</span>
                    <input type="tel" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="mt-1 h-8 w-full rounded-lg border px-2.5 outline-none font-bold dark:border-slate-700 dark:bg-slate-800" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[7px] uppercase font-bold text-slate-400">Email</span>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 h-8 w-full rounded-lg border px-2.5 outline-none font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveProfile} disabled={saving} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[8px] font-bold text-white hover:bg-emerald-700">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="rounded-lg border px-3 py-1.5 text-[8px] font-bold text-slate-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[9px]">
                {[
                  ["Name", officer?.name],
                  ["Mobile", officer?.mobile],
                  ["Email", officer?.email],
                  ["Role", officer?.role || "OFFICER"],
                  ["Designation", fmtDesignation(officer?.designation)],
                  ["Centre ID", centre?.centreId || "--"],
                  ["Status", centre?.status || "Active"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-[7px] uppercase font-bold text-slate-400">{k}</span>
                    <p className="font-black text-slate-800 dark:text-slate-200 truncate mt-0.5">{v || "--"}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Password Security */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Lock size={14} className="text-purple-500" />
              <h3 className="text-xs font-black">Security Credentials</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 text-[9px]">
              {[
                { k: "current", label: "Current Password" },
                { k: "newPassword", label: "New Password" },
                { k: "confirmPassword", label: "Confirm New" },
              ].map(({ k, label }) => (
                <div key={k}>
                  <span className="text-[7px] uppercase font-bold text-slate-400">{label}</span>
                  <div className="relative mt-1">
                    <input
                      type={showPw[k] ? "text" : "password"}
                      value={passwords[k]}
                      onChange={(e) => setPasswords({ ...passwords, [k]: e.target.value })}
                      placeholder="••••••••"
                      className="h-8 w-full rounded-lg border px-2.5 pr-7 font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [k]: !p[k] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPw[k] ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={changePassword}
                disabled={changingPw}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-[8px] font-bold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {changingPw ? <Loader2 size={11} className="animate-spin" /> : <KeyRound size={11} />}
                {changingPw ? "Updating..." : "Update Password"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}