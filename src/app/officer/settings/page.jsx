"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, ChevronRight, Globe2, KeyRound, Lock,
  LogOut, ShieldCheck, Smartphone, User, Volume2
} from "lucide-react";

const NOTIFICATIONS = [
  { icon: Smartphone, title: "Push Notifications", desc: "Important AGRINEX alerts and updates" },
  { icon: Bell, title: "New Bookings", desc: "Notifications when a farmer creates a booking" },
  { icon: Volume2, title: "Queue Updates", desc: "Updates when the centre queue changes" },
  { icon: Bell, title: "Procurement Alerts", desc: "Procurement and payment notifications" },
];

export default function OfficerSettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("English");

  return (
    <main className="h-[calc(100dvh-70px)] w-full overflow-hidden bg-slate-100/70 dark:bg-slate-950 p-2.5 sm:p-4 select-none flex flex-col">
      {/* Header */}
      <header className="mb-2.5 flex shrink-0 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-wider">Officer Portal</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Settings</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck size={14} className="text-emerald-500" />
          <div>
            <p className="text-[6px] uppercase font-bold text-slate-400">Account</p>
            <p className="text-[8px] font-black text-slate-700 dark:text-slate-300 leading-none">Officer • Active</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Alerts & Preferences (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <Bell size={14} />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 dark:text-white">Operational Alerts</h2>
                <p className="text-[7px] text-slate-400">Manage dispatch triggers</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[7px] font-black text-emerald-600 dark:bg-emerald-950/40">Alerts</span>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
            {NOTIFICATIONS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 px-4 text-[9px] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                    <item.icon size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.title}</p>
                    <p className="text-[7px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[7px] font-bold text-emerald-600 dark:bg-emerald-950/40">Active</span>
              </div>
            ))}
          </div>

          {/* Language Selection */}
          <div className="border-t border-slate-100 p-3 px-4 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <Globe2 size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Portal Language</p>
                <p className="text-[7px] text-slate-400">Select active locale</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी</option>
            </select>
          </div>
        </section>

        {/* Right Column: Account, Security, Sign Out (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 min-h-0">
          {/* Profile Shortcut */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <button
              onClick={() => router.push("/officer/profile")}
              className="flex w-full items-center justify-between p-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <User size={13} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Officer Profile</p>
                  <p className="text-[7px] text-slate-400">Edit contact details & identity</p>
                </div>
              </div>
              <ChevronRight size={13} className="text-slate-300" />
            </button>
          </div>

          {/* Password Shortcut */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <button
              onClick={() => router.push("/officer/profile#security")}
              className="flex w-full items-center justify-between p-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                  <KeyRound size={13} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Security Credentials</p>
                  <p className="text-[7px] text-slate-400">Update account password</p>
                </div>
              </div>
              <ChevronRight size={13} className="text-slate-300" />
            </button>
          </div>

          {/* Security Chip */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-950 dark:bg-emerald-950/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-xs dark:bg-slate-900">
              <ShieldCheck size={14} />
            </div>
            <div className="text-[8px] text-emerald-800 dark:text-emerald-400">
              <p className="font-black">Direct Portal Protection Active</p>
              <p className="text-emerald-700/70 dark:text-emerald-500 text-[7px]">Protected via active session authentication.</p>
            </div>
          </div>

          {/* Sign Out Action */}
          <div className="rounded-2xl border border-red-100 bg-white shadow-xs dark:border-red-950 dark:bg-slate-900 overflow-hidden mt-auto">
            <button
              onClick={() => router.replace("/login")}
              className="flex w-full items-center justify-between p-3 px-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30">
                  <LogOut size={13} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-red-600 dark:text-red-400">Sign Out</p>
                  <p className="text-[7px] text-slate-400">Terminate current session</p>
                </div>
              </div>
              <ChevronRight size={13} className="text-slate-300 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}