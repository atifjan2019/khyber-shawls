const formatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
})

export function formatCurrency(value: unknown): string {
  const amount = Number(value ?? 0)
  if (Number.isNaN(amount)) {
    return "₨0"
  }
  return formatter.format(amount)
}
