import { describe, expect, it } from "vitest";

import { pairActions, swapHref } from "./market-pairs";

describe("pairActions", () => {
  it("routes GLITCH pairs to OTC primary", () => {
    const actions = pairActions("GLITCH", "USDC");
    expect(actions[0]?.href).toBe("/glitch");
    expect(actions[0]?.label).toMatch(/OTC/i);
  });

  it("routes BUDJU/USDC to Jupiter swap", () => {
    const actions = pairActions("BUDJU", "USDC");
    expect(actions).toHaveLength(1);
    expect(actions[0]?.href).toBe(swapHref("BUDJU", "USDC"));
  });

  it("GLITCH/BUDJU offers OTC + BUDJU swap secondary", () => {
    const actions = pairActions("GLITCH", "BUDJU");
    expect(actions[0]?.href).toBe("/glitch");
    expect(actions.some((a) => a.href.includes("BUDJU"))).toBe(true);
  });
});
