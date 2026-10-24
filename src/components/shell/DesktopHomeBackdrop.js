import HomeDashboard from "@/components/home/HomeDashboard";
import { DesktopBackgroundLayer } from "@/components/shell/DesktopBackground";
import DesktopHeader from "@/components/shell/DesktopHeader";
import DesktopNav from "@/components/shell/DesktopNav";
import { SearchProvider } from "@/components/SearchProvider";

/*
 * Halaman Rumah versi desktop sebagai latar modal pencatatan (sesuai Figma).
 * Dibuat inert agar tidak bisa difokus; menu bawah tetap bisa dipakai untuk pindah halaman.
 */
export default function DesktopHomeBackdrop() {
  return (
    <div className="hidden lg:block">
      <DesktopBackgroundLayer fixed />
      <SearchProvider>
        <div inert aria-hidden="true" className="relative z-10 mx-auto w-full max-w-[1280px] pb-[90px]">
          <DesktopHeader />
          <div className="pt-[35px]">
            <HomeDashboard />
          </div>
        </div>
        <DesktopNav activeHref="/homepage" />
      </SearchProvider>
    </div>
  );
}
