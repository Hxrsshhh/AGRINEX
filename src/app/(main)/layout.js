"use client";

import { useState } from "react";
import Navbar from "@/components/farmer/Navbar";
import Sidebar from "@/components/farmer/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d12]">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className=" min-h-screen pt-16 lg:ml-56 ">
        <div className=" w-full max-w-[1600px] mx-auto p-3 ">{children}</div>
      </main>
    </div>
  );
}
