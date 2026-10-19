import { useSyncExternalStore } from "react";
import { toLocalDateString } from "./format";

const subscribe = () => () => {};
const getToday = () => toLocalDateString(new Date());
const getServerToday = () => null;

/**
 * Tanggal hari ini ("YYYY-MM-DD") menurut zona waktu browser.
 * Bernilai null saat render di server, supaya HTML server dan client tidak
 * berbeda (server bisa berada di zona waktu lain atau di-render saat build).
 */
export function useToday() {
  return useSyncExternalStore(subscribe, getToday, getServerToday);
}
