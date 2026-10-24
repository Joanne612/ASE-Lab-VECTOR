import { chartPath } from "@/lib/simulation";
import { TEXT } from "@/components/simulasi/desktop-ui";

/**
 * Grafik garis desktop (Figma "Group 152": label Rp di kiri, 5 garis bantu, garis ungu,
 * label waktu di bawah). points: [[x, y], ...]; yLabels dari atas ke bawah.
 */
export default function DesktopLineChart({ points, yLabels, xLabels, label, className = "" }) {
  const path = chartPath(points);

  return (
    <div className={className}>
      <div className="flex h-[170px]">
        <div className={`flex w-[103px] shrink-0 -translate-y-[9px] flex-col justify-between pr-2 text-[17px] font-medium leading-none ${TEXT}`}>
          {yLabels.map((l, i) => (
            <span key={`${l}-${i}`} className="whitespace-nowrap">
              {l}
            </span>
          ))}
        </div>

        <div className="relative flex-1 border-l border-[#6A6E79]/60">
          <div className="absolute inset-0 flex flex-col justify-between">
            {yLabels.map((l, i) => (
              <div key={`${l}-${i}`} className="h-px bg-[#6A6E79]/40" />
            ))}
          </div>
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label={label}
          >
            <path
              d={path}
              fill="none"
              stroke="#9B7FD6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <div className={`ml-[103px] mt-[5px] flex justify-around text-[17px] font-medium ${TEXT}`}>
        {xLabels.map((l, i) => (
          <span key={`${l}-${i}`} className="whitespace-nowrap">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
