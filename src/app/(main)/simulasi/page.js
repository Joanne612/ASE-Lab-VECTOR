"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  advanceSimulationSafely,
  instrumentListPath,
  simulationSession,
  simulationSessions,
  sessionPath,
} from "@/lib/simulation";

const sessionsKey = "/simulation/sessions?page=1&limit=10";
const angka = (value) => Math.round(Number(value) || 0).toLocaleString("id-ID");
const rupiah = (value) => `Rp${angka(value)}`;
const warnaUntung = (value) => (value >= 0 ? "text-[#6FB04A]" : "text-[#F27A70]");

function IconSaham({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M3 3v26h26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 24V14M15 24V8M21 24V17M27 24V11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconTren({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M3 24 12 15l5 5 11-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8h8v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackLink() {
  return (
    <Link href="/homepage" aria-label="Kembali" className="flex h-8 w-8 items-center justify-center text-[#6A6E79]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function GlassWrap({ className = "", children }) {
  return (
    <div className={`mx-3 rounded-[28px] border border-white/60 bg-white/20 p-[10px] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Card({ icon, title, className = "", children }) {
  return (
    <section className={`rounded-[24px] border border-white/80 bg-white/50 px-5 pb-5 pt-4 shadow-[0_6px_16px_rgba(120,100,160,0.15),inset_0_1px_3px_rgba(255,255,255,0.7)] ${className}`}>
      <div className="flex items-center gap-3 text-[#9B7FD6]">
        {icon}
        <h2 className="text-[22px] font-medium text-[#8A8D99]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PillButton({ children, onClick, disabled, variant = "primary", className = "" }) {
  const styles = variant === "primary"
    ? "bg-gradient-to-b from-[#B79BEA] to-[#9B7FD6] text-white shadow-[0_4px_8px_rgba(120,100,160,0.3),inset_0_1px_2px_rgba(255,255,255,0.5)]"
    : "border border-white/70 bg-white/50 text-[#6A6E79] shadow-[0_2px_6px_rgba(120,100,160,0.15)]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-[13px] font-medium transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function Garis() {
  return <div className="my-3 h-px bg-[#8A8D99]/30" />;
}

function BarisModal({ label, nilai, tebal = true }) {
  return (
    <div className="flex items-center justify-between text-[13px] text-[#8A8D99]">
      <span>{label}</span>
      <span className={`tabular-nums ${tebal ? "font-semibold" : ""}`}>{nilai}</span>
    </div>
  );
}

function SimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { data: instrumentsResponse } = useSWR(instrumentListPath());
  const { data: sessionsResponse, mutate: refreshSessions } = useSWR(sessionsKey);
  const {
    data: sessionResponse,
    error: sessionError,
    isLoading: sessionLoading,
    mutate: refreshSession,
  } = useSWR(sessionId ? sessionPath(sessionId) : null);
  const sessions = simulationSessions(sessionsResponse);
  const session = simulationSession(sessionResponse);
  const modalVirtual = Number(instrumentsResponse?.startingCash ?? 1_000_000);
  const instrument = session?.instrument ?? session?.instrumentDetails ?? {};
  const label = instrument.name ?? session?.instrumentName ?? session?.instrumentCode ?? "Investasi";
  const startingCash = Number(session?.startingCash ?? modalVirtual);
  const invested = Number(session?.investedAmount ?? 0);
  const currentValue = Number(session?.currentValue ?? invested);
  // Sisa kas virtual yang tidak ikut dibelikan; bagian dari total aset.
  const cashLeft = Number(session?.cashLeft ?? 0);
  const change = currentValue - invested;
  const finished = session?.status === "FINISHED";
  const checkpoints = Array.isArray(session?.checkpoints) ? session.checkpoints : [];
  // currentStep BE: 0 = baru membeli, 1..4 = checkpoint yang sudah dicapai.
  const checkpointIndex = Number(session?.currentStep ?? 0) - 1;
  const totalCheckpoints = checkpoints.length || 4;
  const nextLabel = session?.nextCheckpoint?.label ?? "1 Hari";
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function lanjutCheckpoint() {
    if (!sessionId || finished || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      // 409 (sudah dimajukan dari tab lain) cukup dimuat ulang.
      await advanceSimulationSafely(sessionId);
      // Daftar sesi ikut diperbarui supaya status dan nilainya tidak basi.
      await Promise.all([refreshSession(), refreshSessions()]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (sessionId) {
    return (
      <GlassWrap className="mb-6 mt-[20px]">
        <div className="mb-1 pl-1"><BackLink /></div>
        {sessionLoading ? <p className="py-8 text-center text-[14px] text-[#8A8D99]">Memuat sesi...</p> : null}
        {sessionError ? <p role="alert" className="py-5 text-center text-[13px] text-[#F27A70]">{sessionError.message}</p> : null}
        {session ? (
          <Card icon={<IconTren />} title="Nilai Investasi">
            <p className="mt-2 text-[13px] text-[#8A8D99]">{finished ? "Simulasi selesai" : `Checkpoint ${checkpointIndex + 1} dari ${totalCheckpoints}`}</p>
            <Garis />
            <p className="mb-2 text-[14px] font-medium text-[#6A6E79]">{label}</p>
            <BarisModal label="Modal virtual" nilai={rupiah(startingCash)} tebal={false} />
            <BarisModal label="Nilai investasi" nilai={rupiah(currentValue)} tebal={false} />
            <BarisModal label="Total aset" nilai={rupiah(currentValue + cashLeft)} />
            <p className={`mt-1 text-right text-[13px] tabular-nums ${warnaUntung(change)}`}>
              {change >= 0 ? "+" : "-"}{rupiah(Math.abs(change))} ({invested ? `${((change / invested) * 100).toFixed(2)}%` : "0.00%"})
            </p>
            {checkpoints.length ? (
              <ol className="mt-4 flex flex-wrap gap-2">
                {checkpoints.map((item, index) => (
                  <li key={item.id ?? item.label ?? index} className={`rounded-lg border px-3 py-1 text-[11px] ${index <= checkpointIndex ? "border-[#9B7FD6]/50 bg-[#9B7FD6]/15 text-[#6A6E79]" : "border-white/70 bg-white/30 text-[#8A8D99]"}`}>
                    {item.label ?? item.name ?? item.period ?? `Tahap ${index + 1}`}
                  </li>
                ))}
              </ol>
            ) : null}
            {errorMessage ? <p role="alert" className="mt-3 text-[12px] text-[#F27A70]">{errorMessage}</p> : null}
            <div className="mt-4 flex justify-center gap-3">
              <PillButton variant="ghost" onClick={() => router.push("/simulasi")}>Kembali</PillButton>
              <PillButton onClick={lanjutCheckpoint} disabled={busy || finished}>
                {busy ? "Memproses..." : finished ? "Selesai" : `Lanjut ${nextLabel}`}
              </PillButton>
            </div>
          </Card>
        ) : null}
      </GlassWrap>
    );
  }

  return (
    <>
      <GlassWrap className="mb-[30px] mt-[20px]">
        <div className="mb-1 pl-1"><BackLink /></div>
        <Card icon={<IconSaham />} title="Saham">
          <p className="pl-[48px] pr-2 pt-1 text-[14px] leading-[20px] text-[#8A8D99]">
            Pelajari cara kerja investasi saham melalui simulasi sederhana.
          </p>
          <Garis />
          <BarisModal label="Modal virtual" nilai={angka(modalVirtual)} />
          <div className="mt-3 flex justify-center">
            <PillButton onClick={() => router.push("/saham")}>Mulai Simulasi</PillButton>
          </div>
        </Card>

        <Card icon={<IconTren />} title="Raksa Dana" className="mt-3">
          <p className="pl-[48px] pr-2 pt-1 text-[14px] leading-[20px] text-[#8A8D99]">
            Kamu bisa memilih saham perusahaan tertentu dan melihat bagaimana nilai berubah.
          </p>
          <Garis />
          <BarisModal label="Modal virtual" nilai={angka(modalVirtual)} />
          <div className="mt-3 flex justify-center">
            <PillButton onClick={() => router.push("/reksadana")}>Mulai Simulasi</PillButton>
          </div>
        </Card>
        {sessions.length ? (
          <div className="px-2 pb-2 pt-5">
            <h2 className="text-[14px] font-semibold text-[#8A8D99]">Sesi Simulasi</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {sessions.map((item) => {
                const id = item.id ?? item.sessionId;
                const itemName = item.instrument?.name ?? item.instrumentName ?? item.instrumentCode ?? "Investasi";
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/simulasi?sessionId=${encodeURIComponent(id)}`)}
                      className="flex w-full items-center justify-between rounded-[14px] border border-white/70 bg-white/40 px-3 py-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-[#6A6E79]">{itemName}</span>
                        <span className="mt-1 block text-[11px] text-[#8A8D99]">{item.status === "FINISHED" ? "Selesai" : "Berjalan"}</span>
                      </span>
                      <span className="pl-3 text-[12px] font-semibold text-[#9B7FD6]">{rupiah(item.currentValue ?? item.amount ?? 0)} ›</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </GlassWrap>

    </>
  );
}

function SimulationContentWrapper() {
  return (
    <Suspense fallback={<GlassWrap className="mt-[20px]"><p className="p-6 text-center text-[14px] text-[#8A8D99]">Memuat simulasi...</p></GlassWrap>}>
      <SimulationContent />
    </Suspense>
  );
}

export default function SimulasiPage() {
  return <SimulationContentWrapper />;
}
