"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DonutChart from "@/components/DonutChart";
import Icon from "@/components/Icon";
import { formatRupiah } from "@/lib/format";
import { useRatioCalculation } from "@/lib/queries";
import { PERIOD_LABEL, POSTS } from "@/lib/use-target-form";

const TIP_STYLE = {
  success: "border-[#C9E9B0] bg-[#E6F4DA]/70",
  warning: "border-[#F7EC9F] bg-[#FBF6D2]/70",
  info: "border-white/80 bg-white/40",
};

const pct = (n) => `${Number(n).toFixed(2)}%`;

function BackgroundAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute right-[12%] top-[48%] h-[90px] w-[110px] rounded-[45%] bg-[#C9B3F0]/60 blur-sm" />
      <div className="absolute bottom-[-40px] right-[-30px] h-[300px] w-[260px] rounded-[40px] bg-[#B9A6EC]/40 blur-xl" />
      <div className="absolute bottom-[90px] left-[12%] h-[70px] w-[70px] rounded-full bg-[#F7DE8A]/60 blur-md" />
    </div>
  );
}

function AlokasiResult({ data, error }) {
  if (!data && !error) {
    return <div className="mx-auto mt-8 h-[170px] w-[170px] animate-pulse rounded-full bg-white/40" aria-busy="true" />;
  }
  if (!data) {
    return <p className="py-8 text-center text-[15px] text-[#8A8D99]">{error.message}</p>;
  }

  const items = POSTS.map((p) => ({
    ...p,
    value: data.ratio[p.pctKey],
    amount: data.allocation.perPeriod[p.key],
  }));
  const perLabel = PERIOD_LABEL[data.input.period];

  return (
    <>
      <div className="mt-8">
        <DonutChart items={items} label="Diagram rencana alokasi" className="mx-auto" />
      </div>

      <ul className="mt-12 flex flex-col gap-4 px-1">
        {items.map((c) => (
          <li key={c.key} className="flex items-center gap-3">
            <span
              className="h-[26px] w-[26px] shrink-0 rounded-[6px] border border-white/80 shadow-[0_2px_5px_rgba(120,100,160,0.2)]"
              style={{ background: `linear-gradient(145deg, ${c.color}, ${c.dark})` }}
            />
            <div className="min-w-0 flex-1 text-[#6A6E79]">
              <p className="text-[18px] font-medium leading-tight">{c.name}</p>
              <p className="text-[15px] leading-tight tabular-nums">
                Rp {formatRupiah(c.amount)} / {perLabel}
              </p>
            </div>
            <p className="shrink-0 text-[17px] tabular-nums text-[#6A6E79]">{pct(c.value)}</p>
          </li>
        ))}
      </ul>

      {data.tips.length > 0 && (
        <ul className="mt-8 flex flex-col gap-2">
          {data.tips.map((tip) => (
            <li
              key={tip.message}
              className={`rounded-xl border px-4 py-3 text-[14px] leading-snug text-[#6A6E79] ${TIP_STYLE[tip.level] ?? TIP_STYLE.info}`}
            >
              {tip.message}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function AlokasiPanel() {
  const router = useRouter();
  const params = useSearchParams();

  // Parameter URL jadi sumber kebenaran, jadi halaman tetap benar saat di-reload.
  const amount = Number(params.get("jumlah"));
  const period = params.get("periode");
  const isValid = amount > 0 && Object.hasOwn(PERIOD_LABEL, period ?? "");

  const { data, error } = useRatioCalculation(isValid ? { amount, period } : null);

  useEffect(() => {
    if (!isValid) router.replace("/target");
  }, [isValid, router]);

  return (
    <section className="relative mx-3 mb-8 mt-5 rounded-[28px] border border-white/70 bg-white/30 px-5 pb-8 pt-4 backdrop-blur-xl">
      <Link href="/target" aria-label="Kembali" className="flex h-8 w-8 items-center justify-center text-[#6A6E79]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#A7A9B3] shadow-[0_3px_8px_rgba(120,100,160,0.18)]">
          <Icon name="compass" className="h-5 w-5" />
        </span>
        <h2 className="text-[20px] font-medium text-[#8A8D99]">Rencana Alokasi Terperinci</h2>
      </div>

      {isValid && <AlokasiResult data={data} error={error} />}
    </section>
  );
}

export default function AlokasiPage() {
  return (
    <>
      <BackgroundAccents />
      {/* useSearchParams wajib dibungkus Suspense di Next.js App Router */}
      <Suspense fallback={null}>
        <AlokasiPanel />
      </Suspense>
    </>
  );
}
