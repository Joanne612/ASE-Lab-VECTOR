"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import CalendarPicker from "@/components/CalendarPicker";
import { usePeriod } from "@/components/PeriodProvider";
import { useSearch } from "@/components/SearchProvider";
import { LogoutButton } from "@/components/shell/Header";
import { formatRupiah, periodBadge } from "@/lib/format";
import { useMe, useSummary } from "@/lib/queries";

// Header ini hanya tampil di desktop, jadi gaya Figma dipakai tanpa prefix lg:.
const TEXT_GLOW = "[text-shadow:0_1px_3px_rgba(255,255,255,0.5)]";
const GLASS_FIELD =
  "border border-white/40 bg-[rgba(221,230,245,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)] backdrop-blur-[10px]";

/* Badge kalender desktop 143×130 berisi periode terpilih (mis. "Agustus" / "2026"). */
function CalendarBadgeLarge({ top, bottom }) {
  return (
    <div className="relative h-[130px] w-[143px]">
      <div className="absolute inset-0 rounded-[25px] border-2 border-white bg-white/50 opacity-70 shadow-[0_8px_30px_rgba(255,255,255,0.12),inset_0_-5px_4px_rgba(154,168,189,0.2),inset_0_8px_4px_rgba(154,168,189,0.2),inset_0_4px_4px_white] backdrop-blur-[2px]" />
      <div className="absolute left-[21px] top-[15px] h-[58px] w-[102px] rounded-[10px] bg-[linear-gradient(123.33deg,#A9A9F1_4.3%,#C5E7D6_95.7%)] shadow-[0_40px_74px_rgba(0,0,0,0.06),inset_0_6px_6px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-[21px] top-[33px] h-[79px] w-[102px] rounded-[10px] bg-[rgba(217,217,217,0.2)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.3)]" />
      <span className="absolute left-[42px] top-[10px] h-[10px] w-[5px] rounded-[10px] bg-white" />
      <span className="absolute left-[94px] top-[10px] h-[10px] w-[5px] rounded-[10px] bg-white" />
      <div className="absolute inset-x-0 top-[48px] flex flex-col items-center text-white">
        <span className="whitespace-nowrap text-[20px] font-semibold leading-normal">{top}</span>
        <span className="mt-1 text-[16px] font-semibold leading-normal">{bottom}</span>
      </div>
    </div>
  );
}

function Profile() {
  const { data: me } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex items-start gap-[7px]">
      <button
        type="button"
        aria-label="Menu akun"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="size-[65px] shrink-0 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${JSON.stringify(me?.avatarUrl ?? "/avatar-default.png")})` }}
      />
      <div className="pt-1">
        <p className={`text-[16px] font-semibold leading-normal text-[#6A6E79] ${TEXT_GLOW}`}>Hai, {me?.username ?? "…"}</p>
        <p className={`text-[16px] font-medium leading-normal text-[#6A6E79] ${TEXT_GLOW}`}>Yuk, atur uangmu</p>
      </div>

      {menuOpen && (
        <form action={logout} className="absolute left-0 top-[73px] z-50">
          <LogoutButton />
        </form>
      )}
    </div>
  );
}

function Total({ label, value, loading, failed, arrowClassName = "" }) {
  return (
    <div>
      <p className={`flex items-center gap-[5px] whitespace-nowrap text-[20px] font-medium leading-normal text-[#6A6E79] ${TEXT_GLOW}`}>
        {label}
        <span aria-hidden="true" className={`size-4 shrink-0 bg-[url(/desktop-arrow.svg)] bg-no-repeat ${arrowClassName}`} />
      </p>
      {loading ? (
        <span className="mt-[6px] block h-[48px] w-40 animate-pulse rounded-lg bg-white/60" />
      ) : (
        <p className={`text-[40px] font-bold leading-normal text-[#6A6E79] ${TEXT_GLOW}`}>
          {failed ? "–" : formatRupiah(value)}
        </p>
      )}
    </div>
  );
}

function SearchBar() {
  const { query, setQuery } = useSearch();
  const pathname = usePathname();
  const router = useRouter();

  // Hasil pencarian tampil di riwayat transaksi halaman Rumah.
  const submit = (event) => {
    event.preventDefault();
    if (pathname !== "/homepage") router.push("/homepage");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="absolute left-1/2 top-[142px] h-[57px] w-[452px] max-w-[40%] -translate-x-1/2"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari transaksi"
        aria-label="Cari transaksi"
        className={`size-full rounded-full pl-6 pr-[70px] text-[16px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/50 [&::-webkit-search-cancel-button]:hidden ${GLASS_FIELD}`}
      />
      <button
        type="submit"
        aria-label="Cari"
        className="absolute right-[27px] top-1/2 size-9 -translate-y-1/2 bg-[url(/desktop-search.svg)] bg-no-repeat"
      />
    </form>
  );
}

/* Header versi desktop (≥ lg) dari Figma; mobile memakai Header. */
export default function DesktopHeader() {
  const { selection, range, setSelection } = usePeriod();
  const { data: summary, error } = useSummary(range);
  const loading = !summary && !error;
  const badge = selection ? periodBadge(selection) : { top: "", bottom: "" };

  return (
    <header className="relative mx-[11px] mt-[11px] hidden h-[278px] lg:block">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[35px] border border-white bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_-10px_4px_rgba(255,255,255,0.25),inset_0_4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[7.5px]"
      />

      <div className="absolute left-[21px] top-[22px]">
        <Profile />
      </div>

      <div className="absolute left-[23.69%] top-[25px]">
        <Total label="Pengeluaran" value={summary?.totals.expense} loading={loading} failed={Boolean(error)} />
      </div>
      <div className="absolute left-[59.14%] top-[25px]">
        <Total
          label="Pemasukan"
          value={summary?.totals.income}
          loading={loading}
          failed={Boolean(error)}
          arrowClassName="rotate-180"
        />
      </div>

      <div className="absolute right-[26px] top-[22px]">
        {/* Modal di tengah layar: popup 607px tidak muat di bawah badge pada layar laptop yang pendek. */}
        <CalendarPicker size="lg" modal value={selection} onConfirm={setSelection}>
          <CalendarBadgeLarge top={badge.top} bottom={badge.bottom} />
        </CalendarPicker>
      </div>

      <SearchBar />

      {/* Lekukan di bawah header, tempat tombol tambah */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[219px] h-[83px] w-[152.272px] -translate-x-1/2 bg-[url(/desktop-header-notch.svg)] bg-no-repeat"
      />
      <Link
        href="/transaksi/tambah"
        aria-label="Tambah transaksi"
        className="group absolute left-1/2 top-[223px] h-[74px] w-[78px] -translate-x-1/2 transition active:scale-95"
      >
        <span
          aria-hidden="true"
          className="absolute -left-1 top-0 size-[86px] bg-[url(/desktop-tambah.svg)] bg-no-repeat group-hover:bg-[url(/desktop-tambah-hover.svg)]"
        />
      </Link>
    </header>
  );
}
