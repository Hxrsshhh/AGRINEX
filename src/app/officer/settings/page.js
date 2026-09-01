"use client";

import {
  Bell,
  ChevronRight,
  Globe2,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  Smartphone,
  User,
  Volume2,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfficerSettingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState("English");

  const logout = () => {
    /*
      REAL IMPLEMENTATION:

      await signOut({
        callbackUrl: "/login",
      });

      OR:

      await fetch("/api/auth/logout", {
        method: "POST",
      });
    */

    router.replace("/login");
  };

  return (
    <main className="h-[calc(100dvh-70px)] w-full overflow-hidden bg-slate-100/70 dark:bg-slate-950">
      <div
        className="
          mx-auto
          flex
          h-full
          min-h-0
          w-full
          max-w-[1450px]
          flex-col
          overflow-hidden
          p-2.5
          sm:p-3
          lg:p-4
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            mb-2.5
            flex
            shrink-0
            items-center
            justify-between
            rounded-2xl
            border
            border-slate-200/80
            bg-white/90
            px-3
            py-2
            shadow-sm
            backdrop-blur-sm
            sm:px-4
            dark:border-slate-800
            dark:bg-slate-900/90
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

              <span className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                Officer Portal
              </span>
            </div>

            <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Settings
            </h1>

            <p className="mt-0.5 truncate text-[8px] text-slate-400">
              Manage your AGRINEX preferences and account
            </p>
          </div>

          {/* ACCOUNT BADGE */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200/80
              bg-white
              px-3
              py-1.5
              shadow-sm
              sm:flex
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck size={13} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
                Account
              </p>

              <p className="text-[8px] font-black text-slate-700 dark:text-slate-300">
                Officer · Active
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            grid
            min-h-0
            w-full
            min-w-0
            flex-1
            grid-cols-1
            gap-2.5
            overflow-hidden
            lg:grid-cols-[1.08fr_0.92fr]
          "
        >
          {/* =================================================
              LEFT — NOTIFICATIONS
          ================================================= */}

          <section
            className="
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              transition-shadow
              duration-200
              hover:shadow-md
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            {/* SECTION HEADER */}

            <div
              className="
                flex
                h-[58px]
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-200
                px-4
                sm:px-5
                dark:border-slate-800
              "
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Bell size={14} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xs font-black text-slate-900 dark:text-white">
                    Notifications
                  </h2>

                  <p className="mt-0.5 text-[7px] text-slate-400">
                    Manage operational alerts
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[6px] font-black uppercase text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                Alerts
              </span>
            </div>

            {/* NOTIFICATION ITEMS */}

            <div className="min-h-0 flex-1 overflow-hidden">
              <NotificationRow
                icon={<Smartphone size={14} />}
                title="Push Notifications"
                description="Important AGRINEX alerts and updates"
              />

              <NotificationRow
                icon={<Bell size={14} />}
                title="New Bookings"
                description="Notifications when a farmer creates a booking"
              />

              <NotificationRow
                icon={<Volume2 size={14} />}
                title="Queue Updates"
                description="Updates when the centre queue changes"
              />

              <NotificationRow
                icon={<Bell size={14} />}
                title="Procurement Alerts"
                description="Procurement and payment notifications"
              />
            </div>

            {/* LANGUAGE */}

            <div className="shrink-0 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Globe2 size={14} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-800 dark:text-slate-200">
                    Language
                  </p>

                  <p className="mt-0.5 truncate text-[7px] text-slate-400">
                    Choose your preferred language
                  </p>
                </div>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Select language"
                  className="
                    h-8
                    shrink-0
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-2.5
                    text-[8px]
                    font-bold
                    text-slate-700
                    outline-none
                    transition
                    hover:border-slate-300
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-500/20
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-300
                  "
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी</option>
                </select>
              </div>
            </div>

            {/* INFO FOOTER */}

            <div className="shrink-0 rounded-b-2xl bg-slate-50 px-4 py-2 dark:bg-slate-950/40">
              <p className="text-[7px] text-slate-400">
                Critical operational alerts are always enabled.
              </p>
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="flex min-h-0 flex-col gap-2.5 overflow-hidden">
            {/* ACCOUNT */}

            <section
              className="
                shrink-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-shadow
                duration-200
                hover:shadow-md
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <SettingsSectionHeader
                icon={<User size={14} />}
                title="Account"
                description="Manage your officer account"
                iconStyle="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              />

              <SettingsLink
                icon={<User size={13} />}
                title="Profile"
                description="View and edit your personal information"
                onClick={() => router.push("/officer/profile")}
              />
            </section>

            {/* SECURITY */}

            <section
              className="
                shrink-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-shadow
                duration-200
                hover:shadow-md
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <SettingsSectionHeader
                icon={<Lock size={14} />}
                title="Security"
                description="Keep your account protected"
                iconStyle="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
              />

              <SettingsLink
                icon={<KeyRound size={13} />}
                title="Change Password"
                description="Update your officer account password"
                onClick={() => router.push("/officer/profile#security")}
              />
            </section>

            {/* ACCOUNT STATUS */}

            <section
              className="
                shrink-0
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/60
                p-3.5
                dark:border-emerald-950
                dark:bg-emerald-950/20
              "
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
                  <ShieldCheck size={14} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black text-emerald-800 dark:text-emerald-400">
                    Officer account secured
                  </p>

                  <p className="mt-1 text-[7px] leading-relaxed text-emerald-700/70 dark:text-emerald-500">
                    Your account is active and protected by AGRINEX
                    authentication.
                  </p>
                </div>
              </div>
            </section>

            {/* LOGOUT */}

            <section
              className="
                mt-auto
                shrink-0
                overflow-hidden
                rounded-2xl
                border
                border-red-100
                bg-white
                shadow-sm
                dark:border-red-950
                dark:bg-slate-900
              "
            >
              <button
                type="button"
                onClick={logout}
                className="
                  group
                  flex
                  min-h-[58px]
                  w-full
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-left
                  transition
                  hover:bg-red-50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-inset
                  focus:ring-red-500/25
                  dark:hover:bg-red-950/20
                "
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <LogOut size={13} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-red-700 dark:text-red-400">
                    Sign Out
                  </p>

                  <p className="mt-0.5 truncate text-[7px] text-slate-400">
                    End your current officer session
                  </p>
                </div>

                <ChevronRight
                  size={13}
                  className="
                    shrink-0
                    text-slate-300
                    transition
                    group-hover:translate-x-0.5
                    group-hover:text-red-400
                  "
                />
              </button>
            </section>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-1.5 flex shrink-0 items-center justify-between px-1">
          <span className="text-[7px] font-medium text-slate-400">
            AGRINEX Officer Portal
          </span>

          <span className="text-[7px] text-slate-400">
            Application Settings
          </span>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        min-h-[58px]
        items-center
        gap-3
        border-b
        border-slate-100
        px-4
        py-3
        transition
        hover:bg-slate-50
        sm:px-5
        dark:border-slate-800
        dark:hover:bg-slate-800/40
      "
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {description}
        </p>
      </div>

      <span
        className="
          shrink-0
          rounded-full
          bg-emerald-50
          px-2
          py-1
          text-[6px]
          font-black
          uppercase
          tracking-wide
          text-emerald-600
          dark:bg-emerald-950/40
          dark:text-emerald-400
        "
      >
        Active
      </span>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SettingsSectionHeader({
  icon,
  title,
  description,
  iconStyle,
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3.5 sm:px-5 dark:border-slate-800">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-xs font-black text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS LINK
========================================================= */

function SettingsLink({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        min-h-[58px]
        w-full
        items-center
        gap-3
        px-4
        py-3
        text-left
        transition
        hover:bg-slate-50
        focus:outline-none
        focus:ring-2
        focus:ring-inset
        focus:ring-emerald-500/25
        sm:px-5
        dark:hover:bg-slate-800/40
      "
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={13}
        className="
          shrink-0
          text-slate-300
          transition
          group-hover:translate-x-0.5
          group-hover:text-emerald-500
          dark:text-slate-600
        "
      />
    </button>
  );
}