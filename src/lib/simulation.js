import { apiFetch } from "@/lib/api";

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
    result.totalInvestment ?? result.totalCost ?? result.totalAmount ?? units * price,
  );
  const remainingCash = Number(
    result.remainingCash ?? result.remainingBalance ?? result.cashAfter ?? startingCash - total,
  );
  return { price, units, total, remainingCash };
};

export const formatRisk = (risk) =>
  ({ LOW: "Rendah", MEDIUM: "Sedang", HIGH: "Tinggi" })[risk] ?? risk ?? "-";
