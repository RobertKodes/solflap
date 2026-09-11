import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import type { Flight } from "../types";
import { classifyStatus } from "./status";
import { padFlap } from "./charset";

export const MAX_ROWS = 12;
export const MIN_ROWS = 8;

export function flightNoFromSig(sig: string): string {
  const tail = sig.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  return `SF${tail.padStart(4, "0").slice(0, 4)}`;
}

export function flightFromSignature(
  info: ConfirmedSignatureInfo,
  carrier: string,
  congested: boolean,
): Flight {
  return {
    id: info.signature,
    flightNo: flightNoFromSig(info.signature),
    carrier: padFlap(carrier, 10).trim() || "UNKNOWN",
    slot: info.slot,
    status: classifyStatus(info.err != null, congested),
    blockTime: info.blockTime ?? null,
  };
}

export function mergeFlights(current: Flight[], incoming: Flight[], cap = MAX_ROWS): Flight[] {
  const have = new Set(current.map((f) => f.id));
  const fresh = incoming.filter((f) => !have.has(f.id));
  if (fresh.length === 0) return current;
  const next = [...current, ...fresh];
  return next.length > cap ? next.slice(next.length - cap) : next;
}
