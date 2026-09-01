"use client";

import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  MapPin,
  PackageCheck,
  Trash2,
  UserCheck,
  Users,
  AlertTriangle,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   INITIAL NOTIFICATIONS
========================================================= */

const initialNotifications = [
  {
    id: "N001",
    type: "BOOKING",
    title: "New booking received",
    message:
      "Ramesh Kumar has created a new booking for Paddy procurement.",
    time: "2 min ago",
    date: "2026-09-01",
    read: false,
    priority: "NORMAL",
    bookingId: "BK1024",
    farmerId: "FR1024",
    farmer: "Ramesh Kumar",
  },
  {
    id: "N002",
    type: "ARRIVAL",
    title: "Farmer has arrived",
    message:
      "Suresh Singh has arrived at XYZ Farmer Centre.",
    time: "8 min ago",
    date: "2026-09-01",
    read: false,
    priority: "NORMAL",
    bookingId: "BK1025",
    farmerId: "FR1025",
    farmer: "Suresh Singh",
  },
  {
    id: "N003",
    type: "QUEUE",
    title: "Queue updated",
    message:
      "Token #105 has moved to processing.",
    time: "15 min ago",
    date: "2026-09-01",
    read: true,
    priority: "NORMAL",
    bookingId: "BK1025",
    farmerId: "FR1025",
    farmer: "Suresh Singh",
  },
  {
    id: "N004",
    type: "PROCUREMENT",
    title: "Procurement request received",
    message:
      "A new procurement request requires officer attention.",
    time: "24 min ago",
    date: "2026-09-01",
    read: false,
    priority: "HIGH",
    bookingId: "BK1026",
    farmerId: "FR1026",
    farmer: "Anita Devi",
  },
  {
    id: "N005",
    type: "PAYMENT",
    title: "Payment pending",
    message:
      "Payment for booking BK1023 is still pending verification.",
    time: "42 min ago",
    date: "2026-09-01",
    read: false,
    priority: "HIGH",
    bookingId: "BK1023",
    farmerId: "FR1023",
    farmer: "Mohan Das",
  },
  {
    id: "N006",
    type: "CAPACITY",
    title: "Centre capacity warning",
    message:
      "Today's queue has reached 85% of the centre's recommended capacity.",
    time: "1 hr ago",
    date: "2026-09-01",
    read: true,
    priority: "HIGH",
    bookingId: null,
    farmerId: null,
    farmer: null,
  },
  {
    id: "N007",
    type: "ADMIN",
    title: "Important admin notification",
    message:
      "Procurement centre operating guidelines have been updated.",
    time: "2 hrs ago",
    date: "2026-09-01",
    read: true,
    priority: "HIGH",
    bookingId: null,
    farmerId: null,
    farmer: null,
  },
  {
    id: "N008",
    type: "BOOKING",
    title: "New booking received",
    message:
      "Priya Devi has created a booking for Wheat procurement.",
    time: "Yesterday",
    date: "2026-08-31",
    read: true,
    priority: "NORMAL",
    bookingId: "BK1030",
    farmerId: "FR1030",
    farmer: "Priya Devi",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function OfficerNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState(initialNotifications);

  const [selectedId, setSelectedId] =
    useState(initialNotifications[0].id);

  const [filter, setFilter] = useState("ALL");

  const selectedNotification = notifications.find(
    (item) => item.id === selectedId
  );

  /* =======================================================
     FILTER
  ======================================================== */

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    if (filter === "HIGH") {
      return notifications.filter(
        (notification) =>
          notification.priority === "HIGH"
      );
    }

    return notifications;
  }, [notifications, filter]);

  /* =======================================================
     COUNTS
  ======================================================== */

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const highPriorityCount = notifications.filter(
    (notification) =>
      notification.priority === "HIGH"
  ).length;

  const todayCount = notifications.filter(
    (notification) =>
      notification.date === "2026-09-01"
  ).length;

  /* =======================================================
     MARK READ
  ======================================================== */

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  /* =======================================================
     MARK ALL READ
  ======================================================== */

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  /* =======================================================
     CLEAR
  ======================================================== */

  const clearNotification = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );

    if (selectedId === id) {
      const remaining = notifications.filter(
        (notification) => notification.id !== id
      );

      setSelectedId(
        remaining.length > 0
          ? remaining[0].id
          : null
      );
    }
  };

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================== */

  const openNotification = (notification) => {
    setSelectedId(notification.id);

    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  /* =======================================================
     VIEW RELATED
  ======================================================== */

  const viewRelated = (notification) => {
    if (!notification.bookingId) {
      return;
    }

    router.push(
      `/officer/bookings?bookingId=${notification.bookingId}`
    );
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col overflow-hidden p-3 sm:p-4 lg:p-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-3 flex shrink-0 items-center justify-between">

          <div>

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                Officer Operations
              </span>

            </div>

            <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Notifications
            </h1>

          </div>

          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex dark:border-slate-800 dark:bg-slate-900">

              <MapPin
                size={13}
                className="text-emerald-600 dark:text-emerald-400"
              />

              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                XYZ Farmer Centre
              </span>

            </div>

            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">

              <Bell size={13} />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
              )}

            </div>

          </div>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">

          <NotificationStat
            icon={<Bell size={13} />}
            label="Total Today"
            value={todayCount}
            type="blue"
          />

          <NotificationStat
            icon={<Clock3 size={13} />}
            label="Unread"
            value={unreadCount}
            type="amber"
          />

          <NotificationStat
            icon={<AlertTriangle size={13} />}
            label="Priority"
            value={highPriorityCount}
            type="red"
          />

          <NotificationStat
            icon={<CheckCheck size={13} />}
            label="Read"
            value={
              notifications.length - unreadCount
            }
            type="green"
          />

        </div>

        {/* =================================================
            MAIN NOTIFICATION PANEL
        ================================================= */}

        <section
          className="
            min-h-0
            flex-1
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >

          {/* PANEL HEADER */}

          <div
            className="
              flex
              h-[52px]
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-200
              px-3
              sm:px-4
              dark:border-slate-800
            "
          >

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                <Bell size={14} />

              </div>

              <div>

                <h2 className="text-xs font-black text-slate-900 dark:text-white">
                  Operational Notifications
                </h2>

                <p className="hidden text-[7px] text-slate-400 sm:block">
                  Stay updated with centre activity
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="
                flex
                h-7
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                text-[7px]
                font-black
                text-slate-500
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              <CheckCheck size={10} />
              Mark all read
            </button>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className="
              grid
              h-[calc(100%-52px)]
              min-h-0
              grid-cols-1
              lg:grid-cols-[minmax(0,1fr)_300px]
            "
          >

            {/* =================================================
                NOTIFICATION LIST
                ONLY THIS AREA SCROLLS
            ================================================= */}

            <div
              className="
                min-h-0
                overflow-hidden
                border-slate-200
                dark:border-slate-800
                lg:border-r
              "
            >

              {/* FILTER BAR */}

              <div className="flex h-[42px] shrink-0 items-center gap-1.5 border-b border-slate-100 px-3 dark:border-slate-800">

                <NotificationFilter
                  active={filter === "ALL"}
                  label="All"
                  count={notifications.length}
                  onClick={() =>
                    setFilter("ALL")
                  }
                />

                <NotificationFilter
                  active={filter === "UNREAD"}
                  label="Unread"
                  count={unreadCount}
                  onClick={() =>
                    setFilter("UNREAD")
                  }
                />

                <NotificationFilter
                  active={filter === "HIGH"}
                  label="Priority"
                  count={highPriorityCount}
                  onClick={() =>
                    setFilter("HIGH")
                  }
                />

              </div>

              {/* SCROLLABLE LIST */}

              <div
                className="
                  h-[calc(100%-42px)]
                  min-h-0
                  overflow-y-auto
                  overscroll-contain
                  scrollbar-thin
                  scrollbar-track-transparent
                  scrollbar-thumb-slate-300
                  dark:scrollbar-thumb-slate-700
                "
              >

                {filteredNotifications.length > 0 ? (

                  filteredNotifications.map(
                    (notification) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        selected={
                          selectedId ===
                          notification.id
                        }
                        onClick={() =>
                          openNotification(
                            notification
                          )
                        }
                        onRead={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      />
                    )
                  )

                ) : (

                  <EmptyNotifications />

                )}

              </div>

            </div>

            {/* =================================================
                SELECTED NOTIFICATION
            ================================================= */}

            <aside
              className="
                hidden
                min-h-0
                overflow-hidden
                bg-slate-50/60
                lg:block
                dark:bg-slate-950/20
              "
            >

              {selectedNotification ? (

                <NotificationDetails
                  notification={
                    selectedNotification
                  }
                  onClose={() =>
                    setSelectedId(null)
                  }
                  onRead={() =>
                    markAsRead(
                      selectedNotification.id
                    )
                  }
                  onClear={() =>
                    clearNotification(
                      selectedNotification.id
                    )
                  }
                  onViewRelated={() =>
                    viewRelated(
                      selectedNotification
                    )
                  }
                />

              ) : (

                <div className="flex h-full items-center justify-center px-5 text-center">

                  <div>

                    <Bell
                      size={22}
                      className="mx-auto text-slate-300 dark:text-slate-700"
                    />

                    <p className="mt-2 text-[9px] text-slate-400">
                      Select a notification to view details.
                    </p>

                  </div>

                </div>

              )}

            </aside>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function NotificationStat({
  icon,
  label,
  value,
  type,
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",

    red:
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",

    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles[type]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="truncate text-[7px] text-slate-400">
          {label}
        </p>

        <p className="text-sm font-black leading-none text-slate-900 dark:text-white">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function NotificationFilter({
  active,
  label,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-7
        items-center
        gap-1.5
        rounded-lg
        px-2.5
        text-[7px]
        font-black
        transition

        ${
          active
            ? "bg-emerald-600 text-white"
            : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        }
      `}
    >
      {label}

      <span
        className={`
          rounded-full
          px-1.5
          py-0.5
          text-[6px]

          ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }
        `}
      >
        {count}
      </span>

    </button>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  notification,
  selected,
  onClick,
  onRead,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        group
        flex
        cursor-pointer
        gap-2.5
        border-b
        border-slate-100
        px-3
        py-3
        transition
        sm:px-4
        dark:border-slate-800

        ${
          selected
            ? "bg-emerald-50/60 dark:bg-emerald-950/15"
            : notification.read
            ? "hover:bg-slate-50 dark:hover:bg-slate-800/30"
            : "bg-blue-50/30 hover:bg-blue-50/60 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
        }
      `}
    >

      {/* ICON */}

      <NotificationIcon
        type={notification.type}
        priority={notification.priority}
      />

      {/* CONTENT */}

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <div className="flex items-center gap-1.5">

              {!notification.read && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              )}

              <p
                className={`
                  truncate
                  text-[9px]
                  ${
                    notification.read
                      ? "font-bold text-slate-700 dark:text-slate-300"
                      : "font-black text-slate-900 dark:text-white"
                  }
                `}
              >
                {notification.title}
              </p>

            </div>

          </div>

          <span className="shrink-0 text-[7px] text-slate-400">
            {notification.time}
          </span>

        </div>

        <p className="mt-1 line-clamp-2 text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            {notification.priority === "HIGH" && (
              <span className="rounded-md bg-red-50 px-1.5 py-1 text-[6px] font-black text-red-600 dark:bg-red-950/30 dark:text-red-400">
                PRIORITY
              </span>
            )}

            {notification.bookingId && (
              <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[6px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {notification.bookingId}
              </span>
            )}

          </div>

          {!notification.read && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRead();
              }}
              className="flex h-6 items-center gap-1 rounded-md px-2 text-[6px] font-black text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Check size={9} />
              Read
            </button>
          )}

        </div>

      </div>

      <ChevronRight
        size={12}
        className={`
          mt-1
          shrink-0
          transition

          ${
            selected
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-300 group-hover:text-slate-500"
          }
        `}
      />

    </div>
  );
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
  priority,
}) {
  const config = {
    BOOKING: {
      icon: <CalendarDays size={13} />,
      style:
        "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },

    ARRIVAL: {
      icon: <UserCheck size={13} />,
      style:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },

    QUEUE: {
      icon: <Users size={13} />,
      style:
        "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    },

    PROCUREMENT: {
      icon: <PackageCheck size={13} />,
      style:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },

    PAYMENT: {
      icon: <CreditCard size={13} />,
      style:
        "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    },

    CAPACITY: {
      icon: <AlertTriangle size={13} />,
      style:
        "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    },

    ADMIN: {
      icon: <Info size={13} />,
      style:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  };

  const current =
    config[type] || config.ADMIN;

  return (
    <div
      className={`
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-lg
        ${current.style}
      `}
    >
      {current.icon}
    </div>
  );
}

/* =========================================================
   NOTIFICATION DETAILS
========================================================= */

function NotificationDetails({
  notification,
  onClose,
  onRead,
  onClear,
  onViewRelated,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      {/* HEADER */}

      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-800">

        <div>

          <p className="text-[7px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            Notification
          </p>

          <p className="mt-0.5 text-[9px] font-black text-slate-900 dark:text-white">
            Details
          </p>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X size={12} />
        </button>

      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1 overflow-hidden p-3">

        {/* ICON + TITLE */}

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-start gap-2.5">

            <NotificationIcon
              type={notification.type}
              priority={notification.priority}
            />

            <div className="min-w-0">

              <h3 className="text-[10px] font-black text-slate-900 dark:text-white">
                {notification.title}
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                {notification.time}
              </p>

            </div>

          </div>

          <p className="mt-3 text-[8px] leading-relaxed text-slate-600 dark:text-slate-300">
            {notification.message}
          </p>

        </div>

        {/* STATUS */}

        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

          <p className="mb-2 text-[7px] font-black uppercase tracking-wider text-slate-400">
            Status
          </p>

          <div className="flex items-center justify-between">

            <span className="text-[8px] text-slate-500 dark:text-slate-400">
              Notification
            </span>

            {notification.read ? (

              <span className="flex items-center gap-1 text-[7px] font-black text-emerald-600 dark:text-emerald-400">
                <CheckCheck size={10} />
                Read
              </span>

            ) : (

              <span className="flex items-center gap-1 text-[7px] font-black text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Unread
              </span>

            )}

          </div>

          <div className="mt-2 flex items-center justify-between">

            <span className="text-[8px] text-slate-500 dark:text-slate-400">
              Priority
            </span>

            <span
              className={
                notification.priority ===
                "HIGH"
                  ? "rounded-md bg-red-50 px-1.5 py-1 text-[6px] font-black text-red-600 dark:bg-red-950/30 dark:text-red-400"
                  : "rounded-md bg-slate-100 px-1.5 py-1 text-[6px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }
            >
              {notification.priority}
            </span>

          </div>

        </div>

        {/* RELATED */}

        {(notification.bookingId ||
          notification.farmer) && (

          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

            <p className="mb-1 text-[7px] font-black uppercase tracking-wider text-slate-400">
              Related Information
            </p>

            {notification.bookingId && (
              <DetailLine
                label="Booking"
                value={notification.bookingId}
              />
            )}

            {notification.farmer && (
              <DetailLine
                label="Farmer"
                value={notification.farmer}
              />
            )}

            {notification.farmerId && (
              <DetailLine
                label="Farmer ID"
                value={notification.farmerId}
              />
            )}

          </div>

        )}

      </div>

      {/* ACTIONS */}

      <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">

        <div className="grid grid-cols-2 gap-1.5">

          {!notification.read && (
            <NotificationAction
              icon={<Check size={10} />}
              label="Mark as Read"
              primary
              onClick={onRead}
            />
          )}

          {notification.bookingId && (
            <NotificationAction
              icon={<ChevronRight size={10} />}
              label="View Related"
              primary={notification.read}
              onClick={onViewRelated}
            />
          )}

          <NotificationAction
            icon={<Trash2 size={10} />}
            label="Clear"
            danger
            onClick={onClear}
          />

          <NotificationAction
            icon={<X size={10} />}
            label="Close"
            onClick={onClose}
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL LINE
========================================================= */

function DetailLine({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800">

      <span className="text-[7px] text-slate-400">
        {label}
      </span>

      <span className="max-w-[150px] truncate text-right text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   ACTION
========================================================= */

function NotificationAction({
  icon,
  label,
  onClick,
  primary = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-8
        items-center
        justify-center
        gap-1.5
        rounded-lg
        px-2
        text-[7px]
        font-black
        transition

        ${
          primary
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : danger
            ? "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyNotifications() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">

        <Bell size={20} />

      </div>

      <h3 className="mt-3 text-xs font-black text-slate-800 dark:text-slate-200">
        No notifications
      </h3>

      <p className="mt-1 text-[8px] text-slate-400">
        You're all caught up.
      </p>

    </div>
  );
}
