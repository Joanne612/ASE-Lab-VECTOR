/** Ikon kalender 84px berisi dua baris teks (mis. "Agustus" / "2026"). */
export default function CalendarBadge({ top, bottom }) {
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <div
        className="absolute inset-0 rounded-[20px] border-[3px] border-white/90"
        style={{
          background: "linear-gradient(160deg, #F6F3FC 0%, #E4E2F4 100%)",
          boxShadow: "0 12px 22px rgba(150,140,205,0.28), inset 0 0 10px rgba(255,255,255,0.9)",
        }}
      />

      {/* Panel gradasi */}
      <div
        className="absolute inset-x-[8px] bottom-[8px] top-[12px] rounded-[10px]"
        style={{
          background: "linear-gradient(180deg, #A395D6 0%, #A7ADDC 30%, #B3BDD9 100%)",
          boxShadow: "inset 0 1px 3px rgba(255,255,255,0.35)",
        }}
      />

      {/* Cincin */}
      <span className="absolute left-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />
      <span className="absolute right-[26px] top-[4px] h-[11px] w-[2.5px] rounded-full bg-white shadow-[0_1px_2px_rgba(90,80,140,0.25)]" />

      {/* Teks */}
      <div className="absolute inset-x-0 bottom-[8px] top-[22px] flex flex-col items-center justify-center">
        <span className="whitespace-nowrap text-[13px] font-bold leading-tight tracking-tight text-white [text-shadow:0_1px_3px_rgba(80,70,130,0.45)]">
          {top}
        </span>
        <span className="text-[20px] font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(80,70,130,0.45)]">
          {bottom}
        </span>
      </div>
    </div>
  );
}
