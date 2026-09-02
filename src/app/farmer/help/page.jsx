"use client";

import React, { useMemo, useState } from "react";
import {
  Search, HelpCircle, MessageCircle, Phone, Mail, MapPin, CalendarDays,
  Wallet, User, ShieldCheck, Clock3, ChevronRight, ChevronDown, Plus, X,
  Send, CheckCircle2, AlertCircle, Headphones, LifeBuoy, Ticket, Wheat, Sparkles,
} from "lucide-react";

const HELP_CATEGORIES = [
  { id: "booking", title: "Slot Booking", icon: CalendarDays },
  { id: "centre", title: "Procurement Centre", icon: MapPin },
  { id: "payment", title: "Payments", icon: Wallet },
  { id: "profile", title: "Profile & e-KYC", icon: User },
  { id: "queue", title: "Queue & Token", icon: Ticket },
  { id: "procurement", title: "Procurement", icon: Wheat },
];

const FAQS = [
  { id: 1, category: "booking", question: "How do I book a procurement slot?", answer: "Open Book Slot, select a procurement centre, choose your crop and quantity, select an available date and time window, enter your vehicle details and confirm the reservation." },
  { id: 2, category: "booking", question: "Can I change my booked slot?", answer: "You can use the booking details page to check whether rescheduling is available for your reservation. Changes depend on slot availability and centre rules." },
  { id: 3, category: "booking", question: "What happens if I miss my slot?", answer: "If you miss your allocated arrival window, contact the procurement centre or AGRINEX support. Your token may need to be revalidated or a new slot may need to be assigned." },
  { id: 4, category: "centre", question: "How can I find the nearest procurement centre?", answer: "Use the procurement centre search and filter options to compare nearby centres, queue size, estimated waiting time and distance." },
  { id: 5, category: "queue", question: "How is my queue position calculated?", answer: "Queue information is based on active bookings and arrivals recorded by the procurement centre. Your displayed position may change as farmers are processed." },
  { id: 6, category: "queue", question: "Where can I find my gate token?", answer: "After successfully confirming a booking, AGRINEX generates a digital gate token. Open your booking confirmation to view the token and QR code." },
  { id: 7, category: "payment", question: "When will my procurement payment arrive?", answer: "Payment status is displayed on the Payment Details page. A payment marked Processing is still undergoing settlement, while Paid indicates that the settlement has been completed." },
  { id: 8, category: "payment", question: "My payment is delayed. What should I do?", answer: "First check the payment transaction status and UTR information. If the payment remains pending beyond the expected settlement period, raise a payment support ticket." },
  { id: 9, category: "profile", question: "How do I update my profile information?", answer: "Open My Profile and select Edit Profile. Personal and contact information can be updated there. Government verification information may require correction through the appropriate authority." },
  { id: 10, category: "profile", question: "Why is my e-KYC status important?", answer: "e-KYC helps verify your farmer identity and supports secure access to AGRINEX procurement services." },
  { id: 11, category: "procurement", question: "What happens at the procurement centre?", answer: "At the centre, your booking and farmer identity are verified, your vehicle is checked, the produce is weighed and quality information is recorded before procurement processing." },
  { id: 12, category: "procurement", question: "What if my produce quantity differs from my booking?", answer: "Inform the procurement-centre staff before weighing. The final accepted quantity is determined through the centre's weighing and procurement process." },
];

const INITIAL_TICKETS = [
  { id: "AGR-48291", subject: "Payment still processing", category: "Payment", priority: "High", status: "Open", date: "28 Aug 2026", message: "My procurement payment is still showing as processing." },
  { id: "AGR-47102", subject: "Booking slot clarification", category: "Slot Booking", priority: "Normal", status: "Resolved", date: "22 Aug 2026", message: "Needed clarification regarding my arrival time." },
];

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState("");
  const [ticketForm, setTicketForm] = useState({ category: "Slot Booking", subject: "", priority: "Normal", message: "" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const filteredFaqs = useMemo(() => {
    const query = search.toLowerCase().trim();
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch = !query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const submitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim()) return showToast("Please enter a support subject.");
    if (!ticketForm.message.trim()) return showToast("Please describe your issue.");
    const newTicket = {
      id: `AGR-${Math.floor(10000 + Math.random() * 89999)}`,
      subject: ticketForm.subject, category: ticketForm.category,
      priority: ticketForm.priority, status: "Open", date: "31 Aug 2026", message: ticketForm.message,
    };
    setTickets((prev) => [newTicket, ...prev]);
    setTicketForm({ category: "Slot Booking", subject: "", priority: "Normal", message: "" });
    setShowTicketModal(false);
    showToast("Support ticket created successfully.");
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4 select-none antialiased">
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {toast}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl h-full min-h-[92vh] max-h-[94vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-7 overflow-hidden">
          {/* HEADER */}
          <header className="shrink-0 pb-4 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>AGRINEX Farmer Desk</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Help & Support
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Find answers, access procurement guides, or raise an assistance ticket.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>RAISE TICKET</span>
            </button>
          </header>

          {/* SEARCH */}
          <div className="mt-3.5 shrink-0 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles, bookings, payments, queues..."
              className="w-full h-9 pl-9 pr-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          {/* MAIN 3-COLUMN CONTENT */}
          <div className="flex-1 min-h-0 pt-3.5 grid lg:grid-cols-[200px_1fr_260px] gap-3.5 overflow-hidden">
            {/* LEFT CATEGORIES */}
            <aside className="hidden lg:flex flex-col min-h-0 rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-3 shadow-sm overflow-hidden">
              <p className="text-[9px] uppercase tracking-wider font-black text-slate-400 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                Help Topics
              </p>
              <div className="space-y-1 overflow-y-auto pr-1">
                <CategoryButton active={activeCategory === "all"} icon={HelpCircle} title="All Topics" onClick={() => setActiveCategory("all")} />
                {HELP_CATEGORIES.map((cat) => (
                  <CategoryButton key={cat.id} active={activeCategory === cat.id} icon={cat.icon} title={cat.title} onClick={() => setActiveCategory(cat.id)} />
                ))}
              </div>
            </aside>

            {/* CENTRE FAQS */}
            <section className="flex flex-col min-h-0 rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-4 shadow-sm overflow-hidden">
              <div className="shrink-0 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-[10px] text-slate-400">Quick solutions for common APMC portal queries</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {filteredFaqs.length} articles
                </span>
              </div>

              {/* Mobile horizontal category pills */}
              <div className="lg:hidden shrink-0 flex gap-1.5 py-2 overflow-x-auto border-b border-slate-100 dark:border-white/5 scrollbar-none">
                <button type="button" onClick={() => setActiveCategory("all")} className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition ${activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>All</button>
                {HELP_CATEGORIES.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase whitespace-nowrap transition ${activeCategory === cat.id ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>{cat.title}</button>
                ))}
              </div>

              {/* FAQ LIST */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-3 pr-1 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className={`rounded-xl border transition-all ${isOpen ? "bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20" : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-white/5 hover:border-emerald-400"}`}>
                      <button type="button" onClick={() => setOpenFaq(isOpen ? null : faq.id)} className="w-full flex items-center justify-between gap-2 p-3 text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-slate-200/70 dark:bg-slate-800 text-slate-400"}`}>
                            <HelpCircle className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{faq.question}</span>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pl-[3.25rem]">
                          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredFaqs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">No help articles found</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try another term or raise a direct support ticket.</p>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT SUPPORT PANELS */}
            <aside className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {/* HELPLINE */}
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <Headphones className="h-3.5 w-3.5 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Assistance Desk</h3>
                </div>
                <ContactOption icon={Phone} title="Farmer Helpline" value="1800-419-0123" />
                <ContactOption icon={MessageCircle} title="Live Assistance" value="8 AM – 8 PM Daily" green />
                <ContactOption icon={Mail} title="Email Support" value="support@agrinex.gov" />
              </div>

              {/* QUICK LINKS */}
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <LifeBuoy className="h-3.5 w-3.5 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Quick Access</h3>
                </div>
                <QuickHelp icon={CalendarDays} title="Booking Issue" onClick={() => { setActiveCategory("booking"); setSearch(""); }} />
                <QuickHelp icon={Wallet} title="Payment Inquiries" onClick={() => { setActiveCategory("payment"); setSearch(""); }} />
                <QuickHelp icon={MapPin} title="Mandi / Gate Queries" onClick={() => { setActiveCategory("centre"); setSearch(""); }} />
                <QuickHelp icon={ShieldCheck} title="e-KYC & Profile" onClick={() => { setActiveCategory("profile"); setSearch(""); }} />
              </div>

              {/* EMERGENCY NOTICE */}
              <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Urgent Gate Issue</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    For active weighbridge stoppage or entry security issues, contact Mandi Reception Window #1 directly.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* FOOTER */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Official APMC Grievance & Farmer Support Portal
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Resolved Tickets: {tickets.filter((t) => t.status === "Resolved").length}
            </span>
          </footer>
        </div>
      </div>

      {/* RAISE TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Raise Support Ticket</h2>
                  <p className="text-[10px] text-slate-400">Direct APMC grievance registration</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTicketModal(false)} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitTicket} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold outline-none"
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
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                <input
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Brief description of the problem"
                  className="w-full h-9 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Normal", "High"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                      className={`h-8 rounded-xl text-[10px] font-black uppercase transition ${ticketForm.priority === p ? (p === "High" ? "bg-rose-500 text-white" : "bg-emerald-600 text-white") : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-white/5"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  rows={3}
                  placeholder="Provide Token ID, Mandi name, and details..."
                  className="w-full p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 outline-none resize-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/20">
                  <Send className="h-3.5 w-3.5" /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryButton({ active, icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
        active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/20 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      <span className="text-[11px] truncate flex-1">{title}</span>
      {active && <ChevronRight className="h-3 w-3 text-emerald-500 shrink-0" />}
    </button>
  );
}

function ContactOption({ icon: Icon, title, value, green = false }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{title}</p>
        <p className={`text-[9px] font-bold truncate mt-0.5 ${green ? "text-emerald-500" : "text-slate-400"}`}>{value}</p>
      </div>
    </div>
  );
}

function QuickHelp({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 text-left transition"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{title}</span>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}