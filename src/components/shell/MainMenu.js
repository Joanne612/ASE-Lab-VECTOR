"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const MENU = [
  { label: "Statistik", icon: "pie", href: "/statistik" },
  { label: "Target", icon: "target", href: "/target" },
  { label: "Ide", icon: "idea", href: "/ide" },
  { label: "Simulasi", icon: "simulation", href: "/simulasi" },
];

export default function MainMenu() {
  const pathname = usePathname();

  return (
    <section className="mt-12 lg:hidden">
      <h2 className="px-5 text-[18px] font-bold text-[#6A6E79]">Menu utama</h2>

      <div
        className="mt-3 flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 py-2
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MENU.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={[
              "flex h-[76px] w-[calc((100%-24px)/3)] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl border backdrop-blur-md transition active:scale-95",
              pathname === m.href
                ? "border-[#C9B6F0] bg-[#E6D9F7]/70 text-[#7E63B8] shadow-[0_6px_16px_rgba(126,99,184,0.25)]"
                : "border-white/70 bg-white/40 text-[#A7A9B3] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-white/60",
            ].join(" ")}
          >
            <Icon name={m.icon} className="h-8 w-8" />
            <span
              className={`text-[12px] font-semibold ${
                m.active ? "text-[#7E63B8]" : "text-[#8A8D99]"
              }`}
            >
              {m.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
