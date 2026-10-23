"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import KonfirmasiReksaDana from "./KonfirmasiReksadana";
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

export default function InvestasiReksaDanaPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: instrumentResponse, error: instrumentError, isLoading } = useSWR(
    id ? instrumentPath(id) : null,
  );
  const { data: cashResponse } = useSWR(instrumentListPath());
  const produk = unwrapSimulationData(instrumentResponse);
  const saldoVirtual = Number(cashResponse?.startingCash ?? 1_000_000);
  const minimalInvestasi = Number(produk?.minInvestment ?? 10000);
  const namaProduk = produk?.name ?? "Reksa dana";
  const pilihanCepat = [100000, 250000, 500000, 750000];

  // Nominal disimpan sebagai angka mentah (string digit)
  const [nominal, setNominal] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nominalAngka = Number(nominal || 0);
  const estimate = previewData && produk
    ? simulationEstimate(previewData, produk, nominalAngka, saldoVirtual)
    : null;
  const totalInvestasi = estimate?.total ?? nominalAngka;
  const sisaSaldo = estimate?.remainingCash ?? saldoVirtual - totalInvestasi;
  // Kode instrumen dari URL dipakai kalau detail produk belum termuat.
  const kodeProduk = produk?.code ?? id;
  const bisaInvestasi =
    !isLoading && !instrumentError && Boolean(produk) &&
    nominalAngka >= minimalInvestasi && nominalAngka <= saldoVirtual;

  const handleChange = (e) => {
    const digit = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    setNominal(digit);
  };

  const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);

  // Klik "Investasi Sekarang" -> buka popup konfirmasi
  const handleInvestasi = async () => {
    if (!bisaInvestasi) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const result = await previewSimulation({ instrumentCode: kodeProduk, amount: nominalAngka });
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
      const result = await createSimulation({ instrumentCode: kodeProduk, amount: nominalAngka });
      const sessionId = simulationSessionId(result);
      if (!sessionId) throw new Error("Sesi berhasil dibuat, tetapi ID sesi tidak ditemukan.");
      router.push(`/reksadana/detail/${encodeURIComponent(id)}/investasi/sukses?sessionId=${encodeURIComponent(sessionId)}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <main className="px-6 py-12 text-center text-[#8A8D99]">Memuat reksa dana...</main>;
  if (instrumentError || !produk) return <main role="alert" className="px-6 py-12 text-center text-[#B94A48]">{instrumentError?.message ?? "Produk tidak ditemukan."}</main>;

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>
      
      <div className="relative flex flex-1 flex-col rounded-[32px] border border-white/70 bg-white/30 px-6 pb-7 pt-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
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

        {/* Sisa saldo (nilai muncul setelah nominal diisi) */}
        <div className="mt-6 min-h-[84px] rounded-2xl border border-white/60 bg-white/40 p-3.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p className="text-[14px] font-semibold text-[#9B7FD6]" style={bayanganTeks}>
            Sisa saldo
          </p>
          {nominal && (
            <p
              className={`mt-1 text-[20px] font-bold ${
                sisaSaldo < 0 ? "text-[#D46B6B]" : "text-[#757885]"
              }`}
              style={bayanganTeks}
            >
              {sisaSaldo < 0 ? `-${rupiah(Math.abs(sisaSaldo))}` : rupiah(sisaSaldo)}
            </p>
          )}
        </div>
        {errorMessage ? <p role="alert" className="mt-3 text-center text-sm text-[#B94A48]">{errorMessage}</p> : null}

        {/* Catatan */}
        <p
          className="mt-5 text-[15px] font-medium leading-relaxed text-[#8A8D99]"
          style={bayanganTeks}
        >
          *Ini adalah uang virtual dan tidak menggunakan uang sungguhan
        </p>

        {/* Tombol aksi (menempel di bagian bawah kartu) */}
        <div className="mt-auto flex justify-center pt-8">
          <button
            type="button"
            disabled={!bisaInvestasi}
            onClick={handleInvestasi}
            className="w-44 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-2.5 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95 disabled:opacity-60 disabled:active:scale-100"
          >
            {busy ? "Memproses..." : "Investasi Sekarang"}
          </button>
        </div>
      </div>

      {/* Popup konfirmasi (di luar kartu supaya menutupi seluruh layar) */}
      <KonfirmasiReksaDana
        open={tampilKonfirmasi}
        onClose={() => setTampilKonfirmasi(false)}
        onConfirm={handleKonfirmasi}
        namaProduk={namaProduk}
        jumlah={nominalAngka}
        saldoAwal={saldoVirtual}
        totalInvestasi={totalInvestasi}
        submitting={busy}
      />
    </main>
  );
}