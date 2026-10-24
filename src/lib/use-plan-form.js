import { useState } from "react";
import { parseRupiahInput } from "@/lib/format";

/* Opsi segmented */
export const DURASI_UNITS = [
  { key: "bulan", label: "Bulan" },
  { key: "minggu", label: "Minggu" },
  { key: "tahun", label: "Tahun" },
];

export const FREKUENSI_UNITS = [
  { key: "hari", label: "Hari" },
  { key: "minggu", label: "Minggu" },
  { key: "bulan", label: "Bulan" },
];

/** State form "Rencanakan Tabungan", dipakai tampilan mobile dan desktop. */
export function usePlanForm() {
  const [tabungan, setTabungan] = useState("");
  const [durasi, setDurasi] = useState("");
  const [durasiUnit, setDurasiUnit] = useState("");
  const [penerimaan, setPenerimaan] = useState("");
  const [frekuensi, setFrekuensi] = useState("");
  const [frekuensiUnit, setFrekuensiUnit] = useState("");
  const [error, setError] = useState("");

  /** onValid menerima URLSearchParams berisi isian yang lengkap. */
  const submit = (onValid) => {
    const target = parseRupiahInput(tabungan);
    const masuk = parseRupiahInput(penerimaan);
    // Sebut isian yang masih kosong: kotak angka di samping pilihan satuan mudah terlewat.
    const missing = [
      !target && "jumlah tabungan",
      !Number(durasi) && "angka “Dalam waktu”",
      !durasiUnit && "satuan “Dalam waktu”",
      !masuk && "uang yang diterima",
      !Number(frekuensi) && "angka “Diterima setiap”",
      !frekuensiUnit && "satuan “Diterima setiap”",
    ].filter(Boolean);
    if (missing.length > 0) {
      setError(`Lengkapi dulu: ${missing.join(", ")}.`);
      return;
    }

    setError("");
    onValid(
      new URLSearchParams({
        tabungan: target,
        durasi,
        durasiUnit,
        penerimaan: masuk,
        frekuensi,
        frekuensiUnit,
      }),
    );
  };

  return {
    tabungan,
    setTabungan,
    durasi,
    setDurasi,
    durasiUnit,
    setDurasiUnit,
    penerimaan,
    setPenerimaan,
    frekuensi,
    setFrekuensi,
    frekuensiUnit,
    setFrekuensiUnit,
    error,
    submit,
  };
}
