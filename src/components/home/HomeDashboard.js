"use client";

import { PALETTE, StatistikContent } from "@/components/CategoryStats";
import Icon from "@/components/Icon";
import { usePeriod } from "@/components/PeriodProvider";
import { useSearch } from "@/components/SearchProvider";
import { TEXT_GLOW } from "@/lib/desktop-styles";
import { formatRupiah, groupByDay } from "@/lib/format";
import { useSummary, useTransactions } from "@/lib/queries";

// Kartu desktop dari Figma: kaca putih dengan bayangan dalam.
const DESKTOP_CARD =
  "lg:rounded-[25px] lg:border-white lg:bg-white/50 lg:shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2),inset_0_4px_4px_rgba(255,255,255,0.25)]";

/* Transaksi berurutan dengan jam yang sama digabung dalam satu blok timeline. */
function groupByTime(items) {
  return items.reduce((blocks, item) => {
    const last = blocks.at(-1);
    if (last?.time === item.time) last.items.push(item);
    else blocks.push({ time: item.time, items: [item] });
    return blocks;
  }, []);
}

/* Cocokkan kata kunci pencarian dengan nama kategori atau catatan transaksi. */
function matchesQuery(item, keyword) {
  return [item.category?.name, item.note].some((text) => text?.toLowerCase().includes(keyword));
}

// Tanpa backdrop-blur per kartu: latar section sudah di-blur, sedangkan blur per
// kartu dihitung untuk setiap transaksi (bisa ratusan) dan membuat scroll berat.
function TransactionCard({ item }) {
  const sign = item.type === "INCOME" ? "+" : "−";

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/70 bg-white/20 p-1.5 pr-3 shadow-[0_3px_10px_rgba(0,0,0,0.06)] lg:h-[55px] lg:gap-[9px] lg:rounded-[10px] lg:border-white/40 lg:bg-white/15 lg:p-0 lg:pr-[7px] lg:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E9D9FA] to-[#C7A3E9] text-white shadow-inner lg:h-[55px] lg:w-[55px] lg:rounded-[10px] lg:bg-[linear-gradient(130.76deg,#FFFFFF_3.2%,#E8D1FD_50%,#EBCFFF_96.8%)] lg:shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]">
        <Icon name={item.category?.icon} className="h-7 w-7 lg:h-11 lg:w-11" />
      </div>
      <div className={`min-w-0 flex-1 ${TEXT_GLOW}`}>
        <p className="truncate text-[16px] font-medium text-[#8A8D99] lg:text-[#6A6E79]/70">{item.category?.name ?? "Tanpa kategori"}</p>
        {item.note && <p className="truncate text-[12px] text-[#8A8D99] lg:text-[13px] lg:font-medium lg:text-[#6A6E79]/70">{item.note}</p>}
      </div>
      <p className={`whitespace-nowrap text-[16px] font-medium text-[#6A6E79] lg:text-[#6A6E79]/70 ${TEXT_GLOW}`}>
        {sign}
        {formatRupiah(item.amount)}
      </p>
    </div>
  );
}

function TransactionBlock({ time, items }) {
  return (
    <div className="flex items-stretch gap-3 lg:gap-4 xl:gap-[37px]">
      <div className="relative w-14 shrink-0 lg:w-[40px] xl:w-[57px]">
        <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-[#6A6E79] lg:top-[20px] lg:text-[12px] lg:text-[#6A6E79]/70">
          {time}
        </span>
        <span className="absolute bottom-0 left-1/2 top-9 w-[3px] -translate-x-1/2 rounded-full bg-[#8A8D99]/70 lg:top-[42px] lg:rounded-none lg:bg-[#6A6E79]/70" />
        {/* Desktop: segitiga penunjuk dari jam ke kartu transaksi. */}
        <span
          aria-hidden="true"
          className="absolute left-[44px] top-[22px] hidden h-[8.75px] w-[9.8px] rotate-90 bg-[url(/desktop-timeline-arrow.svg)] bg-no-repeat lg:block xl:left-[69px]"
        />
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2 lg:gap-[5px]">
        {items.map((item) => (
          <li key={item.id}>
            <TransactionCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Memuat transaksi">
      <div className="mb-1 h-5 w-24 animate-pulse rounded bg-white/50" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="ml-[68px] h-[64px] animate-pulse rounded-xl bg-white/40" />
      ))}
    </div>
  );
}

function StatusMessage({ children }) {
  return <div className="py-8 text-center text-[15px] text-[#8A8D99]">{children}</div>;
}

function TransactionHistory() {
  const { range } = usePeriod();
  const { query } = useSearch();
  const { data: pages, error, size, setSize, mutate } = useTransactions(range);

  const transactions = pages?.flatMap((page) => page.data) ?? [];
  const keyword = query.trim().toLowerCase();
  const visible = keyword ? transactions.filter((item) => matchesQuery(item, keyword)) : transactions;
  const lastPage = pages?.at(-1);
  const hasMore = lastPage ? lastPage.meta.page < lastPage.meta.totalPages : false;
  const isLoadingMore = Boolean(pages) && pages.length < size;

  let content;
  if (!pages && !error) {
    content = <HistorySkeleton />;
  } else if (!pages) {
    content = (
      <StatusMessage>
        <p>Gagal memuat transaksi.</p>
        <button type="button" onClick={() => mutate()} className="mt-2 font-medium text-[#7A53B1] underline">
          Coba lagi
        </button>
      </StatusMessage>
    );
  } else if (transactions.length === 0) {
    content = <StatusMessage>Belum ada transaksi di periode ini.</StatusMessage>;
  } else {
    content = (
      <>
        {visible.length === 0 && <StatusMessage>Tidak ada transaksi yang cocok dengan &ldquo;{query.trim()}&rdquo;.</StatusMessage>}

        {groupByDay(visible).map((group) => (
          <div key={group.key} className="mb-4 last:mb-0 lg:mb-[7px]">
            <div className="mb-2 flex items-baseline gap-2 lg:mb-0">
              <h3 className="text-[16px] font-bold text-[#8A8D99] lg:text-[#6A6E79]/70">{group.date}</h3>
              <span className="text-[11px] font-bold text-[#8A8D99] lg:text-[10px] lg:text-[#6A6E79]/70">{group.day}</span>
            </div>

            <div className="flex flex-col gap-4 lg:gap-2">
              {groupByTime(group.items).map((block) => (
                <TransactionBlock key={block.items[0].id} time={block.time} items={block.items} />
              ))}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore}
              className="h-[40px] rounded-xl border border-white/80 bg-white/40 px-5 text-[15px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] backdrop-blur-md transition hover:bg-white/60 active:scale-95 disabled:opacity-60"
            >
              {isLoadingMore ? "Memuat..." : "Muat lagi"}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <section className={`mt-5 rounded-t-[28px] border border-white/60 bg-white/20 px-4 pt-4 pb-8 backdrop-blur-xl lg:mt-0 lg:flex lg:min-h-0 lg:flex-col lg:px-[18px] lg:pb-[9px] lg:pt-[19px] lg:backdrop-blur-[4px] ${DESKTOP_CARD}`}>
      {/* Desktop: riwayat digulir di dalam kartu yang tingginya tetap. */}
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:scrollbar-glass">{content}</div>
    </section>
  );
}

/* Kartu statistik di halaman Rumah versi desktop; di mobile statistik ada di halaman sendiri. */
function DesktopStatsCard({ title, type, emptyText, chartLabel }) {
  const { range } = usePeriod();
  // Key sama dengan header, jadi data ringkasan tidak diambil dua kali.
  const { data: summary, error } = useSummary(range);

  return (
    <section className={`hidden min-h-0 flex-col border px-[13px] pb-[9px] pt-[19px] backdrop-blur-[7.5px] lg:flex ${DESKTOP_CARD}`}>
      <h2 className={`text-[20px] font-medium leading-normal text-[#6A6E79]/70 ${TEXT_GLOW}`}>{title}</h2>
      <StatistikContent
        summary={summary}
        error={error}
        type={type}
        palette={PALETTE}
        emptyText={emptyText}
        chartLabel={chartLabel}
      />
    </section>
  );
}

export default function HomeDashboard() {
  return (
    // Desktop: riwayat + statistik pengeluaran & pemasukan dalam tiga kolom setinggi sisa layar
    // (414px = header 11 + 278, jarak 35, dan ruang menu bawah 90). Di bawah xl kolom riwayat
    // dibuat lebih lebar supaya nama transaksi tidak terpotong; mulai xl sesuai Figma.
    <div className="lg:grid lg:h-[calc(100dvh-414px)] lg:min-h-[360px] lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-4 lg:px-4 xl:grid-cols-3 xl:gap-[26px] xl:px-[34px]">
      <TransactionHistory />
      <DesktopStatsCard
        title="Pengeluaran"
        type="EXPENSE"
        emptyText="Belum ada pengeluaran di periode ini."
        chartLabel="Diagram pengeluaran per kategori"
      />
      <DesktopStatsCard
        title="Pemasukan"
        type="INCOME"
        emptyText="Belum ada pemasukan di periode ini."
        chartLabel="Diagram pemasukan per kategori"
      />
    </div>
  );
}
