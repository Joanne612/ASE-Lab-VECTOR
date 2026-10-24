/*
 * Latar versi desktop (≥ lg) dari frame Figma 1280×832, dipakai halaman login/register
 * dan halaman utama. Di bawah lg tersembunyi; mobile memakai latar masing-masing.
 */

/* Posisi dari frame desktop Figma (1280×832), dalam persen agar ikut menskala. */
function frameBox(x, y, w, h) {
  return {
    left: `${(x / 1280) * 100}%`,
    top: `${(y / 832) * 100}%`,
    width: `${(w / 1280) * 100}%`,
    height: `${(h / 832) * 100}%`,
  };
}

/*
 * Satu sisi frame desktop: setinggi layar dan menempel ke tepi kiri atau kanan.
 * Dekorasi kiri dan kanan dipisah agar tetap di tepi layar pada rasio layar apa pun.
 */
export function FrameSide({ side, className = "", children }) {
  return (
    <div className={`absolute top-0 aspect-[1280/832] h-full ${side === "left" ? "left-0" : "right-0"} ${className}`}>
      {children}
    </div>
  );
}

/* Tepi potongan background dipudarkan agar tidak tampak sebagai garis di layar lebar. */
function fadeEdges(...gradients) {
  const mask = gradients.join(", ");
  return { WebkitMaskImage: mask, WebkitMaskComposite: "source-in", maskImage: mask, maskComposite: "intersect" };
}

/* Potongan gambar: kotak pada frame + letak gambar di dalam kotak (persen, dari Figma). */
export function FrameImage({ src, box, crop = { left: "0%", top: "0%", width: "100%", height: "100%" }, fade }) {
  return (
    <div className="absolute overflow-hidden" style={{ ...frameBox(...box), ...fade }}>
      <div
        className="absolute bg-no-repeat [background-size:100%_100%]"
        style={{ backgroundImage: `url(${src})`, ...crop }}
      />
    </div>
  );
}

/*
 * LAYER 1 (DESKTOP) — BACKGROUND: potongan ilustrasi Figma di sudut layar.
 * fixed: menempel ke layar, untuk halaman yang bisa di-scroll lebih tinggi dari layar.
 */
export function DesktopBackgroundLayer({ fixed = false }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 z-0 hidden overflow-hidden bg-[#F2EAE8] lg:block`}
    >
      <FrameSide side="right">
        {/* dompet */}
        <FrameImage
          src="/desktop-bg.webp"
          box={[672, 3, 608, 405]}
          crop={{ left: "-146.48%", top: "0%", width: "255.91%", height: "216.32%" }}
          fade={fadeEdges("linear-gradient(to bottom, #000 85%, transparent)", "linear-gradient(to right, transparent, #000 15%)")}
        />
        {/* HP */}
        <FrameImage
          src="/desktop-bg.webp"
          box={[745, 638, 553, 334]}
          crop={{ left: "-146.97%", top: "-129.83%", width: "246.97%", height: "229.83%" }}
          fade={fadeEdges("linear-gradient(to top, #000 80%, transparent)", "linear-gradient(to right, transparent, #000 20%)")}
        />
      </FrameSide>
      <FrameSide side="left">
        {/* kartu, koin, dan buku */}
        <FrameImage
          src="/desktop-bg.webp"
          box={[-4, 0, 601, 832]}
          crop={{ left: "0%", top: "0%", width: "245.88%", height: "100%" }}
          fade={fadeEdges("linear-gradient(to left, transparent, #000 15%)")}
        />
      </FrameSide>
    </div>
  );
}
