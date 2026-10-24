"use client";

import { usePathname } from "next/navigation";

// Halaman yang sudah punya desain desktop. Halaman lain tetap tampil sebagai kolom mobile di desktop.
const DESKTOP_PAGES = ["/homepage", "/target", "/ide", "/simulasi"];

export default function PageContainer({ children }) {
  const pathname = usePathname();
  const wide = DESKTOP_PAGES.includes(pathname);

  return <div className={`lg:pt-[35px] ${wide ? "" : "lg:mx-auto lg:max-w-[640px]"}`}>{children}</div>;
}
