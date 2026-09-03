"use client";

import { useState } from "react";
import Navbar from "@/components/farmer/Navbar";
import Sidebar from "@/components/farmer/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#070d0a] text-slate-900 dark:text-slate-100 m-0 p-0">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 lg:ml-56 flex-1 h-[calc(100vh-4rem)] flex items-stretch justify-center m-0 p-0 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}