"use client";

import useSWR from "swr";
import { DesktopBackgroundLayer } from "@/components/shell/DesktopBackground";
import DesktopHeader from "@/components/shell/DesktopHeader";
import DesktopNav from "@/components/shell/DesktopNav";
import { SearchProvider } from "@/components/SearchProvider";

/*
 * Kerangka desktop (≥ lg) untuk halaman simulasi di luar grup (main): latar, header,
 * dan menu bawah seperti halaman utama. Di bawah lg hanya meneruskan children.
 *
 * /saham dan /reksadana sengaja publik. Header memuat data akun, dan error 401
 * di SWR global memantulkan ke halaman login, jadi header baru dirender setelah
 * /users/me terbukti berhasil (error di sini diabaikan untuk tamu).
 */
export default function SimulationShell({ children }) {
  const { data: me } = useSWR("/users/me", { onError: () => {}, shouldRetryOnError: false });

  return (
    // Kelas posisi hanya di lg, supaya tumpukan (z-index) halaman mobile tidak berubah.
    <div className="lg:relative lg:isolate lg:min-h-screen lg:font-(family-name:--font-poppins)">
      <DesktopBackgroundLayer fixed />
      <SearchProvider>
        <div className="lg:relative lg:z-10 lg:mx-auto lg:w-full lg:max-w-[1280px] lg:pb-[90px]">
          {me ? <DesktopHeader /> : <div aria-hidden="true" className="hidden h-[289px] lg:block" />}
          <div className="lg:pt-[27px]">{children}</div>
          {me && <DesktopNav activeHref="/simulasi" />}
        </div>
      </SearchProvider>
    </div>
  );
}
