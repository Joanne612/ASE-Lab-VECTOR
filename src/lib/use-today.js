import { useSyncExternalStore } from "react";
import { toAppDateString } from "./format";

const subscribe = () => () => {};
const getToday = () => toAppDateString(new Date());
const getServerToday = () => null;

/**
 * Tanggal hari ini ("YYYY-MM-DD") menurut WIB, zona yang sama dengan laporan BE.
 * Bernilai null saat render di server, supaya HTML server dan client tidak
 * berbeda (server bisa di-render saat build atau di hari yang berbeda).
 */
export function useToday() {
  return useSyncExternalStore(subscribe, getToday, getServerToday);
}
