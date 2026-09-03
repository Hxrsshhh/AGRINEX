"use client";

import { useState } from "react";

import OfficerNavbar from "@/components/officer/Navbar";
import OfficerSidebar from "@/components/officer/Sidebar";

export default function OfficerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <OfficerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="min-h-screen lg:pl-[245px]">
        <OfficerNavbar setSidebarOpen={setSidebarOpen} />
        <main className="min-h-[calc(100vh-70px)]">{children}</main>
      </div>
    </div>
  );
}
