"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { finishSimulation, sessionPath, simulationSession } from "@/lib/simulation";

const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function SuksesContent() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const investasiHref = `/reksadana/detail/${encodeURIComponent(id)}/investasi`;

  const { data } = useSWR(sessionId ? sessionPath(sessionId) : null);
  const session = simulationSession(data);
  const nominal = Number(session?.investedAmount ?? 0);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Halaman ini hanya bermakna untuk sesi yang sudah dibuat.
  useEffect(() => {
    if (!sessionId) router.replace(investasiHref);
  }, [sessionId, investasiHref, router]);

  // Alur reksa dana langsung ke hasil: sesi dimajukan sampai checkpoint
  // terakhir (1 Tahun) di server, baru hasilnya ditampilkan.
  async function lihatHasil() {
    if (!sessionId || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const finished = await finishSimulation(sessionId);
      if (finished?.status !== "FINISHED") {
        throw new Error("Simulasi belum selesai. Coba lagi.");
      }
      router.push(`${investasiHref}/selesai?sessionId=${encodeURIComponent(sessionId)}`);
    } catch (error) {
      setErrorMessage(error.message);
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <div className="relative flex flex-1 flex-col items-center justify-center rounded-[32px] border border-white/70 bg-white/30 px-6 pb-8 pt-6 text-center shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#9B7FD6]/15 text-[#9B7FD6]">
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-[22px] font-bold text-[#9B7FD6]" style={bayanganTeks}>
          Investasi Berhasil!
        </h1>
        <p className="mt-2 text-[14px] font-medium text-[#8A8D99]" style={bayanganTeks}>
          Simulasi investasi reksa dana kamu berhasil dikonfirmasi.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-white/60 bg-white/40 p-4 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p className="text-[13px] font-medium text-[#A1A4B0]" style={bayanganTeks}>
            Jumlah investasi
          </p>
          <p className="mt-1 text-[24px] font-bold text-[#8A8D99]" style={bayanganTeks}>
            {rupiah(nominal)}
          </p>
        </div>

        <p className="mt-5 text-[13px] font-medium text-[#8A8D99]" style={bayanganTeks}>
          Ini adalah transaksi virtual untuk simulasi pembelajaran.
        </p>

        {errorMessage ? (
          <p role="alert" className="mt-3 rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-center text-[12px] text-[#B94A48]">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={lihatHasil}
          disabled={!session || busy}
          className="mt-auto w-44 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-2.5 text-center text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
        >
          {busy ? "Memproses..." : "Lihat Hasil Simulasi"}
        </button>
      </div>
    </main>
  );
}

export default function InvestasiSuksesPage() {
  return (
    <Suspense fallback={null}>
      <SuksesContent />
    </Suspense>
  );
}
