export interface LoanResult {
  monthlyPayment: number
  totalPaid: number
  totalInterest: number
}

export interface DifferentiatedResult {
  firstPayment: number
  lastPayment: number
  totalPaid: number
  totalInterest: number
}

export interface ScheduleRow {
  month: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

// аннуитет
export function calculateAnnuity(principal: number, annualRate: number, months: number): LoanResult {
  if (principal <= 0 || months <= 0) {
    return { monthlyPayment: 0, totalPaid: 0, totalInterest: 0 }
  }
  if (annualRate <= 0) {
    const monthlyPayment = Math.round(principal / months * 100) / 100
    return { monthlyPayment, totalPaid: monthlyPayment * months, totalInterest: 0 }
  }

  const r = annualRate / 100 / 12
  const monthlyPayment = Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1) * 100) / 100
  const totalPaid = Math.round(monthlyPayment * months * 100) / 100
  const totalInterest = Math.round((totalPaid - principal) * 100) / 100

  return { monthlyPayment, totalPaid, totalInterest }
}

// дифференцированный
export function calculateDifferentiated(principal: number, annualRate: number, months: number): DifferentiatedResult {
  if (principal <= 0 || months <= 0) {
    return { firstPayment: 0, lastPayment: 0, totalPaid: 0, totalInterest: 0 }
  }

  const schedule = generateSchedule(principal, annualRate, months, "differentiated")
  const firstPayment = schedule[0]?.payment ?? 0
  const lastPayment = schedule[schedule.length - 1]?.payment ?? 0
  const totalPaid = Math.round(schedule.reduce((s, r) => s + r.payment, 0) * 100) / 100
  const totalInterest = Math.round(schedule.reduce((s, r) => s + r.interest, 0) * 100) / 100

  return { firstPayment, lastPayment, totalPaid, totalInterest }
}

// график платежей
export function generateSchedule(
  principal: number,
  annualRate: number,
  months: number,
  type: "annuity" | "differentiated",
): ScheduleRow[] {
  if (principal <= 0 || months <= 0) return []

  const r = annualRate / 100 / 12
  const schedule: ScheduleRow[] = []
  let remaining = principal

  if (type === "annuity") {
    const payment = r > 0
      ? principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
      : principal / months

    for (let i = 1; i <= months; i++) {
      const interest = Math.round(remaining * r * 100) / 100
      const principalPart = Math.round((payment - interest) * 100) / 100
      remaining = Math.round((remaining - principalPart) * 100) / 100
      if (i === months) remaining = 0

      schedule.push({
        month: i,
        payment: Math.round(payment * 100) / 100,
        principal: principalPart,
        interest,
        remaining: Math.max(0, remaining),
      })
    }
  } else {
    const principalPart = Math.round(principal / months * 100) / 100

    for (let i = 1; i <= months; i++) {
      const interest = Math.round(remaining * r * 100) / 100
      const payment = Math.round((principalPart + interest) * 100) / 100
      remaining = Math.round((remaining - principalPart) * 100) / 100
      if (i === months) remaining = 0

      schedule.push({
        month: i,
        payment,
        principal: principalPart,
        interest,
        remaining: Math.max(0, remaining),
      })
    }
  }

  return schedule
}
