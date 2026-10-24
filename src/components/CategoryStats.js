import DonutChart from "@/components/DonutChart";
import Icon from "@/components/Icon";
import { TEXT_GLOW } from "@/lib/desktop-styles";
import { formatRupiah } from "@/lib/format";

/*
 * Statistik per kategori (donat, legenda, bar), dipakai halaman Statistik dan
 * kartu statistik di halaman Rumah versi desktop.
 */

// Warna diberikan berurutan sesuai peringkat kategori, diulang kalau lebih dari 5.
export const PALETTE = [
  { color: "#D7C5F5", dark: "#B79BEA", soft: "#ECE3F9" },
  { color: "#FF9E96", dark: "#F27A70", soft: "#FFDCD8" },
  { color: "#BDE3F7", dark: "#8FCBEA", soft: "#DDF1FB" },
  { color: "#C9E9B0", dark: "#A9D98B", soft: "#E6F4DA" },
  { color: "#F7EC9F", dark: "#EBD96A", soft: "#FBF6D2" },
];

const pct = (n) => `${Number(n).toFixed(2)}%`;

function Legend({ items }) {
  return (
    <ul className="flex min-w-0 flex-1 flex-col gap-[3px] lg:gap-[4px] lg:pt-[15px]">
      {items.map((c) => (
        <li
          key={c.key}
          className={`flex items-center gap-2 text-[13px] leading-[15px] text-[#6A6E79] lg:gap-[9px] lg:text-[12px] lg:font-medium lg:text-[#6A6E79]/70 ${TEXT_GLOW}`}
        >
          <span
            className="h-[14px] w-[14px] shrink-0 rounded-[3px] border border-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.12)] lg:rounded-[2px]"
            style={{ background: c.color }}
          />
          <span className="min-w-0 flex-1 truncate">{c.name}</span>
          <span className="shrink-0 tabular-nums">{pct(c.percentage)}</span>
        </li>
      ))}
    </ul>
  );
}

function CategoryRow({ c }) {
  return (
    <li className="flex items-center gap-[18px] lg:gap-[19px]">
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] border border-white/80 text-white shadow-[0_4px_8px_rgba(120,100,160,0.2),inset_0_1px_3px_rgba(255,255,255,0.55)] lg:rounded-[8px]"
        style={{ background: `linear-gradient(145deg, ${c.color}, ${c.dark})` }}
      >
        <Icon name={c.icon} className="h-6 w-6" />
      </div>

      <div className={`grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-x-[6px] gap-y-[2px] lg:gap-x-[12px] ${TEXT_GLOW}`}>
        <p className="truncate text-[13px] font-medium text-[#6A6E79] lg:text-[12px] lg:text-[#6A6E79]/70">{c.name}</p>
        <p className="text-right text-[12px] tabular-nums text-[#6A6E79] lg:font-medium lg:text-[#6A6E79]/70">{formatRupiah(c.total)}</p>

        <div
          className="h-[18px] overflow-hidden rounded-full shadow-[inset_0_2px_4px_rgba(120,100,160,0.18)] lg:rounded-[5px]"
          style={{ background: c.soft }}
          role="progressbar"
          aria-valuenow={c.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${c.name} ${pct(c.percentage)}`}
        >
          <div
            className="h-full rounded-full shadow-[0_2px_4px_rgba(120,100,160,0.25),inset_0_1px_2px_rgba(255,255,255,0.6)] lg:rounded-[5px]"
            style={{ width: `${c.percentage}%`, background: `linear-gradient(180deg, ${c.color}, ${c.dark})` }}
          />
        </div>
        <p className="text-right text-[11px] tabular-nums text-[#8A8D99] lg:text-[10px] lg:font-medium lg:text-[#6A6E79]/70">
          {pct(c.percentage)}
        </p>
      </div>
    </li>
  );
}

export function StatistikContent({ summary, error, type, palette, emptyText, chartLabel }) {
  if (!summary && !error) {
    return (
      <div className="mt-3 flex items-center gap-[22px]" aria-busy="true" aria-label="Memuat statistik">
        <div className="h-[170px] w-[170px] shrink-0 animate-pulse rounded-full bg-white/40 lg:size-[130px] xl:size-[170px]" />
        <div className="flex flex-1 flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[15px] animate-pulse rounded bg-white/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return <p className="py-8 text-center text-[15px] text-[#8A8D99]">Gagal memuat statistik.</p>;
  }

  const items = summary?.byCategory
    .filter((c) => c.type === type && c.percentage > 0)
    .map((c, i) => ({
      ...c,
      key: c.categoryId ?? "uncategorized",
      value: c.percentage,
      ...palette[i % palette.length],
    }));

  if (items.length === 0) {
    return <p className="py-8 text-center text-[15px] text-[#8A8D99]">{emptyText}</p>;
  }

  return (
    <>
      {/* Desktop di bawah xl: kolom lebih sempit, jadi donat diperkecil. */}
      <div className="mt-3 flex items-center gap-[22px] lg:mt-1 lg:items-start lg:gap-3 xl:gap-[21px]">
        <DonutChart items={items} label={chartLabel} className="lg:size-[130px] xl:size-[170px]" />
        <Legend items={items} />
      </div>

      {/* Desktop: daftar kategori digulir di dalam kartu yang tingginya tetap. */}
      <ul className="mt-4 flex flex-col gap-[21px] lg:mt-[31px] lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:scrollbar-glass">
        {items.map((c) => (
          <CategoryRow key={c.key} c={c} />
        ))}
      </ul>
    </>
  );
}
