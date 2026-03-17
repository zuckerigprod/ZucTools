// праздники РФ
const HOLIDAYS_2024 = [
  "2024-01-01","2024-01-02","2024-01-03","2024-01-04","2024-01-05",
  "2024-01-06","2024-01-07","2024-01-08",
  "2024-02-23",
  "2024-03-08",
  "2024-05-01","2024-05-09",
  "2024-06-12",
  "2024-11-04",
  // переносы
  "2024-04-29","2024-04-30","2024-05-10",
  "2024-06-13",
  "2024-12-30","2024-12-31",
]

const HOLIDAYS_2025 = [
  "2025-01-01","2025-01-02","2025-01-03","2025-01-04","2025-01-05",
  "2025-01-06","2025-01-07","2025-01-08",
  "2025-02-24",
  "2025-03-10",
  "2025-05-01","2025-05-02",
  "2025-05-09",
  "2025-06-12","2025-06-13",
  "2025-11-03","2025-11-04",
  "2025-12-31",
]

const HOLIDAYS_2026 = [
  "2026-01-01","2026-01-02","2026-01-03","2026-01-04","2026-01-05",
  "2026-01-06","2026-01-07","2026-01-08",
  "2026-02-23",
  "2026-03-09",
  "2026-05-01","2026-05-04",
  "2026-05-11",
  "2026-06-12",
  "2026-11-04",
  "2026-12-31",
]

// сокращённые дни (−1 час)
const SHORT_DAYS_2024 = [
  "2024-02-22","2024-03-07","2024-04-27","2024-11-02","2024-12-28",
]

const SHORT_DAYS_2025 = [
  "2025-02-22","2025-03-07","2025-04-30","2025-06-11","2025-11-01","2025-12-30",
]

const SHORT_DAYS_2026 = [
  "2026-02-22","2026-03-07","2026-04-30","2026-06-11","2026-11-03","2026-12-30",
]

// рабочие субботы
const WORKING_SATURDAYS_2024 = ["2024-04-27","2024-11-02","2024-12-28"]
const WORKING_SATURDAYS_2025 = ["2025-11-01"]
const WORKING_SATURDAYS_2026: string[] = []

const holidaysByYear: Record<number, Set<string>> = {
  2024: new Set(HOLIDAYS_2024),
  2025: new Set(HOLIDAYS_2025),
  2026: new Set(HOLIDAYS_2026),
}

const shortDaysByYear: Record<number, Set<string>> = {
  2024: new Set(SHORT_DAYS_2024),
  2025: new Set(SHORT_DAYS_2025),
  2026: new Set(SHORT_DAYS_2026),
}

const workingSaturdaysByYear: Record<number, Set<string>> = {
  2024: new Set(WORKING_SATURDAYS_2024),
  2025: new Set(WORKING_SATURDAYS_2025),
  2026: new Set(WORKING_SATURDAYS_2026),
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function isHoliday(date: Date): boolean {
  const iso = toISODate(date)
  const year = date.getFullYear()
  const holidays = holidaysByYear[year]
  if (holidays) return holidays.has(iso)
  // если года нет — считаем только выходные
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

export function isWorkingDay(date: Date): boolean {
  const iso = toISODate(date)
  const year = date.getFullYear()
  const dow = date.getDay()
  const holidays = holidaysByYear[year]
  const workingSats = workingSaturdaysByYear[year]

  if (holidays && holidays.has(iso)) return false
  if (workingSats && workingSats.has(iso)) return true
  return dow !== 0 && dow !== 6
}

export function isShortDay(date: Date): boolean {
  const iso = toISODate(date)
  const year = date.getFullYear()
  const shorts = shortDaysByYear[year]
  return shorts ? shorts.has(iso) : false
}

// итоги по месяцу
export interface MonthWorkInfo {
  workDays: number
  workHours: number
}

export function getMonthWorkInfo(year: number, month: number): MonthWorkInfo {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let workDays = 0
  let workHours = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    if (isWorkingDay(date)) {
      workDays++
      workHours += isShortDay(date) ? 7 : 8
    }
  }
  return { workDays, workHours }
}

export function getHolidayList(year: number): string[] {
  const holidays = holidaysByYear[year]
  return holidays ? Array.from(holidays).sort() : []
}
