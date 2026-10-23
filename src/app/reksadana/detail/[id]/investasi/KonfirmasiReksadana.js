"use client";

// Format angka
const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

export default function KonfirmasiReksaDana({
  open,
  onClose,
  onConfirm,
  namaProduk,
  jumlah,
  saldoAwal,
  totalInvestasi,
  submitting = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#6A6E79]/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-konfirmasi-reksadana"
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-[32px] border border-white/70 bg-white/80 px-6 pb-8 pt-6 shadow-[0_-8px_24px_rgba(120,100,160,0.15),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl"
      >
        <h2
          id="judul-konfirmasi-reksadana"
          className="text-[18px] font-bold text-[#8A8D99]"
          style={bayanganTeks}
        >
          Konfirmasi Investasi
        </h2>
        <p
          className="mt-2 text-[14px] font-medium leading-snug text-[#8A8D99]"
          style={bayanganTeks}
        >
          Kamu akan melakukan simulasi
          <br />
          investasi {namaProduk}
        </p>

        {/* Ringkasan */}
        <div className="mt-4 min-h-[200px] rounded-2xl border border-white/60 bg-white/50 p-4 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p
            className="text-[20px] font-semibold leading-tight text-[#8A8D99]"
            style={bayanganTeks}
          >
            {namaProduk}
          </p>

          <hr className="mt-3 border-[#A1A4B0]/50" />

          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#8A8D99]" style={bayanganTeks}>
                Jumlah investasi
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {rupiah(jumlah)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#8A8D99]" style={bayanganTeks}>
                Saldo awal
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {rupiah(saldoAwal)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-[#8A8D99]" style={bayanganTeks}>
                Total investasi
              </dt>
              <dd className="font-bold text-[#8A8D99]" style={bayanganTeks}>
                {rupiah(totalInvestasi)}
              </dd>
            </div>
          </dl>
        </div>

        <p
          className="mt-6 text-[13px] font-medium leading-snug text-[#8A8D99]"
          style={bayanganTeks}
        >
          *Investasi ini hanya digunakan untuk simulasi pembelajaran
        </p>

        {/* Tombol */}
        <div className="mt-6 flex justify-center gap-4 px-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-white/80 bg-white py-3 text-[14px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] transition active:scale-95"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-3 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}