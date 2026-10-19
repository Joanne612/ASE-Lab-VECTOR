import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false saat render di server dan selama hydrate, true setelahnya.
 *
 * Input terkontrol yang sudah tampil dari HTML server bisa diketik sebelum
 * JavaScript siap; ketikan itu hilang begitu React mengambil alih. Form yang
 * seperti itu dinonaktifkan dulu sampai hook ini bernilai true.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
