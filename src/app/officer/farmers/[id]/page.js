"use client";

import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  CalendarDays,
  ClipboardList,
  ShoppingBasket,
  Wallet,
  Wheat,
  Sprout,
  LandPlot,
  FileCheck2,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   SAMPLE FARMER
   Later replace this with API / MongoDB data
========================================================= */

const farmer = {
  id: "FR1024",
  name: "Ramesh Kumar",
  mobile: "9876543210",
  village: "Chas",
  district: "Bokaro",
  state: "Jharkhand",

  status: "Verified",

  registeredOn: "12 Jan 2026",
  verifiedOn: "13 Jan 2026",

  land: {
    total: "4.5 Acres",
    irrigated: "3.2 Acres",
    rainfed: "1.3 Acres",
  },

  crops: [
    {
      name: "Wheat",
      area: "2.5 Acres",
      season: "Rabi",
    },
    {
      name: "Rice",
      area: "1.5 Acres",
      season: "Kharif",
    },
    {
      name: "Vegetables",
      area: "0.5 Acres",
      season: "Year Round",
    },
  ],

  activity: {
    bookings: 18,
    completedBookings: 16,
    queueVisits: 21,
    procurement: "842 kg",
    procurementValue: "₹48,620",
    payments: "₹48,620",
    pendingPayment: "₹0",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function FarmerDetailsPage() {
  return (
    <div className="h-[calc(100vh-70px)] overflow-hidden">

      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden p-4 md:p-5 lg:p-6">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* Back */}
            <Link
              href="/officer/farmers"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-xl

                border
                border-slate-200

                bg-white

                text-slate-500

                shadow-sm

                transition

                hover:border-emerald-500
                hover:bg-emerald-50
                hover:text-emerald-600

                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
                dark:hover:bg-emerald-950/40
                dark:hover:text-emerald-400
              "
            >
              <ArrowLeft size={16} />
            </Link>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="text-[9px] font-bold text-slate-400">
                  Farmers
                </span>

                <span className="text-slate-300 dark:text-slate-700">
                  /
                </span>

                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  {farmer.id}
                </span>

              </div>

              <h1 className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-900 dark:text-white md:text-xl">
                Farmer Profile
              </h1>

            </div>

          </div>

          {/* Verification Status */}
          <div className="hidden items-center gap-2 sm:flex">

            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/30">

              <CheckCircle2
                size={15}
                className="text-emerald-600 dark:text-emerald-400"
              />

              <div>
                <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
                  Registration Status
                </p>

                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  {farmer.status}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-hidden">

          <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.15fr_1fr]">

            {/* =================================================
                LEFT COLUMN
            ================================================== */}

            <div className="min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

              {/* =================================================
                  FARMER INFORMATION
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <User size={15} />
                    </div>

                    <div>
                      <h2 className="text-xs font-black text-slate-900 dark:text-white">
                        Farmer Information
                      </h2>

                      <p className="text-[8px] text-slate-400">
                        Registered farmer details
                      </p>
                    </div>

                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <ShieldCheck size={10} />
                    Verified
                  </span>

                </div>

                <div className="p-4">

                  {/* Profile */}
                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-black text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      RK
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {farmer.name}
                      </h3>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Farmer ID: {farmer.id}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Registration verified
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">

                    <InfoCard
                      icon={<Phone size={13} />}
                      label="Mobile Number"
                      value={farmer.mobile}
                    />

                    <InfoCard
                      icon={<MapPin size={13} />}
                      label="Village"
                      value={farmer.village}
                    />

                    <InfoCard
                      icon={<MapPin size={13} />}
                      label="District"
                      value={farmer.district}
                    />

                    <InfoCard
                      icon={<MapPin size={13} />}
                      label="State"
                      value={farmer.state}
                    />

                    <InfoCard
                      icon={<CalendarDays size={13} />}
                      label="Registered On"
                      value={farmer.registeredOn}
                    />

                    <InfoCard
                      icon={<ShieldCheck size={13} />}
                      label="Verified On"
                      value={farmer.verifiedOn}
                    />

                  </div>

                </div>

              </section>

              {/* =================================================
                  LAND INFORMATION
              ================================================== */}

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <SectionHeader
                  icon={<LandPlot size={15} />}
                  title="Land Information"
                  subtitle="Registered agricultural land"
                />

                <div className="grid grid-cols-3 gap-2 p-4">

                  <MiniMetric
                    label="Total Land"
                    value={farmer.land.total}
                  />

                  <MiniMetric
                    label="Irrigated"
                    value={farmer.land.irrigated}
                  />

                  <MiniMetric
                    label="Rainfed"
                    value={farmer.land.rainfed}
                  />

                </div>

              </section>

              {/* =================================================
                  CROP INFORMATION
              ================================================== */}

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <SectionHeader
                  icon={<Sprout size={15} />}
                  title="Crop Information"
                  subtitle="Current registered crops"
                />

                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                  {farmer.crops.map((crop) => (
                    <div
                      key={crop.name}
                      className="flex items-center gap-3 px-4 py-3"
                    >

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Wheat size={14} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                          {crop.name}
                        </p>

                        <p className="mt-0.5 text-[8px] text-slate-400">
                          {crop.season}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                          {crop.area}
                        </p>

                        <p className="text-[8px] text-slate-400">
                          Cultivated area
                        </p>

                      </div>

                    </div>
                  ))}

                </div>

              </section>

              {/* =================================================
                  VERIFICATION
              ================================================== */}

              <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <FileCheck2 size={16} />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      Verification Record
                    </h3>

                    <p className="mt-1 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Farmer registration has been verified for the assigned centre. Sensitive farmer information is read-only for officers.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <span className="rounded-lg bg-white px-2 py-1.5 text-[8px] font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                        Verified: {farmer.verifiedOn}
                      </span>

                      <span className="rounded-lg bg-white px-2 py-1.5 text-[8px] font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                        Centre: XYZ Mandi
                      </span>

                    </div>

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================== */}

            <div className="min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

              {/* =================================================
                  ACTIVITY OVERVIEW
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <SectionHeader
                  icon={<ClipboardList size={15} />}
                  title="Activity Overview"
                  subtitle="Farmer activity at this centre"
                />

                <div className="grid grid-cols-2 gap-2 p-4">

                  <ActivityCard
                    icon={<CalendarDays size={15} />}
                    label="Bookings"
                    value={farmer.activity.bookings}
                    sub={`${farmer.activity.completedBookings} completed`}
                    type="blue"
                  />

                  <ActivityCard
                    icon={<ClipboardList size={15} />}
                    label="Queue Visits"
                    value={farmer.activity.queueVisits}
                    sub="Total visits"
                    type="purple"
                  />

                  <ActivityCard
                    icon={<ShoppingBasket size={15} />}
                    label="Procurement"
                    value={farmer.activity.procurement}
                    sub={farmer.activity.procurementValue}
                    type="green"
                  />

                  <ActivityCard
                    icon={<Wallet size={15} />}
                    label="Payments"
                    value={farmer.activity.payments}
                    sub={`${farmer.activity.pendingPayment} pending`}
                    type="amber"
                  />

                </div>

              </section>

              {/* =================================================
                  RECENT BOOKINGS
              ================================================== */}

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <SectionHeader
                  icon={<CalendarDays size={15} />}
                  title="Recent Bookings"
                  subtitle="Latest booking activity"
                  action="View all"
                />

                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                  <ActivityRow
                    icon={<CalendarDays size={13} />}
                    title="#BK1024"
                    subtitle="Wheat • 280 kg"
                    date="01 Sep 2026"
                    status="Completed"
                  />

                  <ActivityRow
                    icon={<CalendarDays size={13} />}
                    title="#BK0987"
                    subtitle="Rice • 190 kg"
                    date="26 Aug 2026"
                    status="Completed"
                  />

                  <ActivityRow
                    icon={<CalendarDays size={13} />}
                    title="#BK0912"
                    subtitle="Wheat • 372 kg"
                    date="18 Aug 2026"
                    status="Completed"
                  />

                </div>

              </section>

              {/* =================================================
                  QUEUE HISTORY
              ================================================== */}

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <SectionHeader
                  icon={<ClipboardList size={15} />}
                  title="Queue History"
                  subtitle="Recent centre visits"
                  action="View all"
                />

                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                  <ActivityRow
                    icon={<Clock3 size={13} />}
                    title="Token #104"
                    subtitle="Procurement queue"
                    date="Today • 10:30"
                    status="Completed"
                  />

                  <ActivityRow
                    icon={<Clock3 size={13} />}
                    title="Token #087"
                    subtitle="Procurement queue"
                    date="26 Aug • 11:20"
                    status="Completed"
                  />

                  <ActivityRow
                    icon={<Clock3 size={13} />}
                    title="Token #065"
                    subtitle="Procurement queue"
                    date="18 Aug • 09:45"
                    status="Completed"
                  />

                </div>

              </section>

              {/* =================================================
                  PROCUREMENT + PAYMENTS
              ================================================== */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Procurement */}
                <CompactPanel
                  icon={<ShoppingBasket size={15} />}
                  title="Procurement"
                  value={farmer.activity.procurement}
                  label="Total quantity"
                  secondary={farmer.activity.procurementValue}
                  secondaryLabel="Total value"
                />

                {/* Payments */}
                <CompactPanel
                  icon={<Wallet size={15} />}
                  title="Payments"
                  value={farmer.activity.payments}
                  label="Total paid"
                  secondary={farmer.activity.pendingPayment}
                  secondaryLabel="Pending"
                />

              </div>

              {/* =================================================
                  VIEW-ONLY NOTICE
              ================================================== */}

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">

                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <p className="text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Farmer profile information is displayed for verification and operational purposes. Sensitive registration details cannot be directly modified by centre officers.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ==========================================================================
   SECTION HEADER
========================================================================== */

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">

      <div className="flex min-w-0 items-center gap-2">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          {icon}
        </div>

        <div className="min-w-0">

          <h2 className="text-xs font-black text-slate-900 dark:text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="truncate text-[8px] text-slate-400">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {action && (
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400"
        >
          {action}
          <ExternalLink size={9} />
        </button>
      )}

    </div>
  );
}

/* ==========================================================================
   INFO CARD
========================================================================== */

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">

      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        {icon}

        <span className="text-[8px]">
          {label}
        </span>
      </div>

      <p className="truncate text-[10px] font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   MINI METRIC
========================================================================== */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">

      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   ACTIVITY CARD
========================================================================== */

function ActivityCard({
  icon,
  label,
  value,
  sub,
  type,
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  };

  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">

      <div
        className={`
          mb-2
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg

          ${styles[type]}
        `}
      >
        {icon}
      </div>

      <p className="text-[8px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[8px] text-slate-400">
        {sub}
      </p>

    </div>
  );
}

/* ==========================================================================
   ACTIVITY ROW
========================================================================== */

function ActivityRow({
  icon,
  title,
  subtitle,
  date,
  status,
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-[10px] font-bold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[8px] text-slate-400">
          {subtitle}
        </p>

      </div>

      <div className="shrink-0 text-right">

        <p className="text-[8px] text-slate-400">
          {date}
        </p>

        <p className="mt-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
          {status}
        </p>

      </div>

    </div>
  );
}

/* ==========================================================================
   COMPACT PANEL
========================================================================== */

function CompactPanel({
  icon,
  title,
  value,
  label,
  secondary,
  secondaryLabel,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div className="mb-3 flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          {icon}
        </div>

        <h3 className="text-xs font-black text-slate-900 dark:text-white">
          {title}
        </h3>

      </div>

      <p className="text-lg font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">

        <p className="text-xs font-black text-slate-700 dark:text-slate-300">
          {secondary}
        </p>

        <p className="text-[8px] text-slate-400">
          {secondaryLabel}
        </p>

      </div>

    </div>
  );
}