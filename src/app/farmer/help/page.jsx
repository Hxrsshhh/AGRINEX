"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Wallet,
  User,
  ShieldCheck,
  Truck,
  Clock3,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Headphones,
  LifeBuoy,
  ExternalLink,
  Ticket,
  Navigation,
  Wheat,
  RefreshCw,
  Info,
} from "lucide-react";

/* ============================================================
   HELP CATEGORIES
============================================================ */

const HELP_CATEGORIES = [
  {
    id: "booking",
    title: "Slot Booking",
    description: "Booking, rescheduling and cancellation",
    icon: CalendarDays,
  },
  {
    id: "centre",
    title: "Procurement Centre",
    description: "Centre, queue and gate information",
    icon: MapPin,
  },
  {
    id: "payment",
    title: "Payments",
    description: "Payment status and settlement issues",
    icon: Wallet,
  },
  {
    id: "profile",
    title: "Profile & e-KYC",
    description: "Account and verification assistance",
    icon: User,
  },
  {
    id: "queue",
    title: "Queue & Token",
    description: "Token, queue and arrival support",
    icon: Ticket,
  },
  {
    id: "procurement",
    title: "Procurement",
    description: "Produce quality and procurement process",
    icon: Wheat,
  },
];

/* ============================================================
   FAQ DATA
============================================================ */

const FAQS = [
  {
    id: 1,
    category: "booking",
    question: "How do I book a procurement slot?",
    answer:
      "Open Book Slot, select a procurement centre, choose your crop and quantity, select an available date and time window, enter your vehicle details and confirm the reservation.",
  },
  {
    id: 2,
    category: "booking",
    question: "Can I change my booked slot?",
    answer:
      "You can use the booking details page to check whether rescheduling is available for your reservation. Changes depend on slot availability and centre rules.",
  },
  {
    id: 3,
    category: "booking",
    question: "What happens if I miss my slot?",
    answer:
      "If you miss your allocated arrival window, contact the procurement centre or AGRINEX support. Your token may need to be revalidated or a new slot may need to be assigned.",
  },
  {
    id: 4,
    category: "centre",
    question: "How can I find the nearest procurement centre?",
    answer:
      "Use the procurement centre search and filter options to compare nearby centres, queue size, estimated waiting time and distance.",
  },
  {
    id: 5,
    category: "queue",
    question: "How is my queue position calculated?",
    answer:
      "Queue information is based on active bookings and arrivals recorded by the procurement centre. Your displayed position may change as farmers are processed.",
  },
  {
    id: 6,
    category: "queue",
    question: "Where can I find my gate token?",
    answer:
      "After successfully confirming a booking, AGRINEX generates a digital gate token. Open your booking confirmation to view the token and QR code.",
  },
  {
    id: 7,
    category: "payment",
    question: "When will my procurement payment arrive?",
    answer:
      "Payment status is displayed on the Payment Details page. A payment marked Processing is still undergoing settlement, while Paid indicates that the settlement has been completed.",
  },
  {
    id: 8,
    category: "payment",
    question: "My payment is delayed. What should I do?",
    answer:
      "First check the payment transaction status and UTR information. If the payment remains pending beyond the expected settlement period, raise a payment support ticket.",
  },
  {
    id: 9,
    category: "profile",
    question: "How do I update my profile information?",
    answer:
      "Open My Profile and select Edit Profile. Personal and contact information can be updated there. Government verification information may require correction through the appropriate authority.",
  },
  {
    id: 10,
    category: "profile",
    question: "Why is my e-KYC status important?",
    answer:
      "e-KYC helps verify your farmer identity and supports secure access to AGRINEX procurement services.",
  },
  {
    id: 11,
    category: "procurement",
    question: "What happens at the procurement centre?",
    answer:
      "At the centre, your booking and farmer identity are verified, your vehicle is checked, the produce is weighed and quality information is recorded before procurement processing.",
  },
  {
    id: 12,
    category: "procurement",
    question: "What if my produce quantity differs from my booking?",
    answer:
      "Inform the procurement-centre staff before weighing. The final accepted quantity is determined through the centre's weighing and procurement process.",
  },
];

/* ============================================================
   SUPPORT TICKETS
============================================================ */

const INITIAL_TICKETS = [
  {
    id: "AGR-48291",
    subject: "Payment still processing",
    category: "Payment",
    priority: "High",
    status: "Open",
    date: "28 Aug 2026",
    message:
      "My procurement payment is still showing as processing.",
  },
  {
    id: "AGR-47102",
    subject: "Booking slot clarification",
    category: "Slot Booking",
    priority: "Normal",
    status: "Resolved",
    date: "22 Aug 2026",
    message:
      "Needed clarification regarding my arrival time.",
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("all");

  const [openFaq, setOpenFaq] = useState(null);

  const [tickets, setTickets] =
    useState(INITIAL_TICKETS);

  const [showTicketModal, setShowTicketModal] =
    useState(false);

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [toast, setToast] = useState("");

  const [ticketForm, setTicketForm] = useState({
    category: "Slot Booking",
    subject: "",
    priority: "Normal",
    message: "",
  });

  /* ==========================================================
     TOAST
  ========================================================== */

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ==========================================================
     FILTER FAQS
  ========================================================== */

  const filteredFaqs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" ||
        faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  /* ==========================================================
     CREATE TICKET
  ========================================================== */

  const submitTicket = (e) => {
    e.preventDefault();

    if (!ticketForm.subject.trim()) {
      showToast("Please enter a support subject.");
      return;
    }

    if (!ticketForm.message.trim()) {
      showToast("Please describe your issue.");
      return;
    }

    const newTicket = {
      id: `AGR-${Math.floor(
        10000 + Math.random() * 89999
      )}`,
      subject: ticketForm.subject,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: "Open",
      date: "31 Aug 2026",
      message: ticketForm.message,
    };

    setTickets((prev) => [newTicket, ...prev]);

    setTicketForm({
      category: "Slot Booking",
      subject: "",
      priority: "Normal",
      message: "",
    });

    setShowTicketModal(false);

    showToast("Support ticket created successfully.");
  };

  /* ==========================================================
     VIEW TICKET
  ========================================================== */

  const viewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden">
      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600]">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-[10px] font-bold shadow-2xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="shrink-0 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <LifeBuoy className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Help & Support
              </h1>

              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Find answers or get assistance with AGRINEX.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTicketModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              Raise Ticket
            </span>
            <span className="sm:hidden">Ticket</span>
          </button>
        </div>
      </header>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="shrink-0 relative mb-2.5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles, bookings, payments, queues..."
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-[10px] outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="flex-1 min-h-0 grid lg:grid-cols-[190px_1fr_230px] gap-2.5 overflow-hidden">
        {/* ====================================================
            LEFT CATEGORIES
        ==================================================== */}

        <aside className="hidden lg:flex min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-200/70 dark:border-white/10">
            <p className="text-[8px] uppercase tracking-wider font-black text-slate-400">
              Help Topics
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            <CategoryButton
              active={activeCategory === "all"}
              icon={HelpCircle}
              title="All Topics"
              onClick={() => setActiveCategory("all")}
            />

            {HELP_CATEGORIES.map((category) => (
              <CategoryButton
                key={category.id}
                active={
                  activeCategory === category.id
                }
                icon={category.icon}
                title={category.title}
                onClick={() =>
                  setActiveCategory(category.id)
                }
              />
            ))}
          </div>
        </aside>

        {/* ====================================================
            CENTRE FAQ
        ==================================================== */}

        <section className="min-h-0 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm overflow-hidden flex flex-col">
          <div className="shrink-0 px-3 py-2.5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black">
                Frequently Asked Questions
              </h2>

              <p className="text-[8px] text-slate-400 mt-0.5">
                Quick answers to common farmer questions
              </p>
            </div>

            <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
              {filteredFaqs.length} articles
            </span>
          </div>

          {/* Mobile categories */}
          <div className="lg:hidden shrink-0 flex gap-1.5 p-2 overflow-x-auto border-b border-slate-200/70 dark:border-white/10">
            <MobileCategory
              active={activeCategory === "all"}
              title="All"
              onClick={() =>
                setActiveCategory("all")
              }
            />

            {HELP_CATEGORIES.map((category) => (
              <MobileCategory
                key={category.id}
                active={
                  activeCategory === category.id
                }
                title={category.title}
                onClick={() =>
                  setActiveCategory(category.id)
                }
              />
            ))}
          </div>

          {/* FAQ list */}
          <div className="flex-1 min-h-0 p-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-xl border transition-all ${
                      isOpen
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          isOpen ? null : faq.id
                        )
                      }
                      className="w-full flex items-center justify-between gap-2 p-2.5 text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isOpen
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          <HelpCircle className="h-3 w-3" />
                        </div>

                        <span className="text-[9px] sm:text-[10px] font-bold leading-tight">
                          {faq.question}
                        </span>
                      </div>

                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${
                          isOpen
                            ? "rotate-180 text-emerald-500"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-2.5 pb-2.5 pl-[2.85rem]">
                        <p className="text-[8px] sm:text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-5">
                <Search className="h-7 w-7 text-slate-300 dark:text-slate-700 mb-2" />

                <p className="text-xs font-black">
                  No help articles found
                </p>

                <p className="text-[9px] text-slate-400 mt-1">
                  Try a different search term or raise a
                  support ticket.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowTicketModal(true)
                  }
                  className="mt-3 px-3 py-2 rounded-lg bg-emerald-600 text-white text-[9px] font-bold"
                >
                  Contact Support
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            RIGHT SUPPORT PANEL
        ==================================================== */}

        <aside className="min-h-0 flex flex-col gap-2.5">
          {/* Contact */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-3.5 w-3.5 text-emerald-500" />

              <h2 className="text-xs font-black">
                Contact Support
              </h2>
            </div>

            <div className="space-y-1.5">
              <ContactOption
                icon={Phone}
                title="Farmer Helpline"
                value="1800-XXX-XXXX"
              />

              <ContactOption
                icon={MessageCircle}
                title="Live Assistance"
                value="Available 8 AM – 8 PM"
                green
              />

              <ContactOption
                icon={Mail}
                title="Email Support"
                value="support@agrinex"
              />
            </div>
          </section>

          {/* Quick Help */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="h-3.5 w-3.5 text-emerald-500" />

              <h2 className="text-xs font-black">
                Quick Help
              </h2>
            </div>

            <div className="space-y-1">
              <QuickHelp
                icon={CalendarDays}
                title="Booking issue"
                onClick={() => {
                  setActiveCategory("booking");
                  setSearch("");
                }}
              />

              <QuickHelp
                icon={Wallet}
                title="Payment issue"
                onClick={() => {
                  setActiveCategory("payment");
                  setSearch("");
                }}
              />

              <QuickHelp
                icon={MapPin}
                title="Centre / queue issue"
                onClick={() => {
                  setActiveCategory("centre");
                  setSearch("");
                }}
              />

              <QuickHelp
                icon={ShieldCheck}
                title="e-KYC issue"
                onClick={() => {
                  setActiveCategory("profile");
                  setSearch("");
                }}
              />

              <QuickHelp
                icon={Ticket}
                title="Track support ticket"
                onClick={() => {
                  const element =
                    document.getElementById(
                      "support-tickets"
                    );

                  element?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              />
            </div>
          </section>

          {/* Emergency */}
          <section className="rounded-2xl border border-red-500/15 bg-red-500/5 p-3">
            <div className="flex items-start gap-2">
              <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              </div>

              <div>
                <p className="text-[9px] font-black text-red-600 dark:text-red-400">
                  Urgent Assistance
                </p>

                <p className="text-[7px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                  For immediate safety or centre-entry
                  problems, contact the procurement centre
                  staff directly.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ======================================================
          SUPPORT TICKETS
      ====================================================== */}

      <section
        id="support-tickets"
        className="hidden"
      >
        {/* Kept in state for future dedicated ticket page */}
      </section>

      {/* ======================================================
          NEW TICKET MODAL
      ====================================================== */}

      {showTicketModal && (
        <div className="fixed inset-0 z-[500] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-xs font-black">
                    Raise Support Ticket
                  </h2>

                  <p className="text-[8px] text-slate-400">
                    Tell us what you need help with.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTicketModal(false)
                }
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={submitTicket}
              className="p-4 space-y-3"
            >
              <div>
                <label className="block mb-1 text-[8px] uppercase tracking-wider font-bold text-slate-400">
                  Issue Category
                </label>

                <select
                  value={ticketForm.category}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[9px] font-bold outline-none focus:border-emerald-500"
                >
                  <option>Slot Booking</option>
                  <option>Procurement Centre</option>
                  <option>Queue & Token</option>
                  <option>Payment</option>
                  <option>Profile & e-KYC</option>
                  <option>Procurement</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[8px] uppercase tracking-wider font-bold text-slate-400">
                  Subject
                </label>

                <input
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Briefly describe your issue"
                  className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[9px] outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-[8px] uppercase tracking-wider font-bold text-slate-400">
                  Priority
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  {["Low", "Normal", "High"].map(
                    (priority) => (
                      <button
                        type="button"
                        key={priority}
                        onClick={() =>
                          setTicketForm({
                            ...ticketForm,
                            priority,
                          })
                        }
                        className={`h-7 rounded-lg text-[8px] font-bold border ${
                          ticketForm.priority === priority
                            ? priority === "High"
                              ? "bg-red-500/10 border-red-500 text-red-500"
                              : "bg-emerald-500/10 border-emerald-500 text-emerald-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500"
                        }`}
                      >
                        {priority}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[8px] uppercase tracking-wider font-bold text-slate-400">
                  Describe Your Issue
                </label>

                <textarea
                  value={ticketForm.message}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Provide booking ID, payment ID, centre name or other relevant details..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[9px] outline-none resize-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setShowTicketModal(false)
                  }
                  className="flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          TICKET DETAILS MODAL
      ====================================================== */}

      {selectedTicket && (
        <div className="fixed inset-0 z-[550] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-wider text-emerald-500 font-black">
                  Support Ticket
                </p>

                <h2 className="text-xs font-black mt-0.5">
                  {selectedTicket.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTicket(null)
                }
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-black">
                  {selectedTicket.subject}
                </h3>

                <p className="text-[8px] text-slate-400 mt-1">
                  Created {selectedTicket.date}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <TicketDetail
                  label="Category"
                  value={selectedTicket.category}
                />

                <TicketDetail
                  label="Priority"
                  value={selectedTicket.priority}
                />

                <TicketDetail
                  label="Status"
                  value={selectedTicket.status}
                  green={
                    selectedTicket.status ===
                    "Resolved"
                  }
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Issue Description
                </p>

                <p className="text-[9px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedTicket.message}
                </p>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />

                <p className="text-[8px] text-slate-500 dark:text-slate-400">
                  Support responses will be linked to your
                  AGRINEX farmer account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTicket(null)
                }
                className="w-full h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CATEGORY BUTTON
============================================================ */

function CategoryButton({
  active,
  icon: Icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition ${
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />

      <span className="text-[8px] font-bold truncate">
        {title}
      </span>

      {active && (
        <ChevronRight className="h-3 w-3 ml-auto shrink-0" />
      )}
    </button>
  );
}

/* ============================================================
   MOBILE CATEGORY
============================================================ */

function MobileCategory({
  active,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-[8px] font-bold whitespace-nowrap ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      }`}
    >
      {title}
    </button>
  );
}

/* ============================================================
   CONTACT OPTION
============================================================ */

function ContactOption({
  icon: Icon,
  title,
  value,
  green = false,
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
    >
      <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Icon className="h-3 w-3 text-emerald-500" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black">
          {title}
        </p>

        <p
          className={`text-[7px] mt-0.5 truncate ${
            green
              ? "text-emerald-500"
              : "text-slate-400"
          }`}
        >
          {value}
        </p>
      </div>
    </button>
  );
}

/* ============================================================
   QUICK HELP
============================================================ */

function QuickHelp({
  icon: Icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-emerald-500" />

        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
          {title}
        </span>
      </div>

      <ChevronRight className="h-3 w-3 text-slate-400" />
    </button>
  );
}

/* ============================================================
   TICKET DETAIL
============================================================ */

function TicketDetail({
  label,
  value,
  green = false,
}) {
  return (
    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
      <p className="text-[7px] text-slate-400">
        {label}
      </p>

      <p
        className={`text-[8px] font-black mt-0.5 ${
          green ? "text-emerald-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}