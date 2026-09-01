"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Leaf,
  MapPin,
  ShoppingBasket,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

export default function OfficerDashboard() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6">

        {/* ================================================================
            PAGE HEADER
        ================================================================ */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Officer Control Panel
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Good Morning, Officer 👋
            </h1>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Here's what's happening at your centre today.
            </p>
          </div>

          {/* Date */}
          <button
            className="
              flex w-fit items-center gap-2
              rounded-xl border border-slate-200
              bg-white px-3.5 py-2.5
              text-xs font-medium text-slate-700
              shadow-sm transition
              hover:bg-slate-50
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <CalendarDays size={15} />

            <span>Today</span>

            <ChevronRight
              size={14}
              className="rotate-90 text-slate-400"
            />
          </button>
        </div>

        {/* ================================================================
            TODAY'S OVERVIEW
        ================================================================ */}

        <SectionHeading title="Today's Overview" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">

          <StatCard
            icon={<Users size={17} />}
            value="128"
            label="Farmers"
            iconClass="
              bg-blue-50 text-blue-600
              dark:bg-blue-950/40 dark:text-blue-400
            "
          />

          <StatCard
            icon={<CalendarDays size={17} />}
            value="24"
            label="Bookings"
            iconClass="
              bg-purple-50 text-purple-600
              dark:bg-purple-950/40 dark:text-purple-400
            "
          />

          <StatCard
            icon={<Clock3 size={17} />}
            value="07"
            label="Pending"
            iconClass="
              bg-amber-50 text-amber-600
              dark:bg-amber-950/40 dark:text-amber-400
            "
          />

          <StatCard
            icon={<ClipboardList size={17} />}
            value="05"
            label="Queue"
            iconClass="
              bg-orange-50 text-orange-600
              dark:bg-orange-950/40 dark:text-orange-400
            "
          />

          <StatCard
            icon={<Leaf size={17} />}
            value="1.2T"
            label="Procured"
            iconClass="
              bg-emerald-50 text-emerald-600
              dark:bg-emerald-950/40 dark:text-emerald-400
            "
          />

          <StatCard
            icon={<CheckCircle2 size={17} />}
            value="18"
            label="Completed"
            iconClass="
              bg-green-50 text-green-600
              dark:bg-green-950/40 dark:text-green-400
            "
          />

          <StatCard
            icon={<Wallet size={17} />}
            value="₹45.2K"
            label="Pending"
            iconClass="
              bg-red-50 text-red-600
              dark:bg-red-950/40 dark:text-red-400
            "
          />

        </div>

        {/* ================================================================
            FIRST ROW
        ================================================================ */}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">

          {/* --------------------------------------------------------------
              RECENT BOOKINGS
          -------------------------------------------------------------- */}

          <DashboardCard
            title="Recent Bookings"
            icon={<CalendarDays size={16} />}
            action="View All Bookings"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">

              <BookingRow
                id="#BK1024"
                name="Ramesh Kumar"
                time="10:30 AM"
                status="Confirmed"
              />

              <BookingRow
                id="#BK1025"
                name="Suresh Singh"
                time="11:00 AM"
                status="Confirmed"
              />

              <BookingRow
                id="#BK1026"
                name="Anita Devi"
                time="11:30 AM"
                status="Pending"
              />

              <BookingRow
                id="#BK1027"
                name="Mohan Das"
                time="12:00 PM"
                status="Confirmed"
              />

            </div>
          </DashboardCard>

          {/* --------------------------------------------------------------
              QUEUE STATUS
          -------------------------------------------------------------- */}

          <DashboardCard
            title="Queue Status"
            icon={<ClipboardList size={16} />}
            action="Manage Queue"
          >

            <div className="grid grid-cols-2 gap-3">

              {/* Current Token */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Token
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  #104
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Processing
                </div>

              </div>

              {/* Next Token */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Next Token
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  #105
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Waiting
                </div>

              </div>

            </div>

            {/* Queue Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3">

              <QueueMetric
                label="Processing"
                value="01"
                icon={
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                }
              />

              <QueueMetric
                label="Waiting"
                value="04"
                icon={
                  <Clock3
                    size={13}
                    className="text-amber-500"
                  />
                }
              />

            </div>

          </DashboardCard>

          {/* --------------------------------------------------------------
              PROCUREMENT SUMMARY
          -------------------------------------------------------------- */}

          <DashboardCard
            title="Procurement Summary"
            icon={<ShoppingBasket size={16} />}
            action="View Procurement"
          >

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Procurement
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  1,240
                  <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    kg
                  </span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Value
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₹72,450
                </p>
              </div>

            </div>

            {/* Procurement Status */}
            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3 dark:bg-emerald-950/30">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                      Completed
                    </p>

                    <p className="text-[9px] text-slate-500 dark:text-slate-400">
                      Transactions
                    </p>
                  </div>

                </div>

                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  18
                </span>

              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3 dark:bg-amber-950/30">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                    <Clock3 size={14} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                      Pending
                    </p>

                    <p className="text-[9px] text-slate-500 dark:text-slate-400">
                      Transactions
                    </p>
                  </div>

                </div>

                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  07
                </span>

              </div>

            </div>

          </DashboardCard>

          {/* --------------------------------------------------------------
              CENTRE STATUS
          -------------------------------------------------------------- */}

          <DashboardCard
            title="Centre Status"
            icon={<MapPin size={16} />}
            action="Centre Details"
          >

            {/* Status */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Centre Operational
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Running normally
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                Active
              </span>

            </div>

            {/* Capacity */}
            <div className="mt-5">

              <div className="mb-1.5 flex items-center justify-between">

                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Capacity
                </span>

                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  80%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-[80%] rounded-full bg-emerald-500" />
              </div>

            </div>

            {/* Centre Information */}
            <div className="mt-4 grid grid-cols-3 gap-2">

              <InfoBox
                label="Today's Slots"
                value="24/30"
              />

              <InfoBox
                label="Queue"
                value="05"
              />

              <InfoBox
                label="Staff"
                value="04/05"
              />

            </div>

          </DashboardCard>

        </div>

        {/* ================================================================
            IMPORTANT PENDING ACTIONS + ALERTS
        ================================================================ */}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">

          {/* --------------------------------------------------------------
              IMPORTANT PENDING ACTIONS
          -------------------------------------------------------------- */}

          <section>

            <SectionHeading title="Important Pending Actions" />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <PendingAction
                icon={<UserCheck size={16} />}
                text="3 farmers waiting for verification"
                button="Review"
              />

              <PendingAction
                icon={<ShoppingBasket size={16} />}
                text="2 procurement requests need approval"
                button="Review"
              />

              <PendingAction
                icon={<Wallet size={16} />}
                text="4 payments pending"
                button="View"
              />

            </div>

          </section>

          {/* --------------------------------------------------------------
              ALERTS & NOTIFICATIONS
          -------------------------------------------------------------- */}

          <section>

            <SectionHeading title="Alerts & Notifications" />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <AlertRow
                type="info"
                text="New booking received"
                time="5 min ago"
              />

              <AlertRow
                type="success"
                text="Farmer #FR102 arrived"
                time="8 min ago"
              />

              <AlertRow
                type="warning"
                text="Queue capacity reaching limit"
                time="12 min ago"
              />

            </div>

          </section>

        </div>

      </div>
    </div>
  );
}

/* ==========================================================================
   SECTION HEADING
========================================================================== */

function SectionHeading({ title }) {
  return (
    <div className="mb-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {title}
      </h2>
    </div>
  );
}

/* ==========================================================================
   STAT CARD
========================================================================== */

function StatCard({
  icon,
  value,
  label,
  iconClass,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-slate-200
        bg-white
        p-3
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="flex items-center gap-3">

        <div
          className={`
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

        </div>

      </div>
    </div>
  );
}

/* ==========================================================================
   DASHBOARD CARD
========================================================================== */

function DashboardCard({
  title,
  icon,
  action,
  children,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-slate-200
        bg-white
        shadow-sm

        dark:border-slate-800
        dark:bg-slate-900
      "
    >

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">

        <div className="flex items-center gap-2">

          <span className="text-emerald-600 dark:text-emerald-400">
            {icon}
          </span>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h3>

        </div>

        {action && (
          <button
            className="
              flex items-center gap-1
              text-[10px] font-semibold
              text-emerald-600
              hover:text-emerald-700
              dark:text-emerald-400
              dark:hover:text-emerald-300
            "
          >
            {action}

            <ChevronRight size={12} />
          </button>
        )}

      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>

    </div>
  );
}

/* ==========================================================================
   BOOKING ROW
========================================================================== */

function BookingRow({
  id,
  name,
  time,
  status,
}) {
  const pending = status === "Pending";

  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <User size={14} />
        </div>

        <div className="min-w-0">

          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
            {name}
          </p>

          <p className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
            {id}
          </p>

        </div>

      </div>

      <div className="flex shrink-0 items-center gap-3">

        <span className="hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">
          {time}
        </span>

        <span
          className={`
            rounded-full
            px-2 py-1
            text-[9px]
            font-semibold

            ${
              pending
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            }
          `}
        >
          {status}
        </span>

      </div>

    </div>
  );
}

/* ==========================================================================
   QUEUE METRIC
========================================================================== */

function QueueMetric({
  label,
  value,
  icon,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-700">

      <div className="flex items-center gap-2">

        <span className="flex items-center justify-center">
          {icon}
        </span>

        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>

      </div>

      <span className="text-xs font-bold text-slate-900 dark:text-white">
        {value}
      </span>

    </div>
  );
}

/* ==========================================================================
   INFO BOX
========================================================================== */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">

      <p className="truncate text-[9px] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   PENDING ACTION
========================================================================== */

function PendingAction({
  icon,
  text,
  button,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
        {icon}
      </div>

      <p className="flex-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
        {text}
      </p>

      <button
        className="
          flex shrink-0 items-center gap-1
          rounded-lg
          bg-slate-100
          px-2.5 py-1.5
          text-[9px]
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-200

          dark:bg-slate-800
          dark:text-slate-300
          dark:hover:bg-slate-700
        "
      >
        {button}

        <ArrowUpRight size={11} />
      </button>

    </div>
  );
}

/* ==========================================================================
   ALERT ROW
========================================================================== */

function AlertRow({
  type,
  text,
  time,
}) {
  const alertStyles = {
    info: {
      icon: <span className="h-2 w-2 rounded-full bg-blue-500" />,
      className:
        "bg-blue-50 dark:bg-blue-950/40",
    },

    success: {
      icon: <CheckCircle2 size={14} />,
      className:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },

    warning: {
      icon: <AlertTriangle size={14} />,
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
  };

  const current = alertStyles[type];

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800">

      <div
        className={`
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-lg
          ${current.className}
        `}
      >
        {current.icon}
      </div>

      <p className="flex-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
        {text}
      </p>

      <span className="whitespace-nowrap text-[9px] text-slate-400">
        {time}
      </span>

    </div>
  );
}