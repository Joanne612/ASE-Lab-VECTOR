"use client";

import { useState } from "react";
import Link from "next/link";
import CalendarPicker from "@/app/homepage/CalendarPicker";

const TABS = ["Pengeluaran", "Pemasukan", "Transfer"];

const CATEGORIES = {
  Pengeluaran: [
    { label: "Pakaian", icon: "shirt" },
    { label: "Makanan", icon: "burger" },
    { label: "Minuman", icon: "drink" },
    { label: "Sepatu", icon: "shoe" },
    { label: "Transportasi", icon: "bus" },
    { label: "Internet", icon: "wifi" },
    { label: "Pulsa", icon: "phone" },
    { label: "Sewa", icon: "home" },
    { label: "Pendidikan", icon: "building" },
    { label: "Gym", icon: "gym" },
    { label: "Listrik", icon: "bolt" },
    { label: "Kesehatan", icon: "health" },
    { label: "Belanja Online", icon: "bag" },
    { label: "Lainnya", icon: "menu" },
  ],
  Pemasukan: [
    { label: "Gaji", icon: "wallet" },
    { label: "Bonus", icon: "gift" },
    { label: "Hadiah", icon: "gift" },
    { label: "Lainnya", icon: "menu" },
  ],
};

const ACCOUNTS = [
  { label: "Tunai", icon: "wallet" },
  { label: "Kartu Bank", icon: "card" },
  { label: "Tabungan", icon: "piggy" },
];

const ICON_PATHS = {
  shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />,
  burger: <path d="M4 11a8 6 0 0 1 16 0zM3 14h18M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />,
  drink: <path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />,
  shoe: <path d="M3 16v-4l4-1 3 2h3l2-3 4 3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16h18" />,
  bus: (
    <>
      <path d="M6 3h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM4 11h16M4 7h16M7 18v3M17 18v3M7 15h2M15 15h2" />
    </>
  ),
  wifi: <path d="M12 12v9M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9M4.5 4.5a10 10 0 0 0 0 15M19.5 4.5a10 10 0 0 1 0 15M12 12h.01" />,
  phone: <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01" />,
  home: <path d="M3 11 12 3l9 8M5 10v10h14V10M10 20v-6h4v6" />,
  building: <path d="M4 21V8h6V3h10v18zM8 12h.01M8 16h.01M14 8h.01M14 12h.01M14 16h.01M18 12h.01M18 16h.01" />,
  gym: <path d="M6 6v12M3 9v6M18 6v12M21 9v6M6 12h12" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  health: <path d="M4 7h16a1 1 0 0 1 1 1v12H3V8a1 1 0 0 1 1-1zM9 7V4h6v3M12 11v6M9 14h6" />,
  bag: <path d="M5 8h14l1 13H4zM8 8a4 4 0 0 1 8 0" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  wallet: <path d="M3 7a2 2 0 0 1 2-2h14v4M3 7v10a2 2 0 0 0 2 2h16V9H5a2 2 0 0 1-2-2zM17 14h.01" />,
  card: <path d="M3 6h18v12H3zM3 10h18M7 15h4" />,
  piggy: <path d="M19 11c0-3-3-5-7-5S5 8 5 11c0 2 1 3.500 2.500 4.500V19h3v-1.500h3V19h3v-3.500c1-.8 1.500-1.500 1.500-2.500M19 11h2v3h-2M9 10h.01" />,
  gift: <path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8S10 3 7.500 4.500 9 8 12 8zM12 8s2-5 4.500-3.500S15 8 12 8z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  swap: <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
};

const GLASS =
  "border border-white/40 bg-white/15 backdrop-blur-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2),0_8px_30px_rgba(255,255,255,0.12)]";

const FIELD = `${GLASS} !bg-[rgba(221,230,245,0.15)]`;

function Icon({ name, className = "h-6 w-6", stroke = "currentColor", width = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#F1E9E8]">
      <div
        className="absolute left-0 right-0 top-0 h-[300px]"
        style={{
          backgroundImage: "url(/login-mobile-atas.svg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[320px]"
        style={{
          backgroundImage: "url(/login-mobile-bawah.svg)",
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function CategoryButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex h-[55px] items-center rounded-[10px] pr-2 text-left transition active:scale-[0.98] ${GLASS} ${
        active ? "!bg-[rgba(235,207,255,0.55)] !border-white" : ""
      }`}
    >
      <span className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-white via-[#E8D1FD] to-[#EBCFFF] text-white shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]">
        <Icon name={item.icon} className="h-8 w-8" stroke="white" width={2} />
      </span>
      <span className="ml-2 truncate text-[14px] font-medium text-[#6A6E79]/70 [text-shadow:0_1px_3px_rgba(255,255,255,0.5)]">
        {item.label}
      </span>
    </button>
  );
}

function AccountButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-[43px] w-[152px] items-center gap-3 rounded-[10px] bg-white px-2 shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)] transition active:scale-[0.98] ${
        active ? "ring-2 ring-[#EBCFFF]" : ""
      }`}
    >
      <Icon name={item.icon} className="h-8 w-8 shrink-0" stroke="#EBCFFF" width={2} />
      <span className="truncate text-[15px] font-medium text-[#6A6E79]/70">{item.label}</span>
    </button>
  );
}

function AssetSlot({ placeholder, value, onChange }) {
  const text = value.trim().toLowerCase();
  const matched = ACCOUNTS.find((a) => a.label.toLowerCase() === text);
  const iconName = matched ? matched.icon : text ? "wallet" : "plus";

  return (
    <label className={`flex h-[55px] w-[165px] items-center rounded-[10px] pr-2 ${GLASS}`}>
      <span className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-white via-[#E8D1FD] to-[#EBCFFF] shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]">
        <Icon name={iconName} className="h-9 w-9" stroke="white" width={2.5} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        list="daftar-aset"
        maxLength={30}
        autoComplete="off"
        className="ml-2 w-full min-w-0 bg-transparent text-[14px] font-medium text-[#6A6E79] placeholder:text-[#6A6E79]/70 focus:outline-none"
      />
    </label>
  );
}

function TransferPanel({ from, to, fee, setFrom, setTo, onFee }) {
  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="flex min-h-[325px] flex-col items-center gap-3 pt-2">
      <AssetSlot placeholder="Aset dari" value={from} onChange={setFrom} />

      <button
        type="button"
        onClick={swap}
        aria-label="Tukar aset"
        className="flex h-10 w-10 items-center justify-center text-[#4B4F5A] transition active:scale-90"
      >
        <Icon name="swap" className="h-9 w-9" width={2.2} />
      </button>

      <AssetSlot placeholder="Aset ke" value={to} onChange={setTo} />

      <datalist id="daftar-aset">
        {ACCOUNTS.map((a) => (
          <option key={a.label} value={a.label} />
        ))}
      </datalist>

      <input
        inputMode="numeric"
        value={fee}
        onChange={onFee}
        placeholder="Biaya admin"
        aria-label="Biaya admin"
        className={`mt-8 h-[45px] w-[175px] rounded-[10px] px-4 text-center text-[20px] font-medium text-[#6A6E79] placeholder:text-[#6A6E79]/60 focus:outline-none ${FIELD}`}
      />
    </div>
  );
}

function DateBadge() {
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
            <div
              className="absolute inset-0 rounded-[20px] border-[3px] border-white/90"
              style={{
                background: "linear-gradient(160deg, #F6F3FC 0%, #E4E2F4 100%)",
                boxShadow:
                  "0 12px 22px rgba(150,140,205,0.28), inset 0 0 10px rgba(255,255,255,0.9)",
              }}
            />

            {/* Panel gradasi */}
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
  );
}

export default function TambahTransaksiPage() {
  const [tab, setTab] = useState("Pengeluaran");
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState("Tunai");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fee, setFee] = useState("");

  const isTransfer = tab === "Transfer";

  const formatDigits = (v) => {
    const digits = v.replace(/\D/g, "");
    return digits ? Number(digits).toLocaleString("id-ID") : "";
  };
  const handleAmount = (e) => setAmount(formatDigits(e.target.value));
  const handleFee = (e) => setFee(formatDigits(e.target.value));

  const changeTab = (t) => {
    setTab(t);
    setCategory(null);
    setFrom("");
    setTo("");
    setFee("");
  };

  const canSubmit = isTransfer
    ? from.trim() &&
      to.trim() &&
      from.trim().toLowerCase() !== to.trim().toLowerCase() &&
      amount
    : category && amount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: kirim ke backend
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F1ECF5] font-[Poppins,sans-serif]">
      <BackgroundLayer />

      <div className="relative z-10 mx-auto w-full max-w-[480px] px-[11px] pb-6 pt-6">
        <Link
          href="/homepage"
          aria-label="Kembali"
          className="flex h-8 w-8 items-center justify-left text-[#6A6E79]/80"
        >
          <Icon name="back" className="h-6 w-6" width={2.5} />
        </Link>
        {/* Tab */}
          <div
            role="tablist"
            className="absolute inset-x-0 top-16 z-10 mx-auto flex h-[48px] w-[calc(100%-40px)] items-center rounded-[25px] border border-white bg-white/50 p-1 shadow-[0_4px_8px_rgba(154,168,189,0.2)] backdrop-blur-[4px]"
          >
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => changeTab(t)}
                className={`h-full flex-1 rounded-[22px] text-[14px] font-medium text-[#6A6E79]/70 transition ${
                  tab === t
                    ? "border border-white/60 bg-white/30 shadow-[inset_3px_6px_8px_rgba(0,0,0,0.12),inset_-3px_-4px_6px_rgba(255,255,255,0.6)]"
                    : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        <div className="relative mt-3">
        
          <div className="mt-[27px] rounded-[30px] border border-white/50 bg-white/50 px-[18px] pb-4 pt-[48px] shadow-[inset_0_-10px_4px_rgba(255,255,255,0.25),0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[7.5px]">
            {/* Kategori */}
            {isTransfer ? (
              <TransferPanel
                from={from}
                to={to}
                fee={fee}
                setFrom={setFrom}
                setTo={setTo}
                onFee={handleFee}
              />
            ) : (
              <div className="grid max-h-[325px] grid-cols-2 gap-x-[9px] gap-y-[9px] overflow-y-auto pb-1 pr-1">
                {CATEGORIES[tab].map((c) => (
                  <CategoryButton
                    key={c.label}
                    item={c}
                    active={category === c.label}
                    onClick={() => setCategory(c.label)}
                  />
                ))}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="relative mt-4 rounded-[30px] border border-white bg-white/50 p-[13px] shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_5px_4px_4px_rgba(154,168,189,0.2),inset_-5px_-4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[4px]"
            >
              {!isTransfer && (
                <div className="flex flex-wrap gap-x-[21px] gap-y-[14px] pt-[10px]">
                  {ACCOUNTS.map((a) => (
                    <AccountButton
                      key={a.label}
                      item={a}
                      active={account === a.label}
                      onClick={() => setAccount(a.label)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
                  <label className={`flex h-[45px] items-center gap-3 rounded-[10px] px-[10px] ${FIELD}`}>
                    <span className="text-[20px] font-medium text-[#6A6E79]/70">Rp</span>
                    <input
                      inputMode="numeric"
                      value={amount}
                      onChange={handleAmount}
                      placeholder="Jumlah"
                      aria-label="Jumlah"
                      className="w-full min-w-0 bg-transparent text-[20px] font-medium text-[#6A6E79] placeholder:text-[#6A6E79]/50 focus:outline-none"
                    />
                  </label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Keterangan"
                    aria-label="Keterangan"
                    className={`h-[45px] rounded-[10px] px-[17px] text-[20px] font-medium text-[#6A6E79] placeholder:text-[#6A6E79]/50 focus:outline-none ${FIELD}`}
                  />
                </div>

                <CalendarPicker modal>
                  <DateBadge />
                </CalendarPicker>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`h-[45px] w-[99px] rounded-[10px] text-[20px] font-medium text-[#6A6E79] transition active:scale-95 ${GLASS}`}
                >
                  Catat
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
