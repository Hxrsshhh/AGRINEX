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
  Volume2,
  Navigation,
  Users,
  Scale
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* ========================================================= */}
      {/* TOAST                                                      */}
      {/* ========================================================= */}

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />

          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT                                               */}
      {/* ========================================================= */}

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ======================================================= */}
        {/* PAGE HEADER                                             */}
        {/* ======================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-1.5">
              <Sprout className="w-3 h-3 text-emerald-500" />

              <span>AGRINEX Farmer Preferences</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Settings
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your procurement, booking, notification and account
              preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* ======================================================= */}
        {/* ACCOUNT INFORMATION                                     */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Account Information
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Your registered AGRINEX farmer account
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SettingInfo
                label="Farmer Name"
                value="Rajesh Kumar"
                icon={User}
              />

              <SettingInfo
                label="Farmer ID"
                value="AGR-FRM-10245"
                icon={ShieldCheck}
              />

              <SettingInfo
                label="Mobile Number"
                value="+91 98XXXXXX42"
                icon={Smartphone}
              />

              <SettingInfo
                label="Registered State"
                value="Assam"
                icon={MapPin}
              />

              <SettingInfo
                label="Account Status"
                value="Verified"
                icon={CheckCircle2}
                valueClass="text-emerald-500"
              />

              <SettingInfo
                label="KYC Status"
                value="Completed"
                icon={ShieldCheck}
                valueClass="text-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* PROCUREMENT PREFERENCES                                 */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Procurement Preferences
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your default procurement details
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Preferred Centre */}

              <SettingSelect
                label="Preferred Procurement Centre"
                value={preferences.preferredCentre}
                icon={MapPin}
                onChange={(value) =>
                  setPreferences({
                    ...preferences,
                    preferredCentre: value,
                  })
                }
                options={["XYZ Mandi", "ABC Centre", "DEF Centre"]}
              />

              {/* Default Crop */}

              <SettingSelect
                label="Default Crop"
                value={preferences.defaultCrop}
                icon={Sprout}
                onChange={(value) =>
                  setPreferences({
                    ...preferences,
                    defaultCrop: value,
                  })
                }
                options={["Paddy", "Wheat", "Maize", "Mustard", "Rice"]}
              />

              {/* Default Quantity */}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Default Quantity
                </label>

                <div className="relative">
                  <ScaleIcon />

                  <input
                    type="number"
                    value={preferences.defaultQuantity}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultQuantity: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-20 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    QUINTALS
                  </span>
                </div>
              </div>

              {/* Time Format */}

              <SettingSelect
                label="Time Format"
                value={preferences.timeFormat}
                icon={Clock}
                onChange={(value) =>
                  setPreferences({
                    ...preferences,
                    timeFormat: value,
                  })
                }
                options={["12-hour", "24-hour"]}
              />
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* BOOKING PREFERENCES                                    */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={Calendar}
              title="Booking & Queue Preferences"
              description="Control how AGRINEX handles your procurement appointments"
            />
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <PreferenceRow
              icon={Calendar}
              title="Slot Availability Alerts"
              description="Notify me when new procurement slots become available"
              enabled={notifications.booking}
              onToggle={() => toggleNotification("booking")}
            />

            <PreferenceRow
              icon={Users}
              title="Queue Position Updates"
              description="Receive updates when your queue position changes"
              enabled={notifications.queue}
              onToggle={() => toggleNotification("queue")}
            />

            <PreferenceRow
              icon={Clock}
              title="Appointment Reminder"
              description="Remind me before my scheduled procurement slot"
              enabled={true}
              onToggle={() => {}}
            />

            <PreferenceRow
              icon={Navigation}
              title="Preferred Centre Suggestions"
              description="Suggest centres based on queue time and distance"
              enabled={preferences.location}
              onToggle={() =>
                setPreferences({
                  ...preferences,
                  location: !preferences.location,
                })
              }
            />
          </div>
        </section>

        {/* ======================================================= */}
        {/* NOTIFICATIONS                                           */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={Bell}
              title="Notifications"
              description="Choose which procurement updates you want to receive"
            />
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <PreferenceRow
              icon={Calendar}
              title="Booking Updates"
              description="Booking confirmations, changes and cancellations"
              enabled={notifications.booking}
              onToggle={() => toggleNotification("booking")}
            />

            <PreferenceRow
              icon={Users}
              title="Queue Notifications"
              description="Token movement and estimated waiting time"
              enabled={notifications.queue}
              onToggle={() => toggleNotification("queue")}
            />

            <PreferenceRow
              icon={Scale}
              title="Procurement Updates"
              description="Weighing, quality verification and procurement status"
              enabled={notifications.procurement}
              onToggle={() => toggleNotification("procurement")}
            />

            <PreferenceRow
              icon={CreditCard}
              title="Payment Notifications"
              description="Payment processing and DBT settlement updates"
              enabled={notifications.payment}
              onToggle={() => toggleNotification("payment")}
            />

            <PreferenceRow
              icon={Smartphone}
              title="SMS Notifications"
              description="Receive important alerts through registered mobile number"
              enabled={notifications.sms}
              onToggle={() => toggleNotification("sms")}
            />

            <PreferenceRow
              icon={Bell}
              title="Push Notifications"
              description="Receive real-time alerts from AGRINEX"
              enabled={notifications.push}
              onToggle={() => toggleNotification("push")}
            />
          </div>
        </section>

        {/* ======================================================= */}
        {/* LANGUAGE & APPEARANCE                                   */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={Globe}
              title="Language & Appearance"
              description="Customize how AGRINEX appears and communicates"
            />
          </div>

          <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-4">
            <SettingSelect
              label="App Language"
              value={preferences.language}
              icon={Languages}
              onChange={(value) =>
                setPreferences({
                  ...preferences,
                  language: value,
                })
              }
              options={[
                "English",
                "অসমীয়া (Assamese)",
                "हिन्दी (Hindi)",
                "বাংলা (Bengali)",
              ]}
            />

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Appearance
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast("Use the theme button in the navbar")
                  }
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-xs font-bold hover:border-emerald-500 transition"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  Light
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast("Use the theme button in the navbar")
                  }
                  className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-2 text-xs font-bold"
                >
                  <Moon className="w-4 h-4 text-emerald-500" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* PRIVACY & SECURITY                                      */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={ShieldCheck}
              title="Privacy & Security"
              description="Manage your account security and data-sharing preferences"
            />
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <PreferenceRow
              icon={Eye}
              title="Profile Visibility"
              description="Allow procurement centres to view your basic farmer profile"
              enabled={privacy.profileVisibility}
              onToggle={() => togglePrivacy("profileVisibility")}
            />

            <PreferenceRow
              icon={MapPin}
              title="Location Sharing"
              description="Use your location to recommend nearby procurement centres"
              enabled={privacy.locationSharing}
              onToggle={() => togglePrivacy("locationSharing")}
            />

            <button
              type="button"
              onClick={() => showToast("Password change screen opened")}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>

                <div className="text-left">
                  <p className="text-xs font-black">Change Password</p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Update your AGRINEX account password
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </section>

        {/* ======================================================= */}
        {/* BANK & PAYMENT                                         */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={CreditCard}
              title="Payment & Bank Preferences"
              description="Manage your procurement payment information"
            />
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <SettingInfo
                label="Payment Method"
                value="Direct Benefit Transfer (DBT)"
                icon={CreditCard}
              />

              <SettingInfo
                label="Bank Account"
                value="XXXX XXXX 4821"
                icon={CreditCard}
              />

              <SettingInfo
                label="Bank Verification"
                value="Verified"
                icon={ShieldCheck}
                valueClass="text-emerald-500"
              />

              <SettingInfo
                label="Last Payment"
                value="₹42,500 • Completed"
                icon={CheckCircle2}
                valueClass="text-emerald-500"
              />
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />

              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                Your bank details are used only for eligible procurement
                payments and DBT settlement. Sensitive account information is
                masked for security.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* HELP & SUPPORT                                          */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <SettingHeader
              icon={HelpCircle}
              title="Help & Support"
              description="Get assistance with bookings, procurement and payments"
            />
          </div>

          <div className="p-5 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <SupportButton
              icon={HelpCircle}
              title="Help Centre"
              description="FAQs & guides"
              onClick={() => showToast("Opening Help Centre")}
            />

            <SupportButton
              icon={MessageSquare}
              title="Contact Support"
              description="Talk to AGRINEX support"
              onClick={() => showToast("Support request opened")}
            />

            <SupportButton
              icon={Info}
              title="About AGRINEX"
              description="Version 1.0 • SIH 2026"
              onClick={() => showToast("AGRINEX Procurement Platform")}
            />
          </div>
        </section>

        {/* ======================================================= */}
        {/* ACCOUNT ACTIONS                                         */}
        {/* ======================================================= */}

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => showToast("Logout confirmation opened")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/15 text-xs font-black transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <button
                type="button"
                onClick={() => showToast("Account deletion request opened")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-rose-500/40 hover:text-rose-500 text-xs font-black transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SAVE BUTTON                                             */}
        {/* ======================================================= */}

        <div className="flex justify-end pb-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white font-black text-xs shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save All Settings
          </button>
        </div>
      </main>
    </div>
  );
}

/* =============================================================== */
/* REUSABLE COMPONENTS                                             */
/* =============================================================== */

function SettingHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingInfo({ label, value, icon: Icon, valueClass = "" }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-emerald-500" />

        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {label}
        </span>
      </div>

      <p className={`text-xs font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function SettingSelect({ label, value, icon: Icon, options, onChange }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500 appearance-none"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PreferenceRow({ icon: Icon, title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 dark:text-white">
            {title}
          </p>

          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SupportButton({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-500" />
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      <p className="text-xs font-black mt-3">{title}</p>

      <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
    </button>
  );
}

function ScaleIcon() {
  return (
    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
  );
}
