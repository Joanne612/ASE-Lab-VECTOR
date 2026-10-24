"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { selectionFromDate, toLocalDateString } from "@/lib/format";

const TABS = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
  { key: "tahunan", label: "Tahunan" },
];
const ALL_MODES = TABS.map((t) => t.key);
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
// 11 tahun (ukuran grid tetap): 8 tahun ke belakang sampai 2 tahun ke depan.
const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 8 + i);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

// Tanpa backdrop-blur: kalender berlatar putih opak, jadi blur tidak terlihat
// tapi tetap dihitung untuk setiap tombol.
const GLASS =
  "border border-white/40 bg-[rgba(221,230,245,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2),0_8px_30px_rgba(255,255,255,0.12)]";

const TAB_ACTIVE =
  "border border-white/50 bg-[rgba(221,230,245,0.15)] shadow-[inset_8px_-10px_8px_rgba(255,255,255,0.2),inset_-3px_7px_8px_rgba(0,0,0,0.15),0_8px_30px_rgba(255,255,255,0.12)]";

/*
 * Ukuran dari Figma: md = mobile (371×452), lg = desktop (588×607).
 * Desktop: tab digeser ke samping karena keempatnya tidak muat dalam satu baris.
 */
const SIZES = {
  md: {
    box: "h-[452px] w-[371px] rounded-[25px]",
    tabRow: "left-[14px] top-[11px] grid h-[57px] w-[343px] gap-[8px] pt-px",
    tab: "h-[48px] min-w-0 rounded-[15px] text-[14px] font-medium",
    navTop: "top-[83px]",
    navButton: "h-[37px] w-[47px] rounded-[10px]",
    navLabel: "h-[37px] w-[115px] rounded-[10px] text-[16px] font-semibold",
    yearLabelMargin: "mx-[9px]",
    dayNavPadding: "px-[16px]",
    dayNavGaps: ["ml-[9px]", "ml-[9px]", "ml-[9px]", "ml-[9px]"],
    months: "left-[36px] top-[152px] w-[299px] gap-x-[20px] gap-y-[17px]",
    monthButton: "h-[38px] rounded-[8px] text-[16px]",
    years: "left-[12px] top-[124px] w-[347px] gap-x-[11px] gap-y-[19px]",
    yearButton: "h-[36px] w-[76px] rounded-[8px] text-[16px]",
    idleWeight: "font-medium",
    daysHeader: "left-[9px] top-[121px] gap-x-[3px]",
    dayHead: "h-[32px] w-[48px] text-[16px] font-medium",
    dates: "left-[9px] top-[174px] gap-x-[3px]",
    cell: "h-[32px] w-[48px]",
    dayMark: "h-[34px] w-[37px] text-[16px] font-medium",
    markRadius: "rounded-[5px]",
    band: "h-[34px] rounded-[5px]",
    bandLeft: 9,
    bandTop: 173,
    pitch: 51,
    rowHeight: 32,
    cellWidth: 48,
    confirm: "top-[382px] h-[38px] w-[134px] rounded-[10px] text-[18px] font-medium",
    popover: "-left-[6px] top-[96px]",
  },
  lg: {
    box: "h-[607px] w-[588px] rounded-[50px]",
    tabRow:
      "left-[25px] top-[19px] flex h-[57px] w-[536px] gap-[19px] overflow-x-auto overflow-y-clip pt-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    tab: "h-[56px] w-[183px] shrink-0 rounded-[15px] text-[20px] font-semibold",
    navTop: "top-[92px]",
    navButton: "h-[56px] w-[62px] rounded-[15px]",
    navLabel: "h-[56px] w-[183px] rounded-[15px] text-[20px] font-semibold",
    yearLabelMargin: "mx-[28px]",
    dayNavPadding: "px-[25px]",
    dayNavGaps: ["ml-[24px]", "ml-[29px]", "ml-[28px]", "ml-[24px]"],
    months: "left-[92px] top-[193px] w-[400px] gap-x-[20px] gap-y-[30px]",
    monthButton: "h-[56px] rounded-[15px] text-[20px]",
    years: "left-[24px] top-[115px] w-[540px] gap-x-[20px] gap-y-[30px]",
    yearButton: "h-[56px] w-[120px] rounded-[15px] text-[20px]",
    idleWeight: "font-semibold",
    daysHeader: "left-[53px] top-[164px] gap-x-[24px]",
    dayHead: "h-[48px] w-[48px] text-[20px] font-semibold",
    dates: "left-[53px] top-[212px] gap-x-[24px]",
    cell: "h-[48px] w-[48px]",
    dayMark: "h-[56px] w-[55px] text-[20px] font-semibold",
    markRadius: "rounded-[15px]",
    band: "h-[56px] rounded-[15px]",
    bandLeft: 53,
    bandTop: 208,
    pitch: 72,
    rowHeight: 48,
    cellWidth: 48,
    confirm: "top-[537px] h-[56px] w-[183px] rounded-[15px] text-[20px] font-semibold",
    popover: "right-0 top-[142px]",
  },
};

// Desktop tanpa tab (hanya harian), untuk tanggal transaksi; dari Figma 531:6871 (588×589).
SIZES.lgDay = {
  ...SIZES.lg,
  hideTabs: true,
  box: "h-[589px] w-[588px] rounded-[50px]",
  navTop: "top-[31px]",
  dayNavPadding: "px-[26px]",
  daysHeader: "left-[54px] top-[103px] gap-x-[24px]",
  dates: "left-[54px] top-[151px] gap-x-[24px]",
  dayMark: "h-[56px] w-[62px] text-[20px] font-semibold",
  bandLeft: 54,
  bandTop: 147,
  confirm: "top-[476px] h-[56px] w-[183px] rounded-[15px] text-[20px] font-semibold",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const pad2 = (n) => String(n).padStart(2, "0");

/* Ketikan jam jadi "HH:MM": hanya digit, titik dua disisipkan setelah dua digit. */
function formatTimeInput(text) {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

function Chevron({ direction, size }) {
  if (size !== "md") {
    return (
      <span
        aria-hidden="true"
        className={`size-10 bg-[url(/desktop-chevron.svg)] bg-no-repeat ${direction === "right" ? "-rotate-90" : "rotate-90"}`}
      />
    );
  }

  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
      <path
        d={direction === "right" ? "M9.29 18.58 15.48 12.39 9.29 6.19" : "M15.48 18.58 9.29 12.39 15.48 6.19"}
        stroke="#6A6E79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavButton({ direction, label, onClick, size, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center ${SIZES[size].navButton} ${GLASS} ${className}`}
    >
      <Chevron direction={direction} size={size} />
    </button>
  );
}

/**
 * value: { mode, year, month, day } (lihat selectionFromDate di lib/format).
 * maxDate: "YYYY-MM-DD"; hari setelahnya tidak bisa dipilih.
 * withTime: tampilkan isian jam (JJ:MM) di desktop; hasilnya ikut sebagai hour/minute.
 */
function Calendar({ value, modes, maxDate, onConfirm, size, withTime = false }) {
  const s = SIZES[size];
  const tabs = TABS.filter((t) => modes.includes(t.key));
  const initial = value ?? selectionFromDate(new Date(), modes[0]);

  const [tab, setTab] = useState(modes.includes(initial.mode) ? initial.mode : modes[0]);
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const [selected, setSelected] = useState({ year: initial.year, month: initial.month, day: initial.day });
  const [time, setTime] = useState(
    value?.hour === undefined ? "" : `${pad2(value.hour)}:${pad2(value.minute)}`,
  );
  const [timeInvalid, setTimeInvalid] = useState(false);
  const showTime = withTime && size !== "md";

  const confirm = () => {
    if (showTime && time) {
      if (!TIME_PATTERN.test(time)) {
        setTimeInvalid(true);
        return;
      }
      const [hour, minute] = time.split(":").map(Number);
      onConfirm({ mode: tab, ...selected, hour, minute });
      return;
    }
    // Jam kosong: BE memakai jam saat transaksi dicatat.
    onConfirm({ mode: tab, ...selected });
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isWeekly = tab === "mingguan";
  const isMonthly = tab === "bulanan";
  const isYearly = tab === "tahunan";

  const isAfterMax = (day) =>
    Boolean(maxDate) && toLocalDateString(new Date(view.year, view.month, day)) > maxDate;

  const pickYear = (year) => {
    setView((v) => ({ ...v, year }));
    setSelected(({ month, day }) => ({
      year,
      month,
      day: Math.min(day, new Date(year, month + 1, 0).getDate()),
    }));
  };

  const pickMonth = (month) =>
    setSelected(({ day }) => ({
      year: view.year,
      month,
      day: Math.min(day, new Date(view.year, month + 1, 0).getDate()),
    }));

  const isSelected = (day) =>
    !isWeekly && day === selected.day && view.month === selected.month && view.year === selected.year;

  const weekBand =
    isWeekly && view.month === selected.month && view.year === selected.year
      ? (() => {
          const idx = firstWeekday + selected.day - 1;
          const row = Math.floor(idx / 7);
          const lastIdx = firstWeekday + daysInMonth - 1;
          const startCol = row === 0 ? firstWeekday : 0;
          const endCol = row === Math.floor(lastIdx / 7) ? lastIdx % 7 : 6;
          return { row, startCol, endCol };
        })()
      : null;

  const selectTab = (key, event) => {
    setTab(key);
    // Desktop: tab yang terpotong di tepi digeser masuk.
    if (size === "lg") event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  return (
    <div className={`relative ${s.box} max-w-[calc(100vw-24px)] border-2 border-white bg-white font-[Poppins,sans-serif] text-[#6A6E79] shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_5px_4px_4px_rgba(154,168,189,0.2),inset_-5px_-4px_4px_rgba(154,168,189,0.2)]`}>
      {!s.hideTabs && (
      <div
        className={`absolute ${s.tabRow}`}
        style={size === "md" ? { gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` } : undefined}
        // Roda mouse biasa hanya menggulir vertikal; di desktop diteruskan ke samping.
        onWheel={
          size === "lg"
            ? (e) => {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            : undefined
        }
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={(e) => selectTab(t.key, e)}
            className={`${s.tab} ${tab === t.key ? TAB_ACTIVE : GLASS}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      )}

      {isMonthly && (
        <>
          <div className={`absolute left-0 ${s.navTop} flex w-full items-center justify-center`}>
            <NavButton
              direction="left"
              label="Tahun sebelumnya"
              onClick={() => setView((v) => ({ ...v, year: v.year - 1 }))}
              size={size}
            />
            <div className={`${s.yearLabelMargin} flex items-center justify-center ${s.navLabel} ${GLASS}`}>
              {view.year}
            </div>
            <NavButton
              direction="right"
              label="Tahun berikutnya"
              onClick={() => setView((v) => ({ ...v, year: v.year + 1 }))}
              size={size}
            />
          </div>

          <div className={`absolute grid grid-cols-3 ${s.months}`}>
            {MONTHS.map((m, i) => {
              const active = selected.year === view.year && selected.month === i;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => pickMonth(i)}
                  className={`${s.monthButton} ${GLASS} ${
                    active ? "font-semibold !bg-[rgba(235,207,255,0.7)]" : s.idleWeight
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </>
      )}

      {isYearly && (
        <div className={`absolute grid grid-cols-4 ${s.years}`}>
          {YEARS.map((y) => {
            const active = selected.year === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => pickYear(y)}
                className={`${s.yearButton} ${GLASS} ${
                  active ? "font-semibold !bg-[rgba(235,207,255,0.7)]" : s.idleWeight
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {!isMonthly && !isYearly && (
      <>
      <div className={`absolute left-0 ${s.navTop} flex w-full items-center ${s.dayNavPadding}`}>
        <NavButton direction="left" label="Tahun sebelumnya" onClick={() => shiftMonth(-12)} size={size} />
        <NavButton direction="left" label="Bulan sebelumnya" onClick={() => shiftMonth(-1)} size={size} className={s.dayNavGaps[0]} />
        <div className={`${s.dayNavGaps[1]} flex items-center justify-center ${s.navLabel} ${GLASS}`}>
          {MONTHS[view.month]} {view.year}
        </div>
        <NavButton direction="right" label="Bulan berikutnya" onClick={() => shiftMonth(1)} size={size} className={s.dayNavGaps[2]} />
        <NavButton direction="right" label="Tahun berikutnya" onClick={() => shiftMonth(12)} size={size} className={s.dayNavGaps[3]} />
      </div>

      <div className={`absolute grid grid-cols-7 ${s.daysHeader}`}>
        {DAYS.map((d) => (
          <div key={d} className={`flex items-center justify-center ${s.dayHead}`}>
            {d}
          </div>
        ))}
      </div>

      {weekBand && (
        <div
          className={`absolute ${s.band} ${GLASS} !bg-[rgba(235,207,255,0.7)]`}
          style={{
            left: s.bandLeft + weekBand.startCol * s.pitch,
            width: (weekBand.endCol - weekBand.startCol) * s.pitch + s.cellWidth,
            top: s.bandTop + weekBand.row * s.rowHeight,
          }}
        />
      )}

      <div className={`absolute grid grid-cols-7 ${s.dates}`}>
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e${i}`} className={s.cell} />
          ) : (
            <button
              key={day}
              type="button"
              disabled={isAfterMax(day)}
              onClick={() => setSelected({ ...view, day })}
              className={`flex items-center justify-center disabled:opacity-30 ${s.cell}`}
            >
              <span
                className={`flex items-center justify-center ${s.dayMark} ${
                  isSelected(day) ? `${s.markRadius} ${GLASS} !bg-[rgba(235,207,255,0.7)]` : ""
                }`}
              >
                {day}
              </span>
            </button>
          )
        )}
      </div>

      </>
      )}

      <button
        type="button"
        onClick={confirm}
        className={`absolute left-1/2 -translate-x-1/2 text-white ${s.confirm} ${GLASS} !bg-[rgba(122,83,177,0.7)]`}
      >
        Konfirmasi
      </button>

      {showTime && (
        <input
          inputMode="numeric"
          value={time}
          onChange={(e) => {
            setTime(formatTimeInput(e.target.value));
            setTimeInvalid(false);
          }}
          placeholder="JJ:MM"
          aria-label="Jam"
          aria-invalid={timeInvalid}
          maxLength={5}
          className={`absolute left-[26px] top-[448px] h-[56px] w-[103px] rounded-[15px] text-center text-[20px] font-semibold text-[#6A6E79] outline-none placeholder:text-[#6A6E79] ${GLASS} ${
            timeInvalid ? "!border-red-400" : ""
          }`}
        />
      )}
    </div>
  );
}

/**
 * size: "md" (mobile, default), "lg" (popup desktop di header), atau "lgDay"
 * (desktop tanpa tab, untuk tanggal transaksi). withTime: isian jam di desktop.
 */
export default function CalendarPicker({
  withTime = false,
  children,
  value,
  onConfirm,
  modes = ALL_MODES,
  maxDate,
  modal = false,
  size = "md",
}) {
  const [open, setOpen] = useState(false);

  const confirm = (selection) => {
    setOpen(false);
    onConfirm?.(selection);
  };

  const calendar = (
    <Calendar value={value} modes={modes} maxDate={maxDate} onConfirm={confirm} size={size} withTime={withTime} />
  );

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Pilih tanggal"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block"
      >
        {children}
      </button>
      {open && !modal && <div className={`absolute ${SIZES[size].popover} z-50`}>{calendar}</div>}
      {open &&
        modal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-3 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>{calendar}</div>
          </div>,
          document.body
        )}
    </div>
  );
}
