"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CalendarBadge from "@/components/CalendarBadge";
import CalendarPicker from "@/components/CalendarPicker";
import Icon from "@/components/Icon";
import {
  formatDigitsInput,
  parseLocalDate,
  parseRupiahInput,
  periodBadge,
  selectionFromDate,
  toOccurredAt,
} from "@/lib/format";
import { createTransaction, useCategories, useInvalidate } from "@/lib/queries";
import { useHydrated } from "@/lib/use-hydrated";
import { useToday } from "@/lib/use-today";

const TABS = ["Pengeluaran", "Pemasukan", "Transfer"];
const TAB_TYPE = { Pengeluaran: "EXPENSE", Pemasukan: "INCOME" };

// TODO(Fase 8): ganti dengan GET /accounts setelah BE menyediakan akun.
// Sampai saat itu pilihan akun hanya tampilan dan tidak ikut dikirim.
const ACCOUNTS = [
  { label: "Tunai", icon: "wallet" },
  { label: "Kartu Bank", icon: "card" },
  { label: "Tabungan", icon: "piggy" },
];

const GLASS =
  "border border-white/40 bg-white/15 backdrop-blur-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2),0_8px_30px_rgba(255,255,255,0.12)]";

const FIELD = `${GLASS} !bg-[rgba(221,230,245,0.15)]`;

function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#F1E9E8]">
      <div
        className="absolute left-0 right-0 top-0 h-[300px]"
        style={{
          backgroundImage: "url(/login-mobile-atas.webp)",
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
          backgroundImage: "url(/login-mobile-bawah.webp)",
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
        <Icon name={item.icon} className="h-8 w-8" stroke="white" strokeWidth={2} />
      </span>
      <span className="ml-2 truncate text-[14px] font-medium text-[#6A6E79]/70 [text-shadow:0_1px_3px_rgba(255,255,255,0.5)]">
        {item.name}
      </span>
    </button>
  );
}

function CategoryGrid({ type, selectedId, onSelect }) {
  const { data, error, mutate } = useCategories(type);

  if (!data && !error) {
    return (
      <div className="grid grid-cols-2 gap-[9px]" aria-busy="true" aria-label="Memuat kategori">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[55px] animate-pulse rounded-[10px] bg-white/40" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-10 text-center text-[15px] text-[#6A6E79]/80">
        Gagal memuat kategori.{" "}
        <button type="button" onClick={() => mutate()} className="font-medium text-[#7A53B1] underline">
          Coba lagi
        </button>
      </p>
    );
  }

  return (
    <div className="grid max-h-[325px] grid-cols-2 gap-x-[9px] gap-y-[9px] overflow-y-auto pb-1 pr-1">
      {data.data.map((c) => (
        <CategoryButton key={c.id} item={c} active={selectedId === c.id} onClick={() => onSelect(c.id)} />
      ))}
    </div>
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
      <Icon name={item.icon} className="h-8 w-8 shrink-0" stroke="#EBCFFF" strokeWidth={2} />
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
        <Icon name={iconName} className="h-9 w-9" stroke="white" strokeWidth={2.5} />
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
        <Icon name="swap" className="h-9 w-9" strokeWidth={2.2} />
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
      <p className="text-center text-[13px] text-[#6A6E79]/70">Transfer antar aset menunggu dukungan server.</p>
    </div>
  );
}

/** Gabungkan pesan validasi per field dari BE; kalau tidak ada, pakai pesan umum. */
function errorText(error) {
  const messages = Object.values(error.fieldErrors ?? {}).flat();
  return messages.length > 0 ? messages.join(" ") : error.message;
}

export default function TambahTransaksiPage() {
  const router = useRouter();
  const invalidate = useInvalidate();
  const today = useToday();
  const hydrated = useHydrated();

  const [tab, setTab] = useState("Pengeluaran");
  const [categoryId, setCategoryId] = useState(null);
  const [account, setAccount] = useState("Tunai");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [chosenDate, setChosenDate] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fee, setFee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isTransfer = tab === "Transfer";
  // Default tanggal transaksi = hari ini (null sampai hydrate, lihat useToday).
  const date = chosenDate ?? (today ? selectionFromDate(parseLocalDate(today), "harian") : null);

  const handleAmount = (e) => setAmount(formatDigitsInput(e.target.value));
  const handleFee = (e) => setFee(formatDigitsInput(e.target.value));

  const changeTab = (t) => {
    setTab(t);
    setCategoryId(null);
    setFrom("");
    setTo("");
    setFee("");
    setError(null);
  };

  // Transfer belum didukung BE, jadi tombol Catat dinonaktifkan di tab itu.
  const canSubmit = !isTransfer && Boolean(categoryId) && parseRupiahInput(amount) > 0 && Boolean(date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await createTransaction({
        type: TAB_TYPE[tab],
        amount: parseRupiahInput(amount),
        categoryId,
        note: note.trim() || undefined,
        occurredAt: toOccurredAt(date),
      });
      // Header, riwayat, dan statistik ikut diperbarui.
      await invalidate("/transactions");
      router.push("/homepage");
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  const badge = date ? periodBadge(date) : { top: "", bottom: "" };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F1ECF5] font-[Poppins,sans-serif]">
      <BackgroundLayer />

      <div className="relative z-10 mx-auto w-full max-w-[480px] px-[11px] pb-6 pt-6">
        <Link
          href="/homepage"
          aria-label="Kembali"
          className="flex h-8 w-8 items-center justify-left text-[#6A6E79]/80"
        >
          <Icon name="back" className="h-6 w-6" strokeWidth={2.5} />
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
            {/* Nonaktif sampai hydrate: ketikan sebelum itu akan hilang (lihat useHydrated). */}
            <fieldset disabled={!hydrated} className="m-0 min-w-0 border-0 p-0">
              {/* Kategori */}
              {isTransfer ? (
                <TransferPanel from={from} to={to} fee={fee} setFrom={setFrom} setTo={setTo} onFee={handleFee} />
              ) : (
                <CategoryGrid type={TAB_TYPE[tab]} selectedId={categoryId} onSelect={setCategoryId} />
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
                      maxLength={255}
                      className={`h-[45px] rounded-[10px] px-[17px] text-[20px] font-medium text-[#6A6E79] placeholder:text-[#6A6E79]/50 focus:outline-none ${FIELD}`}
                    />
                  </div>

                  {/* BE menolak transaksi bertanggal di masa depan. */}
                  <CalendarPicker modal value={date} onConfirm={setChosenDate} modes={["harian"]} maxDate={today}>
                    <CalendarBadge top={badge.top} bottom={badge.bottom} />
                  </CalendarPicker>
                </div>

                {error && (
                  <p role="alert" className="mt-3 px-1 text-center text-[14px] text-red-600">
                    {errorText(error)}
                  </p>
                )}

                <div className="mt-3 flex justify-center">
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className={`h-[45px] w-[99px] rounded-[10px] text-[20px] font-medium text-[#6A6E79] transition active:scale-95 disabled:opacity-60 ${GLASS}`}
                  >
                    {submitting ? "..." : "Catat"}
                  </button>
                </div>
              </form>
            </fieldset>
          </div>
        </div>
      </div>
    </main>
  );
}
