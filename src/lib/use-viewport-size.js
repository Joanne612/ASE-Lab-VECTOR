import { useSyncExternalStore } from "react";

let cached = null;

const subscribe = (onChange) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};

// Objek di-cache supaya referensinya tetap sama selama ukuran layar tidak berubah.
const getSnapshot = () => {
  if (!cached || cached.width !== window.innerWidth || cached.height !== window.innerHeight) {
    cached = { width: window.innerWidth, height: window.innerHeight };
  }
  return cached;
};

/** Ukuran layar browser; null saat render di server dan selama hydrate. */
export function useViewportSize() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/**
 * Skala tata letak desktop yang ukurannya mengikuti frame Figma 1280px:
 * 1 mulai 1280px, lebih kecil di layar yang lebih sempit (dipakai dengan CSS zoom).
 */
export function useDesktopScale() {
  const size = useViewportSize();
  return { size, scale: size ? Math.min(1, size.width / 1280) : 1 };
}
