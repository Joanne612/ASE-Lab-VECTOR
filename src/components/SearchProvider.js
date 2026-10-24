"use client";

import { createContext, useContext, useMemo, useState } from "react";

const SearchContext = createContext(null);

/**
 * Kata kunci kotak pencarian di header desktop. BE belum punya parameter
 * pencarian, jadi riwayat transaksi menyaring transaksi yang sudah dimuat.
 */
export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <SearchContext value={value}>{children}</SearchContext>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch harus dipakai di dalam <SearchProvider>.");
  return context;
}
