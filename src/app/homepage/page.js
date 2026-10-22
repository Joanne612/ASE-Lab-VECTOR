import Link from "next/link";
import { api } from "@/lib/api";
import CalendarPicker from "./CalendarPicker";

const PANEL_TOP = "363px";
/* ---------- DATA (ganti dengan data dari backend) ---------- */
const SUMMARY = { pengeluaran: 83000, pemasukan: 280000 };

const TRANSACTIONS = [
  {
    date: "Agu 15",
    day: "Sab",
    items: [
      { time: "12.00", icon: "shirt", title: "Pakaian", note: "Baju Channel", amount: 50000 },
      { time: "16.47", icon: "drink", title: "Minuman", amount: 16000 },
      { icon: "shoe", title: "Sepatu", amount: 150000 },
      { icon: "bus", title: "Transportasi", note: "Bis", amount: 5000 },
    ],
  },
  {
    date: "Agu 10",
    day: "Sab",
    items: [
      { time: "11.50", icon: "burger", title: "Makanan", note: "Es krim", amount: 5000 },
      { icon: "burger", title: "Makanan", amount: 5000 },
    ],
  },
];

const rupiah = (n) => n.toLocaleString("id-ID");

/* Icons */
const ICON_PATHS = {
  shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />,
  drink: <path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />,
  shoe: <path d="M3 16v-4l4-1 3 2h3l2-3 4 3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16h18" />,
  bus: (
    <>
      <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M9 18h5" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  burger: <path d="M4 11a8 6 0 0 1 16 0zM3 14h18M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />,
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
  simulation: (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6v34h34" />
    <path d="M14 30l9-9 6 6 11-12" />
    <path d="M32 15h8v8" />
  </svg>
),
  plus: <path d="M12 5v14M5 12h14" />,
};

function ArrowIcon({ direction = "left", className = "h-4 w-4" }) {
  const transform =
    direction === "left"
      ? "rotate(-45deg)"
      : "scaleY(-1) rotate(-45deg)";

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
      {/* Layer atas: fade out ke bawah */}
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
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/40 backdrop-blur-xl"
        style={headerMaskStyle}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 390 250"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d={HEADER_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
 
      {/* Konten */}
      <div className="relative flex h-full flex-col justify-between px-5 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <CalendarPicker>
          <div className="relative h-[84px] w-[84px] shrink-0">
            <div
              className="absolute inset-0 rounded-[20px] border-[3px] border-white/90"
              style={{
                background: "linear-gradient(160deg, #F6F3FC 0%, #E4E2F4 100%)",
                boxShadow:
                  "0 12px 22px rgba(150,140,205,0.28), inset 0 0 10px rgba(255,255,255,0.9)",
              }}
            />

            {/* gradasi */}
            <div
              className="absolute inset-x-[8px] bottom-[8px] top-[12px] rounded-[10px]"
              style={{
                background:
                  "linear-gradient(180deg, #A395D6 0%, #A7ADDC 30%, #B3BDD9 100%)",
                boxShadow: "inset 0 1px 3px rgba(255,255,255,0.35)",
              }}
            />

            {/* Cincin */}
            <span className="absolute left-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />
            <span className="absolute right-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />

            {/* Teks */}
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

          {/* Profile */}
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
 
        {/* Pengeluaran */}
        <div className="grid grid-cols-2 gap-4">
          <div>
          <p className="flex flex-row items-center gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
            <span>Pengeluaran</span>
            <ArrowIcon direction="left" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
          </p>
          <p className="text-[24px] font-bold leading-tight text-[#6A6E79]">
            {rupiah(SUMMARY.pengeluaran)}
          </p>
        </div>

        {/* Pemasukan */}
        <div className="text-right">
          <p className="flex flex-row items-center justify-end gap-2 whitespace-nowrap text-[16px] text-[#6A6E79]">
            <span>Pemasukan</span>
            <ArrowIcon direction="right" className="h-4 w-4 shrink-0 text-[#6A6E79]" />
          </p>
          <p className="text-[24px] font-bold leading-tight text-[#6A6E79]">
            {rupiah(SUMMARY.pemasukan)}
          </p>
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

/* LAYER 3 — MENU UTAMA */
const MENU = [
  { label: "Statistik", icon: "pie", href: "/statistik" },
  { label: "Target", icon: "target", href: "/target" },
  { label: "Ide", icon: "idea", href: "/ide" },
  { label: "Simulasi", icon: "simulation", href: "/simulasi", active: true },
];

function MainMenu() {
  return (
    <section className="mt-12">
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
              m.active
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

/* LAYER 4 — RIWAYAT TRANSAKSI */
function groupByTime(items) {
  return items.reduce((blocks, item) => {
    if (item.time || blocks.length === 0) {
      blocks.push({ time: item.time, items: [item] });
    } else {
      blocks[blocks.length - 1].items.push(item);
    }
    return blocks;
  }, []);
}

function TransactionCard({ item }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/70 bg-white/20 p-1.5 pr-3 shadow-[0_3px_10px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E9D9FA] to-[#C7A3E9] text-white shadow-inner">
        <Icon name={item.icon} className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium text-[#8A8D99]">{item.title}</p>
        {item.note && <p className="truncate text-[12px] text-[#8A8D99]">{item.note}</p>}
      </div>
      <p className="text-[16px] font-medium text-[#6A6E79]">{rupiah(item.amount)}</p>
    </div>
  );
}

function TransactionBlock({ time, items }) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="relative w-14 shrink-0">
        {time && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-[#6A6E79]">
            {time}
          </span>
        )}
        <span
          className={`absolute bottom-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-[#8A8D99]/70 ${
            time ? "top-9" : "top-0"
          }`}
        />
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {items.map((item, i) => (
          <li key={i}>
            <TransactionCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TransactionHistory() {
  return (
    <section className="mt-5 rounded-t-[28px] border border-white/60 bg-white/20 px-4 pt-4 pb-8 backdrop-blur-xl">
      {TRANSACTIONS.map((group) => (
        <div key={group.date} className="mb-4 last:mb-0">
          <div className="mb-2 flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-[#8A8D99]">{group.date}</h3>
            <span className="text-[11px] font-bold text-[#8A8D99]">{group.day}</span>
          </div>

          <div className="flex flex-col gap-4">
            {groupByTime(group.items).map((block, i) => (
              <TransactionBlock key={i} time={block.time} items={block.items} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F1ECF5]">
      <BackgroundLayer />
      <div className="relative z-10 mx-auto h-full w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px]">
        <Header />
        <MainMenu />
        <TransactionHistory />
      </div>
    </main>
  );
}
