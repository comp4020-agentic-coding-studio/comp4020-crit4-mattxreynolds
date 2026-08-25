import { describe, expect, it } from "vitest";
import { PAD_DEFS } from "./pad-defs";

describe("pad-defs", () => {
  it("defines exactly the four pads", () => {
    expect(PAD_DEFS).toHaveLength(4);
  });

  it("gives every pad a distinct id", () => {
    const ids = PAD_DEFS.map((pad) => pad.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every pad a distinct key", () => {
    const keys = PAD_DEFS.map((pad) => pad.key.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses the A/S/D/F keys, in order", () => {
    expect(PAD_DEFS.map((pad) => pad.key)).toEqual(["A", "S", "D", "F"]);
  });
});
