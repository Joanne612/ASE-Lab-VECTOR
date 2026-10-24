"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Statistik tidak masuk menu desktop: diagramnya sudah tampil di halaman Rumah.
// size: ukuran SVG Figma (termasuk ruang bayangan), jangan diperkecil.
const MENU = [
  { label: "Rumah", href: "/homepage", icon: "/desktop-nav-rumah.svg", size: "h-[57px] w-[59px]" },
  { label: "Target", href: "/target", icon: "/desktop-nav-target.svg", size: "size-[57px]" },
  { label: "Ide", href: "/ide", icon: "/desktop-nav-ide.svg", size: "size-[57px]" },
  { label: "Simulasi", href: "/simulasi", icon: "/desktop-nav-simulasi.svg", size: "size-[57px]" },
];

/*
 * Menu bawah versi desktop (≥ lg); mobile memakai MainMenu di bawah header.
 * activeHref: menu yang ditandai aktif, untuk halaman di luar menu (mis. modal pencatatan di atas Rumah).
 */
export default function DesktopNav({ activeHref }) {
  const currentPath = usePathname();
  const pathname = activeHref ?? currentPath;
  const active = MENU.findIndex((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));

  return (
    <nav aria-label="Menu utama" className="fixed bottom-[9px] left-1/2 z-40 hidden h-[70px] w-[474px] -translate-x-1/2 lg:block">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[40px] border border-white bg-[rgba(221,230,245,0.2)] shadow-[0_8px_30px_rgba(255,255,255,0.15),inset_0_-5px_4px_rgba(154,168,189,0.2),inset_0_8px_4px_rgba(154,168,189,0.2)] backdrop-blur-[2px]"
      />
      {active >= 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-[24.68%] rounded-[40px] border border-white bg-white/20 shadow-[0_8px_30px_rgba(255,255,255,0.2),inset_5px_-5px_4px_rgba(0,0,0,0.15),inset_-4px_5px_4px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition-[left] duration-300"
          style={{ left: `${active * 25}%` }}
        />
      )}

      <ul className="relative grid h-full grid-cols-4">
        {MENU.map((m, i) => (
          <li key={m.href} className="relative">
            <Link href={m.href} aria-current={i === active ? "page" : undefined} className="absolute inset-0">
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-[29px] -translate-x-1/2 -translate-y-1/2 bg-no-repeat ${m.size}`}
                style={{ backgroundImage: `url(${m.icon})` }}
              />
              <span className="absolute inset-x-0 top-[46px] text-center text-[13px] font-semibold leading-normal text-[#6A6E79]/70 [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]">
                {m.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
