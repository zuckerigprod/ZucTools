import { useState } from "react"
import { Scale } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { calculateNDFL } from "@/lib/utils/ndfl"
import { cn } from "@/lib/utils"
import { NPD_LIMIT, USN_LIMITS, IP_CONTRIBUTIONS } from "@/lib/constants/tax-constants"

type EntityType = "ip" | "ooo"

interface TaxResult {
  name: string
  available: boolean
  reason?: string
  taxes: number
  contributions: number
  total: number
  details: string[]
}

export default function TaxSystemCalculator() {
  useSEO({
    title: "Выбор системы налогообложения",
    description: "Сравните ОСНО, УСН «Доходы», УСН «Д-Р», Патент и НПД. Узнайте, какая система налогообложения выгоднее для вашего бизнеса.",
  })

  const [entity, setEntity] = useState<EntityType>("ip")
  const [employees, setEmployees] = useState("0")
  const [income, setIncome] = useState("")
  const [expenses, setExpenses] = useState("")
  const [salary, setSalary] = useState("")
  const [isMsp, setIsMsp] = useState(false)
  const [usnRate6, setUsnRate6] = useState("6")
  const [usnRate15, setUsnRate15] = useState("15")
  const [patentCost, setPatentCost] = useState("")

  const incomeVal = parseNumber(income)
  const expensesVal = parseNumber(expenses)
  const salaryVal = parseNumber(salary)
  const employeesVal = parseInt(employees) || 0
  const rate6 = parseFloat(usnRate6) || 6
  const rate15 = parseFloat(usnRate15) || 15
  const patentVal = parseNumber(patentCost)

  const isValid = incomeVal > 0

  // взносы ИП
  const ipFixed = IP_CONTRIBUTIONS[2026].fixed
  const ipVariable = Math.min(
    Math.max(0, (incomeVal - 300_000) * 0.01),
    IP_CONTRIBUTIONS[2026].maxVariable
  )
  const ipContributions = ipFixed + ipVariable

  // взносы за сотрудников (~30.2% ФОТ)
  const employeeContribRate = isMsp ? 0.15 : 0.302
  const employeeContrib = salaryVal * employeeContribRate

  const totalContrib = (entity === "ip" ? ipContributions : 0) + employeeContrib

  function calculateResults(): TaxResult[] {
    const results: TaxResult[] = []

    // осно
    if (entity === "ip") {
      const profit = incomeVal - expensesVal - totalContrib
      const ndfl = calculateNDFL(Math.max(0, profit))
      const vatTax = incomeVal * 0.22
      results.push({
        name: "ОСНО",
        available: true,
        taxes: Math.round((ndfl + vatTax) * 100) / 100,
        contributions: Math.round(totalContrib * 100) / 100,
        total: Math.round((ndfl + vatTax + totalContrib) * 100) / 100,
        details: [`НДФЛ: ${formatCurrency(ndfl)} ₽`, `НДС (22%): ${formatCurrency(vatTax)} ₽`],
      })
    } else {
      const profit = incomeVal - expensesVal - salaryVal - totalContrib
      const profitTax = Math.max(0, profit) * 0.20
      const vatTax = incomeVal * 0.22
      results.push({
        name: "ОСНО",
        available: true,
        taxes: Math.round((profitTax + vatTax) * 100) / 100,
        contributions: Math.round(totalContrib * 100) / 100,
        total: Math.round((profitTax + vatTax + totalContrib) * 100) / 100,
        details: [`Налог на прибыль (20%): ${formatCurrency(profitTax)} ₽`, `НДС (22%): ${formatCurrency(vatTax)} ₽`],
      })
    }

    // усн доходы
    const usnIncomeAvailable = incomeVal <= USN_LIMITS.income && employeesVal <= USN_LIMITS.employees
    if (usnIncomeAvailable) {
      let tax = incomeVal * (rate6 / 100)
      // вычет
      const maxDeduction = entity === "ip" && employeesVal === 0 ? tax : tax * 0.5
      const deduction = Math.min(totalContrib, maxDeduction)
      tax = Math.max(0, tax - deduction)
      results.push({
        name: `УСН «Доходы» ${rate6}%`,
        available: true,
        taxes: Math.round(tax * 100) / 100,
        contributions: Math.round(totalContrib * 100) / 100,
        total: Math.round((tax + totalContrib) * 100) / 100,
        details: [
          `Налог: ${formatCurrency(incomeVal * (rate6 / 100))} ₽`,
          `Вычет взносов: −${formatCurrency(deduction)} ₽`,
        ],
      })
    } else {
      results.push({
        name: `УСН «Доходы» ${rate6}%`,
        available: false,
        reason: incomeVal > USN_LIMITS.income ? "Превышен лимит дохода" : "Превышен лимит сотрудников",
        taxes: 0, contributions: 0, total: 0, details: [],
      })
    }

    // усн д−р
    const usnIEAvailable = incomeVal <= USN_LIMITS.income && employeesVal <= USN_LIMITS.employees
    if (usnIEAvailable) {
      const base = Math.max(0, incomeVal - expensesVal - totalContrib)
      let tax = base * (rate15 / 100)
      const minTax = incomeVal * 0.01
      tax = Math.max(tax, minTax)
      results.push({
        name: `УСН «Д−Р» ${rate15}%`,
        available: true,
        taxes: Math.round(tax * 100) / 100,
        contributions: Math.round(totalContrib * 100) / 100,
        total: Math.round((tax + totalContrib) * 100) / 100,
        details: [
          `База: ${formatCurrency(base)} ₽`,
          `Налог: ${formatCurrency(tax)} ₽`,
          tax === minTax ? "Применён минимальный налог (1%)" : "",
        ].filter(Boolean),
      })
    } else {
      results.push({
        name: `УСН «Д−Р» ${rate15}%`,
        available: false,
        reason: incomeVal > USN_LIMITS.income ? "Превышен лимит дохода" : "Превышен лимит сотрудников",
        taxes: 0, contributions: 0, total: 0, details: [],
      })
    }

    // патент
    if (entity === "ip") {
      if (patentVal > 0) {
        const maxDeduction = employeesVal === 0 ? patentVal : patentVal * 0.5
        const deduction = Math.min(totalContrib, maxDeduction)
        const effectivePatent = Math.max(0, patentVal - deduction)
        results.push({
          name: "Патент (ПСН)",
          available: true,
          taxes: Math.round(effectivePatent * 100) / 100,
          contributions: Math.round(totalContrib * 100) / 100,
          total: Math.round((effectivePatent + totalContrib) * 100) / 100,
          details: [
            `Стоимость патента: ${formatCurrency(patentVal)} ₽`,
            `Вычет взносов: −${formatCurrency(deduction)} ₽`,
          ],
        })
      }
    }

    // нпд
    if (entity === "ip") {
      const npdAvailable = employeesVal === 0 && incomeVal <= NPD_LIMIT
      if (npdAvailable) {
        const tax = incomeVal * 0.06
        results.push({
          name: "НПД (самозанятость)",
          available: true,
          taxes: Math.round(tax * 100) / 100,
          contributions: 0,
          total: Math.round(tax * 100) / 100,
          details: [`Налог (6%): ${formatCurrency(tax)} ₽`, "Взносы: не обязательны"],
        })
      } else {
        results.push({
          name: "НПД (самозанятость)",
          available: false,
          reason: employeesVal > 0 ? "Нельзя с сотрудниками" : `Лимит дохода ${formatCurrency(NPD_LIMIT, 0)} ₽`,
          taxes: 0, contributions: 0, total: 0, details: [],
        })
      }
    }

    return results
  }

  const results = isValid ? calculateResults() : []
  const availableResults = results.filter((r) => r.available)
  const bestResult = availableResults.length > 0
    ? availableResults.reduce((a, b) => a.total < b.total ? a : b)
    : null

  return (
    <CalculatorLayout
      icon={Scale}
      title="Выбор системы налогообложения"
      description="Сравнение налоговых режимов"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-2">
        <Label>Форма собственности</Label>
        <RadioGroup value={entity} onValueChange={(v) => setEntity(v as EntityType)} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ip" id="tax-ip" />
            <Label htmlFor="tax-ip" className="font-normal cursor-pointer">ИП</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ooo" id="tax-ooo" />
            <Label htmlFor="tax-ooo" className="font-normal cursor-pointer">ООО</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax-employees">Количество сотрудников</Label>
          <Input
            id="tax-employees"
            type="number"
            min="0"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            className="bg-input/50"
          />
        </div>
        <MoneyInput id="tax-income" label="Годовой доход" value={income} onChange={setIncome} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MoneyInput id="tax-expenses" label="Годовые расходы (без зарплаты)" value={expenses} onChange={setExpenses} />
        <MoneyInput id="tax-salary" label="Годовой ФОТ (зарплата)" value={salary} onChange={setSalary} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usn-rate-6">Ставка УСН «Д» (%)</Label>
          <Input id="usn-rate-6" type="number" min="1" max="8" step="0.1" value={usnRate6}
            onChange={(e) => setUsnRate6(e.target.value)} className="bg-input/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usn-rate-15">Ставка УСН «Д−Р» (%)</Label>
          <Input id="usn-rate-15" type="number" min="5" max="20" step="0.1" value={usnRate15}
            onChange={(e) => setUsnRate15(e.target.value)} className="bg-input/50" />
        </div>
        {entity === "ip" && (
          <MoneyInput id="tax-patent" label="Стоимость патента" value={patentCost} onChange={setPatentCost} />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="msp-check"
          checked={isMsp}
          onChange={(e) => setIsMsp(e.target.checked)}
          className="rounded border-border"
        />
        <Label htmlFor="msp-check" className="font-normal cursor-pointer">МСП (пониженные тарифы взносов: 15%)</Label>
      </div>

      <Separator />

      {isValid && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Сравнение налоговых режимов:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((r) => {
              const isBest = bestResult && r.name === bestResult.name && r.available
              return (
                <div
                  key={r.name}
                  className={cn(
                    "rounded-lg border p-4 space-y-2 transition-colors",
                    !r.available && "opacity-50 bg-secondary/20 border-border/30",
                    r.available && !isBest && "bg-secondary/30 border-border/50",
                    isBest && "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{r.name}</h3>
                    {isBest && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Выгоднее</span>
                    )}
                  </div>
                  {!r.available ? (
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                  ) : (
                    <>
                      <div className="space-y-1">
                        {r.details.map((d, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{d}</p>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-border/30 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Налоги:</span>
                          <span>{formatCurrency(r.taxes)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Взносы:</span>
                          <span>{formatCurrency(r.contributions)} ₽</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1">
                          <span>Итого:</span>
                          <span className={isBest ? "text-primary" : ""}>{formatCurrency(r.total)} ₽</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <InfoSection>
        <p><strong>Системы налогообложения в РФ (2026):</strong></p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>ОСНО</strong> — общая система. НДФЛ 13–22% (ИП) или налог на прибыль 20% (ООО) + НДС 22%. Подходит при больших вычетах по НДС.</li>
          <li><strong>УСН «Доходы»</strong> — 6% от дохода. Можно уменьшить на взносы. Подходит при малых расходах.</li>
          <li><strong>УСН «Д−Р»</strong> — 15% от разницы. Есть минимальный налог 1%. Подходит при расходах &gt; 60% от дохода.</li>
          <li><strong>Патент (ПСН)</strong> — только ИП. Фиксированная стоимость, не зависит от реального дохода.</li>
          <li><strong>НПД</strong> — самозанятость, 4%/6%, без взносов. Лимит {formatCurrency(NPD_LIMIT, 0)} ₽/год, нельзя с сотрудниками.</li>
        </ul>
      </InfoSection>
    </CalculatorLayout>
  )
}
