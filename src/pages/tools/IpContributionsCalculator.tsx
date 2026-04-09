import { useState } from "react"
import { Shield } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { IP_CONTRIBUTIONS } from "@/lib/constants/tax-constants"

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020]

function daysInYear(year: number): number {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / 86_400_000) + 1
}

export default function IpContributionsCalculator() {
  useSEO({
    title: "Страховые взносы ИП — калькулятор",
    description: "Рассчитайте фиксированные страховые взносы ИП за себя и 1% с доходов свыше 300 000 ₽. Актуальные данные 2020–2026.",
    keywords: "страховые взносы ИП, фиксированные взносы ИП, взносы ИП 2025, взносы ИП 2026, 1 процент свыше 300000, ПФР ИП",
    jsonLd: buildToolJsonLd({ name: "Страховые взносы ИП", description: "Расчёт фиксированных взносов ИП и 1% с доходов свыше 300 000 руб.", url: "https://zuctools.ru/tools/ip-contributions-calculator" }),
  })

  const [year, setYear] = useState("2026")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [income, setIncome] = useState("")

  const y = parseInt(year)
  const contrib = IP_CONTRIBUTIONS[y]
  const incomeVal = parseNumber(income)
  const totalDays = daysInYear(y)

  const yearStart = new Date(y, 0, 1)
  const yearEnd = new Date(y, 11, 31)
  const start = startDate ? new Date(startDate) : yearStart
  const end = endDate ? new Date(endDate) : yearEnd

  // рамки года
  const effectiveStart = start < yearStart ? yearStart : start
  const effectiveEnd = end > yearEnd ? yearEnd : end
  const activeDays = effectiveStart <= effectiveEnd ? daysBetween(effectiveStart, effectiveEnd) : 0

  const proportion = activeDays / totalDays
  const fixedPart = contrib ? Math.round(contrib.fixed * proportion * 100) / 100 : 0

  // 1% сверх 300к
  const variablePart = incomeVal > 300_000
    ? Math.round((incomeVal - 300_000) * 0.01 * 100) / 100
    : 0

  // лимит
  const maxVariable = contrib ? contrib.maxVariable : 0
  const cappedVariable = Math.min(variablePart, maxVariable)

  const total = fixedPart + cappedVariable

  return (
    <CalculatorLayout icon={Shield} title="Страховые взносы ИП" description="Фиксированные взносы и 1% с доходов">
      <div className="space-y-2">
        <Label>Год</Label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="bg-input/50 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="ip-start" label="Начало деятельности" value={startDate} onChange={setStartDate} />
        <DateInput id="ip-end" label="Окончание деятельности" value={endDate} onChange={setEndDate} />
      </div>
      <p className="text-xs text-muted-foreground -mt-4">Оставьте пустыми для полного года</p>

      <MoneyInput id="ip-income" label="Годовой доход" value={income} onChange={setIncome} />

      <Separator />

      <div className="space-y-3">
        <ResultRow label="Дней деятельности" value={`${activeDays} из ${totalDays}`} />
        <ResultRow label="Фиксированные взносы" value={`${formatCurrency(fixedPart)} ₽`} copyValue={String(fixedPart)} />
        <ResultRow
          label="1% с доходов свыше 300 000 ₽"
          value={`${formatCurrency(cappedVariable)} ₽`}
          sublabel={variablePart > maxVariable ? `Ограничено лимитом ${formatCurrency(maxVariable)} ₽` : undefined}
          copyValue={String(cappedVariable)}
        />
        <ResultRow label="Итого к уплате" value={`${formatCurrency(total)} ₽`} highlight copyValue={String(total)} />
      </div>

      <InfoSection>
        <p><strong>Фиксированные взносы ИП по годам:</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-1">Год</th>
                <th className="text-right py-1">Фикс. часть</th>
                <th className="text-right py-1">Макс. 1%</th>
              </tr>
            </thead>
            <tbody>
              {YEARS.map((y) => {
                const c = IP_CONTRIBUTIONS[y]
                return (
                  <tr key={y} className="border-b border-border/30">
                    <td className="py-1">{y}</td>
                    <td className="text-right py-1">{c ? formatCurrency(c.fixed, 0) : "—"} ₽</td>
                    <td className="text-right py-1">{c ? formatCurrency(c.maxVariable, 0) : "—"} ₽</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2"><strong>Сроки уплаты:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Фиксированные взносы — до 31 декабря текущего года</li>
          <li>1% с превышения — до 1 июля следующего года</li>
        </ul>
      </InfoSection>
    </CalculatorLayout>
  )
}
