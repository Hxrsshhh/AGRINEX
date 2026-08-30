"use client";

import { useState } from "react";
import {
  User,
  Edit3,
  Camera,
  MapPin,
  Phone,
  Mail,
  Sprout,
  ShieldCheck,
  BadgeCheck,
  Ruler,
  FileText,
  CheckCircle2,
  X,
  Save,
  MapPinned,
  Building2,
} from "lucide-react";

export default function ProfilePage() {
  /* ============================================================
     FARMER PROFILE DATA
  ============================================================ */

  const [farmer, setFarmer] = useState({
    name: "Rajesh Kumar",
    farmerId: "AGR-FRM-10245",

    phone: "+91 98765 43210",
    email: "rajesh@example.com",
    fatherName: "S K Kumar",

    state: "Assam",
    district: "Kamrup",
    village: "XYZ Village",
    pincode: "781001",

    landSize: "6.5 Acres",
    mainCrop: "Paddy",
    soilType: "Alluvial Loam",

    pmKisanId: "PMK-AS-88902",
    aadhaar: "XXXX-XXXX-4920",
    ekycStatus: "Verified",

    preferredCentre: "XYZ Mandi",
  });

  /* ============================================================
     EDIT MODAL
  ============================================================ */

  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    ...farmer,
  });

  /* ============================================================
     PROFILE PHOTO
  ============================================================ */

  const [profileImage, setProfileImage] = useState(null);

  /* ============================================================
     TOAST
  ============================================================ */

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ============================================================
     OPEN EDIT
  ============================================================ */

  const openEdit = () => {
    setForm({
      ...farmer,
    });

    setEditOpen(true);
  };

  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  const handleSaveProfile = (e) => {
    e.preventDefault();

    setFarmer({
      ...form,
    });

    setEditOpen(false);

    showToast("Profile updated successfully");
  };

  /* ============================================================
     PROFILE IMAGE
  ============================================================ */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result);
      showToast("Profile photo updated");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* =========================================================
          TOAST
      ========================================================= */}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300]">

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl">

            <CheckCircle2 className="w-4 h-4" />

            {toast}

          </div>

        </div>
      )}

      {/* =========================================================
          MAIN CONTENT

          Navbar and Sidebar are already provided by:
          app/(main)/layout.js
      ========================================================= */}

      <main className="w-full p-4 sm:p-6 lg:p-8">

        {/* =======================================================
            PAGE HEADER
        ======================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-2 mb-1">

              <User className="w-4 h-4 text-emerald-500" />

              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500">
                Farmer Account
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Profile
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and manage your registered farmer and farm information.
            </p>

          </div>

          <button
            type="button"
            onClick={openEdit}
            className="self-start sm:self-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all"
          >

            <Edit3 className="w-4 h-4" />

            Edit Profile

          </button>

        </div>


        {/* =======================================================
            PROFILE HERO
        ======================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">

          {/* Top Gradient */}

          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500" />

          {/* Background glow */}

          <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-7">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* =================================================
                  PROFILE IMAGE
              ================================================= */}

              <div className="relative shrink-0 mx-auto md:mx-0">

                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 p-[2px] shadow-xl shadow-emerald-500/20">

                  <div className="w-full h-full rounded-[22px] bg-slate-900 dark:bg-[#0b1015] flex items-center justify-center overflow-hidden">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Farmer profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-slate-500" />
                    )}

                  </div>

                </div>


                {/* Upload */}

                <label
                  htmlFor="profile-image"
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg cursor-pointer transition-colors"
                >

                  <Camera className="w-4 h-4" />

                </label>

                <input
                  id="profile-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </div>


              {/* =================================================
                  IDENTITY
              ================================================= */}

              <div className="flex-1 text-center md:text-left">

                <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">

                  <h2 className="text-2xl sm:text-3xl font-black">
                    {farmer.name}
                  </h2>

                  <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black w-fit mx-auto sm:mx-0">

                    <BadgeCheck className="w-3.5 h-3.5" />

                    VERIFIED FARMER

                  </span>

                </div>


                <p className="text-xs text-slate-400 mt-2">
                  AGRINEX Farmer ID
                </p>


                <div className="inline-flex mt-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-black">

                  {farmer.farmerId}

                </div>


                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">

                  <span className="flex items-center gap-1.5">

                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />

                    {farmer.village}, {farmer.district}

                  </span>


                  <span className="flex items-center gap-1.5">

                    <Phone className="w-3.5 h-3.5 text-emerald-500" />

                    {farmer.phone}

                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                QUICK PROFILE STATS
            ================================================= */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">

              <QuickStat
                label="Land Holding"
                value={farmer.landSize}
                icon={Ruler}
              />

              <QuickStat
                label="Primary Crop"
                value={farmer.mainCrop}
                icon={Sprout}
              />

              <QuickStat
                label="e-KYC"
                value={farmer.ekycStatus}
                icon={ShieldCheck}
                green
              />

              <QuickStat
                label="Procurement Centre"
                value={farmer.preferredCentre}
                icon={Building2}
              />

            </div>

          </div>

        </section>


        {/* =======================================================
            INFORMATION GRID
        ======================================================= */}

        <div className="grid lg:grid-cols-2 gap-6 mt-6">


          {/* =====================================================
              PERSONAL INFORMATION
          ===================================================== */}

          <ProfileCard
            icon={User}
            title="Personal Information"
            description="Registered farmer identity details"
          >

            <InfoRow
              label="Full Name"
              value={farmer.name}
            />

            <InfoRow
              label="Father's Name"
              value={farmer.fatherName}
            />

            <InfoRow
              label="Mobile Number"
              value={farmer.phone}
              icon={Phone}
            />

            <InfoRow
              label="Email Address"
              value={farmer.email}
              icon={Mail}
            />

          </ProfileCard>


          {/* =====================================================
              REGISTERED ADDRESS
          ===================================================== */}

          <ProfileCard
            icon={MapPin}
            title="Registered Address"
            description="Farmer's registered residential location"
          >

            <InfoRow
              label="Village"
              value={farmer.village}
            />

            <InfoRow
              label="District"
              value={farmer.district}
            />

            <InfoRow
              label="State"
              value={farmer.state}
            />

            <InfoRow
              label="Pincode"
              value={farmer.pincode}
            />

          </ProfileCard>


          {/* =====================================================
              FARM INFORMATION
          ===================================================== */}

          <ProfileCard
            icon={Sprout}
            title="Farm Information"
            description="Registered agricultural information"
          >

            <InfoRow
              label="Total Land Holding"
              value={farmer.landSize}
              icon={Ruler}
            />

            <InfoRow
              label="Primary Crop"
              value={farmer.mainCrop}
              icon={Sprout}
            />

            <InfoRow
              label="Soil Type"
              value={farmer.soilType}
            />

            <InfoRow
              label="Preferred Procurement Centre"
              value={farmer.preferredCentre}
              icon={MapPinned}
            />

          </ProfileCard>


          {/* =====================================================
              GOVERNMENT VERIFICATION
          ===================================================== */}

          <ProfileCard
            icon={ShieldCheck}
            title="Identity Verification"
            description="Government-linked farmer verification"
          >

            {/* Verification status */}

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                    <ShieldCheck className="w-4 h-4 text-emerald-500" />

                  </div>

                  <div>

                    <p className="text-xs font-black">
                      e-KYC Verification
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your farmer identity is verified
                    </p>

                  </div>

                </div>

                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500">

                  <CheckCircle2 className="w-3.5 h-3.5" />

                  Verified

                </span>

              </div>

            </div>


            <InfoRow
              label="Aadhaar"
              value={farmer.aadhaar}
              icon={ShieldCheck}
            />

            <InfoRow
              label="PM-KISAN ID"
              value={farmer.pmKisanId}
              icon={FileText}
            />

            <InfoRow
              label="e-KYC Status"
              value={farmer.ekycStatus}
              green
            />

          </ProfileCard>

        </div>


        {/* =======================================================
            PROCUREMENT IDENTITY
        ======================================================= */}

        <section className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-lime-600 text-white shadow-xl shadow-emerald-600/20">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative p-6 sm:p-7">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

              <div>

                <div className="flex items-center gap-2">

                  <Sprout className="w-5 h-5" />

                  <span className="text-[10px] uppercase tracking-widest font-black text-white/70">
                    AGRINEX Procurement Identity
                  </span>

                </div>


                <h3 className="text-xl sm:text-2xl font-black mt-2">
                  Farmer Profile Verified
                </h3>


                <p className="text-xs text-white/75 mt-1 max-w-xl leading-relaxed">
                  Your registered farmer identity can be used for procurement
                  slot booking, queue management and verification at the
                  selected procurement centre.
                </p>

              </div>


              <div className="shrink-0">

                <div className="px-5 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">

                  <p className="text-[9px] uppercase tracking-widest font-bold text-white/60">
                    Farmer ID
                  </p>

                  <p className="font-mono font-black text-lg mt-1">
                    {farmer.farmerId}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =======================================================
            INFORMATION NOTE
        ======================================================= */}

        <div className="mt-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">

          <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />

          <div>

            <p className="text-xs font-black">
              Verified information
            </p>

            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
              Government verification details such as Aadhaar and e-KYC
              status are protected and cannot be directly modified from
              AGRINEX. Contact the appropriate authority if corrections
              are required.
            </p>

          </div>

        </div>

      </main>


      {/* =========================================================
          EDIT PROFILE MODAL
      ========================================================= */}

      {editOpen && (

        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">

            {/* ===================================================
                MODAL HEADER
            =================================================== */}

            <div className="sticky top-0 z-10 p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                    <Edit3 className="w-4 h-4 text-emerald-500" />

                  </div>

                  <div>

                    <h2 className="text-sm font-black">
                      Edit Profile
                    </h2>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Update your registered profile information
                    </p>

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >

                <X className="w-4 h-4" />

              </button>

            </div>


            {/* ===================================================
                FORM
            =================================================== */}

            <form
              onSubmit={handleSaveProfile}
              className="p-5 space-y-4"
            >

              {/* Full name */}

              <FormInput
                label="Full Name"
                value={form.name}
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />


              {/* Father's name */}

              <FormInput
                label="Father's Name"
                value={form.fatherName}
                onChange={(value) =>
                  setForm({
                    ...form,
                    fatherName: value,
                  })
                }
              />


              {/* Phone / Email */}

              <div className="grid sm:grid-cols-2 gap-4">

                <FormInput
                  label="Mobile Number"
                  value={form.phone}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      phone: value,
                    })
                  }
                />

                <FormInput
                  label="Email Address"
                  value={form.email}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      email: value,
                    })
                  }
                />

              </div>


              {/* Village / District */}

              <div className="grid sm:grid-cols-2 gap-4">

                <FormInput
                  label="Village"
                  value={form.village}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      village: value,
                    })
                  }
                />

                <FormInput
                  label="District"
                  value={form.district}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      district: value,
                    })
                  }
                />

              </div>


              {/* State / Pincode */}

              <div className="grid sm:grid-cols-2 gap-4">

                <FormInput
                  label="State"
                  value={form.state}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      state: value,
                    })
                  }
                />

                <FormInput
                  label="Pincode"
                  value={form.pincode}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      pincode: value,
                    })
                  }
                />

              </div>


              {/* Preferred Centre */}

              <div>

                <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Preferred Procurement Centre
                </label>

                <select
                  value={form.preferredCentre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferredCentre: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
                >

                  <option>XYZ Mandi</option>
                  <option>ABC Procurement Centre</option>
                  <option>DEF Mandi</option>
                  <option>North Assam Procurement Centre</option>

                </select>

              </div>


              {/* Save / Cancel */}

              <div className="pt-3 flex gap-3">

                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >

                  <Save className="w-4 h-4" />

                  Save Changes

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* ================================================================
   PROFILE CARD
================================================================ */

function ProfileCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">

      {/* Header */}

      <div className="p-5 border-b border-slate-100 dark:border-slate-800">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">

            <Icon className="w-5 h-5" />

          </div>

          <div>

            <h2 className="text-sm font-black">
              {title}
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {description}
            </p>

          </div>

        </div>

      </div>


      {/* Content */}

      <div className="p-5 space-y-2">

        {children}

      </div>

    </section>
  );
}


/* ================================================================
   INFORMATION ROW
================================================================ */

function InfoRow({
  label,
  value,
  icon: Icon,
  green = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">

      <div className="flex items-center gap-2 min-w-0">

        {Icon && (
          <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}

        <span className="text-[10px] text-slate-400 font-medium">
          {label}
        </span>

      </div>


      <span
        className={`text-xs font-black text-right break-words ${
          green ? "text-emerald-500" : ""
        }`}
      >
        {value}
      </span>

    </div>
  );
}


/* ================================================================
   QUICK STAT
================================================================ */

function QuickStat({
  label,
  value,
  icon: Icon,
  green = false,
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">

      <div className="flex items-center gap-2">

        <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />

        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
          {label}
        </span>

      </div>


      <p
        className={`mt-2 text-xs font-black ${
          green ? "text-emerald-500" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* ================================================================
   FORM INPUT
================================================================ */

function FormInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="block mb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
      />

    </div>
  );
}