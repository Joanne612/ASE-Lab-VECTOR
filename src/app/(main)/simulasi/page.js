"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ---------- Konfigurasi simulasi ---------- */
const MODAL_VIRTUAL = 1_000_000;
const LANGKAH_ALOKASI = 100_000; // tiap tekan +/- menambah/mengurangi sebanyak ini
const MAX_HARI = 14;

const SAHAM = [
    { code: "BBCA", name: "Bank Central Asia", price: 9500, vol: 0.025, color: "#D7C5F5", dark: "#B79BEA", soft: "#ECE3F9" },
    { code: "TLKM", name: "Telkom Indonesia", price: 3200, vol: 0.03, color: "#FF9E96", dark: "#F27A70", soft: "#FFDCD8" },
    { code: "ASII", name: "Astra International", price: 5000, vol: 0.035, color: "#BDE3F7", dark: "#8FCBEA", soft: "#DDF1FB" },
    { code: "UNVR", name: "Unilever Indonesia", price: 2000, vol: 0.04, color: "#C9E9B0", dark: "#A9D98B", soft: "#E6F4DA" },
    { code: "ICBP", name: "Indofood CBP", price: 11000, vol: 0.03, color: "#F7EC9F", dark: "#EBD96A", soft: "#FBF6D2" },
];

// Format angka 
const angka = (n) => Math.round(n).toLocaleString("id-ID");
const pct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const warnaUntung = (n) => (n >= 0 ? "text-[#6FB04A]" : "text-[#F27A70]");

function hargaBerikut(harga, vol) {
    const perubahan = (Math.random() * 2 - 1) * vol;
    return Math.max(50, Math.round(harga * (1 + perubahan)));
}

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

function Sparkline({ data, color }) {
    const w = 84;
    const h = 30;
    if (data.length < 2) return <div className="h-[30px] w-[84px] rounded-full bg-white/40" aria-hidden="true" />;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
        .map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 4)}`)
        .join(" ");
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <div
            className={`mx-3 rounded-[28px] border border-white/60 bg-white/20 p-[10px] backdrop-blur-xl ${className}`}
        >
            {children}
        </div>
    );
}

function Card({ icon, title, className = "", children }) {
    return (
        <section
            className={`rounded-[24px] border border-white/80 bg-white/50 px-5 pb-5 pt-4 shadow-[0_6px_16px_rgba(120,100,160,0.15),inset_0_1px_3px_rgba(255,255,255,0.7)] ${className}`}
        >
            <div className="flex items-center gap-3 text-[#9B7FD6]">
                {icon}
                <h2 className="text-[22px] font-medium text-[#8A8D99]">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function PillButton({ children, onClick, disabled, variant = "primary", className = "" }) {
    const styles =
        variant === "primary"
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

function KodeBadge({ s }) {
    return (
        <div
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] border border-white/80 text-[11px] font-semibold text-white shadow-[0_4px_8px_rgba(120,100,160,0.2),inset_0_1px_3px_rgba(255,255,255,0.55)]"
            style={{ background: `linear-gradient(145deg, ${s.color}, ${s.dark})` }}
        >
            {s.code}
        </div>
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

export default function SimulasiSahamPage() {
    const router = useRouter();
    const [fase, setFase] = useState("intro");
    const [mode, setMode] = useState("saham");
    const [alokasi, setAlokasi] = useState({});
    const [portofolio, setPortofolio] = useState({});
    const [sisaTunai, setSisaTunai] = useState(MODAL_VIRTUAL);
    const [harga, setHarga] = useState({});
    const [riwayat, setRiwayat] = useState({});
    const [hari, setHari] = useState(0);
    const totalAlokasi = useMemo(() => Object.values(alokasi).reduce((a, b) => a + b, 0), [alokasi]);
    const sisaModal = MODAL_VIRTUAL - totalAlokasi;

    const nilaiSaham = useMemo(
        () => Object.entries(portofolio).reduce((sum, [code, p]) => sum + p.lembar * harga[code], 0),
        [portofolio, harga],
    );
    const totalAset = sisaTunai + nilaiSaham;
    const untung = totalAset - MODAL_VIRTUAL;
    const untungPct = (untung / MODAL_VIRTUAL) * 100;
    const selesai = hari >= MAX_HARI;

    function ubahAlokasi(code, arah) {
        setAlokasi((a) => {
            const sekarang = a[code] ?? 0;
            const baru = sekarang + arah * LANGKAH_ALOKASI;
            if (baru < 0) return a;
            if (arah > 0 && baru - sekarang > sisaModal) return a;
            const next = { ...a, [code]: baru };
            if (baru === 0) delete next[code];
            return next;
        });
    }

    function mulai() {
        const hargaAwal = Object.fromEntries(SAHAM.map((s) => [s.code, s.price]));
        const pf = {};
        let terpakai = 0;
        SAHAM.forEach((s) => {
            const rupiah = alokasi[s.code] ?? 0;
            const lembar = Math.floor(rupiah / s.price);
            if (lembar > 0) {
                pf[s.code] = { lembar, hargaBeli: s.price };
                terpakai += lembar * s.price;
            }
        });
        setPortofolio(pf);
        setSisaTunai(MODAL_VIRTUAL - terpakai);
        setHarga(hargaAwal);
        setRiwayat(Object.fromEntries(SAHAM.map((s) => [s.code, [s.price]])));
        setHari(0);
        setFase("jalan");
    }

    function lanjutHari() {
        if (selesai) return;
        const baru = {};
        SAHAM.forEach((s) => {
            baru[s.code] = hargaBerikut(harga[s.code], s.vol);
        });
        setHarga(baru);
        setRiwayat((r) => Object.fromEntries(SAHAM.map((s) => [s.code, [...r[s.code], baru[s.code]]])));
        setHari((h) => h + 1);
    }

    function ulang() {
        setAlokasi({});
        setPortofolio({});
        setHari(0);
        setFase("pilih");
    }

    if (fase === "intro") {
        return (
            <GlassWrap className="mt-[20px] mb-[30px]">
                <div className="mb-1 pl-1">
                    <BackLink />
                </div>
                <Card icon={<IconSaham />} title="Saham">
                    <p className="pl-[48px] pr-2 pt-1 text-[14px] leading-[20px] text-[#8A8D99]">
                        Pelajari cara kerja investasi saham melalui simulasi sederhana.
                    </p>
                    <Garis />
                    <BarisModal label="Modal virtual" nilai={angka(MODAL_VIRTUAL)} />
                    <div className="mt-3 flex justify-center">
                        <PillButton onClick={() => router.push("/saham")}>
                            Mulai Simulasi
                        </PillButton>
                    </div>
                </Card>

                <Card icon={<IconTren />} title="Raksa Dana" className="mt-3">
                    <p className="pl-[48px] pr-2 pt-1 text-[14px] leading-[20px] text-[#8A8D99]">
                        Kamu bisa memilih saham perusahaan tertentu dan melihat bagaimana nilai berubah.
                    </p>
                    <Garis />
                    <BarisModal label="Modal virtual" nilai={angka(MODAL_VIRTUAL)} />
                    <div className="mt-3 flex justify-center">
                        <PillButton
                            onClick={() => {
                                setMode("raksa");
                                setFase("pilih");
                            }}
                        >
                            Mulai Simulasi
                        </PillButton>
                    </div>
                </Card>
            </GlassWrap>
        );
    }

    if (fase === "pilih") {
        return (
            <GlassWrap className="mt-[20px] mb-6">
                <Card
                    icon={mode === "raksa" ? <IconTren /> : <IconSaham />}
                    title={mode === "raksa" ? "Raksa Dana" : "Pilih Saham"}
                >
                    <p className="mt-2 text-[14px] leading-[20px] text-[#8A8D99]">
                        Bagi modal virtualmu ke perusahaan yang kamu mau. Sisanya tetap jadi uang tunai.
                    </p>
                    <Garis />
                    <BarisModal label="Modal virtual" nilai={angka(MODAL_VIRTUAL)} tebal={false} />
                    <BarisModal label="Sudah dialokasikan" nilai={angka(totalAlokasi)} tebal={false} />
                    <BarisModal label="Sisa modal" nilai={angka(sisaModal)} />

                    <ul className="mt-4 flex flex-col gap-3">
                        {SAHAM.map((s) => {
                            const nilai = alokasi[s.code] ?? 0;
                            return (
                                <li
                                    key={s.code}
                                    className="flex items-center gap-3 rounded-[18px] border border-white/70 bg-white/40 p-3"
                                >
                                    <KodeBadge s={s} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-medium text-[#6A6E79]">{s.name}</p>
                                        <p className="text-[12px] tabular-nums text-[#8A8D99]">{angka(s.price)} / lembar</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label={`Kurangi ${s.name}`}
                                            onClick={() => ubahAlokasi(s.code, -1)}
                                            disabled={nilai === 0}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/60 text-[16px] text-[#6A6E79] disabled:opacity-40"
                                        >
                                            −
                                        </button>
                                        <span className="w-[68px] text-center text-[12px] tabular-nums text-[#6A6E79]">{angka(nilai)}</span>
                                        <button
                                            type="button"
                                            aria-label={`Tambah ${s.name}`}
                                            onClick={() => ubahAlokasi(s.code, 1)}
                                            disabled={sisaModal < LANGKAH_ALOKASI}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/60 text-[16px] text-[#6A6E79] disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <p className="mt-3 text-[11px] text-[#8A8D99]">
                        Tiap tekan + menambah {angka(LANGKAH_ALOKASI)}. Harga di sini hanya simulasi, bukan harga pasar sebenarnya.
                    </p>

                    <div className="mt-4 flex justify-center gap-3">
                        <PillButton variant="ghost" onClick={() => setFase("intro")}>
                            Kembali
                        </PillButton>
                        <PillButton onClick={mulai} disabled={totalAlokasi === 0}>
                            Mulai Investasi
                        </PillButton>
                    </div>
                </Card>
            </GlassWrap>
        );
    }

    const dipilih = SAHAM.filter((s) => portofolio[s.code]);
    const terbaik = dipilih.reduce((a, s) => {
        const r = harga[s.code] / s.price;
        return !a || r > a.r ? { s, r } : a;
    }, null);

    return (
        <GlassWrap className="mt-[20px] mb-6">
            <Card icon={<IconTren />} title="Nilai Investasi">
                <p className="mt-2 text-[13px] text-[#8A8D99]">
                    Hari {hari} dari {MAX_HARI}
                </p>
                <Garis />
                <BarisModal label="Modal virtual" nilai={angka(MODAL_VIRTUAL)} tebal={false} />
                <BarisModal label="Uang tunai" nilai={angka(sisaTunai)} tebal={false} />
                <BarisModal label="Nilai saham" nilai={angka(nilaiSaham)} tebal={false} />
                <BarisModal label="Total aset" nilai={angka(totalAset)} />
                <p className={`mt-1 text-right text-[13px] tabular-nums ${warnaUntung(untung)}`}>
                    {untung >= 0 ? "+" : "-"}
                    {angka(Math.abs(untung))} ({pct(untungPct)})
                </p>

                <ul className="mt-4 flex flex-col gap-3">
                    {dipilih.map((s) => {
                        const p = portofolio[s.code];
                        const nilai = p.lembar * harga[s.code];
                        const modal = p.lembar * p.hargaBeli;
                        const selisih = nilai - modal;
                        return (
                            <li
                                key={s.code}
                                className="flex items-center gap-3 rounded-[18px] border border-white/70 bg-white/40 p-3"
                            >
                                <KodeBadge s={s} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-[#6A6E79]">{s.name}</p>
                                    <p className="text-[12px] tabular-nums text-[#8A8D99]">
                                        {p.lembar} lembar · {angka(harga[s.code])}
                                    </p>
                                    <p className={`text-[12px] tabular-nums ${warnaUntung(selisih)}`}>
                                        {selisih >= 0 ? "+" : "-"}
                                        {angka(Math.abs(selisih))} ({pct((selisih / modal) * 100)})
                                    </p>
                                </div>
                                <Sparkline data={riwayat[s.code]} color={s.dark} />
                            </li>
                        );
                    })}
                </ul>

                {selesai ? (
                    <div className="mt-4 rounded-[16px] bg-white/50 p-3 text-center text-[13px] leading-[19px] text-[#6A6E79]">
                        Simulasi selesai. Hasil akhirmu {untung >= 0 ? "untung" : "rugi"} {angka(Math.abs(untung))} (
                        {pct(untungPct)}).
                        {terbaik && ` Saham yang paling naik: ${terbaik.s.name}.`}
                        {dipilih.length === 1
                            ? " Kamu hanya memilih satu perusahaan, coba sebar ke beberapa perusahaan supaya risikonya lebih kecil."
                            : " Menyebar modal ke beberapa perusahaan membuat satu saham turun tidak terlalu berpengaruh."}
                    </div>
                ) : null}

                <div className="mt-4 flex justify-center gap-3">
                    <PillButton variant="ghost" onClick={ulang}>
                        Ubah Pilihan
                    </PillButton>
                    <PillButton onClick={lanjutHari} disabled={selesai}>
                        {selesai ? "Selesai" : "Lanjut 1 Hari"}
                    </PillButton>
                </div>
            </Card>
        </GlassWrap>
    );
}