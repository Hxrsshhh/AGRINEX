"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Edit3, Camera, MapPin, Phone, Mail, Sprout, ShieldCheck, BadgeCheck,
  Ruler, FileText, CheckCircle2, X, Save, Building2, Eye, Download, Clock3,
  AlertCircle, Globe2, Bell, Smartphone, MessageCircle, CalendarDays, Activity, Check,
} from "lucide-react";

const EMPTY_FARMER = {
  name: "",
  avatar: { url: null, publicId: null },
  mobile: "",
  email: "",
  role: "FARMER",
  verification: { isVerified: false, isPhoneVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null },
  isActive: true,
  onboardingCompleted: false,
  onboardingSkipped: false,
  onboardingCompletedAt: null,
  farmLocation: { state: "", district: "", village: "", pincode: "" },
  farm: { landArea: null, landUnit: "Acre", mainCrop: "" },
  preferredCentre: null,
  documents: [],
  designation: null,
  officerCentre: null,
  adminLevel: null,
  preferredLanguage: "en",
  notifications: { sms: true, whatsapp: true, push: true },
  lastLogin: null,
};

const LANGUAGES = {
  en: "English", hi: "हिन्दी (Hindi)", bn: "বাংলা (Bengali)",
  or: "ଓଡ଼ିଆ (Odia)", te: "తెలుగు (Telugu)", mr: "मराठी (Marathi)",
};

const DOC_TYPES = {
  IDENTITY_PROOF: "Identity Proof", LAND_RECORD: "Land Record",
  BANK_PROOF: "Bank Proof", OTHER: "Other",
};

export default function ProfilePage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState(EMPTY_FARMER);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [documentType, setDocumentType] = useState("IDENTITY_PROOF");
  const [documentName, setDocumentName] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "", email: "",
    farmLocation: { state: "", district: "", village: "", pincode: "" },
    farm: { landArea: null, landUnit: "Acre", mainCrop: "" },
    preferredCentre: "", preferredLanguage: "en",
    notifications: { sms: true, whatsapp: true, push: true },
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const readJson = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Something went wrong. Please try again.");
    return data;
  };

  const normalizeFarmer = (data = {}) => ({
    ...EMPTY_FARMER, ...data,
    avatar: { ...EMPTY_FARMER.avatar, ...(data?.avatar || {}) },
    farmLocation: { ...EMPTY_FARMER.farmLocation, ...(data?.farmLocation || {}) },
    farm: { ...EMPTY_FARMER.farm, ...(data?.farm || {}) },
    verification: { ...EMPTY_FARMER.verification, ...(data?.verification || {}) },
    notifications: { ...EMPTY_FARMER.notifications, ...(data?.notifications || {}) },
    documents: data?.documents || [],
  });

  const createFormFromFarmer = (data) => {
    const f = normalizeFarmer(data);
    return {
      name: f.name || "",
      email: f.email || "",
      farmLocation: { state: f.farmLocation?.state || "", district: f.farmLocation?.district || "", village: f.farmLocation?.village || "", pincode: f.farmLocation?.pincode || "" },
      farm: { landArea: f.farm?.landArea ?? null, landUnit: f.farm?.landUnit || "Acre", mainCrop: f.farm?.mainCrop || "" },
      preferredCentre: typeof f.preferredCentre === "object" ? f.preferredCentre?._id || "" : f.preferredCentre || "",
      preferredLanguage: f.preferredLanguage || "en",
      notifications: { sms: f.notifications?.sms ?? true, whatsapp: f.notifications?.whatsapp ?? true, push: f.notifications?.push ?? true },
    };
  };

  const fetchFarmerProfile = async (showLoader = true) => {
    try {
      showLoader ? setLoading(true) : setRefreshing(true);
      setError("");
      const res = await fetch("/api/farmer/profile", { cache: "no-store", credentials: "include" });
      const data = await readJson(res);
      const f = normalizeFarmer(data.farmer);
      setFarmer(f);
      setProfileImage(f.avatar?.url || null);
      setForm(createFormFromFarmer(f));
      return f;
    } catch (err) {
      console.error("Farmer profile fetch error:", err);
      setError(err.message || "Failed to load farmer profile");
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const res = await fetch("/api/farmer/centres", { cache: "no-store", credentials: "include" });
      const data = await readJson(res);
      setCentres(data.centres || []);
    } catch (err) {
      console.error("Procurement centres fetch error:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchFarmerProfile(true), fetchCentres()]);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchFarmerProfile(false), fetchCentres()]);
    showToast("Profile refreshed");
  };

  const openEdit = () => {
    setForm(createFormFromFarmer(farmer));
    setEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return showToast("Name is required");
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return showToast("Please enter a valid email");
    if (form.farmLocation?.pincode && !/^\d{6}$/.test(String(form.farmLocation.pincode).trim())) return showToast("Pincode must contain exactly 6 digits");
    if (form.farm?.landArea !== null && form.farm?.landArea !== "" && form.farm?.landArea !== undefined) {
      if (Number.isNaN(Number(form.farm.landArea)) || Number(form.farm.landArea) < 0) return showToast("Invalid land area");
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/farmer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email?.trim() || null,
          farmLocation: {
            state: form.farmLocation?.state?.trim() || null,
            district: form.farmLocation?.district?.trim() || null,
            village: form.farmLocation?.village?.trim() || null,
            pincode: form.farmLocation?.pincode?.trim() || null,
          },
          farm: {
            landArea: [null, "", undefined].includes(form.farm?.landArea) ? null : Number(form.farm.landArea),
            landUnit: form.farm?.landUnit || "Acre",
            mainCrop: form.farm?.mainCrop?.trim() || null,
          },
          preferredCentre: form.preferredCentre || null,
          preferredLanguage: form.preferredLanguage || "en",
          notifications: {
            sms: Boolean(form.notifications?.sms),
            whatsapp: Boolean(form.notifications?.whatsapp),
            push: Boolean(form.notifications?.push),
          },
        }),
      });
      const data = await readJson(res);
      const updated = normalizeFarmer(data.farmer);
      setFarmer(updated);
      setProfileImage(updated.avatar?.url || null);
      setForm(createFormFromFarmer(updated));
      setEditOpen(false);
      showToast("Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      showToast(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Only JPG, PNG and WEBP images are allowed");
      return (e.target.value = "");
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB");
      return (e.target.value = "");
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      setUploadingAvatar(true);
      setProfileImage(previewUrl);
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/farmer/avatar", { method: "POST", body: formData, credentials: "include" });
      const data = await readJson(res);
      setFarmer((prev) => ({ ...prev, avatar: data.avatar }));
      setProfileImage(data.avatar?.url || null);
      showToast("Profile photo updated successfully");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setProfileImage(farmer.avatar?.url || null);
      showToast(err.message || "Failed to upload profile photo");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!documentName.trim()) {
      showToast("Enter the document name first");
      return (e.target.value = "");
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      showToast("Only PDF, JPG, PNG and WEBP files are allowed");
      return (e.target.value = "");
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Document must be smaller than 10MB");
      return (e.target.value = "");
    }

    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", documentType);
      formData.append("name", documentName.trim());
      const res = await fetch("/api/farmer/documents", { method: "POST", body: formData, credentials: "include" });
      const data = await readJson(res);
      setFarmer((prev) => ({ ...prev, documents: [...(prev.documents || []), data.document] }));
      setDocumentName("");
      showToast("Document uploaded successfully");
    } catch (err) {
      console.error("Document upload error:", err);
      showToast(err.message || "Failed to upload document");
    } finally {
      setUploadingDocument(false);
      e.target.value = "";
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!doc?._id) return;
    if (doc.status === "VERIFIED") return showToast("Verified documents cannot be deleted");
    if (!window.confirm(`Delete "${doc.name}"? This action cannot be undone.`)) return;

    try {
      setDeletingDocument(true);
      const res = await fetch(`/api/farmer/documents?id=${encodeURIComponent(doc._id)}`, { method: "DELETE", credentials: "include" });
      await readJson(res);
      setFarmer((prev) => ({ ...prev, documents: (prev.documents || []).filter((i) => i._id !== doc._id) }));
      if (selectedDocument?._id === doc._id) setSelectedDocument(null);
      showToast("Document deleted successfully");
    } catch (err) {
      console.error("Document delete error:", err);
      showToast(err.message || "Failed to delete document");
    } finally {
      setDeletingDocument(false);
    }
  };

  const getDocumentStatus = (status) => {
    if (status === "VERIFIED") return { label: "Verified", className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
    if (status === "REJECTED") return { label: "Rejected", className: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20", icon: AlertCircle };
    return { label: "Pending", className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock3 };
  };

  const formatFileSize = (s) => (!s ? "Unknown size" : s < 1024 ? `${s} B` : s < 1048576 ? `${(s / 1024).toFixed(1)} KB` : `${(s / 1048576).toFixed(1)} MB`);
  const formatDate = (d) => {
    if (!d || Number.isNaN(new Date(d).getTime())) return "Not available";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getCentreName = () => {
    const pc = farmer.preferredCentre;
    if (!pc) return "Not selected";
    if (typeof pc === "object") return pc.name || pc.title || pc.code || pc.centreCode || pc._id || "Selected Centre";
    const found = centres.find((c) => String(c._id) === String(pc));
    return found ? found.name || found.title || found.code || found.centreCode || "Selected Centre" : pc;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#080d12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Activity className="w-7 h-7 text-emerald-500 animate-spin" />
          </div>
          <p className="text-xs font-black text-slate-600 dark:text-slate-300">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-1000">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl">
            <CheckCircle2 className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-black text-red-600 dark:text-red-400">Unable to load profile</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{error}</p>
            </div>
          </div>
          <button type="button" onClick={() => fetchFarmerProfile(true)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black">
            Retry
          </button>
        </div>
      )}

      <main className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500">Farmer Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My Profile</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage your registered farmer and farm information.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button type="button" onClick={handleRefresh} disabled={refreshing} className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black hover:border-emerald-500/40 transition-all disabled:opacity-50">
              <Activity className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button type="button" onClick={openEdit} disabled={!farmer._id} className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500" />
          <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative shrink-0 mx-auto md:mx-0">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 p-[2px] shadow-xl shadow-emerald-500/20">
                  <div className="w-full h-full rounded-[22px] bg-slate-900 dark:bg-[#0b1015] flex items-center justify-center overflow-hidden">
                    {profileImage ? <img src={profileImage} alt="Farmer profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-500" />}
                  </div>
                </div>
                <label htmlFor="profile-image" className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg cursor-pointer transition-colors ${uploadingAvatar ? "opacity-60 pointer-events-none" : ""}`}>
                  {uploadingAvatar ? <Activity className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </label>
                <input id="profile-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black">{farmer.name || "Farmer"}</h2>
                  {farmer.verification?.isVerified && (
                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black w-fit mx-auto sm:mx-0">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] uppercase tracking-wider font-black text-slate-500 dark:text-slate-400">
                    {farmer.role || "FARMER"}
                  </span>
                  {farmer.isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Account
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {farmer.farmLocation?.village || "Village not set"}{farmer.farmLocation?.district ? `, ${farmer.farmLocation.district}` : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {farmer.mobile ? `+91 ${farmer.mobile}` : "Mobile not available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
              <QuickStat label="Land Holding" value={farmer.farm?.landArea != null ? `${farmer.farm.landArea} ${farmer.farm.landUnit || ""}` : "Not provided"} icon={Ruler} />
              <QuickStat label="Main Crop" value={farmer.farm?.mainCrop || "Not provided"} icon={Sprout} />
              <QuickStat label="Verification" value={farmer.verification?.isVerified ? "Verified" : "Pending"} icon={ShieldCheck} green={farmer.verification?.isVerified} />
              <QuickStat label="Documents" value={`${farmer.documents?.length || 0} Uploaded`} icon={FileText} />
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <ProfileCard icon={User} title="Personal Information" description="Registered account information">
            <InfoRow label="Full Name" value={farmer.name} />
            <InfoRow label="Mobile Number" value={farmer.mobile ? `+91 ${farmer.mobile}` : "Not provided"} icon={Phone} />
            <InfoRow label="Email Address" value={farmer.email || "Not provided"} icon={Mail} />
            <InfoRow label="Account Role" value={farmer.role || "FARMER"} green />
            <InfoRow label="Account Status" value={farmer.isActive ? "Active" : "Inactive"} green={farmer.isActive} />
            {farmer.designation && <InfoRow label="Designation" value={farmer.designation} />}
            {farmer.adminLevel && <InfoRow label="Admin Level" value={farmer.adminLevel} />}
          </ProfileCard>

          <ProfileCard icon={MapPin} title="Farm Location" description="Registered farmer farm location">
            <InfoRow label="Village" value={farmer.farmLocation?.village || "Not provided"} />
            <InfoRow label="District" value={farmer.farmLocation?.district || "Not provided"} />
            <InfoRow label="State" value={farmer.farmLocation?.state || "Not provided"} />
            <InfoRow label="Pincode" value={farmer.farmLocation?.pincode || "Not provided"} />
          </ProfileCard>

          <ProfileCard icon={Sprout} title="Farm Information" description="Registered agricultural information">
            <InfoRow label="Land Area" value={farmer.farm?.landArea != null ? `${farmer.farm.landArea}` : "Not provided"} icon={Ruler} />
            <InfoRow label="Land Unit" value={farmer.farm?.landUnit || "Not provided"} />
            <InfoRow label="Main Crop" value={farmer.farm?.mainCrop || "Not provided"} icon={Sprout} />
            <InfoRow label="Preferred Centre" value={getCentreName()} icon={Building2} />
            {farmer.officerCentre && (
              <InfoRow label="Officer Centre" value={typeof farmer.officerCentre === "object" ? farmer.officerCentre?.name || farmer.officerCentre?._id : farmer.officerCentre} icon={Building2} />
            )}
          </ProfileCard>

          <ProfileCard icon={ShieldCheck} title="Verification" description="Farmer account verification status">
            <VerificationRow label="Account Verification" value={farmer.verification?.isVerified ? "Verified" : "Not Verified"} verified={farmer.verification?.isVerified} />
            <VerificationRow label="Phone Verification" value={farmer.verification?.isPhoneVerified ? "Verified" : "Not Verified"} verified={farmer.verification?.isPhoneVerified} />
            <InfoRow label="Verified At" value={formatDate(farmer.verification?.verifiedAt)} icon={CalendarDays} />
            <InfoRow label="Verified By" value={(typeof farmer.verification?.verifiedBy === "object" ? farmer.verification?.verifiedBy?.name || farmer.verification?.verifiedBy?._id : farmer.verification?.verifiedBy) || "Not assigned"} />
            <InfoRow label="Verified At Centre" value={(typeof farmer.verification?.verifiedAtCentre === "object" ? farmer.verification?.verifiedAtCentre?.name || farmer.verification?.verifiedAtCentre?._id : farmer.verification?.verifiedAtCentre) || "Not assigned"} />
          </ProfileCard>
        </div>

        <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black">Uploaded Documents</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Identity, land and bank verification documents</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold outline-none focus:border-emerald-500">
                {Object.entries(DOC_TYPES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
              <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Document name" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold outline-none focus:border-emerald-500 min-w-[160px]" />
              <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer transition-colors ${uploadingDocument ? "opacity-60 pointer-events-none" : ""}`}>
                <FileText className="w-3.5 h-3.5" />
                {uploadingDocument ? "Uploading..." : "Upload"}
                <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleDocumentUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="p-5">
            {farmer.documents?.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {farmer.documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    statusInfo={getDocumentStatus(doc.status)}
                    fileSize={formatFileSize(doc.size)}
                    formattedDate={formatDate(doc.uploadedAt)}
                    onView={() => setSelectedDocument(doc)}
                    onDelete={() => handleDeleteDocument(doc)}
                    deleting={deletingDocument}
                  />
                ))}
              </div>
            ) : <EmptyDocuments />}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <ProfileCard icon={Globe2} title="Language Preference" description="Preferred language for AGRINEX">
            <InfoRow label="Preferred Language" value={LANGUAGES[farmer.preferredLanguage] || farmer.preferredLanguage || "Not provided"} icon={Globe2} />
          </ProfileCard>

          <ProfileCard icon={Bell} title="Notification Preferences" description="Your enabled AGRINEX notifications">
            <PreferenceRow icon={Smartphone} label="SMS" enabled={farmer.notifications?.sms} />
            <PreferenceRow icon={MessageCircle} label="WhatsApp" enabled={farmer.notifications?.whatsapp} />
            <PreferenceRow icon={Bell} label="Push Notifications" enabled={farmer.notifications?.push} />
          </ProfileCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <ProfileCard icon={CheckCircle2} title="Onboarding Status" description="AGRINEX farmer registration progress">
            {farmer.onboardingCompleted ? (
              <>
                <VerificationRow label="Onboarding Completed" value="Completed" verified />
                <InfoRow label="Onboarding Skipped" value={farmer.onboardingSkipped ? "Yes" : "No"} />
                <InfoRow label="Completed At" value={formatDate(farmer.onboardingCompletedAt)} icon={CalendarDays} />
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400">Onboarding Not Completed</p>
                      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">Complete your farmer onboarding to add your farm details, location, preferred procurement centre and required documents.</p>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => router.push("/onboarding")} className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                  <Sprout className="w-4 h-4" />
                  Complete Onboarding
                  <span className="text-sm">→</span>
                </button>
              </>
            )}
          </ProfileCard>

          <ProfileCard icon={Activity} title="Account Activity" description="Recent account activity">
            <InfoRow label="Last Login" value={formatDate(farmer.lastLogin)} icon={Clock3} />
            <InfoRow label="Account Status" value={farmer.isActive ? "Active" : "Inactive"} green={farmer.isActive} />
          </ProfileCard>
        </div>

        <section className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-lime-600 text-white shadow-xl shadow-emerald-600/20">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest font-black text-white/70">AGRINEX Farmer Account</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-2">{farmer.verification?.isVerified ? "Farmer Profile Verified" : "Verification Pending"}</h3>
              <p className="text-xs text-white/75 mt-1 max-w-xl leading-relaxed">Your AGRINEX farmer profile contains your registered farm information, verification status and uploaded documents.</p>
            </div>
            <div className="shrink-0 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <p className="text-[9px] uppercase tracking-widest font-bold text-white/60">Account Role</p>
              <p className="font-black text-lg mt-1">{farmer.role || "FARMER"}</p>
            </div>
          </div>
        </section>

        <div className="mt-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-black">Verification information</p>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">Verification status and verification records are controlled by AGRINEX officers. Sensitive verification information cannot be directly modified from the farmer profile.</p>
          </div>
        </div>
      </main>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          statusInfo={getDocumentStatus(selectedDocument.status)}
          fileSize={formatFileSize(selectedDocument.size)}
          formattedDate={formatDate(selectedDocument.uploadedAt)}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {editOpen && (
        <EditProfileModal
          form={{ ...form, centres }}
          setForm={setForm}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
          saving={savingProfile}
        />
      )}
    </div>
  );
}

function ProfileCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black">{title}</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </section>
  );
}

function InfoRow({ label, value, icon: Icon, green = false }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      </div>
      <span className={`text-xs font-black text-right break-words max-w-[60%] ${green ? "text-emerald-500" : ""}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon, green = false }) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{label}</span>
      </div>
      <p className={`mt-2 text-xs font-black break-words ${green ? "text-emerald-500" : ""}`}>{value}</p>
    </div>
  );
}

function VerificationRow({ label, value, verified }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      </div>
      <span className={`flex items-center gap-1 text-[10px] font-black ${verified ? "text-emerald-500" : "text-amber-500"}`}>
        {verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
        {value}
      </span>
    </div>
  );
}

function DocumentCard({ document: doc, statusInfo, fileSize, formattedDate, onView, onDelete, deleting }) {
  const StatusIcon = statusInfo.icon;
  return (
    <div className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-500/30 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-black ${statusInfo.className}`}>
          <StatusIcon className="w-3 h-3" />
          {statusInfo.label}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-black truncate">{doc.name}</p>
        <p className="text-[10px] text-emerald-500 font-bold mt-1">{DOC_TYPES[doc.type] || doc.type || "Document"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Size</p>
          <p className="text-[10px] font-black mt-1">{fileSize}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Uploaded</p>
          <p className="text-[10px] font-black mt-1">{formattedDate}</p>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
        <button type="button" onClick={onView} className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center gap-2 transition-colors">
          <Eye className="w-3.5 h-3.5" />
          View Document
        </button>
        {doc.status !== "VERIFIED" && (
          <button type="button" onClick={onDelete} disabled={deleting} title="Delete document" className="px-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-black transition-colors disabled:opacity-50">
            {deleting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function DocumentViewer({ document: doc, statusInfo, fileSize, formattedDate, onClose }) {
  const isImage = doc.mimeType?.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";
  return (
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black truncate">{doc.name}</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{DOC_TYPES[doc.type] || doc.type || "Document"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-auto bg-slate-100 dark:bg-[#080d12] p-4 sm:p-6">
          {isImage ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <img src={doc.url} alt={doc.name} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-xl" />
            </div>
          ) : isPdf ? (
            <iframe src={doc.url} title={doc.name} className="w-full h-[60vh] rounded-2xl bg-white" />
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-sm font-black">Preview unavailable</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">This document type cannot be previewed directly. Use the button below to open the original file.</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800">
          <div className="grid sm:grid-cols-4 gap-3 mb-4">
            <DocumentMeta label="Status" value={statusInfo.label} green={doc.status === "VERIFIED"} />
            <DocumentMeta label="File Type" value={doc.mimeType || "Unknown"} />
            <DocumentMeta label="File Size" value={fileSize} />
            <DocumentMeta label="Uploaded" value={formattedDate} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black">Close</button>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Open / Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentMeta({ label, value, green = false }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
      <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className={`text-[10px] font-black mt-1 break-words ${green ? "text-emerald-500" : ""}`}>{value}</p>
    </div>
  );
}

function EmptyDocuments() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <FileText className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-black mt-4">No documents uploaded</h3>
      <p className="text-xs text-slate-400 mt-1">Your uploaded verification documents will appear here.</p>
    </div>
  );
}

function PreferenceRow({ icon: Icon, label, enabled }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-medium text-slate-400">{label}</span>
      </div>
      <span className={`flex items-center gap-1 text-[10px] font-black ${enabled ? "text-emerald-500" : "text-slate-400"}`}>
        {enabled ? <><Check className="w-3.5 h-3.5" /> Enabled</> : "Disabled"}
      </span>
    </div>
  );
}

function EditProfileModal({ form, setForm, onClose, onSave, saving }) {
  const updateNested = (parent, key, val) => setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: val } }));

  return (
    <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="sticky top-0 z-10 p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-black">Edit Profile</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Update your farmer profile information</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-6">
          <FormSection title="Personal Information" icon={User}>
            <FormInput label="Full Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <FormInput label="Email Address" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Mobile Number</label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                {form.mobile || "Managed through authentication"}
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5">Mobile number cannot be changed from the farmer profile.</p>
            </div>
          </FormSection>

          <FormSection title="Farm Location" icon={MapPin}>
            <div className="grid sm:grid-cols-2 gap-4">
              {["village", "district", "state"].map((k) => (
                <FormInput key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={form.farmLocation[k] || ""} onChange={(v) => updateNested("farmLocation", k, v)} />
              ))}
              <FormInput label="Pincode" value={form.farmLocation.pincode || ""} onChange={(v) => updateNested("farmLocation", "pincode", v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" />
            </div>
          </FormSection>

          <FormSection title="Farm Information" icon={Sprout}>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Land Area" type="number" min="0" step="0.01" value={form.farm.landArea ?? ""} onChange={(v) => updateNested("farm", "landArea", v === "" ? null : Number(v))} />
              <div>
                <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Land Unit</label>
                <select value={form.farm.landUnit || "Acre"} onChange={(e) => updateNested("farm", "landUnit", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500">
                  <option value="Acre">Acre</option>
                  <option value="Hectare">Hectare</option>
                </select>
              </div>
            </div>
            <FormInput label="Main Crop" value={form.farm.mainCrop || ""} onChange={(v) => updateNested("farm", "mainCrop", v)} />
          </FormSection>

          <FormSection title="Preferred Procurement Centre" icon={Building2}>
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Procurement Centre</label>
              <select value={form.preferredCentre || ""} onChange={(e) => setForm((p) => ({ ...p, preferredCentre: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500">
                <option value="">Not selected</option>
                {(form.centres || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name || c.title || c.code || c.centreCode || c._id}</option>
                ))}
              </select>
              {(form.centres || []).length === 0 && <p className="text-[9px] text-amber-500 mt-1.5">No procurement centres were returned by the server.</p>}
            </div>
          </FormSection>

          <FormSection title="Language Preference" icon={Globe2}>
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Preferred Language</label>
              <select value={form.preferredLanguage || "en"} onChange={(e) => setForm((p) => ({ ...p, preferredLanguage: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500">
                {Object.entries(LANGUAGES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
          </FormSection>

          <FormSection title="Notification Preferences" icon={Bell}>
            {["sms", "whatsapp", "push"].map((key) => (
              <ToggleRow
                key={key}
                label={`${key === "sms" ? "SMS" : key.charAt(0).toUpperCase() + key.slice(1)} Notifications`}
                enabled={form.notifications[key]}
                onChange={(val) => updateNested("notifications", key, val)}
              />
            ))}
          </FormSection>

          <div className="pt-3 flex gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-60">
              {saving ? <><Activity className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-500" />
        </div>
        <h3 className="text-xs font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false, min, step, inputMode }) {
  return (
    <div>
      <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        min={min}
        step={step}
        inputMode={inputMode}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
      />
    </div>
  );
}

function ToggleRow({ label, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
      <span className="text-xs font-bold">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${enabled ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}