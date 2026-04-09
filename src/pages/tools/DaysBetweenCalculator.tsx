import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { countCalendarDays, countWorkingDays, countWorkingHours } from "@/lib/utils/calendar"
import { formatNumber } from "@/lib/utils/format"
import { getHolidayList } from "@/lib/constants/production-calendar"

export default function DaysBetweenCalculator() {
  useSEO({
    title: "Дни между датами — калькулятор",
    description: "Рассчитайте количество календарных и рабочих дней между двумя датами с учётом производственного календаря РФ.",
    keywords: "дни между датами, рабочие дни между датами, календарные дни, количество дней, производственный календарь",
    jsonLd: buildToolJsonLd({ name: "Дни между датами", description: "Расчёт календарных и рабочих дней между двумя датами", url: "https://zuctools.ru/tools/days-between-calculator" }),
  })

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState("8")

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  const hpd = parseFloat(hoursPerDay) || 8
  const isValid = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start

  const calendarDays = isValid ? countCalendarDays(start, end) : 0
  const workingDays = isValid ? countWorkingDays(start, end) : 0
  const workingHours = isValid ? countWorkingHours(start, end, hpd) : 0

  const holidays2026 = getHolidayList(2026)

  return (
    <CalculatorLayout icon={CalendarDays} title="Дни между датами" description="Календарные и рабочие дни">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="start-date" label="Дата начала" value={startDate} onChange={setStartDate} />
        <DateInput id="end-date" label="Дата окончания" value={endDate} onChange={setEndDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hours-per-day">Часов в рабочем дне</Label>
        <Input
          id="hours-per-day"
          type="number"
          min="1"
          max="24"
          value={hoursPerDay}
          onChange={(e) => setHoursPerDay(e.target.value)}
          className="bg-input/50 max-w-32"
        />
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow label="Календарных дней" value={formatNumber(calendarDays)} />
          <ResultRow label="Рабочих дней" value={formatNumber(workingDays)} highlight />
          <ResultRow label="Рабочих часов" value={formatNumber(workingHours)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Производственный календарь 2026:</strong></p>
        <p>Расчёт ведётся с учётом праздничных и нерабочих дней, перенесённых рабочих суббот и предпраздничных сокращённых дней.</p>
        <p className="mt-2"><strong>Праздничные дни 2026:</strong></p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>1–8 января — Новогодние каникулы</li>
          <li>23 февраля — День защитника Отечества</li>
          <li>8 марта — Международный женский день</li>
          <li>1 мая — Праздник Весны и Труда</li>
          <li>9 мая — День Победы</li>
          <li>12 июня — День России</li>
          <li>4 ноября — День народного единства</li>
        </ul>
        {holidays2026.length > 0 && (
          <p className="mt-2 text-xs">Всего нерабочих праздничных дат: {holidays2026.length}</p>
        )}
      </InfoSection>
    </CalculatorLayout>
  )
}
