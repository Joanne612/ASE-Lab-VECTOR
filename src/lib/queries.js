import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { apiFetch } from "./api";

/* Key SWR berupa path string supaya mudah di-invalidate berdasarkan potongan path. */
function withQuery(path, params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/* ---------- QUERY ---------- */

export const useMe = () => useSWR("/users/me");

/** Akun milik user (Tunai, Kartu Bank, Tabungan, ...), dipakai untuk mengisi accountId transaksi. */
export const useAccounts = () => useSWR("/accounts");

/** Total & breakdown kategori. Header dan Statistik memakai key yang sama, jadi cukup satu request. */
export const useSummary = (range) => useSWR(range ? withQuery("/transactions/summary", range) : null);

export const TRANSACTIONS_PAGE_SIZE = 50;

export function useTransactions(range) {
  return useSWRInfinite((pageIndex, previousPage) => {
    if (!range) return null;
    if (previousPage && previousPage.meta.page >= previousPage.meta.totalPages) return null;
    return withQuery("/transactions", {
      ...range,
      page: pageIndex + 1,
      limit: TRANSACTIONS_PAGE_SIZE,
    });
  });
}

/** type: "EXPENSE" | "INCOME" (null = jangan fetch). Kategori sistem dan buatan user ikut dikembalikan. */
export const useCategories = (type) => useSWR(type ? withQuery("/categories", { type }) : null);

export const useSavingRatio = () => useSWR("/savings/ratio");

const postFetcher = ([path, body]) => apiFetch(path, { method: "POST", body });

/** Kalkulasi alokasi tidak mengubah data, jadi aman dijadikan data SWR walau memakai POST. */
export const useRatioCalculation = (input) =>
  useSWR(input ? ["/savings/ratio/calculate", input] : null, postFetcher);

/** BE menolak gap 0, jadi parameter hanya dikirim kalau masih ada kekurangan. */
export const useIncomeIdeas = (gapPerMonth) =>
  useSWR(withQuery("/income-ideas", { gap: gapPerMonth > 0 ? Math.ceil(gapPerMonth) : undefined }));

/* ---------- MUTASI ---------- */

export const createTransaction = (payload) =>
  apiFetch("/transactions", { method: "POST", body: payload });

/** Transfer antar akun; biaya admin (fee) dicatat BE sebagai pengeluaran dari akun asal. */
export const createTransfer = (payload) =>
  apiFetch("/transfers", { method: "POST", body: payload });

export const saveSavingRatio = (payload) =>
  apiFetch("/savings/ratio", { method: "PUT", body: payload });

/**
 * Revalidasi semua cache yang key-nya memuat `fragment`, termasuk key
 * useSWRInfinite ("$inf$/transactions?...") yang tidak ikut tersaring oleh
 * mutate(filter) bawaan SWR.
 */
export function useInvalidate() {
  const { cache, mutate } = useSWRConfig();

  return useCallback(
    (fragment) =>
      Promise.all(
        [...cache.keys()].filter((key) => key.includes(fragment)).map((key) => mutate(key)),
      ),
    [cache, mutate],
  );
}
