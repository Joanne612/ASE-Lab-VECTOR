"use client";

import Icon from "@/components/Icon";
import { usePeriod } from "@/components/PeriodProvider";
import { formatRupiah, groupByDay } from "@/lib/format";
import { useTransactions } from "@/lib/queries";

/* Transaksi berurutan dengan jam yang sama digabung dalam satu blok timeline. */
function groupByTime(items) {
  return items.reduce((blocks, item) => {
    const last = blocks.at(-1);
    if (last?.time === item.time) last.items.push(item);
    else blocks.push({ time: item.time, items: [item] });
    return blocks;
  }, []);
}

// Tanpa backdrop-blur per kartu: latar section sudah di-blur, sedangkan blur per
// kartu dihitung untuk setiap transaksi (bisa ratusan) dan membuat scroll berat.
function TransactionCard({ item }) {
  const sign = item.type === "INCOME" ? "+" : "−";

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/70 bg-white/20 p-1.5 pr-3 shadow-[0_3px_10px_rgba(0,0,0,0.06)]">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E9D9FA] to-[#C7A3E9] text-white shadow-inner">
        <Icon name={item.category?.icon} className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium text-[#8A8D99]">{item.category?.name ?? "Tanpa kategori"}</p>
        {item.note && <p className="truncate text-[12px] text-[#8A8D99]">{item.note}</p>}
      </div>
      <p className="whitespace-nowrap text-[16px] font-medium text-[#6A6E79]">
        {sign}
        {formatRupiah(item.amount)}
      </p>
    </div>
  );
}

function TransactionBlock({ time, items }) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="relative w-14 shrink-0">
        <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-[#6A6E79]">
          {time}
        </span>
        <span className="absolute bottom-0 left-1/2 top-9 w-[3px] -translate-x-1/2 rounded-full bg-[#8A8D99]/70" />
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
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
  const { data: pages, error, size, setSize, mutate } = useTransactions(range);

  const transactions = pages?.flatMap((page) => page.data) ?? [];
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
        {groupByDay(transactions).map((group) => (
          <div key={group.key} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-baseline gap-2">
              <h3 className="text-[16px] font-bold text-[#8A8D99]">{group.date}</h3>
              <span className="text-[11px] font-bold text-[#8A8D99]">{group.day}</span>
            </div>

            <div className="flex flex-col gap-4">
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
    <section className="mt-5 rounded-t-[28px] border border-white/60 bg-white/20 px-4 pt-4 pb-8 backdrop-blur-xl">
      {content}
    </section>
  );
}

export default function HomePage() {
  return <TransactionHistory />;
}
