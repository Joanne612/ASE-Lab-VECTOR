export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/* ---------- UANG ---------- */

const rupiahFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** BE mengirim nominal sebagai string desimal ("83000.00"). */
export const formatRupiah = (value) => rupiahFormatter.format(Number(value) || 0);

/** Format ketikan nominal menjadi "50.000". */
export const formatDigitsInput = (text) => {
  const digits = String(text).replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

export const parseRupiahInput = (text) => Number(String(text).replace(/\D/g, ""));

/* ---------- TANGGAL ---------- */

const pad = (n) => String(n).padStart(2, "0");

/**
 * "YYYY-MM-DD" dari komponen kalender Date lokal. Dipakai untuk aritmetika
 * kalender (rentang periode, batas tanggal kalender). Jangan pakai toISOString():
 * hasilnya UTC dan bisa mundur sehari.
 */
export const toLocalDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseLocalDate = (text) => {
  const [year, month, day] = text.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/*
 * BE mengelompokkan dan memfilter transaksi menurut tanggal WIB. Momen waktu
 * (hari ini, waktu transaksi) dibaca dalam zona yang sama, supaya user di
 * WITA/WIT atau dengan jam perangkat zona lain melihat tanggal yang sama
 * dengan laporan BE.
 */
export const APP_TIME_ZONE = "Asia/Jakarta";
const APP_UTC_OFFSET = "+07:00";

const appZoneFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Komponen tanggal & jam sebuah momen menurut WIB; month 0-based seperti Date. */
export function appZoneParts(date) {
  const parts = Object.fromEntries(
    appZoneFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month) - 1;
  const day = Number(parts.day);

  return {
    year,
    month,
    day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: new Date(Date.UTC(year, month, day)).getUTCDay(),
  };
}

/** "YYYY-MM-DD" sebuah momen menurut WIB. */
export const toAppDateString = (date) => {
  const { year, month, day } = appZoneParts(date);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
};

export const formatTime = (date) => {
  const { hour, minute } = appZoneParts(date);
  return `${pad(hour)}.${pad(minute)}`;
};

/** Pilihan kalender: { mode: "harian" | "mingguan" | "bulanan" | "tahunan", year, month, day }. */
export const selectionFromDate = (date, mode = "bulanan") => ({
  mode,
  year: date.getFullYear(),
  month: date.getMonth(),
  day: date.getDate(),
});

// Minggu dimulai hari Minggu, sama seperti kalender.
function weekBounds({ year, month, day }) {
  const date = new Date(year, month, day);
  const start = new Date(year, month, day - date.getDay());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start, end };
}

/** Rentang inklusif untuk query BE (`from`, `to`). */
export function periodToRange(selection) {
  const { mode, year, month, day } = selection;
  let start;
  let end;

  if (mode === "harian") {
    start = end = new Date(year, month, day);
  } else if (mode === "mingguan") {
    ({ start, end } = weekBounds(selection));
  } else if (mode === "tahunan") {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31);
  } else {
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0);
  }

  return { from: toLocalDateString(start), to: toLocalDateString(end) };
}

/** Teks dua baris untuk badge kalender. */
export function periodBadge(selection) {
  const { mode, year, month, day } = selection;

  if (mode === "harian") return { top: `${day} ${MONTH_SHORT[month]}`, bottom: String(year) };
  if (mode === "tahunan") return { top: "Tahun", bottom: String(year) };
  if (mode === "mingguan") {
    const { start, end } = weekBounds(selection);
    const top =
      start.getMonth() === end.getMonth()
        ? `${start.getDate()}–${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`
        : `${start.getDate()}/${start.getMonth() + 1}–${end.getDate()}/${end.getMonth() + 1}`;
    return { top, bottom: String(end.getFullYear()) };
  }
  return { top: MONTH_NAMES[month], bottom: String(year) };
}

/**
 * Tanggal pilihan user (tanggal WIB) + jam pilihan user, atau jam WIB sekarang
 * kalau jam tidak dipilih, sebagai ISO UTC (BE menyimpan UTC). Offset ditulis
 * eksplisit, jadi hasilnya tidak bergantung pada zona waktu perangkat.
 */
export const toOccurredAt = (selection, now = new Date()) => {
  const { year, month, day } = selection;
  const { hour, minute, second } =
    selection.hour === undefined ? appZoneParts(now) : { hour: selection.hour, minute: selection.minute, second: 0 };
  const local = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}${APP_UTC_OFFSET}`;
  return new Date(local).toISOString();
};

/** Kelompokkan transaksi (sudah urut terbaru dari BE) per tanggal WIB. */
export function groupByDay(transactions) {
  const groups = [];

  for (const transaction of transactions) {
    const date = new Date(transaction.occurredAt);
    const key = toAppDateString(date);
    const parts = appZoneParts(date);
    let group = groups.at(-1);

    if (group?.key !== key) {
      group = {
        key,
        date: `${MONTH_SHORT[parts.month]} ${parts.day}`,
        day: DAY_SHORT[parts.weekday],
        items: [],
      };
      groups.push(group);
    }
    group.items.push({ ...transaction, time: formatTime(date) });
  }

  return groups;
}
