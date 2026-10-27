const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

// Formats numeric API prices as stable US dollar strings.
export function formatMoney(value: number): string {
  return usdFormatter.format(value);
}
