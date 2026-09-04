import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Logo({ href = "/", badge = "PROCURE", tagline = "Smart Procurement • Less Waiting", className = "" }) {
  return (
    <Link href={href} className={`group flex items-center gap-3 ${className}`}>
      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-lime-500 p-[2px] shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
          <Sprout className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:rotate-12" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            AGRI<span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">NEX</span>
          </span>

          {badge && (
            <span className="hidden rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black tracking-wide text-emerald-600 dark:text-emerald-400 sm:inline-flex">
              {badge}
            </span>
          )}
        </div>

        {tagline && (
          <p className="hidden text-[9px] font-medium text-slate-500 dark:text-slate-400 sm:block">
            {tagline}
          </p>
        )}
      </div>
    </Link>
  );
}