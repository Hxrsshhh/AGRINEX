"use client";

import React, { useState } from "react";
import {
  User,
  MapPin,
  Bell,
  Calendar,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  CreditCard,
  Smartphone,
  MessageSquare,
  ChevronRight,
  Save,
  LogOut,
  Trash2,
  HelpCircle,
  Info,
  CheckCircle2,
  Sprout,
  Clock,
  Languages,
  Lock,
  Eye,
  Navigation,
  Users,
  Scale,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState("");

  const [notifications, setNotifications] = useState({
    booking: true,
    queue: true,
    procurement: true,
    payment: true,
    sms: true,
    push: true,
  });

  const [preferences, setPreferences] = useState({
    preferredCentre: "XYZ Mandi",
    defaultCrop: "Paddy",
    defaultQuantity: "25",
    language: "English",
    timeFormat: "12-hour",
    location: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: false,
    locationSharing: true,
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    showToast("Settings saved successfully");
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4 select-none antialiased">
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl h-full min-h-[92vh] max-h-[94vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">
        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-7 overflow-hidden">
          {/* HEADER BAR */}
          <header className="shrink-0 pb-4 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>AGRINEX Farmer Preferences</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage your procurement, booking, notification and account preferences.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>SAVE CHANGES</span>
            </button>
          </header>

          {/* SCROLLABLE INNER DASHBOARD */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
            {/* ACCOUNT OVERVIEW */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Account Information
                    </h2>
                    <p className="text-[10px] text-slate-400">Your registered AGRINEX farmer profile</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <SettingInfo label="Farmer Name" value="Rajesh Kumar" icon={User} />
                <SettingInfo label="Farmer ID" value="AGR-FRM-10245" icon={ShieldCheck} />
                <SettingInfo label="Mobile Number" value="+91 98XXXXXX42" icon={Smartphone} />
                <SettingInfo label="Registered State" value="Assam" icon={MapPin} />
                <SettingInfo label="Account Status" value="Verified" icon={CheckCircle2} valueClass="text-emerald-500" />
                <SettingInfo label="KYC Status" value="Completed" icon={ShieldCheck} valueClass="text-emerald-500" />
              </div>
            </div>

            {/* TWO-COLUMN CONFIGURATION */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* PROCUREMENT PREFERENCES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                    <Sprout className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Procurement Preferences
                      </h2>
                      <p className="text-[9px] text-slate-400">Configure default delivery values</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <SettingSelect
                      label="Preferred Centre"
                      value={preferences.preferredCentre}
                      icon={MapPin}
                      onChange={(value) => setPreferences({ ...preferences, preferredCentre: value })}
                      options={["XYZ Mandi", "ABC Centre", "DEF Centre"]}
                    />
                    <SettingSelect
                      label="Default Crop"
                      value={preferences.defaultCrop}
                      icon={Sprout}
                      onChange={(value) => setPreferences({ ...preferences, defaultCrop: value })}
                      options={["Paddy", "Wheat", "Maize", "Mustard", "Rice"]}
                    />

                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Default Quantity
                      </label>
                      <div className="relative">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500 pointer-events-none" />
                        <input
                          type="number"
                          value={preferences.defaultQuantity}
                          onChange={(e) => setPreferences({ ...preferences, defaultQuantity: e.target.value })}
                          className="w-full h-9 pl-9 pr-14 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          QTL
                        </span>
                      </div>
                    </div>

                    <SettingSelect
                      label="Time Format"
                      value={preferences.timeFormat}
                      icon={Clock}
                      onChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
                      options={["12-hour", "24-hour"]}
                    />
                  </div>
                </div>
              </div>

              {/* BOOKING & QUEUE BEHAVIOR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Queue & Slot Behavior
                    </h2>
                    <p className="text-[9px] text-slate-400">Telemetry notifications & arrival pacing</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <PreferenceRow
                    icon={Calendar}
                    title="Slot Availability Alerts"
                    description="Notify me when new procurement windows open"
                    enabled={notifications.booking}
                    onToggle={() => toggleNotification("booking")}
                  />
                  <PreferenceRow
                    icon={Users}
                    title="Live Queue Radar"
                    description="Receive alerts when token position updates"
                    enabled={notifications.queue}
                    onToggle={() => toggleNotification("queue")}
                  />
                  <PreferenceRow
                    icon={Navigation}
                    title="Proximity Mandi Suggestions"
                    description="Recommend centres by waiting time and route distance"
                    enabled={preferences.location}
                    onToggle={() => setPreferences({ ...preferences, location: !preferences.location })}
                  />
                </div>
              </div>
            </div>

            {/* NOTIFICATION CHANNELS & AUDIT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Dispatch & Notification Triggers
                  </h3>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-2.5">
                <PreferenceRow
                  icon={Scale}
                  title="Procurement Progress"
                  description="Weighbridge recordings and moisture quality checks"
                  enabled={notifications.procurement}
                  onToggle={() => toggleNotification("procurement")}
                />
                <PreferenceRow
                  icon={CreditCard}
                  title="DBT Payment Clearing"
                  description="Direct Benefit Transfer processing and settlements"
                  enabled={notifications.payment}
                  onToggle={() => toggleNotification("payment")}
                />
                <PreferenceRow
                  icon={Smartphone}
                  title="SMS Gate Alerts"
                  description="Receive pass security tokens via SMS"
                  enabled={notifications.sms}
                  onToggle={() => toggleNotification("sms")}
                />
                <PreferenceRow
                  icon={Bell}
                  title="System Notifications"
                  description="Real-time portal toasts and status banner updates"
                  enabled={notifications.push}
                  onToggle={() => toggleNotification("push")}
                />
              </div>
            </div>

            {/* PAYMENT & SECURITY SPLIT */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* PAYMENT & BANK MASK */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Bank Details & DBT
                      </h3>
                      <p className="text-[9px] text-slate-400">Masked records for subsidy settlements</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <SettingInfo label="Payment Method" value="DBT Settlement" icon={CreditCard} />
                    <SettingInfo label="Masked Account" value="XXXX XXXX 4821" icon={CreditCard} />
                    <SettingInfo label="Bank Status" value="PFMS Active" icon={ShieldCheck} valueClass="text-emerald-500" />
                    <SettingInfo label="Last Transfer" value="₹42,500" icon={CheckCircle2} valueClass="text-emerald-500" />
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[10px]">
                  <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Account details are locked to official Aadhaar payment bridges for security.</span>
                </div>
              </div>

              {/* PRIVACY & ACCESS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Privacy & Credentials
                      </h3>
                      <p className="text-[9px] text-slate-400">Security authorizations and location</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <PreferenceRow
                      icon={Eye}
                      title="Mandi Profile Visibility"
                      description="Allow APMC operators to inspect verification status"
                      enabled={privacy.profileVisibility}
                      onToggle={() => togglePrivacy("profileVisibility")}
                    />
                    <PreferenceRow
                      icon={MapPin}
                      title="Location Telemetry"
                      description="Share geolocation for dynamic gate slot routing"
                      enabled={privacy.locationSharing}
                      onToggle={() => togglePrivacy("locationSharing")}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast("Password update request dispatched")}
                  className="mt-3 w-full h-9 flex items-center justify-between px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 hover:border-emerald-400 transition"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Change Account Password</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* SUPPORT & ACTIONS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Mandi Procurement Helpdesk</h4>
                  <p className="text-[10px] text-slate-400">AGRINEX Support v1.0 • 2026 APMC Harvest Season</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => showToast("Support contact opened")}
                  className="flex-1 sm:flex-initial h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-400 transition"
                >
                  Contact Desk
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Logout dialog displayed")}
                  className="flex-1 sm:flex-initial h-8 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Official Farmer Profile & Preferences • APMC Digital Mandi
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              End-to-End Encrypted
            </span>
          </footer>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function SettingInfo({ label, value, icon: Icon, valueClass = "" }) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-1.5 mb-1 text-slate-400">
        <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[8px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <p className={`text-xs font-black truncate ${valueClass || "text-slate-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

function SettingSelect({ label, value, icon: Icon, options, onChange }) {
  return (
    <div>
      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 appearance-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PreferenceRow({ icon: Icon, title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{title}</p>
          <p className="text-[9px] text-slate-400 truncate">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"
            }`}
        />
      </button>
    </div>
  );
}