"use client";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBasket,
  Users,
} from "lucide-react";

import { useState } from "react";

export default function CentersPage() {
  const [capacity, setCapacity] = useState(30);
  const [savedCapacity, setSavedCapacity] = useState(30);

  const bookedSlots = 24;
  const currentQueue = 5;
  const processingQueue = 1;
  const waitingQueue = 4;

  const capacityPercentage = Math.round(
    (bookedSlots / savedCapacity) * 100
  );

  const increaseCapacity = () => {
    setCapacity((value) => Math.min(value + 1, 100));
  };

  const decreaseCapacity = () => {
    setCapacity((value) =>
      Math.max(value - 1, bookedSlots)
    );
  };

  const saveCapacity = () => {
    setSavedCapacity(capacity);
  };

  return (
    /*
      IMPORTANT:
      The whole page is now naturally scrollable.
      No inner scroll container is used.
    */
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5 lg:p-6">

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <div className="min-w-0">

            <div className="mb-1.5 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                Centre Management
              </span>

            </div>

            <h1 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
              XYZ Farmer Centre
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 md:text-xs">
              Manage centre operations, capacity and today's workload.
            </p>

          </div>

          {/* Centre Status */}

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/30">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </span>

            <div>

              <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
                Centre Status
              </p>

              <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                Operational
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            TOP METRICS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">

          <MetricCard
            icon={<Activity size={16} />}
            label="Centre Capacity"
            value={`${capacityPercentage}%`}
            sub={`${bookedSlots}/${savedCapacity} slots booked`}
            type="green"
          />

          <MetricCard
            icon={<CalendarDays size={16} />}
            label="Today's Workload"
            value="24"
            sub="Bookings today"
            type="blue"
          />

          <MetricCard
            icon={<Users size={16} />}
            label="Live Queue"
            value="#104"
            sub={`${currentQueue} farmers in queue`}
            type="purple"
          />

          <MetricCard
            icon={<ShoppingBasket size={16} />}
            label="Procurement"
            value="1.24T"
            sub="₹72,450 today"
            type="amber"
          />

        </div>

        {/* ===================================================
            CENTRE STATUS + WORKLOAD
        ==================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          {/* Centre Status */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Activity size={15} />}
              title="Centre Status"
              subtitle="Current operational condition"
            />

            <div className="p-4">

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>

                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Centre Operational
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-500 dark:text-slate-400">
                      All major services are running normally.
                    </p>

                  </div>

                </div>

                <span className="hidden rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 sm:block">
                  ACTIVE
                </span>

              </div>

              {/* Capacity */}

              <div className="mt-4">

                <div className="mb-1.5 flex items-center justify-between">

                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                    Today's Capacity
                  </span>

                  <span className="text-[9px] font-black text-slate-800 dark:text-slate-200">
                    {bookedSlots}/{savedCapacity}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        capacityPercentage,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <p className="mt-1 text-[8px] text-slate-400">
                  {Math.max(
                    savedCapacity - bookedSlots,
                    0
                  )}{" "}
                  slots remaining
                </p>

              </div>

              {/* Status Grid */}

              <div className="mt-4 grid grid-cols-2 gap-2">

                <SmallStatus
                  label="Staff Available"
                  value="04 / 05"
                />

                <SmallStatus
                  label="Today's Slots"
                  value={`${bookedSlots} / ${savedCapacity}`}
                />

                <SmallStatus
                  label="Queue"
                  value={currentQueue}
                />

                <SmallStatus
                  label="Last Updated"
                  value="2 min ago"
                />

              </div>

            </div>

          </section>

          {/* Today's Workload */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<CalendarDays size={15} />}
              title="Today's Workload"
              subtitle="Operational summary for today"
            />

            <div className="grid grid-cols-2 gap-2 p-4">

              <WorkloadItem
                icon={<CalendarDays size={14} />}
                label="Bookings"
                value="24"
                sub="Today's bookings"
              />

              <WorkloadItem
                icon={<CheckCircle2 size={14} />}
                label="Completed"
                value="18"
                sub="Completed today"
              />

              <WorkloadItem
                icon={<Clock3 size={14} />}
                label="Pending"
                value="07"
                sub="Need attention"
              />

              <WorkloadItem
                icon={<ShoppingBasket size={14} />}
                label="Procurement"
                value="1,240 kg"
                sub="₹72,450 value"
              />

            </div>

          </section>

        </div>

        {/* ===================================================
            SLOT MANAGEMENT + LIVE QUEUE
        ==================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          {/* Slot Management */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<CalendarDays size={15} />}
              title="Slot Management"
              subtitle="Manage today's available slots"
            />

            <div className="p-4">

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-medium text-slate-400">
                      Today's Available Slots
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {capacity}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">
                      {bookedSlots} already booked
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={decreaseCapacity}
                      disabled={capacity <= bookedSlots}
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        transition
                        hover:border-emerald-500
                        hover:text-emerald-600
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-slate-400
                      "
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-slate-200">
                      {capacity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseCapacity}
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        transition
                        hover:border-emerald-500
                        hover:text-emerald-600
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-slate-400
                      "
                    >
                      <Plus size={14} />
                    </button>

                  </div>

                </div>

              </div>

              <div className="mt-3 flex items-center justify-between">

                <div>

                  <p className="text-[8px] text-slate-400">
                    New capacity
                  </p>

                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">
                    {capacity} slots
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-[8px] text-slate-400">
                    Available
                  </p>

                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {Math.max(
                      capacity - bookedSlots,
                      0
                    )}{" "}
                    slots
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={saveCapacity}
                disabled={capacity === savedCapacity}
                className="
                  mt-3
                  flex
                  h-9
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-emerald-600
                  text-[9px]
                  font-bold
                  text-white
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:bg-slate-200
                  disabled:text-slate-400
                  dark:disabled:bg-slate-800
                  dark:disabled:text-slate-600
                "
              >
                <RefreshCw size={12} />
                Save Slot Capacity
              </button>

            </div>

          </section>

          {/* Live Queue */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <SectionHeader
              icon={<Clock3 size={15} />}
              title="Live Queue"
              subtitle="Current queue at the centre"
            />

            <div className="p-4">

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Current Token
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    #104
                  </p>

                  <p className="mt-0.5 text-[8px] text-slate-400">
                    Processing now
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

                <QueueItem
                  label="Processing"
                  value={processingQueue}
                  type="green"
                />

                <QueueItem
                  label="Waiting"
                  value={waitingQueue}
                  type="amber"
                />

              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">

                <div>

                  <p className="text-[8px] text-slate-400">
                    Next Token
                  </p>

                  <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-200">
                    #105
                  </p>

                </div>

                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-1
                    text-[8px]
                    font-bold
                    text-emerald-600
                    hover:text-emerald-700
                    dark:text-emerald-400
                  "
                >
                  Manage Queue
                  <ChevronRight size={11} />
                </button>

              </div>

            </div>

          </section>

        </div>

        {/* ===================================================
            PROCUREMENT ACTIVITY
        ==================================================== */}

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <SectionHeader
            icon={<ShoppingBasket size={15} />}
            title="Procurement Activity"
            subtitle="Today's procurement at this centre"
          />

          {/* Desktop Header */}

          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40 md:grid">

            <TableHeading>
              Crop
            </TableHeading>

            <TableHeading>
              Quantity
            </TableHeading>

            <TableHeading>
              Value
            </TableHeading>

            <TableHeading>
              Transactions
            </TableHeading>

          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">

            <ProcurementRow
              crop="Wheat"
              quantity="620 kg"
              value="₹36,580"
              transactions="9"
            />

            <ProcurementRow
              crop="Rice"
              quantity="420 kg"
              value="₹24,920"
              transactions="6"
            />

            <ProcurementRow
              crop="Vegetables"
              quantity="200 kg"
              value="₹10,950"
              transactions="3"
            />

          </div>

          {/* Total */}

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40 md:px-5">

            <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

              <div>
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Total
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white">
                  1,240 kg
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  ₹72,450
                </p>
              </div>

              <div className="hidden md:block">
                <p className="text-[10px] font-black text-slate-900 dark:text-white">
                  18
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            ALERT
        ==================================================== */}

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertCircle size={15} />
          </div>

          <div>

            <p className="text-[9px] font-black text-slate-800 dark:text-slate-200">
              Capacity approaching limit
            </p>

            <p className="mt-0.5 text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
              {bookedSlots} of {savedCapacity} available slots are currently booked. Monitor incoming bookings and queue activity.
            </p>

          </div>

        </div>

        {/* Bottom spacing */}
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
   SMALL STATUS
========================================================================== */

function SmallStatus({
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
   WORKLOAD ITEM
========================================================================== */

function WorkloadItem({
  icon,
  label,
  value,
  sub,
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">

      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>

      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] text-slate-400">
        {sub}
      </p>

    </div>
  );
}

/* ==========================================================================
   QUEUE ITEM
========================================================================== */

function QueueItem({
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
   PROCUREMENT ROW
========================================================================== */

function ProcurementRow({
  crop,
  quantity,
  value,
  transactions,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-4 md:px-5">

      <div className="flex items-center gap-2">

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <PackageCheck size={13} />
        </div>

        <div>

          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
            {crop}
          </p>

          <p className="text-[8px] text-slate-400 md:hidden">
            Crop
          </p>

        </div>

      </div>

      <div>

        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
          {quantity}
        </p>

        <p className="text-[8px] text-slate-400 md:hidden">
          Quantity
        </p>

      </div>

      <div>

        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
          {value}
        </p>

        <p className="text-[8px] text-slate-400 md:hidden">
          Value
        </p>

      </div>

      <div>

        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
          {transactions}
        </p>

        <p className="text-[8px] text-slate-400 md:hidden">
          Transactions
        </p>

      </div>

    </div>
  );
}

/* ==========================================================================
   TABLE HEADING
========================================================================== */

function TableHeading({
  children,
}) {
  return (
    <span className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
      {children}
    </span>
  );
}