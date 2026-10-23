"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import KonfirmasiInvestasi from "./KonfirmasiInvestasi";
import {
  createSimulation,
  instrumentListPath,
  instrumentPath,
  previewSimulation,
  simulationEstimate,
  simulationSessionId,
  unwrapSimulationData,
} from "@/lib/simulation";

// Format angka
const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function BackLink() {
  return (
    <Link
      href="/saham"
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

export default function InvestasiPage() {
  const router = useRouter();
  const { code } = useParams();
  const { data: instrumentResponse, error: instrumentError, isLoading } = useSWR(
    code ? instrumentPath(code) : null,
  );
  const { data: cashResponse } = useSWR(instrumentListPath());
  const saham = unwrapSimulationData(instrumentResponse);
  const kodeSaham = saham?.code ?? code ?? "NUSA";
  const namaSaham = saham?.name ?? "PT Nusantara Abadi Tbk";
  const saldoVirtual = Number(cashResponse?.startingCash ?? 1_000_000);
  const hargaSaham = Number(saham?.price ?? 2500);
  const pilihanCepat = [100000, 250000, 500000, 750000];

  // Nominal disimpan sebagai angka mentah (string digit)
  const [nominal, setNominal] = useState("");
  const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nominalAngka = Number(nominal || 0);
  const estimate = previewData && saham
    ? simulationEstimate(previewData, saham, nominalAngka, saldoVirtual)
    : null;
  const jumlahLembar = estimate?.units ?? Math.floor(nominalAngka / hargaSaham);
  const totalInvestasi = estimate?.total ?? jumlahLembar * hargaSaham;
  const sisaSaldo = saldoVirtual - totalInvestasi;
  const bisaInvestasi = !isLoading && !instrumentError && jumlahLembar >= 1 && nominalAngka <= saldoVirtual && saham;

  const handleChange = (e) => {
    const digit = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    setNominal(digit);
  };

  const handlePreview = async () => {
    if (!bisaInvestasi) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const result = await previewSimulation({ instrumentCode: kodeSaham, amount: nominalAngka });
      setPreviewData(result);
      setTampilKonfirmasi(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleKonfirmasi = async () => {
    setBusy(true);
    setErrorMessage("");
    try {
      const result = await createSimulation({ instrumentCode: kodeSaham, amount: nominalAngka });
      const id = simulationSessionId(result);
      if (!id) throw new Error("Sesi berhasil dibuat, tetapi ID sesi tidak ditemukan.");
      router.push(`/saham/detail/${encodeURIComponent(kodeSaham)}/investasi/sukses?sessionId=${encodeURIComponent(id)}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>

      <div className="relative flex flex-1 flex-col rounded-[32px] border border-white/70 bg-white/30 px-6 pb-8 pt-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        {/* Judul */}
        <h1
          className="text-[20px] font-semibold leading-snug text-[#8A8D99]"
          style={bayanganTeks}
        >
          Berapa banyak yang ingin
          <br />
          kamu investasikan?
        </h1>

        {/* Saldo Virtual */}
        <div className="mt-5 rounded-2xl border border-white/60 bg-white/40 px-3.5 py-2 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p className="text-[11px] font-medium text-[#9B7FD6]">Saldo Virtual</p>
          <p
            className="text-[24px] font-bold leading-tight text-[#8A8D99]"
            style={bayanganTeks}
          >
            {rupiah(saldoVirtual)}
          </p>
        </div>
        {isLoading ? <p className="mt-2 text-[12px] text-[#8A8D99]">Memuat data saham...</p> : null}
        {instrumentError ? <p role="alert" className="mt-2 text-[12px] text-[#B94A48]">{instrumentError.message}</p> : null}

        {/* Nominal Investasi */}
        <label
          htmlFor="nominal"
          className="mt-6 block text-[15px] font-bold text-[#8A8D99]"
          style={bayanganTeks}
        >
          Nominal Investasi
        </label>
        <div className="mt-2 rounded-2xl border border-white/60 bg-white/40 px-3.5 py-3 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <input
            id="nominal"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Rp"
            value={nominal ? rupiah(nominalAngka) : ""}
            onChange={handleChange}
            className="w-full bg-transparent text-[24px] font-semibold text-[#757885] placeholder:text-[#B5B8C2] focus:outline-none"
            style={bayanganTeks}
          />
        </div>

        {/* Pilihan nominal cepat (sedikit lebih lebar dari padding kartu) */}
        <div className="-mx-3 mt-4 grid grid-cols-4 gap-2">
          {pilihanCepat.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNominal(String(n))}
              className={`rounded-xl border py-3 text-[11px] font-medium backdrop-blur-md transition duration-200 active:scale-95 ${
                nominalAngka === n
                  ? "border-white/80 bg-gradient-to-b from-[#CDBDEE] to-[#B6A0E2] text-white shadow-[0_6px_14px_rgba(140,107,212,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)]"
                  : "border-white/60 bg-white/40 text-[#8A8D99] shadow-[0_4px_10px_rgba(120,100,160,0.1)] hover:border-white/80 hover:bg-gradient-to-b hover:from-[#CDBDEE] hover:to-[#B6A0E2] hover:text-white hover:shadow-[0_6px_14px_rgba(140,107,212,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)]"
              }`}
            >
              {rupiah(n)}
            </button>
          ))}
        </div>

        {/* Estimasi pembelian */}
        <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-3.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <h2 className="text-[14px] font-semibold text-[#9B7FD6]">Estimasi pembelian</h2>

          <dl className="mt-3 space-y-2 text-[14px]">
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]">Harga saham</dt>
              <dd className="text-[#8A8D99]">
                <span className="font-bold">{rupiah(hargaSaham)}</span>{" "}
                <span className="text-[13px]">/ lembar</span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]">Jumlah saham</dt>
              <dd className="text-[#8A8D99]">
                <span className="font-bold">{jumlahLembar.toLocaleString("id-ID")}</span>{" "}
                <span className="text-[13px]">lembar</span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#A1A4B0]">Sisa saldo</dt>
              <dd className="font-bold text-[#8A8D99]">{rupiah(sisaSaldo)}</dd>
            </div>
          </dl>
        </div>
        {errorMessage ? <p role="alert" className="mt-3 rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-center text-[12px] text-[#B94A48]">{errorMessage}</p> : null}

        {/* Tombol aksi */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!bisaInvestasi || busy}
            onClick={handlePreview}
            className="rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95 disabled:opacity-60 disabled:active:scale-100"
          >
            {busy ? "Memproses..." : isLoading ? "Memuat..." : "Investasi Sekarang"}
          </button>
        </div>
      </div>

      {/* Popup konfirmasi (di luar kartu supaya menutupi seluruh layar) */}
      <KonfirmasiInvestasi
        open={tampilKonfirmasi}
        onClose={() => setTampilKonfirmasi(false)}
        onConfirm={handleKonfirmasi}
        kodeSaham={kodeSaham}
        namaSaham={namaSaham}
        jumlahLembar={jumlahLembar}
        totalInvestasi={totalInvestasi}
        sisaSaldo={sisaSaldo}
        submitting={busy}
      />
    </main>
  );
}