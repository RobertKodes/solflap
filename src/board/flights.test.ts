import { describe, expect, it } from "vitest";
import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import { flightFromSignature, flightNoFromSig, mergeFlights } from "./flights";
import { padFlap } from "./charset";

const sig = "5".repeat(64) + "abCd";

function fake(partial: Partial<ConfirmedSignatureInfo> = {}): ConfirmedSignatureInfo {
  return {
    signature: sig,
    slot: 312841102,
    err: null,
    memo: null,
    blockTime: 1_700_000_000,
    confirmationStatus: "confirmed",
    ...partial,
  };
}

describe("flight mapping", () => {
  it("builds a flight number from the signature tail", () => {
    expect(flightNoFromSig(sig)).toBe("SFABCD");
  });

  it("pads flap columns", () => {
    expect(padFlap("jupiter", 8)).toBe("JUPITER ");
    expect(padFlap("CANCELLED!", 9)).toBe("CANCELLED");
  });

  it("maps a failed signature to cancelled", () => {
    const flight = flightFromSignature(fake({ err: "InstructionError" }), "JUPITER", false);
    expect(flight.status).toBe("CANCELLED");
    expect(flight.carrier).toBe("JUPITER");
    expect(flight.flightNo).toBe("SFABCD");
  });

  it("maps a congested window to delayed", () => {
    const flight = flightFromSignature(fake(), "RAYDIUM", true);
    expect(flight.status).toBe("DELAYED");
  });

  it("rolls older flights off the top", () => {
    const current = [1, 2, 3].map((n) => ({
      id: `old-${n}`,
      flightNo: `SF000${n}`,
      carrier: "TOKEN",
      slot: n,
      status: "ON TIME" as const,
      blockTime: null,
    }));
    const incoming = [
      {
        id: "new-4",
        flightNo: "SF0004",
        carrier: "ORCA",
        slot: 4,
        status: "ON TIME" as const,
        blockTime: null,
      },
    ];
    const next = mergeFlights(current, incoming, 3);
    expect(next.map((f) => f.id)).toEqual(["old-2", "old-3", "new-4"]);
  });
});
