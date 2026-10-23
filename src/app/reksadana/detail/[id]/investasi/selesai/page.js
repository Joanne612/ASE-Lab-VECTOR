"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Format angka
const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function BackLink() {
  return (
    <Link
      href="/reksadana"
      aria-label="Kembali"
      className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center text-[#6A6E79] transition hover:opacity-80 active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18 9 12l6-6"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

function SimulasiSelesaiContent() {
  const searchParams = useSearchParams();
  const nominalParam = Number(searchParams.get("nominal"));
  const modalAwal = Number.isFinite(nominalParam) && nominalParam > 0 ? nominalParam : 1000000;
  const returnPersen = 18;
  const periode = "1 Tahun";
  const jenisReksaDana = "Pasar Uang";

  const keuntungan = (modalAwal * returnPersen) / 100;
  const nilaiAkhir = modalAwal + keuntungan;

  // Label sumbu Y (atas ke bawah) & sumbu X
  const labelY = ["Rp 650k", "Rp 600k", "Rp 550k", "Rp 500k", "Rp 450k"];
  const labelX = ["1 H", "1 B", "6 B", "1 T"];

  // Mock titik grafik: 0 = paling atas, 100 = paling bawah
  const titik = [
    98, 82, 72, 80, 74, 86, 74, 64, 72, 50, 60, 46, 54, 36, 28, 40, 30, 16, 22, 10, 24, 12, 3,
  ];
  const path = titik
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (titik.length - 1)) * 100},${y}`)
    .join(" ");

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>

      <div className="relative flex flex-1 flex-col rounded-[32px] border border-white/70 bg-white/30 px-6 pb-8 pt-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        {/* Judul */}
        <h1
          className="text-center text-[22px] font-bold text-[#9B7FD6]"
          style={bayanganTeks}
        >
          Simulasi Selesai!
        </h1>
        <p
          className="mt-2 text-center text-[14px] font-medium text-[#8A8D99]"
          style={bayanganTeks}
        >
          Nilai investasi kamu setelah {periode.toLowerCase()}
        </p>

        {/* Hasil utama */}
        <div className="mt-5 rounded-[20px] border-2 border-[#9B7FD6]/70 bg-white/30 px-4 py-4 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p
            className="text-center text-[30px] font-extrabold leading-tight text-[#8A8D99]"
            style={bayanganTeks}
          >
            {rupiah(nilaiAkhir)}
          </p>
          <div className="mt-2 flex justify-center gap-14 text-[14px] font-semibold text-[#9B7FD6]">
            <span style={bayanganTeks}>+{rupiah(keuntungan)}</span>
            <span style={bayanganTeks}>+{returnPersen}%</span>
          </div>
        </div>

        {/* Grafik */}
        <div className="mt-6">
          <div className="flex h-[132px]">
            {/* Label sumbu Y */}
            <div className="flex w-[82px] shrink-0 translate-y-1.5 flex-col justify-between text-[13px] font-medium leading-none text-[#8A8D99]">
              {labelY.map((l) => (
                <span key={l} style={bayanganTeks}>
                  {l}
                </span>
              ))}
            </div>

            {/* Area grafik */}
            <div className="relative flex-1 border-l border-[#8A8D99]/70">
              <div className="absolute inset-0 flex flex-col justify-between">
                {labelY.map((l) => (
                  <div key={l} className="h-px bg-[#8A8D99]/70" />
                ))}
              </div>

              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={path}
                  fill="none"
                  stroke="#9B7FD6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          {/* Label sumbu X */}
          <div className="ml-[82px] mt-3 flex justify-around text-[13px] font-medium text-[#8A8D99]">
            {labelX.map((l) => (
              <span key={l} style={bayanganTeks}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Ringkasan */}
        <div className="mt-5 rounded-2xl border border-white/60 bg-white/40 p-3.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <h2 className="text-[15px] font-semibold text-[#9B7FD6]" style={bayanganTeks}>
            Estimasi pembelian
          </h2>

          <dl className="mt-3 space-y-3 text-[14px]">
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]" style={bayanganTeks}>
                Modal awal
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {rupiah(modalAwal)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]" style={bayanganTeks}>
                Periode Investasi
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {periode}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]" style={bayanganTeks}>
                Jenis Reksa Dana
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {jenisReksaDana}
              </dd>
            </div>
          </dl>
        </div>

        {/* Tombol aksi (menempel di bagian bawah kartu) */}
        <div className="mt-auto flex justify-center pt-6">
          <Link
            href="/simulasi"
            className="w-44 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-2.5 text-center text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
          >
            Selesai
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SimulasiSelesaiReksaDanaPage() {
  return (
    <Suspense fallback={null}>
      <SimulasiSelesaiContent />
    </Suspense>
  );
}