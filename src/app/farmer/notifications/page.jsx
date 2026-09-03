"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  Wheat,
  WalletCards,
  X,
} from "lucide-react";

/* ============================================================
   NOTIFICATION DATA
============================================================ */

// const INITIAL_NOTIFICATIONS = [
//   {
//     id: 1,
//     type: "queue",
//     title: "Your queue position changed",
//     message:
//       "You are now #8 in the procurement queue. 7 farmers are ahead of you.",
//     time: "5 min ago",
//     unread: true,
//     icon: Users,
//   },
//   {
//     id: 2,
//     type: "booking",
//     title: "Booking confirmed",
//     message:
//       "Your procurement slot at XYZ Procurement Centre has been confirmed.",
//     time: "32 min ago",
//     unread: true,
//     icon: CalendarDays,
//   },
//   {
//     id: 3,
//     type: "reminder",
//     title: "Procurement slot reminder",
//     message:
//       "Your procurement window is tomorrow from 10:00 – 11:00 AM.",
//     time: "2 hrs ago",
//     unread: true,
//     icon: Clock3,
//   },
//   {
//     id: 4,
//     type: "procurement",
//     title: "Paddy procurement is active",
//     message:
//       "Paddy procurement is currently available at your selected centre.",
//     time: "Yesterday",
//     unread: false,
//     icon: Wheat,
//   },
//   {
//     id: 5,
//     type: "queue",
//     title: "Queue is moving normally",
//     message:
//       "The average waiting time at XYZ Procurement Centre is currently 22 minutes.",
//     time: "Yesterday",
//     unread: false,
//     icon: BellRing,
//   },
//   {
//     id: 6,
//     type: "system",
//     title: "Centre information updated",
//     message:
//       "Procurement centre operating information has been updated.",
//     time: "2 days ago",
//     unread: false,
//     icon: Info,
//   },
//   {
//     id: 7,
//     type: "payment",
//     title: "Payment Completed",
//     message: "Your procurement payment has been successfully processed.",
//     time: "2 hr ago",
//     unread: false,
//     icon: WalletCards,
//   }
// ];

/* ============================================================
   MAIN PAGE
============================================================ */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // initialize icons

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Booking":
        return CalendarDays;

      case "Queue":
        return Users;

      case "Procurement":
        return Wheat;

      case "Payment":
        return WalletCards;

      default:
        return BellRing;
    }
  };

  // Fetch Notification API calling

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notification/get-all-notification");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      const formattedNotifications = (
        data.notifications || []
      ).map((notification) => ({
        id: notification._id,
        type: notification.type.toLowerCase(),
        title: notification.title,
        message: notification.message,
        time: new Date(
          notification.createdAt
        ).toLocaleString(),
        unread: !notification.isRead,
        icon: getNotificationIcon(notification.type),
      }));

      setNotifications(formattedNotifications);


    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filters = ["All", "Unread", "Booking", "Queue", "Procurement", "Payment"];

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return notification.unread;
    if (activeFilter === "Booking") return notification.type === "booking";
    if (activeFilter === "Queue") return notification.type === "queue";
    if (activeFilter === "Procurement") return notification.type === "procurement";
    if (activeFilter === "Payment") return notification.type === "payment";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notification/update-status/${id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification as read"
        );
      }

      // Update UI only after backend successfully updates MongoDB
      setNotifications((current) =>
        current.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification))
      );
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notification/mark-read-all", {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      // Update UI only after backend successfully updates MongoDB
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`/api/notification/delete-notification/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete notification"
        );
      }

      // Update UI only after backend successfully updates MongoDB
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error(
        "Error deleting notification:",
        error
      );
    }
  };

  const openNotification = (notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  return (
    <div className="relative h-full w-full flex flex-col min-h-0 overflow-hidden select-none">
      {/* Ambience Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-lime-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[8px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Notifications & Alerts
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-time updates regarding your queue status, gate passes, and bookings.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-3 text-[11px] font-bold transition hover:border-emerald-400 dark:border-white/10 dark:bg-slate-900/60"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Main Container Card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white/60 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 overflow-hidden">

        {/* Top Accent Strip */}
        <div className="h-0.5 w-full bg-linear-to-r from-emerald-500/20 via-emerald-500 to-lime-500/20" />

        {/* Filter Strip */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/30 px-3 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${activeFilter === filter
                  ? "bg-emerald-600 text-white"
                  : "bg-white/80 text-slate-600 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <BellRing className="h-3.5 w-3.5 text-emerald-500" />
            {unreadCount} unread
          </div>
        </div>

        {/* 2-Column Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-y-auto lg:overflow-hidden">

          {/* Notification Feed (8 cols) */}
          <section className="lg:col-span-8 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {filteredNotifications.length} updates found
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Sync Active
              </span>
            </div>

            {/* List with internal scroll */}
            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-0.5">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onOpen={() => openNotification(notification)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}

              {filteredNotifications.length === 0 && <EmptyState />}
            </div>
          </section>

          {/* Right Info Column (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between gap-3 min-h-0">

            {/* Unread Status Widget */}
            <div className="shrink-0 rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white">Active Alerts</p>
                    <p className="text-[10px] text-slate-400">Live feed status</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {unreadCount}
                </span>
              </div>
            </div>

            {/* Categories Info */}
            <div className="rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3 min-h-0 overflow-y-auto">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2.5">Channel Subscriptions</p>
              <div className="space-y-2">
                <NotificationType
                  icon={CalendarDays}
                  title="Booking updates"
                  text="Slot confirmations & yard entry times"
                />
                <NotificationType
                  icon={Users}
                  title="Queue updates"
                  text="Real-time position & weighbridge callouts"
                />
                <NotificationType
                  icon={Wheat}
                  title="Procurement alerts"
                  text="MSP price revisions & moisture limits"
                />
                <NotificationType
                  icon={Truck}
                  title="Delivery updates"
                  text="Gate 2 access and weighing logs"
                />
              </div>
            </div>

            {/* Notice Footer Card */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black text-slate-800 dark:text-white">Direct Push Active</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Critical notifications regarding your active token will appear highlighted at the top of your screen.
              </p>
            </div>

          </aside>

        </div>

        {/* Bottom Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-200/70 bg-slate-50/90 dark:border-white/10 dark:bg-slate-950/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">AGRINEX Automated Dispatch Notification Engine</span>
          </div>
          <span className="text-[10px]">Auto-refreshed</span>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-400 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3">
              <selectedNotification.icon className="h-5 w-5" />
            </div>

            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              AGRINEX Notification
            </span>

            <h3 className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
              {selectedNotification.title}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {selectedNotification.message}
            </p>

            <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
              <Clock3 className="h-3 w-3" />
              <span>{selectedNotification.time}</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="mt-4 w-full h-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   NOTIFICATION CARD
============================================================ */

function NotificationCard({ notification, onOpen, onDelete }) {
  const Icon = notification.icon;

  return (
    <div
      onClick={onOpen}
      className={`group relative flex items-center gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${notification.unread
        ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-sm"
        : "border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-800/40 hover:border-emerald-500/40"
        }`}
    >
      {/* Unread Pip */}
      {notification.unread && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
      )}

      {/* Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notification.unread
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-slate-100 dark:bg-slate-700/60 text-slate-400"
          }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Text Area */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`truncate text-xs ${notification.unread
              ? "font-black text-slate-900 dark:text-white"
              : "font-semibold text-slate-700 dark:text-slate-300"
              }`}
          >
            {notification.title}
          </h4>
          <span className="shrink-0 text-[9px] text-slate-400">{notification.time}</span>
        </div>
        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {notification.message}
        </p>
      </div>

      {/* Actions */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete notification"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
      </div>
    </div>
  );
}

/* ============================================================
   NOTIFICATION TYPE
============================================================ */

function NotificationType({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/50">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{title}</p>
        <p className="truncate text-[9px] text-slate-400">{text}</p>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-white/10 dark:bg-slate-800/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
        <Bell className="h-5 w-5" />
      </div>
      <h4 className="mt-2 text-xs font-black text-slate-800 dark:text-white">All caught up</h4>
      <p className="text-[10px] text-slate-400 mt-0.5">No notifications in this category.</p>
    </div>
  );
}