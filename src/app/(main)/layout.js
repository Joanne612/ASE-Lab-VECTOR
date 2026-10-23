import BackgroundLayer from "@/components/shell/BackgroundLayer";
import Header from "@/components/shell/Header";
import MainMenu from "@/components/shell/MainMenu";

/* Kerangka bersama halaman utama: header (periode + ringkasan) dan menu utama. */
export default function MainLayout({ children }) {
  return (
    // isolate: BackgroundLayer memakai -z-10; tanpa stacking context sendiri,
    // lapisan itu tergambar di belakang bg-[#F1ECF5] milik main dan tidak terlihat.
    <main className="relative isolate min-h-screen overflow-hidden bg-[#F1ECF5]">
      <BackgroundLayer />
      <div className="relative z-10 mx-auto w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px]">
        <Header />
        <MainMenu />
        {children}
      </div>
    </main>
  );
}
