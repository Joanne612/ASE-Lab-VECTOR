"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CalendarPicker from "@/components/CalendarPicker";
import Icon from "@/components/Icon";
import DesktopHomeBackdrop from "@/components/shell/DesktopHomeBackdrop";
import { periodBadge } from "@/lib/format";
import { useCategories } from "@/lib/queries";
import { ACCOUNTS, TABS, TAB_TYPE, errorText } from "@/lib/use-transaction-form";
import { useViewportSize } from "@/lib/use-viewport-size";

/*
 * Modal pencatatan versi desktop (≥ lg) dari Figma "Pencatatan Pengeluaran/Pemasukan/Transfer"
 * (2:456, 2:807, 2:1085). Ukuran tetap 1114×603 seperti Figma 1280×832, lalu diskalakan
 * agar muat di layar lain. Semua koordinat relatif ke pojok kiri-atas modal.
 */
const MODAL_W = 1114;
const MODAL_H = 603;

const TEXT_GLOW = "[text-shadow:0_1px_3px_rgba(255,255,255,0.5)]";
const GLASS_SHADOW =
  "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]";
// Tanpa backdrop-blur per tile: modal sudah di-blur (lihat catatan performa di HomeDashboard).
const TILE = `rounded-[10px] border border-white/40 ${GLASS_SHADOW}`;
const FIELD = `rounded-[10px] border border-white/40 bg-[rgba(221,230,245,0.15)] backdrop-blur-[10px] ${GLASS_SHADOW}`;
const ICON_BOX =
  "absolute left-0 top-0 flex size-[55px] items-center justify-center rounded-[10px] bg-[linear-gradient(130.76deg,#FFFFFF_3.2%,#E8D1FD_50%,#EBCFFF_96.8%)] shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]";

// Posisi tab di dalam switch 580×62 (Figma 34:3698).
const TAB_LEFT = { Pengeluaran: 5, Pemasukan: 211, Transfer: 416 };

// Ikon akun dari Figma; ukuran = ukuran SVG (termasuk ruang bayangan), posisi relatif tombol 152×43.
const ACCOUNT_STYLE = {
  Tunai: { icon: "/desktop-account-tunai.svg", w: 55, h: 47.2225, x: 0, y: 0, label: 60 },
  "Kartu Bank": { icon: "/desktop-account-bank.svg", w: 52, h: 42, x: -0.5, y: 1.2, label: 58 },
  Tabungan: { icon: "/desktop-account-tabungan.svg", w: 56, h: 52, x: 0, y: -2.2, label: 63 },
};
const ACCOUNT_POS = { Tunai: [15, 15], "Kartu Bank": [225, 15], Tabungan: [15, 70] };

function TabSwitch({ tab, onChange }) {
  return (
    <div
      role="tablist"
      className="absolute left-[267px] top-[-20px] h-[62px] w-[580px] rounded-[40px] border-2 border-white bg-white/50 shadow-[0_8px_30px_rgba(255,255,255,0.15),inset_0_-5px_4px_rgba(154,168,189,0.2),inset_0_8px_4px_rgba(154,168,189,0.2)] backdrop-blur-[2px]"
    >
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={tab === t}
          onClick={() => onChange(t)}
          style={{ left: TAB_LEFT[t] - 2 }}
          className={`absolute top-[2px] h-[54px] w-[158px] rounded-[40px] text-[20px] font-medium text-[#6A6E79]/70 [text-shadow:0_2px_8px_rgba(0,0,0,0.15)] ${
            tab === t
              ? "border-2 border-white bg-white/50 shadow-[0_8px_30px_rgba(255,255,255,0.2),inset_5px_-5px_4px_rgba(0,0,0,0.1),inset_-4px_5px_4px_rgba(0,0,0,0.1)]"
              : ""
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function CategoryTile({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative h-[55px] w-[257px] ${TILE} ${active ? "bg-white/70" : "bg-white/15"}`}
    >
      <span className={ICON_BOX}>
        <Icon name={item.icon} className="h-10 w-10" stroke="white" strokeWidth={2} />
      </span>
      <span className={`absolute left-[62px] right-2 top-[14px] truncate text-left text-[20px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}>
        {item.name}
      </span>
    </button>
  );
}

function CategoryArea({ type, selectedId, onSelect }) {
  const { data, error, mutate } = useCategories(type);
  const areaClass =
    "absolute left-[44px] top-[67px] h-[521px] w-[921px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const gridClass = "grid grid-cols-[repeat(3,257px)] gap-x-[75px] gap-y-[28px] [grid-auto-flow:row_dense]";

  if (!data && !error) {
    return (
      <div className={areaClass} aria-busy="true" aria-label="Memuat kategori">
        <div className={gridClass}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[55px] animate-pulse rounded-[10px] bg-white/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="absolute left-[44px] top-[67px] w-[591px] py-10 text-center text-[18px] text-[#6A6E79]/80">
        Gagal memuat kategori.{" "}
        <button type="button" onClick={() => mutate()} className="font-medium text-[#7A53B1] underline">
          Coba lagi
        </button>
      </p>
    );
  }

  const items = data.data;
  // Kolom 3 mulai baris 3 tertutup kartu form, jadi dikosongkan dengan placeholder.
  const reservedRows = items.length > 6 ? Math.ceil((items.length - 6) / 2) : 0;

  return (
    <div className={areaClass}>
      <div className={gridClass}>
        {reservedRows > 0 && (
          <div aria-hidden="true" style={{ gridColumn: 3, gridRow: `3 / span ${reservedRows}` }} />
        )}
        {items.map((c) => (
          <CategoryTile key={c.id} item={c} active={selectedId === c.id} onClick={() => onSelect(c.id)} />
        ))}
      </div>
    </div>
  );
}

function AccountButton({ label, active, onClick }) {
  const s = ACCOUNT_STYLE[label];
  const [left, top] = ACCOUNT_POS[label];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ left, top }}
      className={`absolute h-[43px] w-[152px] rounded-[10px] bg-white ${
        active
          ? "shadow-[0_3px_2px_rgba(0,0,0,0.15),inset_-3px_7px_8px_rgba(0,0,0,0.15),inset_8px_-10px_8px_rgba(255,255,255,0.2)]"
          : "shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute bg-no-repeat"
        style={{ left: s.x, top: s.y, width: s.w, height: s.h, backgroundImage: `url(${s.icon})` }}
      />
      <span
        style={{ left: s.label }}
        className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[15px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}
      >
        {label}
      </span>
    </button>
  );
}

/* Badge kalender kecil 89×86 di kartu form (Figma "Kalender" 34:3567). */
function CalendarBadgeSmall({ top, bottom }) {
  return (
    <div className="relative h-[85.838px] w-[89.235px]">
      <div className="absolute inset-0 rounded-[15px] border-2 border-white bg-white/50 shadow-[0_8px_30px_rgba(255,255,255,0.12),inset_0_-5px_4px_rgba(154,168,189,0.2),inset_0_8px_4px_rgba(154,168,189,0.2)] backdrop-blur-[2px]" />
      <div className="absolute inset-[11.54%_13.99%_43.85%_14.69%] rounded-[10px] bg-[linear-gradient(121.86deg,#A9A9F1_4.3%,#C5E7D6_95.7%)] shadow-[0_40px_74px_rgba(0,0,0,0.06),inset_0_6px_6px_rgba(0,0,0,0.15)]" />
      <div className="absolute inset-[25.38%_13.99%_13.85%_14.69%] rounded-[10px] bg-[rgba(217,217,217,0.2)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.3)]" />
      <span className="absolute inset-[7.69%_67.13%_84.62%_29.37%] rounded-[10px] bg-white" />
      <span className="absolute inset-[7.69%_30.77%_84.62%_65.73%] rounded-[10px] bg-white" />
      <div className="absolute inset-x-0 top-[33.7%] flex flex-col items-center leading-normal text-white">
        <span className="whitespace-nowrap text-[10px] font-semibold">{top}</span>
        <span className="text-[12px] font-semibold">{bottom}</span>
      </div>
    </div>
  );
}

/* Kartu form: akun (bukan transfer), jumlah, keterangan, tanggal, dan tombol Catat. */
function FormCard({ form }) {
  const { isTransfer, account, setAccount, amount, handleAmount, note, setNote, date, setChosenDate, today } = form;
  const badge = date ? periodBadge(date) : { top: "", bottom: "" };
  // Kartu transfer tanpa baris akun: lebih pendek dan isinya bergeser ke atas.
  const at = isTransfer
    ? { card: "top-[369px] h-[209px]", amount: [16, 18], note: [16, 82], calendar: [289, 17], submit: [134, 150] }
    : { card: "top-[237px] h-[341px]", amount: [15, 147], note: [15, 211], calendar: [288, 147], submit: [129, 279] };
  const pos = ([left, top]) => ({ left, top });

  return (
    <div
      className={`absolute left-[694px] w-[395px] ${at.card} rounded-[25px] border border-white bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_5px_4px_4px_rgba(154,168,189,0.2),inset_-5px_-4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[4px]`}
    >
      {!isTransfer &&
        ACCOUNTS.map((a) => (
          <AccountButton key={a.label} label={a.label} active={account === a.label} onClick={() => setAccount(a.label)} />
        ))}

      <label style={pos(at.amount)} className={`absolute h-[57px] w-[257px] ${FIELD}`}>
        <span className={`absolute left-[10px] top-1/2 w-[34px] -translate-y-1/2 text-center text-[20px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}>
          Rp
        </span>
        <input
          inputMode="numeric"
          value={amount}
          onChange={handleAmount}
          placeholder="Jumlah"
          aria-label="Jumlah"
          className={`absolute inset-y-0 left-[54px] right-[10px] bg-transparent text-[24px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/50 ${TEXT_GLOW}`}
        />
      </label>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Keterangan"
        aria-label="Keterangan"
        maxLength={255}
        style={pos(at.note)}
        className={`absolute h-[49px] w-[257px] px-[11px] text-[20px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/50 ${FIELD} ${TEXT_GLOW}`}
      />

      {/* BE menolak transaksi bertanggal di masa depan. */}
      <div style={pos(at.calendar)} className="absolute">
        <CalendarPicker modal size="lgDay" withTime modes={["harian"]} maxDate={today} value={date} onConfirm={setChosenDate}>
          <CalendarBadgeSmall top={badge.top} bottom={badge.bottom} />
        </CalendarPicker>
      </div>

      <button
        type="submit"
        disabled={!form.canSubmit || form.submitting}
        style={pos(at.submit)}
        className={`absolute h-[48px] w-[126px] rounded-[10px] border border-white/40 bg-white/15 text-[24px] font-medium text-[#6A6E79]/70 backdrop-blur-[10px] transition ${GLASS_SHADOW} ${TEXT_GLOW} enabled:hover:bg-white/70 enabled:hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_8px_-10px_8px_rgba(255,255,255,0.2),inset_-3px_2px_8px_rgba(0,0,0,0.15)] active:scale-95 disabled:opacity-60`}
      >
        {form.submitting ? "..." : "Catat"}
      </button>
    </div>
  );
}

function AssetSlot({ top, placeholder, value, onChange }) {
  return (
    <label style={{ top }} className={`absolute left-[428px] h-[55px] w-[257px] ${TILE} ${value ? "bg-white/70" : "bg-white/15"}`}>
      <span aria-hidden="true" className={ICON_BOX}>
        <span className="absolute left-[26.6px] top-[5px] h-[45px] w-[3px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.15)]" />
        <span className="absolute left-[5px] top-[26px] h-[3px] w-[46px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        list="daftar-aset-desktop"
        maxLength={30}
        autoComplete="off"
        className={`absolute left-[62px] right-2 top-1/2 -translate-y-1/2 bg-transparent text-[20px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/70 ${TEXT_GLOW}`}
      />
    </label>
  );
}

function TransferArea({ form }) {
  const { from, setFrom, to, setTo, swapAssets, fee, handleFee, accountNames } = form;

  return (
    <>
      <AssetSlot top={109} placeholder="Aset dari" value={from} onChange={setFrom} />
      <button
        type="button"
        onClick={swapAssets}
        aria-label="Tukar aset"
        className="absolute left-[529px] top-[179px] size-[55px] bg-[url(/desktop-swap.svg)] bg-no-repeat transition active:scale-90"
      />
      <AssetSlot top={249} placeholder="Aset ke" value={to} onChange={setTo} />
      <datalist id="daftar-aset-desktop">
        {accountNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <input
        inputMode="numeric"
        value={fee}
        onChange={handleFee}
        placeholder="Biaya admin"
        aria-label="Biaya admin"
        className={`absolute left-[470px] top-[336px] h-[49px] w-[174px] px-3 text-center text-[20px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/70 ${FIELD} ${fee ? "!bg-white/70" : ""} ${TEXT_GLOW}`}
      />
    </>
  );
}

export default function DesktopTransactionModal({ form }) {
  const router = useRouter();
  const size = useViewportSize();
  // 1280×832 (frame Figma) = skala 1; layar lebih kecil memperkecil modal agar tetap muat.
  const scale = size ? Math.min(1, (size.width - 32) / MODAL_W, size.height / 832) : 1;
  const { tab, changeTab, isTransfer, categoryId, setCategoryId, hydrated, error, handleSubmit } = form;

  useEffect(() => {
    // Hanya di desktop: di mobile modal ini tersembunyi.
    if (!window.matchMedia("(min-width: 64rem)").matches) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") router.push("/homepage");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="hidden font-(family-name:--font-poppins) lg:block">
      <DesktopHomeBackdrop />

      {/* Klik di luar modal (latar Rumah, menu, dsb.) membatalkan pencatatan. */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          if (e.target === e.currentTarget) router.push("/homepage");
        }}
      >
        <form
          onSubmit={handleSubmit}
          aria-label="Catat transaksi"
          className="absolute"
          style={{
            left: "50%",
            top: 143 * scale,
            width: MODAL_W,
            height: MODAL_H,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "50% 0",
          }}
        >
          {/* Nonaktif sampai hydrate: ketikan sebelum itu akan hilang (lihat useHydrated). */}
          <fieldset disabled={!hydrated} className="m-0 size-full min-w-0 border-0 p-0">
            <div className="absolute inset-0 rounded-[30px] border border-white/50 bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_-10px_4px_rgba(255,255,255,0.25),inset_0_4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[7.5px]" />

            {isTransfer ? (
              <TransferArea form={form} />
            ) : (
              <CategoryArea type={TAB_TYPE[tab]} selectedId={categoryId} onSelect={setCategoryId} />
            )}

            <FormCard form={form} />

            {error && (
              <p role="alert" title={errorText(error)} className="absolute left-[694px] top-[584px] w-[395px] truncate px-1 text-[13px] text-red-600">
                {errorText(error)}
              </p>
            )}

            <TabSwitch tab={tab} onChange={changeTab} />

            <Link
              href="/homepage"
              aria-label="Tutup"
              className="group absolute left-[1011px] top-[21px] h-[74px] w-[78px] transition active:scale-95"
            >
              <span
                aria-hidden="true"
                className="absolute -left-1 top-0 size-[86px] bg-[url(/desktop-close.svg)] bg-no-repeat group-hover:bg-[url(/desktop-close-hover.svg)]"
              />
            </Link>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
