import { describe, expect, it } from "vitest";

import { glitchPairUiMeta, pairActions, swapHref } from "./market-pairs";

describe("pairActions", () => {
  it("routes GLITCH pairs to SOL OTC primary", () => {
    const actions = pairActions("GLITCH", "USDC");
    expect(actions[0]?.href).toBe("/glitch");
    expect(actions[0]?.label).toMatch(/SOL/i);
  });

  it("routes BUDJU/USDC to Jupiter swap", () => {
    const actions = pairActions("BUDJU", "USDC");
    expect(actions).toHaveLength(1);
    expect(actions[0]?.href).toBe(swapHref("BUDJU", "USDC"));
  });

  it("GLITCH/BUDJU offers SOL OTC + BUDJU swap secondary", () => {
    const actions = pairActions("GLITCH", "BUDJU");
    expect(actions[0]?.href).toBe("/glitch");
    expect(actions.some((a) => a.label.includes("not §GLITCH"))).toBe(true);
  });
});

describe("glitchPairUiMeta", () => {
  it("marks GLITCH/SOL as featured OTC", () => {
    const meta = glitchPairUiMeta("GLITCH", "SOL");
    expect(meta?.featuredOtc).toBe(true);
  });

  it("USDC quote is reference only", () => {
    const meta = glitchPairUiMeta("GLITCH", "USDC");
    expect(meta?.featuredOtc).toBeFalsy();
    expect(meta?.subtitle).toMatch(/SOL only/i);
  });
});
