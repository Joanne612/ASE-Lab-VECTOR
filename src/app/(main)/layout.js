import BackgroundLayer from "@/components/shell/BackgroundLayer";
import { DesktopBackgroundLayer } from "@/components/shell/DesktopBackground";
import DesktopHeader from "@/components/shell/DesktopHeader";
import DesktopNav from "@/components/shell/DesktopNav";
import Header from "@/components/shell/Header";
import MainMenu from "@/components/shell/MainMenu";
import PageContainer from "@/components/shell/PageContainer";
import { SearchProvider } from "@/components/SearchProvider";

/*
 * Kerangka bersama halaman utama: header (periode + ringkasan) dan menu utama.
 * Desktop (≥ lg): header lebar dari Figma dan menu pindah ke bawah layar.
 */
export default function MainLayout({ children }) {
  return (
    // isolate: BackgroundLayer memakai -z-10; tanpa stacking context sendiri,
    // lapisan itu tergambar di belakang bg-[#F1ECF5] milik main dan tidak terlihat.
    <main className="relative isolate min-h-screen overflow-hidden bg-[#F1ECF5] lg:font-(family-name:--font-poppins)">
      <BackgroundLayer />
      <DesktopBackgroundLayer fixed />
      <SearchProvider>
        <div className="relative z-10 mx-auto w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[1280px] lg:pb-[90px]">
          <Header />
          <DesktopHeader />
          <MainMenu />
          <PageContainer>{children}</PageContainer>
          {/* Di dalam lapisan konten supaya popup header tetap di atas menu. */}
          <DesktopNav />
        </div>
      </SearchProvider>
    </main>
  );
}
