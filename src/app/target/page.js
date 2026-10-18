"use client";

import { useState } from "react";
import Link from "next/link";
import CalendarPicker from "../homepage/CalendarPicker";

/* ---------- DATA (ganti dengan data dari backend) ---------- */
const SUMMARY = { pengeluaran: 83000, pemasukan: 280000 };

const rupiah = (n) => n.toLocaleString("id-ID");

const PERIODS = [
  { key: "hari", label: "Hari" },
  { key: "minggu", label: "Minggu" },
  { key: "bulan", label: "Bulan" },
];

/* Icons */
const ICON_PATHS = {
  pie: <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />,
  target: (
    <>
      <circle cx="11" cy="13" r="8" />
      <circle cx="11" cy="13" r="4" />
      <circle cx="11" cy="13" r="1" />
      <path d="M11 13 L20 4" />
      <path d="M20 4 L20.5 1.5M20 4 L22.5 3.5" />
      <path d="M17.5 6.5 L18 4M17.5 6.5 L20 6" />
    </>
  ),
  idea: <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />,
  handCoin: (
    <>
      <circle cx="17" cy="6" r="3.5" />
      <path d="M17 4.8v2.4" />
      <path d="M2 15h3.5l3-1.5 4 .5c1 .1 1.5 1 .8 1.7L11 17h-3M5.5 15v5H2M8 19l5 1.5 7-3.2c1-.5.4-1.8-.6-1.5L13 17.5" />
    </>
  ),
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

function Icon({ name, className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* LAYER 1 — BACKGROUND */
function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#F1E9E8]">
      {/* fade out ke bawah */}
      <div
        className="absolute left-0 right-0 top-0 h-[400px]"
        style={{
          backgroundImage: `url(/login-mobile-atas.svg)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
        }}
      />

      {/* fade di atas dan kiri */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[320px]"
        style={{
          backgroundImage: `url(/login-mobile-bawah.svg)`,
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          opacity: 0.2,
          WebkitMaskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          maskComposite: "intersect",
        }}
      />
    </div>
  );
}

/* LAYER 2 — HEADER */
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

function Header() {
  return (
    <header className="relative mt-6 h-[250px] w-full">
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
          <CalendarPicker>
            <div className="relative h-[84px] w-[84px] shrink-0">
              <div
                className="absolute inset-0 rounded-[20px] border-[3px] border-white/90"
                style={{
                  background: "linear-gradient(160deg, #F6F3FC 0%, #E4E2F4 100%)",
                  boxShadow: "0 12px 22px rgba(150,140,205,0.28), inset 0 0 10px rgba(255,255,255,0.9)",
                }}
              />
              <div
                className="absolute inset-x-[8px] bottom-[8px] top-[12px] rounded-[10px]"
                style={{
                  background: "linear-gradient(180deg, #A395D6 0%, #A7ADDC 30%, #B3BDD9 100%)",
                  boxShadow: "inset 0 1px 3px rgba(255,255,255,0.35)",
                }}
              />
              <span className="absolute left-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />
              <span className="absolute right-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />
              <div className="absolute inset-x-0 bottom-[8px] top-[22px] flex flex-col items-center justify-center">
                <span className="text-[13px] font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(80,70,130,0.45)]">
                  Agustus
                </span>
                <span className="text-[20px] font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(80,70,130,0.45)]">
                  2026
                </span>
              </div>
            </div>
          </CalendarPicker>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[18px] font-bold leading-tight text-[#6A6E79]">Hai, Cio</p>
              <p className="text-[14px] text-[#6A6E79]">Yuk, atur uangmu</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A9D8F5]">
              <span className="h-8 w-9 rounded-[45%] bg-[#E0463E]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex flex-row items-center gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
              <span>Pengeluaran</span>
              <ArrowIcon direction="left" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
            </p>
            <p className="text-[24px] font-bold leading-tight text-[#6A6E79]">{rupiah(SUMMARY.pengeluaran)}</p>
          </div>

          <div className="text-right">
            <p className="flex flex-row items-center justify-end gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
              <span>Pemasukan</span>
              <ArrowIcon direction="right" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
            </p>
            <p className="text-[24px] font-bold leading-tight text-[#6A6E79]">{rupiah(SUMMARY.pemasukan)}</p>
          </div>
        </div>
      </div>

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

/* MENU UTAMA */
const MENU = [
  { label: "Statistik", icon: "pie", href: "/statistik" },
  { label: "Target", icon: "target", href: "/target" },
  { label: "Ide", icon: "idea", href: "/ide" },
];

function MainMenu({ active = "Target" }) {
  return (
    <section className="mt-12 px-5">
      <h2 className="text-[18px] font-bold text-[#6A6E79]">Menu utama</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {MENU.map((m) => {
          const isActive = m.label === active;
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

/* PANEL TARGET */
function TargetPanel() {
  const [period, setPeriod] = useState("hari");
  const [amount, setAmount] = useState("");

  const handleAmount = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setAmount(digits ? Number(digits).toLocaleString("id-ID") : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount.replace(/\./g, ""));
    if (!value) return;
    router.push(`/target/alokasi?periode=${period}&jumlah=${value}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-3 mt-5 rounded-[28px] border border-white/70 bg-white/30 px-5 pb-6 pt-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 text-[#8A8D99]">
        <Icon name="handCoin" className="h-10 w-10 text-white drop-shadow-[0_2px_4px_rgba(120,100,160,0.3)]" />
        <h2 className="text-[20px] font-medium">Total Uang Jajan</h2>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Periode">
        {PERIODS.map((p) => {
          const isActive = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setPeriod(p.key)}
              className={`h-[48px] rounded-xl border text-[18px] font-medium shadow-[0_4px_10px_rgba(120,100,160,0.12)] transition active:scale-95 ${
                isActive
                  ? "border-[#D7C5F5] bg-[#D7C5F5]/60 text-[#8A6FCF]"
                  : "border-white/80 bg-white/40 text-[#8A8D99] hover:bg-white/60"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <label className="mt-8 flex h-[52px] items-center gap-3 rounded-xl border border-white/80 bg-white/30 px-4 shadow-[inset_0_2px_4px_rgba(120,100,160,0.12)]">
        <span className="text-[18px] font-semibold text-[#8A8D99]">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={handleAmount}
          placeholder="Jumlah"
          className="min-w-0 flex-1 bg-transparent text-[18px] text-[#6A6E79] outline-none placeholder:text-[#A7A9B3]"
        />
      </label>

      <div className="mt-24 flex justify-center">
        <button
          type="submit"
          className="h-[48px] w-[126px] rounded-xl border border-white/80 bg-white/40 text-[22px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] backdrop-blur-md transition hover:bg-white/60 active:scale-95"
        >
          <a href="/target/alokasi" className="block h-full w-full text-center leading-[48px]">
            Catat
          </a>
        </button>
      </div>
    </form>
  );
}

export default function TargetPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F1ECF5] pb-8">
      <BackgroundLayer />

      <div className="relative z-10 mx-auto w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px]">
        <Header />
        <MainMenu active="Target" />
        <TargetPanel />
      </div>
    </main>
  );
}