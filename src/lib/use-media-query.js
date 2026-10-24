import { useCallback, useSyncExternalStore } from "react";

/**
 * Apakah media query cocok di browser. Bernilai false saat render di server dan
 * selama hydrate, supaya HTML server sama dengan render pertama di client.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
