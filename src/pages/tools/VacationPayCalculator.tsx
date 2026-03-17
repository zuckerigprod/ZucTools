import { useState } from "react"
import { Palmtree } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { calculateNDFL } from "@/lib/utils/ndfl"
import { countCalendarDays } from "@/lib/utils/calendar"
import { AVG_MONTH_DAYS } from "@/lib/constants/tax-constants"

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]

interface MonthData {
  salary: string
  workedDays: string
}

function getMonthsBeforeDate(dateStr: string): { month: number; year: number; label: string }[] {
  if (!dateStr) {
    // последние 12 мес.
    const now = new Date()
    const months: { month: number; year: number; label: string }[] = []
    for (let i = 12; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      })
    }
    return months
  }

  const date = new Date(dateStr)
  const months: { month: number; year: number; label: string }[] = []
  for (let i = 12; i >= 1; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1)
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    })
  }
  return months
}

export default function VacationPayCalculator() {
  useSEO({
    title: "Калькулятор отпускных онлайн",
    description: "Рассчитайте отпускные с учётом среднего заработка, НДФЛ и производственного календаря. Формула с коэффициентом 29,3.",
  })

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [monthsData, setMonthsData] = useState<MonthData[]>(
    Array.from({ length: 12 }, () => ({ salary: "", workedDays: "" }))
  )

  const months = getMonthsBeforeDate(startDate)

  const updateMonth = (index: number, field: keyof MonthData, value: string) => {
    setMonthsData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // расчёт
  const startD = startDate ? new Date(startDate) : null
  const endD = endDate ? new Date(endDate) : null
  const vacationDays = startD && endD && endD >= startD ? countCalendarDays(startD, endD) : 0

  // заработок и дни
  let totalEarnings = 0
  let totalCalcDays = 0
  let hasData = false

  months.forEach((m, i) => {
    const salary = parseNumber(monthsData[i].salary)
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate()
    const workedDays = monthsData[i].workedDays
      ? parseNumber(monthsData[i].workedDays)
      : daysInMonth

    if (salary > 0) {
      hasData = true
      totalEarnings += salary
      if (workedDays >= daysInMonth) {
        // полный
        totalCalcDays += AVG_MONTH_DAYS
      } else {
        // неполный
        totalCalcDays += AVG_MONTH_DAYS / daysInMonth * workedDays
      }
    }
  })

  const sdz = totalCalcDays > 0 ? totalEarnings / totalCalcDays : 0
  const vacationPayGross = Math.round(sdz * vacationDays * 100) / 100
  const ndfl = calculateNDFL(vacationPayGross)
  const vacationPayNet = Math.round((vacationPayGross - ndfl) * 100) / 100

  const isValid = hasData && vacationDays > 0

  return (
    <CalculatorLayout
      icon={Palmtree}
      title="Калькулятор отпускных"
      description="Расчёт среднего заработка и отпускных"
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="vac-start" label="Начало отпуска" value={startDate} onChange={setStartDate} />
        <DateInput id="vac-end" label="Окончание отпуска" value={endDate} onChange={setEndDate} />
      </div>

      <div className="space-y-3">
        <Label>Заработок и отработанные дни за 12 месяцев</Label>
        <p className="text-xs text-muted-foreground -mt-1">Оставьте дни пустыми для полного месяца</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {months.map((m, i) => (
            <div key={`${m.year}-${m.month}`} className="rounded-lg border border-border/50 p-3 space-y-2 bg-secondary/20">
              <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Зарплата"
                  value={monthsData[i].salary}
                  onChange={(e) => updateMonth(i, "salary", e.target.value)}
                  className="bg-input/50 text-xs h-8"
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Дни"
                  value={monthsData[i].workedDays}
                  onChange={(e) => updateMonth(i, "workedDays", e.target.value)}
                  className="bg-input/50 text-xs h-8"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow label="Среднедневной заработок (СДЗ)" value={`${formatCurrency(sdz)} ₽`} copyValue={String(sdz)} />
          <ResultRow label="Дней отпуска" value={String(vacationDays)} />
          <ResultRow label="Отпускные (до НДФЛ)" value={`${formatCurrency(vacationPayGross)} ₽`} copyValue={String(vacationPayGross)} />
          <ResultRow label="НДФЛ" value={`${formatCurrency(ndfl)} ₽`} copyValue={String(ndfl)} />
          <ResultRow label="К выплате" value={`${formatCurrency(vacationPayNet)} ₽`} highlight copyValue={String(vacationPayNet)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Формула расчёта:</strong></p>
        <p>СДЗ = Сумма заработка / Количество расчётных дней</p>
        <p>Для полного месяца: 29,3 дня</p>
        <p>Для неполного: 29,3 / Кал. дней в месяце × Отработанных дней</p>
        <p>Отпускные = СДЗ × Дней отпуска</p>
        <p className="mt-2"><strong>НДФЛ:</strong> с 2025 года — прогрессивная шкала (13%–22%).</p>
        <p className="mt-2"><strong>Важно:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>В расчёт не включаются: больничные, отпускные, командировочные</li>
          <li>Праздничные дни не входят в число дней отпуска</li>
          <li>Отпускные выплачиваются за 3 дня до начала отпуска</li>
        </ul>
      </InfoSection>
    </CalculatorLayout>
  )
}
