"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Pencil,
  Eye,
  UserPlus,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Power,
} from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const EMPTY_FORM = {
  centreId: "",
  name: "",
  village: "",
  district: "",
  state: "",
  pincode: "",
  contactNumber: "",
  email: "",
  openingTime: "09:00",
  closingTime: "17:00",
  workingDays: DAYS,
  dailyCapacity: 0,
  processingCapacity: 1,
  status: "ACTIVE",
  description: "",
};

const noScroll = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const inputStyle = "w-full h-10 px-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

export default function AdminCentresPage() {
  const [centres, setCentres] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [officersLoading, setOfficersLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [editingCentre, setEditingCentre] = useState(null);
  const [viewingCentre, setViewingCentre] = useState(null);
  const [assigningCentre, setAssigningCentre] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedOfficer, setSelectedOfficer] = useState("");

  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [changingStatus, setChangingStatus] = useState(null);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const response = await fetch(`/api/admin/centres?${params.toString()}`, { method: "GET", cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch centres");
      setCentres(data.centres || []);
    } catch (err) {
      setError(err.message || "Failed to fetch centres");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      setOfficersLoading(true);
      const response = await fetch("/api/admin/centres/officers", { method: "GET", cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch officers");
      setOfficers(data.officers || []);
    } catch (err) {
      setError(err.message || "Failed to fetch officers");
    } finally {
      setOfficersLoading(false);
    }
  };

  useEffect(() => { fetchCentres(); }, [search, statusFilter]);
  useEffect(() => { fetchOfficers(); }, []);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditingCentre(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (centre) => {
    setEditingCentre(centre);
    setForm({
      centreId: centre.centreId || "",
      name: centre.name || "",
      village: centre.address?.village || "",
      district: centre.address?.district || "",
      state: centre.address?.state || "",
      pincode: centre.address?.pincode || "",
      contactNumber: centre.contactNumber || "",
      email: centre.email || "",
      openingTime: centre.operatingHours?.openingTime || "09:00",
      closingTime: centre.operatingHours?.closingTime || "17:00",
      workingDays: centre.workingDays?.length ? centre.workingDays : DAYS,
      dailyCapacity: centre.dailyCapacity ?? 0,
      processingCapacity: centre.processingCapacity ?? 1,
      status: centre.status || "ACTIVE",
      description: centre.description || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.centreId.trim()) throw new Error("Centre ID is required");
      if (!form.name.trim()) throw new Error("Centre name is required");
      if (!form.district.trim()) throw new Error("District is required");
      if (!form.state.trim()) throw new Error("State is required");
      if (!/^\d{6}$/.test(form.pincode.trim())) throw new Error("Enter a valid 6-digit pincode");
      if (form.contactNumber && !/^[6-9]\d{9}$/.test(form.contactNumber.trim())) {
        throw new Error("Enter a valid 10-digit contact number");
      }

      const payload = {
        centreId: form.centreId,
        name: form.name,
        address: { village: form.village, district: form.district, state: form.state, pincode: form.pincode },
        contactNumber: form.contactNumber,
        email: form.email,
        operatingHours: { openingTime: form.openingTime, closingTime: form.closingTime },
        workingDays: form.workingDays,
        dailyCapacity: Number(form.dailyCapacity || 0),
        processingCapacity: Number(form.processingCapacity || 1),
        status: form.status,
        description: form.description,
      };

      const url = editingCentre ? `/api/admin/centres/${editingCentre._id}` : "/api/admin/centres";
      const method = editingCentre ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to ${editingCentre ? "update" : "create"} centre`);

      setShowForm(false);
      setEditingCentre(null);
      setForm(EMPTY_FORM);
      showSuccess(editingCentre ? "Centre updated successfully" : "Centre created successfully");
      await fetchCentres();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleView = async (centre) => {
    try {
      setError("");
      const res = await fetch(`/api/admin/centres/${centre._id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch centre");
      setViewingCentre(data.centre);
      setShowView(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const openAssign = (centre) => {
    setAssigningCentre(centre);
    setSelectedOfficer(centre.managedBy?._id ? String(centre.managedBy._id) : "");
    setError("");
    setShowAssign(true);
  };

  const handleAssignOfficer = async () => {
    if (!assigningCentre) return;
    setAssigning(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/centres/${assigningCentre._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: selectedOfficer || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to assign officer");

      setShowAssign(false);
      setAssigningCentre(null);
      setSelectedOfficer("");
      showSuccess(selectedOfficer ? "Officer assigned successfully" : "Officer assignment removed");
      await Promise.all([fetchCentres(), fetchOfficers()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (centre, newStatus) => {
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} "${centre.name}"?`)) return;

    setChangingStatus(centre._id);
    setError("");

    try {
      const res = await fetch(`/api/admin/centres/${centre._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to ${action} centre`);

      showSuccess(newStatus === "ACTIVE" ? "Centre activated successfully" : "Centre deactivated successfully");
      await fetchCentres();
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingStatus(null);
    }
  };

  const stats = useMemo(() => ({
    total: centres.length,
    active: centres.filter((c) => c.status === "ACTIVE").length,
    inactive: centres.filter((c) => c.status === "INACTIVE").length,
    temporary: centres.filter((c) => c.status === "TEMPORARILY_CLOSED").length,
    assigned: centres.filter((c) => c.managedBy).length,
  }), [centres]);

  const hasFilters = Boolean(search.trim() || statusFilter !== "ALL");

  return (
    <div className={`h-[calc(100dvh-4.5rem)] w-full overflow-hidden p-3.5 sm:p-5 lg:p-6 flex flex-col min-h-0 bg-slate-50/50 dark:bg-[#070b0e] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white ${noScroll}`}>
      {/* HEADER */}
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Operations Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Procurement Centres
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCentres}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Centre
          </button>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-3.5">
        <StatCard label="Total Centres" value={stats.total} icon={Building2} iconClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} iconClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
        <StatCard label="Inactive" value={stats.inactive} icon={XCircle} iconClass="bg-rose-500/10 text-rose-500 border-rose-500/20" />
        <StatCard label="Temp. Closed" value={stats.temporary} icon={Clock} iconClass="bg-amber-500/10 text-amber-500 border-amber-500/20" />
        <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} iconClass="bg-blue-500/10 text-blue-500 border-blue-500/20" />
      </div>

      {/* SUCCESS BANNER */}
      {success && (
        <div className="shrink-0 mb-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-500/10 px-3.5 py-2 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold flex-1 truncate">{success}</p>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="shrink-0 mb-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-500/10 px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold flex-1 truncate">{error}</p>
          <button type="button" onClick={() => setError("")} className="text-[11px] font-bold underline hover:opacity-80">Dismiss</button>
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
            placeholder="Search centre, ID, district, state, pincode..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="relative w-36 sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 px-3 pr-8 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TEMPORARILY_CLOSED">Temp. Closed</option>
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

      {/* TABLE / LIST CONTAINER */}
      <section className="flex-1 min-h-0 rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col shadow-sm">
        <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{centres.length} Procurement Centres Found</span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">Assigned: {stats.assigned} • Unassigned: {stats.total - stats.assigned}</span>
        </div>

        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${noScroll}`}>
          {loading && centres.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-xs font-bold text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" /> Loading procurement centres...
            </div>
          ) : centres.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <Building2 className="w-8 h-8 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No procurement centres found</p>
              <p className="text-[10px] text-slate-400">Try adjusting your filters or create a new centre.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <table className="w-full hidden xl:table border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#090e13]/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Centre</th>
                    <th className="px-4 py-2.5 text-left">Location</th>
                    <th className="px-4 py-2.5 text-left">Contact</th>
                    <th className="px-4 py-2.5 text-left">Managed By</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {centres.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                          <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{c.centreId}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold truncate">{c.address?.district}, {c.address?.state}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.address?.village ? `${c.address.village} • ` : ""}{c.address?.pincode}</p>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold truncate">{c.contactNumber || "—"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.email || "—"}</p>
                      </td>

                      <td className="px-4 py-3">
                        {c.managedBy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                              {getInitials(c.managedBy.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.managedBy.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{c.managedBy.mobile || "Officer"}</p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAssign(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                          >
                            <UserPlus className="w-3 h-3" /> Assign
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton icon={Eye} label="View Details" onClick={() => handleView(c)} />
                          <ActionButton icon={Pencil} label="Edit Centre" onClick={() => openEdit(c)} />
                          <ActionButton
                            icon={UserCheck}
                            label={c.managedBy ? "Change Manager" : "Assign Manager"}
                            onClick={() => openAssign(c)}
                          />
                          <ActionButton
                            icon={Power}
                            label={c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            danger={c.status === "ACTIVE"}
                            onClick={() => handleStatusChange(c, c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                            loading={changingStatus === c._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* MOBILE / TABLET CARDS */}
              <div className="xl:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                {centres.map((c) => (
                  <div key={c._id} className="p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</h3>
                        <p className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">{c.centreId}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="truncate">📍 {c.address?.district}, {c.address?.state}</span>
                      <span className="truncate">📞 {c.contactNumber || "No contact"}</span>
                      <span className="truncate col-span-2">👤 {c.managedBy?.name ? `Managed by ${c.managedBy.name}` : "No manager assigned"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button type="button" onClick={() => handleView(c)} className="flex-1 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1 hover:bg-slate-200">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button type="button" onClick={() => openEdit(c)} className="flex-1 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/20">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button type="button" onClick={() => openAssign(c)} className="flex-1 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-blue-500/20">
                        <UserCheck className="w-3 h-3" /> Assign
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(c, c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.status === "ACTIVE" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                      >
                        <Power className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <Modal title={editingCentre ? "Edit Procurement Centre" : "Add Procurement Centre"} onClose={() => !saving && setShowForm(false)}>
          <form onSubmit={handleSubmit} className={`flex-1 overflow-y-auto p-5 space-y-4 ${noScroll}`}>
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Centre Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Centre ID *</label>
                  <input value={form.centreId} disabled={!!editingCentre} onChange={(e) => updateForm("centreId", e.target.value.toUpperCase())} placeholder="DHB001" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Centre Name *</label>
                  <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Dhanbad Procurement Centre" className={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Location Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village</label>
                  <input value={form.village} onChange={(e) => updateForm("village", e.target.value)} placeholder="Village Name" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">District *</label>
                  <input value={form.district} onChange={(e) => updateForm("district", e.target.value)} placeholder="Dhanbad" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">State *</label>
                  <input value={form.state} onChange={(e) => updateForm("state", e.target.value)} placeholder="Jharkhand" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pincode *</label>
                  <input value={form.pincode} maxLength={6} onChange={(e) => updateForm("pincode", e.target.value.replace(/\D/g, ""))} placeholder="826001" className={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Contact & Capacity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Number</label>
                  <input value={form.contactNumber} maxLength={10} onChange={(e) => updateForm("contactNumber", e.target.value.replace(/\D/g, ""))} placeholder="9876543210" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="centre@domain.com" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Capacity (MT)</label>
                  <input type="number" min={0} value={form.dailyCapacity} onChange={(e) => updateForm("dailyCapacity", e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Processing Capacity (MT)</label>
                  <input type="number" min={1} value={form.processingCapacity} onChange={(e) => updateForm("processingCapacity", e.target.value)} className={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Working Days</p>
              <div className="flex flex-wrap gap-1.5">
                {[...DAYS, "SUNDAY"].map((day) => {
                  const checked = form.workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          workingDays: checked ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day],
                        }));
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        checked ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : editingCentre ? "Save Changes" : "Create Centre"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {showView && viewingCentre && (
        <Modal title="Centre Details" onClose={() => setShowView(false)}>
          <div className={`p-5 space-y-4 overflow-y-auto ${noScroll}`}>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{viewingCentre.centreId}</p>
                <h2 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{viewingCentre.name}</h2>
              </div>
              <StatusBadge status={viewingCentre.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Location</span>
                <p className="mt-0.5 font-bold truncate">{viewingCentre.address?.district}, {viewingCentre.address?.state}</p>
                <p className="text-[10px] text-slate-400 truncate">{viewingCentre.address?.village} - {viewingCentre.address?.pincode}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Operating Hours</span>
                <p className="mt-0.5 font-bold">{viewingCentre.operatingHours?.openingTime || "09:00"} - {viewingCentre.operatingHours?.closingTime || "17:00"}</p>
                <p className="text-[10px] text-slate-400 truncate">Daily Cap: {viewingCentre.dailyCapacity ?? 0} MT</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Centre Manager</span>
              {viewingCentre.managedBy ? (
                <div className="mt-1.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {getInitials(viewingCentre.managedBy.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{viewingCentre.managedBy.name}</p>
                    <p className="text-[10px] text-slate-400">{viewingCentre.managedBy.mobile} • {viewingCentre.managedBy.email}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs font-semibold text-slate-400">No officer currently assigned</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button type="button" onClick={() => setShowView(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGN OFFICER MODAL */}
      {showAssign && assigningCentre && (
        <Modal title={assigningCentre.managedBy ? "Reassign Officer" : "Assign Officer"} onClose={() => !assigning && setShowAssign(false)}>
          <div className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Target Centre</p>
              <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{assigningCentre.name}</p>
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{assigningCentre.centreId}</p>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Officer</label>
              {officersLoading ? (
                <div className="text-xs text-slate-400 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading officers...</div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className={`${inputStyle} pr-8 appearance-none`}
                  >
                    <option value="">No Officer / Unassign</option>
                    {officers.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.name} — {o.mobile} {o.officerCentre ? "(Assigned)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] leading-relaxed">
              Note: Assigning an officer who manages another centre will automatically transfer their operational scope to this centre.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" disabled={assigning} onClick={() => setShowAssign(false)} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button
                type="button"
                disabled={assigning || officersLoading}
                onClick={handleAssignOfficer}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                {assigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {assigning ? "Updating..." : selectedOfficer ? "Confirm Assignment" : "Remove Officer"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==============================================================
   UI ELEMENTS
============================================================== */

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isOk = status === "ACTIVE";
  const isTemp = status === "TEMPORARILY_CLOSED";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
        isOk
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : isTemp
          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOk ? "bg-emerald-500" : isTemp ? "bg-amber-500" : "bg-rose-500"}`} />
      {isOk ? "ACTIVE" : isTemp ? "TEMP CLOSED" : "INACTIVE"}
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false, loading = false }) {
  return (
    <button
      type="button"
      title={label}
      disabled={loading}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        danger ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500"
      }`}
    >
      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden ${noScroll}`}>
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}