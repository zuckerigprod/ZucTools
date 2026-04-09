import { useState, useMemo } from "react"
import { CalendarRange } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import ResultRow from "@/components/calculator/ResultRow"
import {
  isHoliday,
  isWorkingDay,
  isShortDay,
  getMonthWorkInfo,
  getHolidayList,
} from "@/lib/constants/production-calendar"
import { formatNumber } from "@/lib/utils/format"

const YEARS = ["2024", "2025", "2026"]
const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]
const SHORT_DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

function MiniCalendar({ year, month }: { year: number; month: number }) {
  const info = getMonthWorkInfo(year, month)
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // пн=0..вс=6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{MONTH_NAMES[month]}</span>
        <span className="text-xs text-muted-foreground">{info.workDays} дн. / {info.workHours} ч.</span>
      </div>
      <div className="grid grid-cols-7 gap-px text-center text-xs">
        {SHORT_DAY_NAMES.map((d) => (
          <div key={d} className="py-0.5 text-muted-foreground font-medium">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />

          const date = new Date(year, month, day)
          const dateISO = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isToday = dateISO === todayISO
          const holiday = isHoliday(date)
          const working = isWorkingDay(date)
          const short = isShortDay(date)
          const dow = date.getDay()
          const isWeekend = dow === 0 || dow === 6

          let colorClass = ""
          if (holiday && !working) {
            colorClass = "text-rose-500 font-semibold"
          } else if (short) {
            colorClass = "text-amber-500 font-semibold"
          } else if (isWeekend && !working) {
            colorClass = "text-sky-400 dark:text-sky-500"
          }

          return (
            <div
              key={i}
              className={`py-0.5 rounded-sm ${colorClass} ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProductionCalendar() {
  useSEO({
    title: "Производственный календарь 2024–2026",
    description: "Производственный календарь РФ с праздниками, выходными и сокращёнными днями на 2024, 2025 и 2026 годы.",
    keywords: "производственный календарь, производственный календарь 2025, производственный календарь 2026, рабочие дни, праздничные дни РФ",
    jsonLd: buildToolJsonLd({ name: "Производственный календарь 2024–2026", description: "Производственный календарь РФ с праздниками и рабочими днями", url: "https://zuctools.ru/tools/production-calendar" }),
  })

  const [year, setYear] = useState("2026")
  const y = parseInt(year)

  const yearStats = useMemo(() => {
    let totalWorkDays = 0
    let totalWorkHours = 0
    let totalCalendarDays = 0
    const quarters: { workDays: number; workHours: number; calendarDays: number }[] = []

    for (let q = 0; q < 4; q++) {
      let qWorkDays = 0
      let qWorkHours = 0
      let qCalendarDays = 0
      for (let m = q * 3; m < q * 3 + 3; m++) {
        const info = getMonthWorkInfo(y, m)
        const daysInMonth = new Date(y, m + 1, 0).getDate()
        qWorkDays += info.workDays
        qWorkHours += info.workHours
        qCalendarDays += daysInMonth
      }
      quarters.push({ workDays: qWorkDays, workHours: qWorkHours, calendarDays: qCalendarDays })
      totalWorkDays += qWorkDays
      totalWorkHours += qWorkHours
      totalCalendarDays += qCalendarDays
    }

    return { totalWorkDays, totalWorkHours, totalCalendarDays, quarters }
  }, [y])

  const holidays = useMemo(() => getHolidayList(y), [y])

  return (
    <CalculatorLayout icon={CalendarRange} title="Производственный календарь" description={`Рабочие и праздничные дни ${year} года`} maxWidth="max-w-4xl">
      <div className="space-y-2">
        <Label>Год</Label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="bg-input/50 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* сводка */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultRow label="Рабочих дней" value={formatNumber(yearStats.totalWorkDays)} />
        <ResultRow label="Рабочих часов" value={formatNumber(yearStats.totalWorkHours)} />
        <ResultRow label="Календарных дней" value={formatNumber(yearStats.totalCalendarDays)} />
      </div>

      {/* месяцы */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, m) => (
          <MiniCalendar key={m} year={y} month={m} />
        ))}
      </div>

      {/* кварталы */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="text-left py-2 font-medium">Квартал</th>
              <th className="text-right py-2 font-medium">Рабочих дней</th>
              <th className="text-right py-2 font-medium">Рабочих часов</th>
              <th className="text-right py-2 font-medium">Календарных дней</th>
            </tr>
          </thead>
          <tbody>
            {yearStats.quarters.map((q, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-1.5">{i + 1} квартал</td>
                <td className="py-1.5 text-right">{q.workDays}</td>
                <td className="py-1.5 text-right">{q.workHours}</td>
                <td className="py-1.5 text-right">{q.calendarDays}</td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="py-1.5">Итого</td>
              <td className="py-1.5 text-right">{yearStats.totalWorkDays}</td>
              <td className="py-1.5 text-right">{yearStats.totalWorkHours}</td>
              <td className="py-1.5 text-right">{yearStats.totalCalendarDays}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* легенда */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-rose-500" />
          <span className="text-muted-foreground">Праздники</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-sky-400 dark:bg-sky-500" />
          <span className="text-muted-foreground">Выходные</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-muted-foreground">Сокращённые дни</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm ring-1 ring-primary" />
          <span className="text-muted-foreground">Сегодня</span>
        </div>
      </div>

      {/* праздники */}
      {holidays.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Праздничные дни {year}:</p>
          <p>{holidays.length} дней</p>
        </div>
      )}
    </CalculatorLayout>
  )
}
