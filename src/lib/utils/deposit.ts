export interface DepositResult {
  totalInterest: number
  finalAmount: number
  effectiveRate: number
  ndfl: number
}

// расчёт вклада
export function calculateDeposit(
  amount: number,
  annualRate: number,
  months: number,
  capitalization: "monthly" | "quarterly" | "yearly" | "none",
  monthlyTopUp = 0,
): DepositResult {
  if (amount <= 0 || months <= 0 || annualRate <= 0) {
    return { totalInterest: 0, finalAmount: amount, effectiveRate: 0, ndfl: 0 }
  }

  const rate = annualRate / 100
  let balance = amount
  let totalInterest = 0
  let totalDeposited = amount

  // период капитализации (мес.)
  const capPeriod = capitalization === "monthly" ? 1
    : capitalization === "quarterly" ? 3
    : capitalization === "yearly" ? 12
    : 0 // без капитализации

  if (capPeriod === 0) {
    // простые проценты
    for (let m = 1; m <= months; m++) {
      balance += monthlyTopUp
      if (m > 1) totalDeposited += monthlyTopUp
    }
    totalInterest = Math.round(amount * rate * months / 12 * 100) / 100
    // проценты на пополнения
    if (monthlyTopUp > 0) {
      for (let m = 2; m <= months; m++) {
        totalInterest += Math.round(monthlyTopUp * rate * (months - m + 1) / 12 * 100) / 100
      }
    }
    totalInterest = Math.round(totalInterest * 100) / 100
    balance = totalDeposited + totalInterest
  } else {
    // с капитализацией
    let accruedInterest = 0

    for (let m = 1; m <= months; m++) {
      if (m > 1) {
        balance += monthlyTopUp
        totalDeposited += monthlyTopUp
      }

      const monthlyInterest = balance * rate / 12
      accruedInterest += monthlyInterest
      totalInterest += monthlyInterest

      if (m % capPeriod === 0 || m === months) {
        balance += accruedInterest
        accruedInterest = 0
      }
    }

    totalInterest = Math.round(totalInterest * 100) / 100
    balance = Math.round(balance * 100) / 100
  }

  // эфф. ставка
  const effectiveRate = totalDeposited > 0
    ? Math.round(totalInterest / totalDeposited * 12 / months * 100 * 100) / 100
    : 0

  // ндфл на проценты (порог = 1 млн × ставка ЦБ)
  const taxFreeThreshold = 1_000_000 * 21 / 100 * (months / 12)
  const taxableInterest = Math.max(0, totalInterest - taxFreeThreshold)
  const ndfl = Math.round(taxableInterest * 0.13 * 100) / 100

  return {
    totalInterest,
    finalAmount: Math.round((totalDeposited + totalInterest) * 100) / 100,
    effectiveRate,
    ndfl,
  }
}
