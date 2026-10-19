"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { SWRConfig } from "swr";
import { PeriodProvider } from "@/components/PeriodProvider";
import { ApiError, fetcher } from "@/lib/api";

const MAX_RETRIES = 3;

export default function Providers({ children }) {
  const router = useRouter();

  const swrConfig = useMemo(
    () => ({
      fetcher,
      // Kuota rate limit BE kecil: jangan refetch setiap tab kembali fokus.
      revalidateOnFocus: false,
      onError(error) {
        // BFF sudah menghapus cookie, jadi proxy tidak akan memantulkan balik.
        if (error instanceof ApiError && error.status === 401) router.replace("/");
      },
      onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
        // Error 4xx tidak akan sembuh dengan mengulang.
        if (error instanceof ApiError && error.status < 500) return;
        if (retryCount >= MAX_RETRIES) return;
        setTimeout(() => revalidate({ retryCount }), 2000 * 2 ** retryCount);
      },
    }),
    [router],
  );

  return (
    <SWRConfig value={swrConfig}>
      <PeriodProvider>{children}</PeriodProvider>
    </SWRConfig>
  );
}
