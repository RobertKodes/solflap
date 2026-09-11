import type { FlightStatus, WeatherKind } from "../types";

export const FEE_STORM = 25_000;
export const FEE_HAZY = 5_000;
export const PRESSURE_STORM = 0.45;
export const TPS_STORM = 3_500;

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[i] ?? 0;
}

export function isCongested(feeP90: number, feePressure: number, tps: number): boolean {
  return feeP90 >= FEE_STORM || feePressure >= PRESSURE_STORM || tps >= TPS_STORM;
}

export function weatherKind(feeP90: number, feePressure: number, tps: number): WeatherKind {
  if (isCongested(feeP90, feePressure, tps)) return "STORM";
  if (feeP90 >= FEE_HAZY || feePressure >= 0.2 || tps >= 2_400) return "HAZY";
  return "CLEAR";
}

export function classifyStatus(failed: boolean, congested: boolean): FlightStatus {
  if (failed) return "CANCELLED";
  if (congested) return "DELAYED";
  return "ON TIME";
}

export function weatherLine(kind: WeatherKind, slot: number, tps: number, feeP90: number): string {
  const tpsBit = Number.isFinite(tps) ? `${Math.round(tps)} TPS` : "TPS —";
  const feeBit =
    feeP90 <= 0 ? "FEE CALM" : feeP90 >= FEE_STORM ? "FEE HEAVY" : "FEE WARM";
  const sky =
    kind === "STORM"
      ? "WEATHER STORM"
      : kind === "HAZY"
        ? "WEATHER HAZY"
        : kind === "HOLD"
          ? "WEATHER HOLD"
          : kind === "DARK"
            ? "WEATHER DARK"
            : "WEATHER CLEAR";
  return `SLOT ${slot || "—"}  ·  ${sky}  ·  ${tpsBit}  ·  ${feeBit}`;
}
