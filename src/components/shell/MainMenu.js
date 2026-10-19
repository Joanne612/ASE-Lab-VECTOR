"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const MENU = [
  { label: "Statistik", icon: "pie", href: "/statistik" },
  { label: "Target", icon: "target", href: "/target" },
  { label: "Ide", icon: "idea", href: "/ide" },
];

export default function MainMenu() {
  const pathname = usePathname();

  return (
    <section className="mt-12 px-5">
      <h2 className="text-[18px] font-bold text-[#6A6E79]">Menu utama</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {MENU.map((m) => {
          const isActive = pathname === m.href || pathname.startsWith(`${m.href}/`);
          return (
            <Link
              key={m.label}
              href={m.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex h-[76px] flex-col items-center justify-center gap-1 rounded-xl border border-[#D7C5F5] bg-[#D7C5F5]/50 text-[#9B7FDB] shadow-[0_4px_12px_rgba(150,120,210,0.18)] backdrop-blur-md transition active:scale-95"
                  : "flex h-[76px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-white/40 text-[#A7A9B3] shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:bg-white/60 active:scale-95"
              }
            >
              <Icon name={m.icon} className="h-8 w-8" />
              <span className={`text-[12px] font-semibold ${isActive ? "text-[#8A6FCF]" : "text-[#8A8D99]"}`}>
                {m.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
