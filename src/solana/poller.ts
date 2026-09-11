import { Connection, type ConfirmedSignatureInfo } from "@solana/web3.js";
import type { ChainWeather, Flight, PollHealth } from "../types";
import { flightFromSignature } from "../board/flights";
import { isCongested, percentile, weatherKind, weatherLine } from "../board/status";
import { FEE_WATCH, KNOWN_PROGRAMS } from "./programs";
import {
  DEFAULT_RPC,
  RPC_CANDIDATES,
  formatErr,
  hostOf,
  humanRpcError,
  isForbidden,
  isRateLimited,
} from "./rpc";

type PerfRow = {
  numTransactions: number;
  numSlots: number;
  samplePeriodSecs: number;
  numNonVoteTransactions?: number;
  numNonVoteTransaction?: number;
};

export type PollerHandlers = {
  onFlights: (flights: Flight[]) => void;
  onWeather: (weather: ChainWeather) => void;
  onHealth: (health: PollHealth, note: string) => void;
};

export class BoardPoller {
  readonly urls: string[];
  private index = 0;
  private connection: Connection;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private delayMs = 1800;
  private progCursor = 0;
  private seen = new Set<string>();
  private lastTps = 1600;
  private lastTxPerSlot = 400;
  private lastFeeP90 = 0;
  private lastPressure = 0;

  constructor(urls: string | string[], private readonly handlers: PollerHandlers) {
    this.urls = Array.isArray(urls) ? urls.filter(Boolean) : [urls];
    this.connection = this.makeConnection(this.urls[0] ?? DEFAULT_RPC);
  }

  get rpcUrl(): string {
    return this.urls[this.index] ?? this.urls[0] ?? DEFAULT_RPC;
  }

  rpcHost(): string {
    return hostOf(this.rpcUrl);
  }

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.delayMs = 1800;
    this.handlers.onHealth("listening", `asking ${this.rpcHost()} for the board…`);
    void this.tick();
  }

  stop(): void {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private makeConnection(url: string): Connection {
    return new Connection(url, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
    });
  }

  private schedule(): void {
    if (this.stopped) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.tick();
    }, this.delayMs);
  }

  private rotate(reason: string): boolean {
    if (this.index >= this.urls.length - 1) return false;
    this.index += 1;
    this.connection = this.makeConnection(this.rpcUrl);
    this.delayMs = 1800;
    this.handlers.onHealth("waiting", `${reason} Trying ${this.rpcHost()}.`);
    return true;
  }

  private async tick(): Promise<void> {
    try {
      const programs = nextPrograms(this.progCursor, 2);
      this.progCursor += 2;

      const [slotRes, feeRes, perfRes, ...sigRes] = await Promise.allSettled([
        this.connection.getSlot("confirmed"),
        this.connection.getRecentPrioritizationFees({
          lockedWritableAccounts: FEE_WATCH,
        }),
        this.connection.getRecentPerformanceSamples(4),
        ...programs.map((p) =>
          this.connection.getSignaturesForAddress(p.key, { limit: 10 }),
        ),
      ]);

      if (slotRes.status === "rejected") {
        throw slotRes.reason;
      }

      const slot = slotRes.value;
      const fees = feeRes.status === "fulfilled" ? feeRes.value : [];
      const perf = perfRes.status === "fulfilled" ? (perfRes.value as PerfRow[]) : [];

      const feeValues = fees.map((f) => f.prioritizationFee);
      this.lastFeeP90 = percentile(feeValues, 0.9);
      this.lastPressure = feeValues.length
        ? feeValues.filter((n) => n > 0).length / feeValues.length
        : 0;

      const latest = perf[0] ?? null;
      if (latest && latest.samplePeriodSecs > 0 && latest.numSlots > 0) {
        const nonVote =
          latest.numNonVoteTransactions ??
          latest.numNonVoteTransaction ??
          latest.numTransactions;
        this.lastTps = nonVote / latest.samplePeriodSecs;
        this.lastTxPerSlot = nonVote / latest.numSlots;
      }

      const congested = isCongested(this.lastFeeP90, this.lastPressure, this.lastTps);
      const kind = weatherKind(this.lastFeeP90, this.lastPressure, this.lastTps);
      const weather: ChainWeather = {
        slot,
        tps: this.lastTps,
        txPerSlot: this.lastTxPerSlot,
        feeP90: this.lastFeeP90,
        feePressure: this.lastPressure,
        congested,
        kind,
        line: weatherLine(kind, slot, this.lastTps, this.lastFeeP90),
      };
      this.handlers.onWeather(weather);

      const incoming: Flight[] = [];
      sigRes.forEach((res, i) => {
        if (res.status !== "fulfilled") return;
        const carrier = programs[i]?.name ?? "UNKNOWN";
        const rows = res.value as ConfirmedSignatureInfo[];
        for (const info of [...rows].reverse()) {
          if (this.seen.has(info.signature)) continue;
          this.seen.add(info.signature);
          incoming.push(flightFromSignature(info, carrier, congested));
        }
      });

      if (this.seen.size > 400) {
        const extra = [...this.seen].slice(0, this.seen.size - 280);
        for (const id of extra) this.seen.delete(id);
      }

      if (incoming.length > 0) {
        const cap = this.seen.size <= incoming.length + 4 ? 12 : 4;
        this.handlers.onFlights(incoming.slice(-cap));
      }

      this.delayMs = 1800;
      this.handlers.onHealth("ok", this.rpcHost());
    } catch (err) {
      const forbidden = isForbidden(err);
      if (forbidden && this.rotate("This hall is barred.")) {
        return;
      }
      const limited = isRateLimited(err);
      this.delayMs =
        limited || forbidden
          ? Math.min(this.delayMs * 2, 16_000)
          : Math.min(this.delayMs + 800, 8_000);
      this.handlers.onHealth(limited || forbidden ? "waiting" : "error", humanRpcError(err));
      if (!limited && !forbidden && formatErr(err).length === 0) {
        this.handlers.onHealth("error", "The tower missed a call. Holding, then asking again.");
      }
    } finally {
      this.schedule();
    }
  }
}

export { RPC_CANDIDATES, DEFAULT_RPC };

function nextPrograms(cursor: number, n: number) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    out.push(KNOWN_PROGRAMS[(cursor + i) % KNOWN_PROGRAMS.length]);
  }
  return out;
}
