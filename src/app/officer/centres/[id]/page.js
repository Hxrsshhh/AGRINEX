"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  User,
  Users,
  Warehouse,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   SAMPLE CENTRE DATA
   Later replace this with MongoDB / API data
========================================================= */

const centers = [
  {
    id: "CTR001",
    name: "XYZ Farmer Centre",
    location: "Chas, Bokaro, Jharkhand",
    address: "Chas Block, Bokaro District",
    officer: "Raj Kumar",
    officerMobile: "9876543210",

    capacity: 30,
    bookedSlots: 24,

    bookings: {
      total: 24,
      completed: 18,
      pending: 7,
    },

    queue: {
      currentToken: 104,
      processing: 1,
      waiting: 4,
      nextToken: 105,
    },

    procurement: {
      status: "Active",
      quantity: "1,240 kg",
      value: "₹72,450",
      transactions: 18,
    },

    operatingStatus: "Operational",

    staff: {
      available: 4,
      total: 5,
    },

    lastUpdated: "2 minutes ago",
  },

  {
    id: "CTR002",
    name: "Bokaro Farmer Centre",
    location: "Bokaro, Jharkhand",
    address: "Bokaro Block, Bokaro District",
    officer: "Amit Kumar",
    officerMobile: "9123456780",

    capacity: 40,
    bookedSlots: 29,

    bookings: {
      total: 29,
      completed: 22,
      pending: 7,
    },

    queue: {
      currentToken: 78,
      processing: 2,
      waiting: 6,
      nextToken: 79,
    },

    procurement: {
      status: "Active",
      quantity: "1,580 kg",
      value: "₹91,240",
      transactions: 24,
    },

    operatingStatus: "Operational",

    staff: {
      available: 5,
      total: 5,
    },

    lastUpdated: "4 minutes ago",
  },

  {
    id: "CTR003",
    name: "Kasmar Farmer Centre",
    location: "Kasmar, Bokaro, Jharkhand",
    address: "Kasmar Block, Bokaro District",
    officer: "Sunil Das",
    officerMobile: "9988776655",

    capacity: 25,
    bookedSlots: 12,

    bookings: {
      total: 12,
      completed: 9,
      pending: 3,
    },

    queue: {
      currentToken: 42,
      processing: 1,
      waiting: 2,
      nextToken: 43,
    },

    procurement: {
      status: "Active",
      quantity: "620 kg",
      value: "₹36,450",
      transactions: 9,
    },

    operatingStatus: "Operational",

    staff: {
      available: 3,
      total: 4,
    },

    lastUpdated: "7 minutes ago",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CenterDetailsPage() {
  const params = useParams();

  const centerId = params?.id;

  const center = centers.find(
    (item) => item.id === centerId
  );

  /* =======================================================
     CENTRE NOT FOUND
  ======================================================== */

  if (!center) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="flex min-h-screen items-center justify-center p-6">

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Warehouse size={21} />
            </div>

            <h1 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
              Centre not found
            </h1>

            <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
              No centre exists with ID{" "}
              <span className="font-bold">
                {centerId}
              </span>
              .
            </p>

            <Link
              href="/officer/centers"
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-emerald-600
                px-3
                py-2
                text-[9px]
                font-bold
                text-white
                transition
                hover:bg-emerald-700
              "
            >
              <ArrowLeft size={12} />
              Back to Centres
            </Link>

          </div>

        </div>

      </main>
    );
  }

  const capacityPercentage = Math.round(
    (center.bookedSlots / center.capacity) * 100
  );

  const availableSlots =
    center.capacity - center.bookedSlots;

  return (
    /*
      Whole page scrolls naturally.
      Sidebar + navbar remain controlled by your parent layout.
    */
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5 lg:p-6">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* Back */}
            <Link
              href="/officer/centers"
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

              <div className="mb-1 flex items-center gap-2">

                <span className="text-[8px] font-bold text-slate-400">
                  Centres
                </span>

                <span className="text-slate-300 dark:text-slate-700">
                  /
                </span>

                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                  {center.id}
                </span>

              </div>

              <h1 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                {center.name}
              </h1>

              <p className="mt-0.5 truncate text-[9px] text-slate-500 dark:text-slate-400 md:text-[10px]">
                Detailed centre information and operational status.
              </p>

            </div>

          </div>

          <OperatingBadge
            status={center.operatingStatus}
          />

        </div>

        {/* ===================================================
            QUICK METRICS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">

          <MetricCard
            icon={<Activity size={16} />}
            label="Capacity"
            value={`${capacityPercentage}%`}
            sub={`${center.bookedSlots}/${center.capacity} booked`}
            type="green"
          />

          <MetricCard
            icon={<CalendarDays size={16} />}
            label="Today's Bookings"
            value={center.bookings.total}
            sub={`${center.bookings.completed} completed`}
            type="blue"
          />

          <MetricCard
            icon={<Clock3 size={16} />}
            label="Current Queue"
            value={`#${center.queue.currentToken}`}
            sub={`${center.queue.waiting} waiting`}
            type="purple"
          />

          <MetricCard
            icon={<PackageCheck size={16} />}
            label="Procurement"
            value={center.procurement.quantity}
            sub={center.procurement.value}
            type="amber"
          />

        </div>

        {/* ===================================================
            CENTRE DETAILS + OPERATING STATUS
        ==================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">

          {/* Centre Details */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Warehouse size={15} />}
              title="Centre Details"
              subtitle="Registered centre information"
            />

            <div className="grid grid-cols-2 gap-2.5 p-4 md:grid-cols-3">

              <InfoCard
                icon={<Warehouse size={13} />}
                label="Centre Name"
                value={center.name}
              />

              <InfoCard
                icon={<ShieldCheck size={13} />}
                label="Centre ID"
                value={center.id}
              />

              <InfoCard
                icon={<MapPin size={13} />}
                label="Location"
                value={center.location}
              />

              <InfoCard
                icon={<MapPin size={13} />}
                label="Address"
                value={center.address}
              />

              <InfoCard
                icon={<User size={13} />}
                label="Assigned Officer"
                value={center.officer}
              />

              <InfoCard
                icon={<Phone size={13} />}
                label="Officer Contact"
                value={center.officerMobile}
              />

            </div>

          </section>

          {/* Operating Status */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Activity size={15} />}
              title="Operating Status"
              subtitle="Current centre availability"
            />

            <div className="p-4">

              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">

                    <CheckCircle2 size={19} />

                  </div>

                  <div>

                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {center.operatingStatus}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-500 dark:text-slate-400">
                      Centre is currently accepting operations.
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">

                <SmallInfo
                  label="Staff"
                  value={`${center.staff.available}/${center.staff.total}`}
                />

                <SmallInfo
                  label="Last Updated"
                  value={center.lastUpdated}
                />

              </div>

            </div>

          </section>

        </div>

        {/* ===================================================
            CAPACITY + BOOKINGS
        ==================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          {/* Capacity */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Users size={15} />}
              title="Centre Capacity"
              subtitle="Today's available capacity"
            />

            <div className="p-4">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[8px] font-medium text-slate-400">
                    Slots Used
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {center.bookedSlots}
                    <span className="text-sm font-bold text-slate-400">
                      {" "}
                      / {center.capacity}
                    </span>
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-[8px] text-slate-400">
                    Available
                  </p>

                  <p className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {availableSlots}
                  </p>

                </div>

              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${capacityPercentage}%`,
                  }}
                />

              </div>

              <div className="mt-2 flex items-center justify-between">

                <span className="text-[8px] text-slate-400">
                  {capacityPercentage}% capacity utilized
                </span>

                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
                  {availableSlots} slots left
                </span>

              </div>

            </div>

          </section>

          {/* Today's Bookings */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<CalendarDays size={15} />}
              title="Today's Bookings"
              subtitle="Booking activity at this centre"
            />

            <div className="grid grid-cols-3 gap-2 p-4">

              <BookingStat
                label="Total"
                value={center.bookings.total}
                type="blue"
              />

              <BookingStat
                label="Completed"
                value={center.bookings.completed}
                type="green"
              />

              <BookingStat
                label="Pending"
                value={center.bookings.pending}
                type="amber"
              />

            </div>

            <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[8px] text-slate-400">
                    Completion rate
                  </p>

                  <p className="mt-0.5 text-[11px] font-black text-slate-800 dark:text-slate-200">
                    {Math.round(
                      (center.bookings.completed /
                        center.bookings.total) *
                        100
                    )}
                    %
                  </p>

                </div>

                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.round(
                        (center.bookings.completed /
                          center.bookings.total) *
                          100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ===================================================
            QUEUE + PROCUREMENT
        ==================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          {/* Queue */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Clock3 size={15} />}
              title="Current Queue"
              subtitle="Live queue status"
            />

            <div className="p-4">

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Current Token
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                    #{center.queue.currentToken}
                  </p>

                  <p className="mt-0.5 text-[8px] text-slate-400">
                    Currently processing
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">

                  <Clock3
                    size={20}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                </div>

              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">

                <QueueStat
                  label="Processing"
                  value={center.queue.processing}
                  type="green"
                />

                <QueueStat
                  label="Waiting"
                  value={center.queue.waiting}
                  type="amber"
                />

              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-800">

                <div>

                  <p className="text-[8px] text-slate-400">
                    Next Token
                  </p>

                  <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-200">
                    #{center.queue.nextToken}
                  </p>

                </div>

                <span className="text-[8px] font-bold text-slate-400">
                  {center.queue.waiting} farmers waiting
                </span>

              </div>

            </div>

          </section>

          {/* Procurement */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<PackageCheck size={15} />}
              title="Procurement Status"
              subtitle="Today's procurement activity"
            />

            <div className="p-4">

              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <PackageCheck size={18} />
                  </div>

                  <div>

                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Procurement Active
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-500 dark:text-slate-400">
                      Operations are running normally.
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  ACTIVE
                </span>

              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">

                <ProcurementStat
                  label="Quantity"
                  value={center.procurement.quantity}
                />

                <ProcurementStat
                  label="Value"
                  value={center.procurement.value}
                />

                <ProcurementStat
                  label="Transactions"
                  value={center.procurement.transactions}
                />

              </div>

            </div>

          </section>

        </div>

        {/* ===================================================
            OPERATIONAL INFORMATION
        ==================================================== */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <SectionHeader
            icon={<RefreshCw size={15} />}
            title="Operational Information"
            subtitle="Current centre monitoring details"
          />

          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">

            <OperationalItem
              label="Operating Status"
              value="Operational"
              icon={<CheckCircle2 size={14} />}
              success
            />

            <OperationalItem
              label="Capacity"
              value={`${capacityPercentage}% utilized`}
              icon={<Activity size={14} />}
            />

            <OperationalItem
              label="Queue"
              value={`${center.queue.waiting} waiting`}
              icon={<Clock3 size={14} />}
            />

            <OperationalItem
              label="Staff Availability"
              value={`${center.staff.available}/${center.staff.total} available`}
              icon={<Users size={14} />}
            />

          </div>

        </section>

        {/* ===================================================
            NOTICE
        ==================================================== */}

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <AlertCircle size={14} />
          </div>

          <div>

            <p className="text-[9px] font-black text-slate-800 dark:text-slate-200">
              Centre information
            </p>

            <p className="mt-0.5 text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
              This page provides the officer with an operational overview of the assigned centre. Capacity, queue and procurement information should reflect live centre data when connected to the backend.
            </p>

          </div>

        </div>

        <div className="h-6" />

      </div>

    </main>
  );
}

/* ==========================================================================
   METRIC CARD
========================================================================== */

function MetricCard({
  icon,
  label,
  value,
  sub,
  type,
}) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",

    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",

    purple:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div className="flex items-center gap-2.5">

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${styles[type]}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[8px] font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="truncate text-[8px] text-slate-400">
            {sub}
          </p>

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
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>

      <div className="min-w-0">

        <h2 className="text-xs font-black text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="truncate text-[8px] text-slate-400">
          {subtitle}
        </p>

      </div>

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
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">

      <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">

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
   SMALL INFO
========================================================================== */

function SmallInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">

      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   BOOKING STAT
========================================================================== */

function BookingStat({
  label,
  value,
  type,
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",

    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  };

  return (
    <div className={`rounded-xl p-3 ${styles[type]}`}>

      <p className="text-[8px] font-medium opacity-80">
        {label}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   QUEUE STAT
========================================================================== */

function QueueStat({
  label,
  value,
  type,
}) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  };

  return (
    <div
      className={`
        flex
        items-center
        justify-between
        rounded-xl
        p-3
        ${styles[type]}
      `}
    >

      <span className="text-[9px] font-semibold">
        {label}
      </span>

      <span className="text-sm font-black">
        {value}
      </span>

    </div>
  );
}

/* ==========================================================================
   PROCUREMENT STAT
========================================================================== */

function ProcurementStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">

      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-black text-slate-800 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================================
   OPERATIONAL ITEM
========================================================================== */

function OperationalItem({
  label,
  value,
  icon,
  success = false,
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg

          ${
            success
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400"
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[8px] text-slate-400">
          {label}
        </p>

        <p
          className={`
            mt-0.5
            truncate
            text-[10px]
            font-black

            ${
              success
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-800 dark:text-slate-200"
            }
          `}
        >
          {value}
        </p>

      </div>

    </div>
  );
}

/* ==========================================================================
   OPERATING BADGE
========================================================================== */

function OperatingBadge({
  status,
}) {
  const isOperational =
    status === "Operational";

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1.5
        text-[8px]
        font-bold

        ${
          isOperational
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
        }
      `}
    >

      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            isOperational
              ? "bg-emerald-500"
              : "bg-red-500"
          }
        `}
      />

      {status}

    </span>
  );
}