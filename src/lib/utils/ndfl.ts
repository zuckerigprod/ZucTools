import { NDFL_SCALE_2025 } from "@/lib/constants/tax-constants"

// НДФЛ: с 2025 прогрессивная шкала, до 2025 — 13%
export function calculateNDFL(income: number, year = 2026): number {
  if (income <= 0) return 0

  if (year < 2025) {
    return Math.round(income * 0.13 * 100) / 100
  }

  // прогрессивка
  let tax = 0
  let remaining = income
  let prevLimit = 0

  for (const bracket of NDFL_SCALE_2025) {
    const bracketSize = bracket.limit === Infinity
      ? remaining
      : Math.min(remaining, bracket.limit - prevLimit)

    if (bracketSize <= 0) break

    tax += bracketSize * (bracket.rate / 100)
    remaining -= bracketSize
    prevLimit = bracket.limit
  }

  return Math.round(tax * 100) / 100
}
