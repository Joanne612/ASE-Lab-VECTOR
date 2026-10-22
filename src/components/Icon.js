const ICON_PATHS = {
  /* Kategori */
  shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />,
  drink: <path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />,
  shoe: <path d="M3 16v-4l4-1 3 2h3l2-3 4 3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16h18" />,
  bus: (
    <>
      <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M9 18h5" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  burger: <path d="M4 11a8 6 0 0 1 16 0zM3 14h18M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />,
  wifi: <path d="M12 12v9M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9M4.5 4.5a10 10 0 0 0 0 15M19.5 4.5a10 10 0 0 1 0 15M12 12h.01" />,
  phone: <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01" />,
  home: <path d="M3 11 12 3l9 8M5 10v10h14V10M10 20v-6h4v6" />,
  building: <path d="M4 21V8h6V3h10v18zM8 12h.01M8 16h.01M14 8h.01M14 12h.01M14 16h.01M18 12h.01M18 16h.01" />,
  gym: <path d="M6 6v12M3 9v6M18 6v12M21 9v6M6 12h12" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  health: <path d="M4 7h16a1 1 0 0 1 1 1v12H3V8a1 1 0 0 1 1-1zM9 7V4h6v3M12 11v6M9 14h6" />,
  bag: <path d="M5 8h14l1 13H4zM8 8a4 4 0 0 1 8 0" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  wallet: <path d="M3 7a2 2 0 0 1 2-2h14v4M3 7v10a2 2 0 0 0 2 2h16V9H5a2 2 0 0 1-2-2zM17 14h.01" />,
  card: <path d="M3 6h18v12H3zM3 10h18M7 15h4" />,
  piggy: <path d="M19 11c0-3-3-5-7-5S5 8 5 11c0 2 1 3.500 2.500 4.500V19h3v-1.500h3V19h3v-3.500c1-.8 1.500-1.500 1.500-2.500M19 11h2v3h-2M9 10h.01" />,
  gift: <path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8S10 3 7.500 4.500 9 8 12 8zM12 8s2-5 4.500-3.500S15 8 12 8z" />,
  gamepad: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" />
    </>
  ),
  book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  briefcase: (
    <>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  tag: (
    <>
      <path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),

  /* Navigasi & menu */
  pie: <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />,
  target: (
    <>
      <circle cx="11" cy="13" r="8" />
      <circle cx="11" cy="13" r="4" />
      <circle cx="11" cy="13" r="1" />
      <path d="M11 13 L20 4" />
      <path d="M20 4 L20.5 1.5M20 4 L22.5 3.5" />
      <path d="M17.5 6.5 L18 4M17.5 6.5 L20 6" />
    </>
  ),
  idea: <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />,
  simulation: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round">
      {/* sumbu */}
      <path d="M8 6v34h34" />
      {/* garis tren naik */}
      <path d="M14 30l9-9 6 6 11-12" />
      {/* kepala panah */}
      <path d="M32 15h8v8" />
    </svg>
  ),
  handCoin: (
    <>
      <circle cx="17" cy="6" r="3.5" />
      <path d="M17 4.8v2.4" />
      <path d="M2 15h3.5l3-1.5 4 .5c1 .1 1.5 1 .8 1.7L11 17h-3M5.5 15v5H2M8 19l5 1.5 7-3.2c1-.5.4-1.8-.6-1.5L13 17.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="M15 5l-7 7 7 7" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  swap: <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
};

/** Nama ikon dari seed kategori BE yang tidak sama dengan nama ikon FE. */
const BE_ICON_MAP = {
  utensils: "burger",
  "piggy-bank": "piggy",
  "heart-pulse": "health",
  "shopping-bag": "bag",
  ellipsis: "menu",
};

const FALLBACK_ICON = "menu";

export default function Icon({ name, className = "h-6 w-6", stroke = "currentColor", strokeWidth = 1.8 }) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS[BE_ICON_MAP[name]] ?? ICON_PATHS[FALLBACK_ICON];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths}
    </svg>
  );
}
