import { describe, expect, it } from "vitest";
import { KNOWN_PROGRAMS } from "./programs";

describe("known programs", () => {
  it("loads a usable rotation of valid pubkeys", () => {
    expect(KNOWN_PROGRAMS.length).toBeGreaterThan(10);
    for (const program of KNOWN_PROGRAMS) {
      expect(program.key.toBase58()).toBe(program.id);
      expect(program.name.length).toBeGreaterThan(0);
    }
  });
});
