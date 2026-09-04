"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Plus, RefreshCw, MoreVertical, Pencil, Trash2, Power, X,
  Package, CheckCircle2, XCircle, CalendarDays, IndianRupee, ChevronLeft,
  ChevronRight, Wheat, Filter, SlidersHorizontal, AlertCircle, Save, Loader2, Eye
} from "lucide-react";

const CATEGORIES = [
  { value: "CEREAL", label: "Cereal" }, { value: "PULSE", label: "Pulse" },
  { value: "OILSEED", label: "Oilseed" }, { value: "VEGETABLE", label: "Vegetable" },
  { value: "FRUIT", label: "Fruit" }, { value: "OTHER", label: "Other" }
];

const UNITS = [
  { value: "KG", label: "Kilogram (KG)" },
  { value: "QUINTAL", label: "Quintal" },
  { value: "TON", label: "Ton" }
];

const emptyForm = {
  name: "", code: "", description: "", category: "CEREAL", unit: "QUINTAL",
  minimumSupportPrice: "", procurementStartDate: "", procurementEndDate: "",
  qualityParameters: [], isActive: true
};

const formatDate = (d) => {
  if (!d || Number.isNaN(new Date(d).getTime())) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const toDateInput = (d) => (!d || Number.isNaN(new Date(d).getTime()) ? "" : new Date(d).toISOString().split("T")[0]);
const getCatLabel = (c) => CATEGORIES.find((i) => i.value === c)?.label || c || "Other";

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#0e161f] dark:hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {description && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
    active 
      ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400" 
      : "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:text-slate-400"
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

function Modal({ children, onClose, title, subtitle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d141c]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
            <X size={17} />
          </button>
        </div>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const STEPS = ["General", "Category", "Procurement", "Quality"];

function CommodityForm({ form, setForm, onSubmit, onClose, saving, editing }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const updateParam = (i, f, v) => setForm((p) => ({
    ...p,
    qualityParameters: p.qualityParameters.map((q, idx) => idx === i ? { ...q, [f]: v } : q)
  }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.name.trim()) return setError("Commodity name is required."), false;
      if (!form.code.trim()) return setError("Commodity code is required."), false;
    } else if (step === 1) {
      if (!form.category) return setError("Category selection is required."), false;
    } else if (step === 2) {
      if (form.procurementStartDate && form.procurementEndDate && form.procurementEndDate < form.procurementStartDate) {
        return setError("End date cannot be prior to start date."), false;
      }
    } else if (step === 3) {
      if (form.qualityParameters.some((p) => !p.name.trim())) {
        return setError("Every parameter must have a valid name."), false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(STEPS.length - 1, s + 1)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    try {
      await onSubmit();
    } catch (err) {
      setError(err.message || "Failed to save commodity.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Progress Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/30">
        {STEPS.map((lbl, idx) => (
          <button
            type="button"
            key={lbl}
            onClick={() => { if (idx < step || validateStep()) setStep(idx); }}
            className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition ${
              step === idx
                ? "text-emerald-600 dark:text-emerald-400"
                : idx < step
                ? "text-slate-700 dark:text-slate-300"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              step === idx
                ? "bg-emerald-600 text-white"
                : idx < step
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-slate-200 text-slate-500 dark:bg-slate-800"
            }`}>
              {idx + 1}
            </span>
            <span>{lbl}</span>
          </button>
        ))}
      </div>

      {/* Strict fixed container to avoid scrollbars */}
      <div className="h-[270px] overflow-hidden p-6">
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Wheat" className="field-input" autoFocus />
              </div>
              <div>
                <label className="field-label">Code *</label>
                <input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} placeholder="e.g. WHT" className="field-input uppercase" />
              </div>
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Short commodity description..." rows={3} className="field-input resize-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Category *</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)} className="field-input">
                  {CATEGORIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Standard Unit</label>
                <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="field-input">
                  {UNITS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
              Units & categories determine MSP calculations and storage allocation configurations.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <label className="field-label">MSP (₹ per {form.unit || "unit"})</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" min="0" step="0.01" value={form.minimumSupportPrice} onChange={(e) => update("minimumSupportPrice", e.target.value)} placeholder="0" className="field-input pl-8" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Procurement Start</label>
                <input type="date" value={form.procurementStartDate} onChange={(e) => update("procurementStartDate", e.target.value)} className="field-input" />
              </div>
              <div>
                <label className="field-label">Procurement End</label>
                <input type="date" value={form.procurementEndDate} onChange={(e) => update("procurementEndDate", e.target.value)} className="field-input" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quality Checks ({form.qualityParameters.length}/2)</span>
                <button
                  type="button"
                  disabled={form.qualityParameters.length >= 2}
                  onClick={() => setForm((p) => ({ ...p, qualityParameters: [...p.qualityParameters, { name: "", minimum: "", maximum: "", unit: "" }] }))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {form.qualityParameters.slice(0, 2).map((param, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40">
                    <input value={param.name} onChange={(e) => updateParam(i, "name", e.target.value)} placeholder="Parameter" className="field-input !py-1 text-xs flex-1" />
                    <input type="number" value={param.minimum} onChange={(e) => updateParam(i, "minimum", e.target.value)} placeholder="Min" className="field-input !py-1 text-xs w-14" />
                    <input type="number" value={param.maximum} onChange={(e) => updateParam(i, "maximum", e.target.value)} placeholder="Max" className="field-input !py-1 text-xs w-14" />
                    <input value={param.unit} onChange={(e) => updateParam(i, "unit", e.target.value)} placeholder="Unit" className="field-input !py-1 text-xs w-12" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, qualityParameters: p.qualityParameters.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {!form.qualityParameters.length && <p className="py-4 text-center text-xs text-slate-400">No parameters specified (optional)</p>}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enable Procurement Bookings</span>
              <button
                type="button"
                onClick={() => update("isActive", !form.isActive)}
                className={`relative h-5 w-9 rounded-full transition ${form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${form.isActive ? "left-4" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-slate-800 dark:bg-[#0a1017]">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800">
            Cancel
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function ViewModal({ commodity, onClose }) {
  const [tab, setTab] = useState("overview");

  return (
    <Modal title={commodity.name} subtitle={`Commodity Code: ${commodity.code}`} onClose={onClose}>
      <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
        {["overview", "quality parameters"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 py-2 px-3 text-xs font-semibold capitalize transition ${
              tab === t ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="h-[210px] overflow-hidden p-6">
        {tab === "overview" ? (
          <div className="space-y-3.5">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] uppercase text-slate-400">Category</p>
                <p className="mt-0.5 text-xs font-bold">{getCatLabel(commodity.category)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] uppercase text-slate-400">MSP</p>
                <p className="mt-0.5 text-xs font-bold">₹{commodity.minimumSupportPrice || 0}/{commodity.unit}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] uppercase text-slate-400">Status</p>
                <div className="mt-1 flex justify-center"><StatusBadge active={commodity.isActive} /></div>
              </div>
            </div>
            <p className="line-clamp-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
              {commodity.description || "No description provided."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {!commodity.qualityParameters?.length ? (
              <p className="py-12 text-center text-xs text-slate-400">No parameters configured.</p>
            ) : (
              commodity.qualityParameters.map((p, i) => (
                <div key={i} className="flex justify-between rounded-xl border border-slate-100 px-4 py-2 text-xs dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="text-slate-500">{p.minimum ?? "—"} - {p.maximum ?? "—"} {p.unit}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AdminCommoditiesPage() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState(null);
  const [viewingCommodity, setViewingCommodity] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchCommodities = useCallback(async (showLoader = true) => {
    try {
      showLoader ? setLoading(true) : setRefreshing(true);
      const res = await fetch("/api/admin/commodities", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch commodities");
      setCommodities(data.commodities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCommodities(); }, [fetchCommodities]);

  const stats = useMemo(() => {
    const active = commodities.filter((i) => i.isActive).length;
    const currentlyProcuring = commodities.filter((i) => {
      if (!i.isActive) return false;
      const now = new Date(), start = i.procurementStartDate ? new Date(i.procurementStartDate) : null, end = i.procurementEndDate ? new Date(i.procurementEndDate) : null;
      return (!start || now >= start) && (!end || now <= end);
    }).length;
    return { total: commodities.length, active, inactive: commodities.length - active, currentlyProcuring };
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return commodities.filter((c) => {
      const matchesSearch = !q || [c.name, c.code, c.description].some((v) => v?.toLowerCase().includes(q));
      const matchesCategory = category === "ALL" || c.category === category;
      const matchesStatus = status === "ALL" || (status === "ACTIVE" ? c.isActive : !c.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [commodities, search, category, status]);

  const totalPages = Math.max(1, Math.ceil(filteredCommodities.length / perPage));
  const visibleCommodities = filteredCommodities.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const resetForm = () => { setForm(emptyForm); setEditingCommodity(null); };

  const openEdit = (c) => {
    setEditingCommodity(c);
    setForm({
      name: c.name || "", code: c.code || "", description: c.description || "",
      category: c.category || "CEREAL", unit: c.unit || "QUINTAL",
      minimumSupportPrice: c.minimumSupportPrice ?? "",
      procurementStartDate: toDateInput(c.procurementStartDate),
      procurementEndDate: toDateInput(c.procurementEndDate),
      qualityParameters: (c.qualityParameters || []).map((p) => ({ name: p.name || "", minimum: p.minimum ?? "", maximum: p.maximum ?? "", unit: p.unit || "" })),
      isActive: c.isActive !== false
    });
    setShowForm(true);
    setOpenMenu(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        minimumSupportPrice: form.minimumSupportPrice === "" ? 0 : Number(form.minimumSupportPrice),
        procurementStartDate: form.procurementStartDate || null,
        procurementEndDate: form.procurementEndDate || null,
        qualityParameters: form.qualityParameters.map((p) => ({
          name: p.name.trim(),
          minimum: p.minimum === "" ? null : Number(p.minimum),
          maximum: p.maximum === "" ? null : Number(p.maximum),
          unit: p.unit?.trim() || ""
        }))
      };
      const res = await fetch("/api/admin/commodities", {
        method: editingCommodity ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCommodity ? { ...payload, id: editingCommodity._id } : payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to save commodity");
      setShowForm(false);
      resetForm();
      await fetchCommodities(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c) => {
    setActionId(c._id);
    setOpenMenu(null);
    try {
      const res = await fetch("/api/admin/commodities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c._id, isActive: !c.isActive, action: "STATUS" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to update status");
      await fetchCommodities(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  const deleteCommodity = async (c) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete "${c.name}"? This action cannot be undone.`)) return;
    setActionId(c._id);
    try {
      const res = await fetch(`/api/admin/commodities?id=${c._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to delete");
      await fetchCommodities(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Smooth, minimalist scrollbars */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.25); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.4); }

        .field-label { display: block; margin-bottom: 4px; font-size: 11px; font-weight: 600; color: rgb(71 85 105); }
        .dark .field-label { color: rgb(148 163 184); }
        .field-input { width: 100%; border-radius: 10px; border: 1px solid rgb(226 232 240); background: white; padding: 7px 10px; font-size: 13px; color: rgb(15 23 42); outline: none; }
        .field-input:focus { border-color: rgb(16 185 129); box-shadow: 0 0 0 2px rgb(16 185 129 / 0.15); }
        .dark .field-input { border-color: rgb(30 41 59); background: rgb(15 23 30); color: rgb(241 245 249); }
        .dark .field-input:focus { border-color: rgb(16 185 129); }
        .field-input::placeholder { color: rgb(148 163 184); }
      `}</style>

      {/* Viewport locked screen without page-level scrollbars */}
      <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50/70 text-slate-900 antialiased dark:bg-[#070c12] dark:text-slate-100">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden px-4 py-4 sm:px-6">
          
          {/* Header */}
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <div>
              <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span>Admin</span><span>/</span><span className="text-emerald-600 dark:text-emerald-400">Commodities</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Commodities</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchCommodities(false)} disabled={refreshing} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-[#0d141b] dark:text-slate-200">
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={() => { resetForm(); setShowForm(true); setOpenMenu(null); }} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
                <Plus size={15} /> Add Commodity
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={Package} label="Total" value={stats.total} description="All commodities" />
            <StatCard icon={CheckCircle2} label="Active" value={stats.active} description="Procurement live" />
            <StatCard icon={XCircle} label="Inactive" value={stats.inactive} description="Deactivated" />
            <StatCard icon={CalendarDays} label="Active Season" value={stats.currentlyProcuring} description="Date valid" />
          </div>

          {/* Table Container with Internal Scroll */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0d141c]">
            {/* Toolbar */}
            <div className="shrink-0 border-b border-slate-100 p-3 dark:border-slate-800">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search commodities..."
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#070c12]"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                      className="appearance-none rounded-xl border border-slate-200/80 bg-white py-1.5 pl-7 pr-6 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-[#0d141b] dark:text-slate-200"
                    >
                      <option value="ALL">All Categories</option>
                      {CATEGORIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </select>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-[#0d141b] dark:text-slate-200"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="min-h-0 flex-1 overflow-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center p-6">
                  <Loader2 size={24} className="animate-spin text-emerald-500" />
                </div>
              ) : visibleCommodities.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <Package size={24} className="text-slate-400" />
                  <p className="mt-2 text-xs font-medium text-slate-500">No commodities found</p>
                </div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-[#0a1017]">
                    <tr>
                      <th className="px-4 py-2.5">Commodity</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">MSP / Unit</th>
                      <th className="px-4 py-2.5">Season Range</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {visibleCommodities.map((item) => (
                      <tr key={item._id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Wheat size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">{item.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {getCatLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          ₹{Number(item.minimumSupportPrice || 0).toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] text-slate-400">/ {item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          {formatDate(item.procurementStartDate)} - {formatDate(item.procurementEndDate)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge active={item.isActive} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button onClick={() => setOpenMenu(openMenu === item._id ? null : item._id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                              <MoreVertical size={16} />
                            </button>
                            {openMenu === item._id && (
                              <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 text-left shadow-xl dark:border-slate-800 dark:bg-[#0e1620]">
                                <button onClick={() => { setViewingCommodity(item); setOpenMenu(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  <Eye size={13} /> View
                                </button>
                                <button onClick={() => openEdit(item)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  <Pencil size={13} /> Edit
                                </button>
                                <button disabled={actionId === item._id} onClick={() => toggleStatus(item)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  <Power size={13} /> {item.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                                <button disabled={actionId === item._id} onClick={() => deleteCommodity(item)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800">
              <span>
                Showing {filteredCommodities.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filteredCommodities.length)} of {filteredCommodities.length}
              </span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-200/80 p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800">
                  <ChevronLeft size={14} />
                </button>
                <span className="px-1 font-medium">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200/80 p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Modal
          title={editingCommodity ? "Edit Commodity" : "New Commodity"}
          subtitle="Configure procurement details"
          onClose={() => { if (!saving) { setShowForm(false); resetForm(); } }}
        >
          <CommodityForm form={form} setForm={setForm} onSubmit={handleSave} onClose={() => { setShowForm(false); resetForm(); }} saving={saving} editing={!!editingCommodity} />
        </Modal>
      )}

      {viewingCommodity && <ViewModal commodity={viewingCommodity} onClose={() => setViewingCommodity(null)} />}
      {openMenu && <button aria-label="Close menu" onClick={() => setOpenMenu(null)} className="fixed inset-0 z-10 cursor-default" />}
    </>
  );
}