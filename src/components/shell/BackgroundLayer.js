export default function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[#f3ecfa] bg-[url('/nama-background.png')] bg-cover bg-top bg-no-repeat">
      {/* fade out ke bawah */}
      <div
        className="absolute left-0 right-0 top-0 h-[400px]"
        style={{
          backgroundImage: `url(/login-mobile-atas.webp)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
        }}
      />

      {/* fade di atas dan kiri */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[320px]"
        style={{
          backgroundImage: `url(/login-mobile-bawah.webp)`,
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          opacity: 0.2,
          WebkitMaskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          maskComposite: "intersect",
        }}
      />
    </div>
  );
}
