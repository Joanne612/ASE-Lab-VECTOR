"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import CalendarBadge from "@/components/CalendarBadge";
import CalendarPicker from "@/components/CalendarPicker";
import { usePeriod } from "@/components/PeriodProvider";
import { formatRupiah, periodBadge } from "@/lib/format";
import { useMe, useSummary } from "@/lib/queries";

const HEADER_PATH =
  "M0 32 Q0 0 32 0 L114 0 C124 0 127 5 129 12 C131 20 134 27 146 27 L244 27 " +
  "C256 27 259 20 261 12 C263 5 266 0 276 0 L358 0 Q390 0 390 32 L390 218 " +
  "Q390 250 358 250 L264 250 C250 250 246 246 240 232 C232 214 216 204 195 204 " +
  "C174 204 158 214 150 232 C144 246 140 250 126 250 L32 250 Q0 250 0 218 Z";

const HEADER_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 250' preserveAspectRatio='none'><path d='${HEADER_PATH}'/></svg>`
)}")`;

const headerMaskStyle = {
  WebkitMaskImage: HEADER_MASK,
  maskImage: HEADER_MASK,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};

function ArrowIcon({ direction = "left", className = "h-4 w-4" }) {
  const transform = direction === "left" ? "rotate(-45deg)" : "scaleY(-1) rotate(-45deg)";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ transform }}
    >
      <path d="M12 3 L19 20 L12 16.5 L5 20 Z" />
    </svg>
  );
}

function TotalValue({ value, loading, failed, align = "left" }) {
  if (loading) {
    return (
      <span
        className={`mt-1 block h-[26px] w-24 animate-pulse rounded-md bg-white/60 ${align === "right" ? "ml-auto" : ""}`}
      />
    );
  }
  return (
    <p className="text-[24px] font-bold leading-tight text-[#6A6E79]">
      {failed ? "–" : formatRupiah(value)}
    </p>
  );
}

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="whitespace-nowrap rounded-[10px] border border-white bg-white/90 px-4 py-2 text-[14px] font-medium text-[#6A6E79] shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:bg-white disabled:opacity-60"
    >
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}

function Profile() {
  const { data: me } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-3">
      <div className="text-right">
        <p className="text-[18px] font-bold leading-tight text-[#6A6E79]">Hai, {me?.username ?? "…"}</p>
        <p className="text-[14px] text-[#6A6E79]">Yuk, atur uangmu</p>
      </div>
      <button
        type="button"
        aria-label="Menu akun"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A9D8F5] bg-cover bg-center"
        style={me?.avatarUrl ? { backgroundImage: `url(${JSON.stringify(me.avatarUrl)})` } : undefined}
      >
        {!me?.avatarUrl && <span className="h-8 w-9 rounded-[45%] bg-[#E0463E]" />}
      </button>

      {menuOpen && (
        <form action={logout} className="absolute right-0 top-[64px] z-50">
          <LogoutButton />
        </form>
      )}
    </div>
  );
}

export default function Header() {
  const { selection, range, setSelection } = usePeriod();
  const { data: summary, error } = useSummary(range);
  const loading = !summary && !error;
  const badge = selection ? periodBadge(selection) : { top: "", bottom: "" };

  return (
    <header className="relative mt-6 h-[250px] w-full lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-white/40 backdrop-blur-xl" style={headerMaskStyle} />

      <svg
        aria-hidden="true"
        viewBox="0 0 390 250"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path d={HEADER_PATH} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative flex h-full flex-col justify-between px-5 pb-8 pt-10">
        <div className="flex items-start justify-between">
          <CalendarPicker value={selection} onConfirm={setSelection}>
            <CalendarBadge top={badge.top} bottom={badge.bottom} />
          </CalendarPicker>

          <Profile />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex flex-row items-center gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
              <span>Pengeluaran</span>
              <ArrowIcon direction="left" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
            </p>
            <TotalValue value={summary?.totals.expense} loading={loading} failed={Boolean(error)} />
          </div>

          <div className="text-right">
            <p className="flex flex-row items-center justify-end gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
              <span>Pemasukan</span>
              <ArrowIcon direction="right" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
            </p>
            <TotalValue value={summary?.totals.income} loading={loading} failed={Boolean(error)} align="right" />
          </div>
        </div>
      </div>

      {/* Tombol tambah */}
      <Link
        href="/transaksi/tambah"
        aria-label="Tambah transaksi"
        className="absolute bottom-0 left-1/2 flex h-[76px] w-[76px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/40 shadow-[0_4px_14px_rgba(120,100,160,0.18)] backdrop-blur-md transition hover:bg-white/60 active:scale-95"
      >
        <span className="absolute h-[3px] w-[60px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
        <span className="absolute h-[60px] w-[3px] rounded-full bg-white shadow-[1px_0_3px_rgba(0,0,0,0.15)]" />
      </Link>
    </header>
  );
}
