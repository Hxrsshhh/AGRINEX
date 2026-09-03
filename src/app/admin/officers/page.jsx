"use client";

import React from "react";
import {
  Search,
  Plus,
  UserCog,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Eye,
  X,
  Check,
  ChevronDown,
  RefreshCw,
  UserCheck,
  UserX,
  UserMinus,
  AlertCircle,
} from "lucide-react";

const API = { officers: "/api/admin/officers" };
const EMPTY_FORM = { name: "", mobile: "", email: "", password: "", officerCentre: "", isActive: true };
const noScroll = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const inputStyle = "w-full h-10 px-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

export default function AdminOfficersPage() {
  const [officers, setOfficers] = React.useState([]);
  const [centres, setCentres] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const [modal, setModal] = React.useState(null);
  const [selectedOfficer, setSelectedOfficer] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setError("");
      const res = await fetch(API.officers, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load officer data");
      setOfficers(Array.isArray(data?.officers) ? data.officers : []);
      setCentres(Array.isArray(data?.centres) ? data.centres : []);
    } catch (err) {
      setError(err?.message || "Unable to load officer data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const filteredOfficers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return officers.filter((o) => {
      const matchQuery = !q || [o?.name, o?.mobile, o?.email].some((f) => f?.toLowerCase().includes(q));
      const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? o?.isActive : !o?.isActive);
      return matchQuery && matchStatus;
    });
  }, [officers, search, statusFilter]);

  const totalOfficers = officers.length;
  const activeOfficers = officers.filter((o) => o?.isActive).length;
  const inactiveOfficers = totalOfficers - activeOfficers;
  const assignedOfficers = officers.filter((o) => !!getCentreId(o)).length;
  const unassignedOfficers = totalOfficers - assignedOfficers;

  const openCreate = () => {
    setSelectedOfficer(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setModal("create");
  };

  const openEdit = (officer) => {
    setSelectedOfficer(officer);
    setForm({
      name: officer?.name || "",
      mobile: officer?.mobile || "",
      email: officer?.email || "",
      password: "",
      officerCentre: getCentreId(officer) || "",
      isActive: officer?.isActive !== false,
    });
    setFormError("");
    setModal("edit");
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setSelectedOfficer(null);
    setFormError("");
  };

  const updateForm = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanName = form.name.trim();
    const cleanMobile = form.mobile.replace(/\D/g, "");
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanName) return setFormError("Officer name is required.");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) return setFormError("Enter a valid 10-digit Indian mobile number.");
    if (!cleanEmail) return setFormError("Email address is required.");
    if (modal === "create" && form.password.length < 6) return setFormError("Password must contain at least 6 characters.");
    if (modal === "edit" && form.password && form.password.length < 6) return setFormError("New password must contain at least 6 characters.");

    try {
      setSaving(true);
      const isEdit = modal === "edit";
      const payload = {
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        officerCentre: form.officerCentre || null,
        isActive: form.isActive,
        ...(form.password ? { password: form.password } : {}),
      };

      const res = await fetch(isEdit ? `${API.officers}/${selectedOfficer?._id}` : API.officers, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || `Failed to ${isEdit ? "update" : "create"} officer`);

      closeModal();
      await loadData();
    } catch (err) {
      setFormError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (officer) => {
    const nextStatus = !officer?.isActive;
    const action = nextStatus ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} ${officer?.name}?`)) return;

    try {
      const res = await fetch(`${API.officers}/${officer?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || `Unable to ${action} officer`);
      await loadData();
    } catch (err) {
      alert(err?.message || `Unable to ${action} officer`);
    }
  };

  const hasFilters = Boolean(search.trim() || statusFilter !== "ALL");

  return (
    <div className={`h-[calc(100dvh-4.5rem)] w-full overflow-hidden p-3.5 sm:p-5 lg:p-6 flex flex-col min-h-0 ${noScroll}`}>
      {/* HEADER */}
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Administration
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Officer Management
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setRefreshing(true); loadData(); }}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Officer
          </button>
        </div>
      </header>

      {/* COMPACT METRIC CARDS */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-3.5">
        <Summary title="Total" value={totalOfficers} icon={UserCog} iconClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20" />
        <Summary title="Active" value={activeOfficers} icon={UserCheck} iconClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
        <Summary title="Inactive" value={inactiveOfficers} icon={UserX} iconClass="bg-rose-500/10 text-rose-500 border-rose-500/20" />
        <Summary title="Assigned" value={assignedOfficers} icon={Building2} iconClass="bg-blue-500/10 text-blue-500 border-blue-500/20" />
        <Summary title="Unassigned" value={unassignedOfficers} icon={UserMinus} iconClass="bg-amber-500/10 text-amber-500 border-amber-500/20" />
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="shrink-0 mb-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-500/10 px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold flex-1 truncate">{error}</p>
          <button type="button" onClick={loadData} className="text-[11px] font-bold underline hover:opacity-80">Retry</button>
        </div>
      )}

      {/* FILTERS */}
      <div className="shrink-0 rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-2.5 mb-3.5 shadow-sm flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officer name, phone, email..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="relative w-36 sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 px-3 pr-8 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* OFFICERS LIST CONTAINER (HIDDEN SCROLLBAR) */}
      <section className="flex-1 min-h-0 rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col shadow-sm">
        <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{filteredOfficers.length} Officers Listed</span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">Assigned: {assignedOfficers} • Unassigned: {unassignedOfficers}</span>
        </div>

        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${noScroll}`}>
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-xs font-bold text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" /> Loading officers...
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <UserCog className="w-8 h-8 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No officers found</p>
              <p className="text-[10px] text-slate-400">Try changing your filters or add a new officer.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="w-full hidden xl:table border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#090e13]/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Officer</th>
                    <th className="px-4 py-2.5 text-left">Mobile</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredOfficers.map((o) => (
                    <tr key={o?._id || o?.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o?.name} avatar={o?.avatar?.url} />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{o?.name || "Unnamed"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{o?.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{o?.mobile || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge active={o?.isActive === true} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton icon={Eye} label="View" onClick={() => { setSelectedOfficer(o); setModal("view"); }} />
                          <ActionButton icon={Pencil} label="Edit" onClick={() => openEdit(o)} />
                          <ActionButton
                            icon={o?.isActive ? ShieldOff : ShieldCheck}
                            label={o?.isActive ? "Deactivate" : "Activate"}
                            danger={o?.isActive}
                            onClick={() => toggleStatus(o)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile / Tablet Cards */}
              <div className="xl:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredOfficers.map((o) => (
                  <OfficerCard
                    key={o?._id || o?.id}
                    officer={o}
                    centres={centres}
                    onView={() => { setSelectedOfficer(o); setModal("view"); }}
                    onEdit={() => openEdit(o)}
                    onToggle={() => toggleStatus(o)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* FORM MODAL */}
      {(modal === "create" || modal === "edit") && (
        <OfficerFormModal
          mode={modal}
          form={form}
          updateForm={updateForm}
          centres={centres}
          saving={saving}
          error={formError}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selectedOfficer && (
        <ViewOfficerModal
          officer={selectedOfficer}
          onEdit={() => openEdit(selectedOfficer)}
          onToggle={() => toggleStatus(selectedOfficer)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* ==============================================================
   UI ELEMENTS & MODALS (CLEANED UP & NO-SCROLLBAR)
============================================================== */

function Summary({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

function OfficerCard({ officer, centres, onView, onEdit, onToggle }) {
  return (
    <div className="p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={officer?.name} avatar={officer?.avatar?.url} />
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{officer?.name || "Unnamed"}</h3>
            <p className="text-[10px] text-slate-400 truncate">{officer?.email || "No email"}</p>
          </div>
        </div>
        <StatusBadge active={officer?.isActive === true} />
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <span className="truncate text-slate-500 font-medium">📱 {officer?.mobile || "N/A"}</span>
        <span className="truncate text-slate-500 font-medium">🏢 {getCentreName(officer, centres)}</span>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5">
        <button type="button" onClick={onView} className="flex-1 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-200">
          <Eye className="w-3 h-3" /> View
        </button>
        <button type="button" onClick={onEdit} className="flex-1 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/20">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button type="button" onClick={onToggle} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {officer?.isActive ? <ShieldOff className="w-3 h-3 text-rose-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden ${noScroll}`}>
        {children}
      </div>
    </div>
  );
}

function OfficerFormModal({ mode, form, updateForm, centres, saving, error, onSubmit, onClose }) {
  const isEdit = mode === "edit";
  const activeCentres = centres.filter((c) => c?.status === "ACTIVE");

  return (
    <Modal onClose={onClose}>
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">{isEdit ? "Edit Officer" : "Add Officer"}</h2>
        <button type="button" onClick={onClose} disabled={saving} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className={`flex-1 overflow-y-auto p-5 space-y-3.5 ${noScroll}`}>
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
            <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Rahul Kumar" className={inputStyle} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile *</label>
            <input value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876500011" inputMode="numeric" className={inputStyle} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="officer@agrinex.com" className={inputStyle} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{isEdit ? "New Password" : "Password *"}</label>
            <input type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} placeholder={isEdit ? "Leave blank to keep" : "Min. 6 characters"} className={inputStyle} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Procurement Centre</label>
            <div className="relative">
              <select value={form.officerCentre} onChange={(e) => updateForm("officerCentre", e.target.value)} className={`${inputStyle} pr-8 appearance-none`}>
                <option value="">Not Assigned</option>
                {activeCentres.map((c) => (
                  <option key={c?._id || c?.id} value={c?._id || c?.id}>{c?.name || c?.centreId}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Account Active</span>
          <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm("isActive", e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
        </label>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewOfficerModal({ officer, onEdit, onToggle, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={officer?.name} avatar={officer?.avatar?.url} large />
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">{officer?.name || "Officer"}</h2>
            <p className="text-[10px] text-slate-400">{officer?.email || "No email"}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`p-5 space-y-3.5 overflow-y-auto ${noScroll}`}>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Account Status</span>
          <StatusBadge active={officer?.isActive === true} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Mobile</span>
            <p className="mt-0.5 font-bold truncate">{officer?.mobile || "N/A"}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Assigned Centre</span>
            <p className="mt-0.5 font-bold truncate">{getCentreDisplayName(officer)}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button type="button" onClick={onEdit} className="flex-1 h-9 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button type="button" onClick={onToggle} className="flex-1 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5">
            {officer?.isActive ? <><ShieldOff className="w-3.5 h-3.5 text-rose-500" /> Deactivate</> : <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Activate</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Avatar({ name, avatar, large = false }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "O";
  const size = large ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  if (avatar) return <img src={avatar} alt={name || "Officer"} className={`${size} rounded-xl object-cover shrink-0`} />;
  return (
    <div className={`${size} rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shrink-0`}>
      {initial}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
      active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        danger ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function getCentreId(officer) {
  const c = officer?.officerCentre;
  return !c ? "" : typeof c === "string" ? c : String(c?._id || c?.id || "");
}

function getOfficerCentre(officer, centres) {
  const c = officer?.officerCentre;
  if (!c) return null;
  if (typeof c === "object") return c;
  return centres.find((i) => String(i?._id || i?.id) === String(c)) || null;
}

function getCentreName(officer, centres) {
  const c = getOfficerCentre(officer, centres);
  return c?.name || c?.centreId || "Not Assigned";
}

function getCentreDisplayName(officer) {
  const c = officer?.officerCentre;
  return !c ? "Not Assigned" : typeof c === "string" ? c : (c?.name || c?.centreId || "Assigned Centre");
}