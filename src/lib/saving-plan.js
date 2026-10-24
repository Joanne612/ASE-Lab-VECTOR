/* hari per satuan waktu (pendekatan) */
export const UNIT_DAYS = { hari: 1, minggu: 7, bulan: 30, tahun: 365 };
export const UNIT_LABEL = { hari: "hari", minggu: "minggu", bulan: "bulan", tahun: "tahun" };

/* ---------- PERHITUNGAN ---------- */
export function hitungCatatan(p) {
  const tabungan = Number(p.get("tabungan")) || 0;
  const durasi = Number(p.get("durasi")) || 0;
  const durasiUnit = p.get("durasiUnit") || "bulan";
  const penerimaan = Number(p.get("penerimaan")) || 0;
  const frekuensi = Number(p.get("frekuensi")) || 0;
  const frekuensiUnit = p.get("frekuensiUnit") || "minggu";

  const totalHari = durasi * (UNIT_DAYS[durasiUnit] ?? 30);
  const jarakHari = frekuensi * (UNIT_DAYS[frekuensiUnit] ?? 7);
  const kali = jarakHari > 0 ? Math.floor(totalHari / jarakHari) : 0;

  const totalMasuk = kali * penerimaan;
  const kekurangan = Math.max(0, tabungan - totalMasuk);
  const sisihkan = kali > 0 ? Math.ceil(tabungan / kali) : 0; // per penerimaan
  const persen = penerimaan > 0 ? Math.min(100, Math.round((sisihkan / penerimaan) * 100)) : 0;
  // BE mengurutkan ide berdasarkan kekurangan per bulan.
  const kekuranganPerBulan = totalHari > 0 ? kekurangan / (totalHari / UNIT_DAYS.bulan) : 0;

  return {
    tabungan,
    durasi,
    durasiUnit,
    penerimaan,
    frekuensi,
    frekuensiUnit,
    kali,
    totalMasuk,
    kekurangan,
    kekuranganPerBulan,
    sisihkan,
    persen,
    cukup: kali > 0 && kekurangan === 0,
  };
}
