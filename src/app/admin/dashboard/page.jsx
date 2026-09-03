"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserCog,
  Building2,
  CalendarDays,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Wheat,
  IndianRupee,
  Activity,
  MapPin,
  UserCheck,
  CircleAlert,
} from "lucide-react";

/* ============================================================
   DUMMY DASHBOARD DATA
   Replace these with API data later
============================================================ */

const dashboardData = {
  totalFarmers: 2450,
  verifiedFarmers: 1980,
  pendingFarmers: 470,

  totalOfficers: 32,
  activeOfficers: 28,

  activeCentres: 18,
  inactiveCentres: 3,

  todaysBookings: 126,
  todaysCompleted: 84,

  pendingBookings: 12,
  rejectedBookings: 9,

  totalQuantity: 12450,
  totalPayment: 2845600,

  centres: [
    {
      name: "Bokaro",
      district: "Bokaro",
      officer: "Rahul Kumar",
      bookings: 32,
      completed: 24,
      quantity: 420,
      status: "ACTIVE",
    },
    {
      name: "Dhanbad",
      district: "Dhanbad",
      officer: "Amit Kumar",
      bookings: 28,
      completed: 19,
      quantity: 315,
      status: "ACTIVE",
    },
    {
      name: "Ranchi",
      district: "Ranchi",
      officer: "Suresh Kumar",
      bookings: 25,
      completed: 17,
      quantity: 280,
      status: "ACTIVE",
    },
    {
      name: "Giridih",
      district: "Giridih",
      officer: "Priya Kumari",
      bookings: 18,
      completed: 14,
      quantity: 195,
      status: "ACTIVE",
    },
  ],

  bookingStatus: {
    completed: 84,
    booked: 21,
    cancelled: 12,
    rejected: 9,
  },

  recentActivity: [
    {
      title: "Officer Rahul Kumar activated",
      time: "5 minutes ago",
      type: "officer",
    },
    {
      title: "Bokaro Procurement Centre updated",
      time: "18 minutes ago",
      type: "centre",
    },
    {
      title: "Officer Amit Kumar assigned to Dhanbad Centre",
      time: "35 minutes ago",
      type: "officer",
    },
    {
      title: "New Procurement Centre created",
      time: "1 hour ago",
      type: "centre",
    },
  ],
};

/* ============================================================
   MAIN PAGE
============================================================ */

export default function AdminDashboardPage() {
  const completionRate =
    dashboardData.todaysBookings > 0
      ? Math.round(
          (dashboardData.todaysCompleted /
            dashboardData.todaysBookings) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100">
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

          {/* GREETING */}

          <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Thursday • 03 September 2026
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
                Good Morning, Admin 👋
              </h1>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Here's today's AGRINEX system overview.
              </p>
            </div>

            {/* QUICK ACTIONS */}

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/officers/create"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 transition-colors"
              >
                <UserCog className="w-3.5 h-3.5" />
                Create Officer
              </Link>

              <Link
                href="/admin/centres/create"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-black hover:opacity-90 transition-opacity"
              >
                <Building2 className="w-3.5 h-3.5" />
                Create Centre
              </Link>

              <Link
                href="/admin/daily-slip"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Daily Slip
              </Link>
            </div>
          </div>

          {/* ====================================================
              KPI ROW 1
          ==================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Farmers"
              value={formatNumber(
                dashboardData.totalFarmers
              )}
              subtitle="+84 this month"
              icon={Users}
              iconClass="bg-blue-500/10 text-blue-500"
              trend="+3.5%"
              trendPositive
            />

            <StatCard
              title="Verified Farmers"
              value={formatNumber(
                dashboardData.verifiedFarmers
              )}
              subtitle={`${Math.round(
                (dashboardData.verifiedFarmers /
                  dashboardData.totalFarmers) *
                  100
              )}% of total farmers`}
              icon={UserCheck}
              iconClass="bg-emerald-500/10 text-emerald-500"
              trend="+5.2%"
              trendPositive
            />

            <StatCard
              title="Pending Verification"
              value={formatNumber(
                dashboardData.pendingFarmers
              )}
              subtitle="Awaiting officer verification"
              icon={Clock3}
              iconClass="bg-amber-500/10 text-amber-500"
              trend="Needs attention"
            />

            <StatCard
              title="Total Officers"
              value={formatNumber(
                dashboardData.totalOfficers
              )}
              subtitle={`${dashboardData.activeOfficers} active officers`}
              icon={UserCog}
              iconClass="bg-violet-500/10 text-violet-500"
              trend={`${dashboardData.totalOfficers -
                dashboardData.activeOfficers} inactive`}
            />
          </div>

          {/* ====================================================
              KPI ROW 2
          ==================================================== */}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Active Procurement Centres"
              value={formatNumber(
                dashboardData.activeCentres
              )}
              subtitle={`${dashboardData.inactiveCentres} inactive`}
              icon={Building2}
              iconClass="bg-teal-500/10 text-teal-500"
              trend="Operational"
              trendPositive
            />

            <StatCard
              title="Today's Bookings"
              value={formatNumber(
                dashboardData.todaysBookings
              )}
              subtitle="+14 compared to yesterday"
              icon={CalendarDays}
              iconClass="bg-cyan-500/10 text-cyan-500"
              trend="+12.5%"
              trendPositive
            />

            <StatCard
              title="Completed Procurements"
              value={formatNumber(
                dashboardData.todaysCompleted
              )}
              subtitle={`${completionRate}% completion rate`}
              icon={CheckCircle2}
              iconClass="bg-emerald-500/10 text-emerald-500"
              trend="Today"
              trendPositive
            />

            <StatCard
              title="Pending / Rejected"
              value={formatNumber(
                dashboardData.pendingBookings +
                  dashboardData.rejectedBookings
              )}
              subtitle={`${dashboardData.pendingBookings} pending • ${dashboardData.rejectedBookings} rejected`}
              icon={CircleAlert}
              iconClass="bg-rose-500/10 text-rose-500"
              trend="Attention"
            />
          </div>

          {/* ====================================================
              FINANCIAL SUMMARY
          ==================================================== */}

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SummaryCard
              title="Procurement Summary"
              icon={Wheat}
              iconClass="bg-emerald-500/10 text-emerald-500"
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-black">
                    {formatNumber(
                      dashboardData.totalQuantity
                    )}{" "}
                    <span className="text-sm font-bold text-slate-400">
                      Quintal
                    </span>
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Total quantity procured
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black">
                  <TrendingUp className="w-3 h-3" />
                  +8.4%
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <MiniMetric
                  label="Today"
                  value="1,240 Q"
                />

                <MiniMetric
                  label="This Month"
                  value="8,420 Q"
                />

                <MiniMetric
                  label="All Time"
                  value="12,450 Q"
                />
              </div>
            </SummaryCard>

            <SummaryCard
              title="Payment Summary"
              icon={IndianRupee}
              iconClass="bg-blue-500/10 text-blue-500"
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-black">
                    ₹
                    {formatNumber(
                      dashboardData.totalPayment
                    )}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Total payment amount
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-black">
                  <TrendingUp className="w-3 h-3" />
                  +6.8%
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <MiniMetric
                  label="Today"
                  value="₹2.84L"
                />

                <MiniMetric
                  label="This Month"
                  value="₹18.42L"
                />

                <MiniMetric
                  label="All Time"
                  value="₹28.45L"
                />
              </div>
            </SummaryCard>
          </div>

          {/* ====================================================
              TODAY'S PROCUREMENT CENTRES
          ==================================================== */}

          <section className="mt-4 rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />

                  <h2 className="text-sm font-black">
                    Today's Procurement Centres
                  </h2>
                </div>

                <p className="mt-1 text-[9px] text-slate-400">
                  Centre-wise operational performance
                </p>
              </div>

              <Link
                href="/admin/centres"
                className="text-[9px] font-black text-emerald-500 hover:underline"
              >
                View All Centres →
              </Link>
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Centre
                    </th>

                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Officer
                    </th>

                    <th className="text-center px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Bookings
                    </th>

                    <th className="text-center px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Completed
                    </th>

                    <th className="text-center px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Quantity
                    </th>

                    <th className="text-center px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.centres.map(
                    (centre) => (
                      <tr
                        key={centre.name}
                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-emerald-500" />
                            </div>

                            <div>
                              <p className="text-[11px] font-black">
                                {centre.name}
                              </p>

                              <p className="text-[8px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />

                                {centre.district}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-[10px] font-bold">
                            {centre.officer}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="text-[11px] font-black">
                            {centre.bookings}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="text-[11px] font-black text-emerald-500">
                            {centre.completed}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="text-[11px] font-black">
                            {formatNumber(
                              centre.quantity
                            )}{" "}
                            Q
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <StatusBadge
                            status={
                              centre.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {dashboardData.centres.map(
                (centre) => (
                  <div
                    key={centre.name}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-emerald-500" />
                        </div>

                        <div>
                          <p className="text-xs font-black">
                            {centre.name}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            {centre.officer}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={
                          centre.status
                        }
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MiniMetric
                        label="Bookings"
                        value={
                          centre.bookings
                        }
                      />

                      <MiniMetric
                        label="Completed"
                        value={
                          centre.completed
                        }
                      />

                      <MiniMetric
                        label="Quantity"
                        value={`${centre.quantity} Q`}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ====================================================
              BOTTOM GRID
          ==================================================== */}

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* BOOKING STATUS */}

            <section className="rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black">
                    Booking Status
                  </h2>

                  <p className="text-[9px] text-slate-400 mt-1">
                    Today's booking distribution
                  </p>
                </div>

                <CalendarDays className="w-4 h-4 text-cyan-500" />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-center">
                  <DonutChart
                    values={[
                      dashboardData.bookingStatus
                        .completed,
                      dashboardData.bookingStatus
                        .booked,
                      dashboardData.bookingStatus
                        .cancelled,
                      dashboardData.bookingStatus
                        .rejected,
                    ]}
                    total={
                      dashboardData.todaysBookings
                    }
                  />
                </div>

                <div className="space-y-3">
                  <StatusRow
                    label="Completed"
                    value={
                      dashboardData.bookingStatus
                        .completed
                    }
                    total={
                      dashboardData.todaysBookings
                    }
                    type="completed"
                  />

                  <StatusRow
                    label="Booked"
                    value={
                      dashboardData.bookingStatus
                        .booked
                    }
                    total={
                      dashboardData.todaysBookings
                    }
                    type="booked"
                  />

                  <StatusRow
                    label="Cancelled"
                    value={
                      dashboardData.bookingStatus
                        .cancelled
                    }
                    total={
                      dashboardData.todaysBookings
                    }
                    type="cancelled"
                  />

                  <StatusRow
                    label="Rejected"
                    value={
                      dashboardData.bookingStatus
                        .rejected
                    }
                    total={
                      dashboardData.todaysBookings
                    }
                    type="rejected"
                  />
                </div>
              </div>
            </section>

            {/* CENTRE STATUS */}

            <section className="rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black">
                    Centre Status
                  </h2>

                  <p className="text-[9px] text-slate-400 mt-1">
                    Current procurement centre availability
                  </p>
                </div>

                <Building2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="mt-5 flex items-center gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <div className="absolute inset-0 rounded-full border-12 border-emerald-500" />

                  <div className="absolute inset-3 rounded-full bg-white dark:bg-[#0d141b] flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">
                      {
                        dashboardData.activeCentres
                      }
                    </span>

                    <span className="text-[8px] font-bold text-slate-400">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

                      <span className="text-xs font-bold">
                        Active
                      </span>
                    </div>

                    <span className="text-xs font-black">
                      {
                        dashboardData.activeCentres
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />

                      <span className="text-xs font-bold">
                        Inactive
                      </span>
                    </div>

                    <span className="text-xs font-black">
                      {
                        dashboardData.inactiveCentres
                      }
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] text-slate-400">
                      Total Centres
                    </p>

                    <p className="mt-0.5 text-sm font-black">
                      {dashboardData.activeCentres +
                        dashboardData.inactiveCentres}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ====================================================
              OFFICER STATUS + RECENT ACTIVITY
          ==================================================== */}

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* OFFICER STATUS */}

            <section className="rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black">
                    Officer Status
                  </h2>

                  <p className="text-[9px] text-slate-400 mt-1">
                    Current officer accounts
                  </p>
                </div>

                <UserCog className="w-4 h-4 text-violet-500" />
              </div>

              <div className="mt-5 space-y-4">
                <ProgressRow
                  label="Active"
                  value={
                    dashboardData.activeOfficers
                  }
                  total={
                    dashboardData.totalOfficers
                  }
                />

                <ProgressRow
                  label="Inactive"
                  value={
                    dashboardData.totalOfficers -
                    dashboardData.activeOfficers
                  }
                  total={
                    dashboardData.totalOfficers
                  }
                />

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">
                    Total Officers
                  </span>

                  <span className="text-sm font-black">
                    {
                      dashboardData.totalOfficers
                    }
                  </span>
                </div>
              </div>

              <Link
                href="/admin/officers"
                className="mt-5 block w-full py-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 text-center text-[10px] font-black hover:bg-violet-500/20 transition-colors"
              >
                Manage Officers →
              </Link>
            </section>

            {/* RECENT ACTIVITY */}

            <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black">
                    Recent Activity
                  </h2>

                  <p className="text-[9px] text-slate-400 mt-1">
                    Latest administrative actions
                  </p>
                </div>

                <Activity className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {dashboardData.recentActivity.map(
                  (
                    activity,
                    index
                  ) => (
                    <div
                      key={index}
                      className="py-3 flex items-center gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type ===
                          "officer"
                            ? "bg-violet-500/10 text-violet-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {activity.type ===
                        "officer" ? (
                          <UserCog className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate">
                          {
                            activity.title
                          }
                        </p>

                        <p className="text-[8px] text-slate-400 mt-0.5">
                          {
                            activity.time
                          }
                        </p>
                      </div>

                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <footer className="mt-6 pb-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[8px] text-slate-400">
            <span>
              © 2026 AGRINEX • Administration Portal
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              System Operational
            </span>
          </footer>
      </main>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
  trendPositive = false,
}) {
  return (
    <div className="group rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/5 transition-all">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span
          className={`text-[8px] font-black px-2 py-1 rounded-lg ${
            trendPositive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}
        >
          {trend}
        </span>
      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  icon: Icon,
  iconClass,
  children,
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0d141b] border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <h2 className="text-sm font-black">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   MINI METRIC
============================================================ */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-2.5">
      <p className="text-[8px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-black">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}) {
  const active =
    status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black ${
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
}

/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({
  label,
  value,
  total,
  type,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  const dotClass =
    type === "completed"
      ? "bg-emerald-500"
      : type === "booked"
      ? "bg-blue-500"
      : type === "cancelled"
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${dotClass}`}
          />

          <span className="text-[10px] font-bold">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black">
            {value}
          </span>

          <span className="text-[8px] text-slate-400">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${dotClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   PROGRESS ROW
============================================================ */

function ProgressRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold">
          {label}
        </span>

        <span className="text-[10px] font-black">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-[8px] text-slate-400 text-right">
        {percentage}%
      </p>
    </div>
  );
}

/* ============================================================
   DONUT CHART
============================================================ */

function DonutChart({
  values,
  total,
}) {
  const radius = 45;
  const circumference =
    2 * Math.PI * radius;

  const colors = [
    "stroke-emerald-500",
    "stroke-blue-500",
    "stroke-amber-500",
    "stroke-rose-500",
  ];

  let accumulated = 0;

  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-slate-100 dark:stroke-slate-800"
        />

        {values.map(
          (value, index) => {
            const percentage =
              total > 0
                ? value / total
                : 0;

            const dash =
              percentage *
              circumference;

            const offset =
              -accumulated *
              circumference;

            accumulated +=
              percentage;

            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="12"
                strokeLinecap="butt"
                className={
                  colors[index]
                }
                strokeDasharray={`${dash} ${
                  circumference - dash
                }`}
                strokeDashoffset={
                  offset
                }
              />
            );
          }
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black">
          {total}
        </span>

        <span className="text-[8px] font-bold text-slate-400">
          BOOKINGS
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   NUMBER FORMAT
============================================================ */

function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}
