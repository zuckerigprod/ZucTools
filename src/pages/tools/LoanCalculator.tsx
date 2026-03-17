import { useState } from "react"
import { Landmark } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber, sanitizePastedNumber } from "@/lib/utils/format"
import { calculateAnnuity, calculateDifferentiated, generateSchedule } from "@/lib/utils/loan"

export default function LoanCalculator() {
  useSEO({
    title: "Калькулятор кредита онлайн",
    description: "Расчёт аннуитетных и дифференцированных платежей по кредиту с графиком амортизации.",
  })

  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [months, setMonths] = useState("")
  const [type, setType] = useState<"annuity" | "differentiated">("annuity")
  const [showAll, setShowAll] = useState(false)

  const principal = parseNumber(amount)
  const annualRate = parseNumber(rate)
  const termMonths = parseInt(months)
  const isValid = !isNaN(principal) && principal > 0 && !isNaN(annualRate) && annualRate >= 0 && !isNaN(termMonths) && termMonths > 0

  const annuityResult = isValid ? calculateAnnuity(principal, annualRate, termMonths) : null
  const diffResult = isValid ? calculateDifferentiated(principal, annualRate, termMonths) : null
  const schedule = isValid ? generateSchedule(principal, annualRate, termMonths, type) : []
  const visibleSchedule = showAll ? schedule : schedule.slice(0, 12)

  return (
    <CalculatorLayout icon={Landmark} title="Калькулятор кредита" description="Аннуитетные и дифференцированные платежи" maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MoneyInput id="loan-amount" label="Сумма кредита" value={amount} onChange={setAmount} />

        <div className="space-y-2">
          <Label htmlFor="loan-rate">Ставка (% годовых)</Label>
          <Input
            id="loan-rate"
            type="text"
            inputMode="decimal"
            placeholder="18"
            value={rate}
            onChange={(e) => {
              if (/^\d*[.,]?\d{0,2}$/.test(e.target.value) || e.target.value === "") setRate(e.target.value)
            }}
            onPaste={(e) => {
              e.preventDefault()
              const cleaned = sanitizePastedNumber(e.clipboardData.getData("text")).replace(".", ",")
              if (/^\d*[,]?\d{0,2}$/.test(cleaned) || cleaned === "") setRate(cleaned)
            }}
            className="bg-input/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-months">Срок (месяцев)</Label>
          <Input
            id="loan-months"
            type="text"
            inputMode="numeric"
            placeholder="60"
            value={months}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) setMonths(e.target.value)
            }}
            onPaste={(e) => {
              e.preventDefault()
              const cleaned = sanitizePastedNumber(e.clipboardData.getData("text"))
              if (/^\d*$/.test(cleaned)) setMonths(cleaned)
            }}
            className="bg-input/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Тип платежей</Label>
        <RadioGroup value={type} onValueChange={(v) => setType(v as "annuity" | "differentiated")} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="annuity" id="loan-annuity" />
            <Label htmlFor="loan-annuity" className="font-normal cursor-pointer">Аннуитетный</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="differentiated" id="loan-diff" />
            <Label htmlFor="loan-diff" className="font-normal cursor-pointer">Дифференцированный</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-4">
          {type === "annuity" && annuityResult && (
            <div className="space-y-3">
              <ResultRow label="Ежемесячный платёж" value={`${formatCurrency(annuityResult.monthlyPayment)} ₽`} highlight copyValue={String(annuityResult.monthlyPayment)} />
              <ResultRow label="Общая сумма выплат" value={`${formatCurrency(annuityResult.totalPaid)} ₽`} copyValue={String(annuityResult.totalPaid)} />
              <ResultRow label="Переплата" value={`${formatCurrency(annuityResult.totalInterest)} ₽`} copyValue={String(annuityResult.totalInterest)} />
            </div>
          )}

          {type === "differentiated" && diffResult && (
            <div className="space-y-3">
              <ResultRow label="Первый платёж" value={`${formatCurrency(diffResult.firstPayment)} ₽`} highlight copyValue={String(diffResult.firstPayment)} />
              <ResultRow label="Последний платёж" value={`${formatCurrency(diffResult.lastPayment)} ₽`} copyValue={String(diffResult.lastPayment)} />
              <ResultRow label="Общая сумма выплат" value={`${formatCurrency(diffResult.totalPaid)} ₽`} copyValue={String(diffResult.totalPaid)} />
              <ResultRow label="Переплата" value={`${formatCurrency(diffResult.totalInterest)} ₽`} copyValue={String(diffResult.totalInterest)} />
            </div>
          )}

          {/* график */}
          {schedule.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">График платежей</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left py-2 font-medium">#</th>
                      <th className="text-right py-2 font-medium">Платёж</th>
                      <th className="text-right py-2 font-medium">Основной долг</th>
                      <th className="text-right py-2 font-medium">Проценты</th>
                      <th className="text-right py-2 font-medium">Остаток</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSchedule.map((row) => (
                      <tr key={row.month} className="border-b border-border/30">
                        <td className="py-1.5">{row.month}</td>
                        <td className="py-1.5 text-right">{formatCurrency(row.payment)} ₽</td>
                        <td className="py-1.5 text-right">{formatCurrency(row.principal)} ₽</td>
                        <td className="py-1.5 text-right">{formatCurrency(row.interest)} ₽</td>
                        <td className="py-1.5 text-right">{formatCurrency(row.remaining)} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!showAll && schedule.length > 12 && (
                <Button variant="outline" size="sm" onClick={() => setShowAll(true)} className="w-full">
                  Показать все {schedule.length} месяцев
                </Button>
              )}
              {showAll && schedule.length > 12 && (
                <Button variant="outline" size="sm" onClick={() => setShowAll(false)} className="w-full">
                  Скрыть
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <InfoSection>
        <p><strong>Аннуитетный платёж</strong> — одинаковые ежемесячные платежи. Формула: PMT = P × r × (1+r)^n / ((1+r)^n − 1)</p>
        <p className="mt-2"><strong>Дифференцированный платёж</strong> — уменьшается каждый месяц. Основной долг гасится равными частями, проценты начисляются на остаток.</p>
        <p className="mt-2">Аннуитет удобнее для планирования, дифференцированный — выгоднее по общей переплате.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
