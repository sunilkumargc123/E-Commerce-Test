import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it.each([
    [0, "$0.00"],
    [9.99, "$9.99"],
    [69.97000000000001, "$69.97"],
    [1234.5, "$1,234.50"]
  ])("formats %s as %s", (value, expected) => {
    expect(formatMoney(value)).toBe(expected);
  });
});
