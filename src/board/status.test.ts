import { describe, expect, it } from "vitest";
import {
  classifyStatus,
  isCongested,
  percentile,
  weatherKind,
  weatherLine,
} from "./status";

describe("classifyStatus", () => {
  it("cancels failed txs first", () => {
    expect(classifyStatus(true, true)).toBe("CANCELLED");
    expect(classifyStatus(true, false)).toBe("CANCELLED");
  });

  it("marks congestion as delayed", () => {
    expect(classifyStatus(false, true)).toBe("DELAYED");
  });

  it("is on time when the window is calm", () => {
    expect(classifyStatus(false, false)).toBe("ON TIME");
  });
});

describe("weather", () => {
  it("reads a high percentile from fees", () => {
    expect(percentile([1, 2, 3, 4, 100], 0.9)).toBe(100);
    expect(percentile([], 0.9)).toBe(0);
  });

  it("flags a storm from fee or tps", () => {
    expect(isCongested(30_000, 0, 100)).toBe(true);
    expect(isCongested(0, 0.6, 100)).toBe(true);
    expect(isCongested(0, 0, 4_000)).toBe(true);
    expect(isCongested(100, 0.05, 800)).toBe(false);
  });

  it("names the sky", () => {
    expect(weatherKind(100, 0.05, 800)).toBe("CLEAR");
    expect(weatherKind(8_000, 0.1, 800)).toBe("HAZY");
    expect(weatherKind(40_000, 0.1, 800)).toBe("STORM");
  });

  it("writes a single weather line", () => {
    const line = weatherLine("CLEAR", 312841102, 1842.4, 0);
    expect(line).toContain("SLOT 312841102");
    expect(line).toContain("WEATHER CLEAR");
    expect(line).toContain("1842 TPS");
    expect(line).toContain("FEE CALM");
  });
});
