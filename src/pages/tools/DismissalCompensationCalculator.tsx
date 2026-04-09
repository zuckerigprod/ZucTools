import { useState } from "react"
import { UserMinus } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { calculateNDFL } from "@/lib/utils/ndfl"
import { AVG_MONTH_DAYS } from "@/lib/constants/tax-constants"
import { cn } from "@/lib/utils"

type DismissalReason = "own" | "employer" | "reduction" | "liquidation" | "conscription"
type SdzMode = "auto" | "manual"

const REASONS = [
  { value: "own", label: "По собственному желанию" },
  { value: "employer", label: "По соглашению сторон" },
  { value: "reduction", label: "Сокращение" },
  { value: "liquidation", label: "Ликвидация организации" },
  { value: "conscription", label: "Призыв на военную службу" },
]

export default function DismissalCompensationCalculator() {
  useSEO({
    title: "Компенсация отпуска при увольнении",
    description: "Рассчитайте компенсацию за неиспользованный отпуск при увольнении с учётом стажа, НДФЛ и правила 5,5 месяцев.",
    keywords: "компенсация при увольнении, компенсация за неиспользованный отпуск, расчёт при увольнении, увольнение компенсация",
    jsonLd: buildToolJsonLd({ name: "Компенсация при увольнении", description: "Расчёт компенсации за неиспользованный отпуск при увольнении", url: "https://zuctools.ru/tools/dismissal-compensation-calculator" }),
  })

  const [reason, setReason] = useState<DismissalReason>("own")
  const [hireDate, setHireDate] = useState("")
  const [dismissDate, setDismissDate] = useState("")
  const [vacDaysPerYear, setVacDaysPerYear] = useState("28")
  const [usedDays, setUsedDays] = useState("0")

  // сдз: авто или вручную
  const [sdzMode, setSdzMode] = useState<SdzMode>("auto")
  const [monthlySalary, setMonthlySalary] = useState("")
  const [manualSdz, setManualSdz] = useState("")

  const hireDt = hireDate ? new Date(hireDate) : null
  const dismissDt = dismissDate ? new Date(dismissDate) : null
  const vacPerYear = parseInt(vacDaysPerYear) || 28
  const usedVal = parseInt(usedDays) || 0

  // считаем сдз
  const salaryVal = parseNumber(monthlySalary)
  const manualSdzVal = parseNumber(manualSdz)
  const autoSdz = salaryVal > 0 ? Math.round(salaryVal / AVG_MONTH_DAYS * 100) / 100 : 0
  const sdzVal = sdzMode === "auto" ? autoSdz : manualSdzVal

  // стаж в месяцах
  let totalMonths = 0
  if (hireDt && dismissDt && dismissDt > hireDt) {
    let years = dismissDt.getFullYear() - hireDt.getFullYear()
    let months = dismissDt.getMonth() - hireDt.getMonth()
    let days = dismissDt.getDate() - hireDt.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(dismissDt.getFullYear(), dismissDt.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    totalMonths = years * 12 + months
    if (days >= 15) totalMonths++
  }

  const isSpecialReason = ["reduction", "liquidation", "conscription"].includes(reason)
  const fullVacationRule = isSpecialReason && totalMonths >= 5.5 && totalMonths < 12

  let earnedDays: number
  if (fullVacationRule) {
    earnedDays = vacPerYear
  } else {
    earnedDays = Math.round(vacPerYear / 12 * totalMonths * 100) / 100
  }

  const unusedDays = Math.max(0, Math.round((earnedDays - usedVal) * 100) / 100)
  const compensationGross = Math.round(sdzVal * unusedDays * 100) / 100
  const ndfl = calculateNDFL(compensationGross)
  const compensationNet = Math.round((compensationGross - ndfl) * 100) / 100

  const isValid = hireDt && dismissDt && dismissDt > hireDt && sdzVal > 0

  return (
    <CalculatorLayout icon={UserMinus} title="Компенсация при увольнении" description="За неиспользованный отпуск">
      <div className="space-y-2">
        <Label>Причина увольнения</Label>
        <RadioGroup value={reason} onValueChange={(v) => setReason(v as DismissalReason)} className="space-y-2">
          {REASONS.map((r) => (
            <div key={r.value} className="flex items-center space-x-2">
              <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
              <Label htmlFor={`reason-${r.value}`} className="font-normal cursor-pointer">{r.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="hire-date" label="Дата приёма на работу" value={hireDate} onChange={setHireDate} />
        <DateInput id="dismiss-date" label="Дата увольнения" value={dismissDate} onChange={setDismissDate} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vac-days-year">Дней отпуска в год</Label>
          <Input
            id="vac-days-year"
            type="number"
            min="1"
            value={vacDaysPerYear}
            onChange={(e) => setVacDaysPerYear(e.target.value)}
            className="bg-input/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="used-days">Использовано дней</Label>
          <Input
            id="used-days"
            type="number"
            min="0"
            value={usedDays}
            onChange={(e) => setUsedDays(e.target.value)}
            className="bg-input/50"
          />
        </div>
      </div>

      {/* расчёт СДЗ */}
      <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-secondary/20">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Среднедневной заработок (СДЗ)</Label>
          <div className="flex gap-1 rounded-lg bg-secondary/50 p-0.5">
            <button
              type="button"
              onClick={() => setSdzMode("auto")}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors",
                sdzMode === "auto"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Из зарплаты
            </button>
            <button
              type="button"
              onClick={() => setSdzMode("manual")}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors",
                sdzMode === "manual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Ввести вручную
            </button>
          </div>
        </div>

        {sdzMode === "auto" ? (
          <div className="space-y-3">
            <MoneyInput
              id="monthly-salary"
              label="Средняя зарплата за месяц (до НДФЛ)"
              value={monthlySalary}
              onChange={setMonthlySalary}
              placeholder="50 000"
            />
            {autoSdz > 0 && (
              <p className="text-sm text-muted-foreground">
                СДЗ = {formatCurrency(salaryVal)} ÷ {AVG_MONTH_DAYS} = <span className="font-semibold text-foreground">{formatCurrency(autoSdz)} ₽</span>
              </p>
            )}
          </div>
        ) : (
          <MoneyInput
            id="manual-sdz"
            label="СДЗ (рублей в день)"
            value={manualSdz}
            onChange={setManualSdz}
            placeholder="1 706,48"
          />
        )}
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow label="СДЗ" value={`${formatCurrency(sdzVal)} ₽`}
            sublabel={sdzMode === "auto" ? `${formatCurrency(salaryVal)} ₽ ÷ ${AVG_MONTH_DAYS}` : undefined}
            copyValue={String(sdzVal)}
          />
          <ResultRow label="Стаж (месяцев)" value={String(totalMonths)} />
          <ResultRow label="Положено дней отпуска" value={String(earnedDays)}
            sublabel={fullVacationRule ? "Применено правило 5,5 мес. — полный отпуск" : undefined}
          />
          <ResultRow label="Неиспользовано дней" value={String(unusedDays)} />
          <ResultRow label="Компенсация (до НДФЛ)" value={`${formatCurrency(compensationGross)} ₽`} copyValue={String(compensationGross)} />
          <ResultRow label="НДФЛ" value={`${formatCurrency(ndfl)} ₽`} copyValue={String(ndfl)} />
          <ResultRow label="К выплате" value={`${formatCurrency(compensationNet)} ₽`} highlight copyValue={String(compensationNet)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Формула:</strong> Компенсация = СДЗ × Неиспользованные дни</p>
        <p className="mt-2"><strong>Расчёт СДЗ (упрощённый):</strong> Зарплата ÷ 29,3</p>
        <p>Точный расчёт: сумма заработка за 12 мес. ÷ (29,3 × полные мес. + дни в неполных мес.)</p>
        <p className="mt-2"><strong>Правило 5,5 месяцев:</strong></p>
        <p>При увольнении по сокращению, ликвидации или призыву работник, отработавший от 5,5 до 11 месяцев, получает компенсацию за полный отпуск.</p>
        <p className="mt-2"><strong>Округление стажа:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Остаток ≥ 15 дней → округляется до полного месяца</li>
          <li>Остаток &lt; 15 дней → отбрасывается</li>
        </ul>
        <p className="mt-2"><strong>НДФЛ:</strong> компенсация облагается НДФЛ в общем порядке (прогрессивная шкала с 2025 г.).</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
