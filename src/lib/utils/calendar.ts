import { isWorkingDay, isShortDay } from "@/lib/constants/production-calendar"
import { CB_RATE_HISTORY } from "@/lib/constants/tax-constants"

// календарные дни (обе даты включительно)
export function countCalendarDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / 86_400_000) + 1
}

// рабочие дни по произв. календарю
export function countWorkingDays(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  current.setHours(0, 0, 0, 0)
  const endTime = new Date(end).setHours(0, 0, 0, 0)
  while (current.getTime() <= endTime) {
    if (isWorkingDay(current)) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

// рабочие часы (с учётом сокращённых)
export function countWorkingHours(start: Date, end: Date, hoursPerDay = 8): number {
  let hours = 0
  const current = new Date(start)
  current.setHours(0, 0, 0, 0)
  const endTime = new Date(end).setHours(0, 0, 0, 0)
  while (current.getTime() <= endTime) {
    if (isWorkingDay(current)) {
      hours += isShortDay(current) ? hoursPerDay - 1 : hoursPerDay
    }
    current.setDate(current.getDate() + 1)
  }
  return hours
}

// ставка ЦБ на дату
export function getCBRateForDate(date: Date): number {
  const iso = toISODate(date)
  for (const entry of CB_RATE_HISTORY) {
    if (iso >= entry.from) return entry.rate
  }
  return CB_RATE_HISTORY[CB_RATE_HISTORY.length - 1].rate
}

// периоды ставки ЦБ (для пеней)
export interface CBRatePeriod {
  from: Date
  to: Date
  rate: number
  days: number
}

export function getCBRatePeriods(start: Date, end: Date): CBRatePeriod[] {
  const periods: CBRatePeriod[] = []
  const current = new Date(start)
  current.setHours(0, 0, 0, 0)
  const endClean = new Date(end)
  endClean.setHours(0, 0, 0, 0)

  while (current <= endClean) {
    const rate = getCBRateForDate(current)
    const periodStart = new Date(current)

    // ищем конец периода
    while (current <= endClean && getCBRateForDate(current) === rate) {
      current.setDate(current.getDate() + 1)
    }

    const periodEnd = new Date(current)
    periodEnd.setDate(periodEnd.getDate() - 1)

    const actualEnd = periodEnd > endClean ? endClean : periodEnd
    const days = countCalendarDays(periodStart, actualEnd)

    periods.push({ from: periodStart, to: actualEnd, rate, days })
  }

  return periods
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
