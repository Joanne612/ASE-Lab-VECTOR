/** Panjang dan offset tiap potongan dalam satuan pathLength = 100. */
function toSegments(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.reduce((segments, item) => {
    const previous = segments.at(-1);
    const offset = previous ? previous.offset + previous.length : 0;
    return [...segments, { ...item, length: (item.value / total) * 100, offset }];
  }, []);
}

/**
 * Donat 170px dengan efek cekung di tengah. Potongan digambar searah jarum jam
 * mulai jam 12. items: [{ key, value, color }]; nilai 0 dilewati.
 */
export default function DonutChart({ items, label, className = "" }) {
  const segments = toSegments(items.filter((item) => item.value > 0));

  return (
    <div className={`relative h-[170px] w-[170px] shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={label}
        className="h-full w-full drop-shadow-[0_6px_10px_rgba(120,100,160,0.2)]"
      >
        <g transform="rotate(-90 50 50)">
          {segments.map((s) => (
            <circle
              key={s.key}
              cx="50"
              cy="50"
              r="41"
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              pathLength="100"
              strokeDasharray={`${s.length} ${100 - s.length}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
      </svg>

      {/* efek cekung */}
      {/* inset 30px pada 170px, dalam persen supaya tetap pas kalau ukuran donat diubah lewat className. */}
      <div className="absolute inset-[17.647%] rounded-full bg-[#F6F3F3] shadow-[inset_0_4px_10px_rgba(120,100,160,0.2),inset_0_-3px_6px_rgba(255,255,255,0.9)]" />
    </div>
  );
}
