"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Check, CheckCircle2, ChevronDown, ClipboardCheck,
  FileCheck2, Leaf, PackageCheck, Save, Scale, ShieldCheck, User, Clock3
} from "lucide-react";

const SAMPLE_DATA = {
  PR1024: { id: "PR1024", farmer: { id: "FR1024", name: "Ramesh Kumar", mobile: "9876543210", village: "Chas" }, crop: "Wheat", expectedQuantity: 450, actualQuantity: 0, grade: "A", rate: 59, status: "PENDING", verification: { farmerVerified: false, cropVerified: false, quantityVerified: false }, remarks: "" },
  PR1025: { id: "PR1025", farmer: { id: "FR1025", name: "Suresh Singh", mobile: "9123456780", village: "Bokaro" }, crop: "Rice", expectedQuantity: 320, actualQuantity: 315, grade: "A", rate: 60, status: "WEIGHED", verification: { farmerVerified: true, cropVerified: true, quantityVerified: true }, remarks: "Quantity verified at centre." },
  PR1026: { id: "PR1026", farmer: { id: "FR1026", name: "Anita Devi", mobile: "9988776655", village: "Kandra" }, crop: "Wheat", expectedQuantity: 280, actualQuantity: 0, grade: "A", rate: 59, status: "VERIFIED", verification: { farmerVerified: true, cropVerified: true, quantityVerified: false }, remarks: "" },
  PR1027: { id: "PR1027", farmer: { id: "FR1027", name: "Mohan Das", mobile: "9876123450", village: "Dumri" }, crop: "Maize", expectedQuantity: 520, actualQuantity: 510, grade: "A+", rate: 61, status: "COMPLETED", verification: { farmerVerified: true, cropVerified: true, quantityVerified: true }, remarks: "Procurement completed successfully." },
  PR1028: { id: "PR1028", farmer: { id: "FR1028", name: "Sunita Kumari", mobile: "9812345678", village: "Pindrajora" }, crop: "Rice", expectedQuantity: 240, actualQuantity: 0, grade: "B", rate: 58, status: "PENDING", verification: { farmerVerified: false, cropVerified: false, quantityVerified: false }, remarks: "" },
};

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500", icon: Clock3 },
  VERIFIED: { label: "Verified", bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500", icon: ShieldCheck },
  ACCEPTED: { label: "Accepted", bg: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400", dot: "bg-violet-500", icon: CheckCircle2 },
  WEIGHED: { label: "Weighed", bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400", dot: "bg-indigo-500", icon: Scale },
  COMPLETED: { label: "Completed", bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500", icon: PackageCheck },
  REJECTED: { label: "Rejected", bg: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-500", icon: XCircle },
};

const WORKFLOW_STEPS = ["PENDING", "VERIFIED", "ACCEPTED", "WEIGHED", "COMPLETED"];
const CROPS = ["Wheat", "Rice", "Maize", "Pulses", "Vegetables"];
const GRADES = ["A+", "A", "B+", "B", "C"];

export default function ProcurementDetailsPage() {
  const { id } = useParams() || {};
  const router = useRouter();
  const initial = SAMPLE_DATA[id];

  const [form, setForm] = useState(initial || null);
  const [saved, setSaved] = useState(false);

  const total = useMemo(() => (Number(form?.actualQuantity) || 0) * (Number(form?.rate) || 0), [form?.actualQuantity, form?.rate]);
  const verifiedCount = useMemo(() => Object.values(form?.verification || {}).filter(Boolean).length, [form?.verification]);

  if (!form) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <PackageCheck size={24} className="mx-auto text-slate-400" />
          <h1 className="mt-2 text-xs font-black">Procurement not found</h1>
          <Link href="/officer/procurement" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[9px] font-bold text-white">
            <ArrowLeft size={12} /> Back to Desk
          </Link>
        </div>
      </main>
    );
  }

  const updateField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const updateFarmer = (key, val) => setForm((prev) => ({ ...prev, farmer: { ...prev.farmer, [key]: val } }));
  const updateVerif = (key, val) => setForm((prev) => ({ ...prev, verification: { ...prev.verification, [key]: val } }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const markComplete = () => {
    setForm((prev) => ({
      ...prev,
      status: "COMPLETED",
      verification: { farmerVerified: true, cropVerified: true, quantityVerified: true }
    }));
  };

  const curStatus = STATUS_CONFIG[form.status] || STATUS_CONFIG.PENDING;
  const currentStepIdx = WORKFLOW_STEPS.indexOf(form.status);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 select-none">
      <div className="mx-auto max-w-[1400px] space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/officer/procurement")} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900">
              <ArrowLeft size={15} />
            </button>
            <div>
              <div className="text-[8px] font-bold text-slate-400">Procurement / <span className="text-emerald-600 font-bold">{form.id}</span></div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Transaction #{form.id}</h1>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold ${curStatus.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${curStatus.dot}`} /> {curStatus.label}
          </span>
        </header>

        {/* Workflow Strip */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {WORKFLOW_STEPS.map((step, idx) => {
              const done = currentStepIdx >= idx;
              const Icon = STATUS_CONFIG[step].icon;
              return (
                <div key={step} className={`rounded-xl border p-2 transition ${done ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30" : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"}`}>
                  <div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-lg ${done ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" : "bg-white text-slate-400 dark:bg-slate-900"}`}>
                    <Icon size={12} />
                  </div>
                  <p className={`mt-1 text-[8px] font-bold capitalize ${done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>{step.toLowerCase()}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Content Layout */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left Column: Form Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Farmer Info */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
                <User size={14} className="text-emerald-500" /> Farmer Record
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[9px]">
                {["name", "id", "mobile", "village"].map((f) => (
                  <label key={f} className="block">
                    <span className="text-[7px] font-bold uppercase text-slate-400 capitalize">{f}</span>
                    <input
                      type="text"
                      value={form.farmer[f]}
                      onChange={(e) => updateFarmer(f, e.target.value)}
                      className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Produce & Rate */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
                <Scale size={14} className="text-emerald-500" /> Weighing & Grading
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[9px]">
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">Crop</span>
                  <select value={form.crop} onChange={(e) => updateField("crop", e.target.value)} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-bold dark:border-slate-700 dark:bg-slate-800">
                    {CROPS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">Quality Grade</span>
                  <select value={form.grade} onChange={(e) => updateField("grade", e.target.value)} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-bold dark:border-slate-700 dark:bg-slate-800">
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">Actual (kg)</span>
                  <input type="number" value={form.actualQuantity} onChange={(e) => updateField("actualQuantity", e.target.value)} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">Rate (₹/kg)</span>
                  <input type="number" value={form.rate} onChange={(e) => updateField("rate", e.target.value)} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
                <div>
                  <span className="text-[7px] font-bold uppercase text-emerald-600">Calculated Valuation</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">₹{total.toLocaleString("en-IN")}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-500">{form.actualQuantity} kg × ₹{form.rate}/kg</span>
              </div>
            </section>

            {/* Remarks */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
                <ClipboardCheck size={14} className="text-emerald-500" /> Dispatch Observations
              </div>
              <textarea
                rows={3}
                value={form.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                placeholder="Quality inspection notes, moisture variations..."
                className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[9px] outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </section>
          </div>

          {/* Right Column: Verifications & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Verification Checklist */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black">Compliance Checks</span>
                <span className="text-[8px] font-black text-emerald-600">{verifiedCount}/3 Passed</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {[
                  { key: "farmerVerified", title: "Farmer Verified", desc: "Identity & booking match" },
                  { key: "cropVerified", title: "Produce Checked", desc: "Crop grade conforms to MSP" },
                  { key: "quantityVerified", title: "Weighbridge Checked", desc: "Gross/tare weighment verified" },
                ].map((item) => (
                  <label key={item.key} className="flex cursor-pointer items-start gap-2.5 py-2 text-[9px]">
                    <input
                      type="checkbox"
                      checked={form.verification[item.key]}
                      onChange={(e) => updateVerif(item.key, e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded accent-emerald-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.title}</p>
                      <span className="text-[7px] text-slate-400">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Status Override */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <span className="text-xs font-black">Pipeline State</span>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-[9px] font-bold dark:border-slate-700 dark:bg-slate-800">
                {Object.keys(STATUS_CONFIG).map((st) => <option key={st}>{st}</option>)}
              </select>
            </section>

            {/* Action Buttons */}
            <div className="space-y-2">
              {form.status !== "COMPLETED" && (
                <button onClick={markComplete} className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-[9px] font-black text-white hover:bg-emerald-700 transition">
                  <CheckCircle2 size={13} /> Complete Procurement
                </button>
              )}
              <button onClick={handleSave} className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[9px] font-black text-slate-700 hover:border-emerald-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {saved ? <><Check size={13} className="text-emerald-500" /> Saved</> : <><Save size={13} /> Save Modifications</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}