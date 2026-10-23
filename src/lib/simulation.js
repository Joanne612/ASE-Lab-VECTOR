import { ApiError, apiFetch } from "@/lib/api";

const ROOT = "/simulation";

export const instrumentListPath = (type) =>
  `${ROOT}/instruments${type ? `?type=${encodeURIComponent(type)}` : ""}`;

export const instrumentPath = (code) => `${ROOT}/instruments/${encodeURIComponent(code)}`;

export const instrumentHistoryPath = (code, range = "MONTH") =>
  `${instrumentPath(code)}/history?range=${encodeURIComponent(range)}`;

export const sessionPath = (id) => `${ROOT}/sessions/${encodeURIComponent(id)}`;

export const previewSimulation = (payload) =>
  apiFetch(`${ROOT}/sessions/preview`, { method: "POST", body: payload });

export const createSimulation = (payload) =>
  apiFetch(`${ROOT}/sessions`, { method: "POST", body: payload });

export const advanceSimulation = (id) =>
  apiFetch(`${sessionPath(id)}/advance`, { method: "POST" });

/**
 * Maju satu checkpoint. BE menjawab 409 kalau sesi sudah dimajukan request
 * lain (tombol ditekan dua kali) atau sudah selesai; itu bukan error bagi user,
 * cukup muat ulang sesinya. Mengembalikan null untuk kasus itu.
 */
export async function advanceSimulationSafely(id) {
  try {
    return await advanceSimulation(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return null;
    throw error;
  }
}

// 4 checkpoint, ditambah ruang untuk 409 dari request yang bersamaan.
const MAX_ADVANCE_ATTEMPTS = 8;

/** Majukan sesi sampai checkpoint terakhir, untuk alur yang langsung ke hasil. */
export async function finishSimulation(id) {
  for (let attempt = 0; attempt < MAX_ADVANCE_ATTEMPTS; attempt++) {
    const session = (await advanceSimulationSafely(id)) ?? (await apiFetch(sessionPath(id)));
    if (session?.status === "FINISHED") return session;
  }
  return apiFetch(sessionPath(id));
}

export const unwrapSimulationData = (response) => response?.data ?? response;

export const simulationInstruments = (response) => {
  const value = unwrapSimulationData(response);
  return Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
};

export const simulationSessions = (response) => {
  const value = unwrapSimulationData(response);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.sessions)) return value.sessions;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const simulationSession = (response) => {
  const value = unwrapSimulationData(response);
  return value?.session ?? value;
};

export const simulationSessionId = (response) => {
  const session = simulationSession(response);
  return session?.id ?? session?.sessionId ?? null;
};

export const simulationEstimate = (response, instrument, amount, startingCash) => {
  const result = unwrapSimulationData(response) ?? {};
  const price = Number(result.price ?? result.unitPrice ?? instrument.price);
  const units = Number(
    result.units ?? result.quantity ?? result.shares ?? Math.floor(amount / price),
  );
  const total = Number(
    result.investedAmount ?? result.totalInvestment ?? result.totalCost ?? result.totalAmount ?? units * price,
  );
  const remainingCash = Number(
    result.cashLeft ?? result.remainingCash ?? result.remainingBalance ?? result.cashAfter ?? startingCash - total,
  );
  return { price, units, total, remainingCash };
};

export const formatRisk = (risk) =>
  ({ LOW: "Rendah", MEDIUM: "Sedang", HIGH: "Tinggi" })[risk] ?? risk ?? "-";

/** Tanda untuk keuntungan/kerugian; simulasi bisa rugi, jadi "+" tidak boleh ditulis mati. */
export const signOf = (value) => (Number(value) < 0 ? "-" : "+");

/**
 * Path SVG untuk grafik viewBox 0..100. points: [[x, y], ...], mis. [hari, nilai].
 * 0 = paling atas; garis dijaga di rentang 3..98 seperti mockup.
 */
export function chartPath(points) {
  if (points.length === 0) return "";

  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;

  return points
    .map(([x, y], index) => {
      const px = ((x - minX) / spanX) * 100;
      const py = 98 - ((y - minY) / spanY) * 95;
      return `${index === 0 ? "M" : "L"} ${px},${py}`;
    })
    .join(" ");
}

/** Label sumbu Y dari atas ke bawah, format ringkas "Rp 512,3k". */
export function chartLabels(values, count = 5) {
  if (values.length === 0) return [];

  const max = Math.max(...values);
  const min = Math.min(...values);
  return Array.from({ length: count }, (_, index) => {
    const value = max - ((max - min) * index) / (count - 1);
    return `Rp ${(value / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}k`;
  });
}
