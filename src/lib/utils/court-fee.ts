import { COURT_FEE_GENERAL, COURT_FEE_ARBITRATION } from "@/lib/constants/tax-constants"

// госпошлина
export function calculateCourtFee(amount: number, type: "general" | "arbitration"): number {
  if (amount <= 0) return 0

  const scale = type === "general" ? COURT_FEE_GENERAL : COURT_FEE_ARBITRATION
  const minFee = type === "general" ? 400 : 2000
  const maxFee = type === "general" ? 60_000 : 200_000

  let fee = 0

  for (const bracket of scale) {
    if (amount <= bracket.upTo) {
      fee = bracket.base + (amount - bracket.excess) * (bracket.rate / 100)
      break
    }
  }

  fee = Math.round(fee * 100) / 100

  return Math.max(minFee, Math.min(maxFee, fee))
}
