import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { USN_LIMITS } from "@/lib/constants/tax-constants"

type OwnerType = "ip" | "ooo"
type TaxObject = "income" | "income-expense"
type Period = "q1" | "q2" | "q3" | "year"

const QUARTERS = [
  { value: "q1", label: "I квартал" },
  { value: "q2", label: "I полугодие" },
  { value: "q3", label: "9 месяцев" },
  { value: "year", label: "Год" },
]

interface QuarterData {
  income: string
  expenses: string
  contributions: string
  advances: string
}

const emptyQuarter = (): QuarterData => ({ income: "", expenses: "", contributions: "", advances: "" })

export default function UsnCalculator() {
  useSEO({
    title: "Калькулятор УСН онлайн",
    description: "Рассчитайте налог по упрощённой системе налогообложения (УСН). «Доходы» 6% и «Доходы минус расходы» 15%. Данные 2026.",
  })

  const [ownerType, setOwnerType] = useState<OwnerType>("ip")
  const [taxObject, setTaxObject] = useState<TaxObject>("income")
  const [period, setPeriod] = useState<Period>("year")
  const [rate, setRate] = useState("")
  const [year, setYear] = useState("2026")
  const [quarterData, setQuarterData] = useState<QuarterData[]>([
    emptyQuarter(), emptyQuarter(), emptyQuarter(), emptyQuarter(),
  ])

  const defaultRate = taxObject === "income" ? 6 : 15
  const effectiveRate = parseFloat(rate) || defaultRate

  const parseVal = (s: string) => parseNumber(s)

  const updateQuarter = (qi: number, field: keyof QuarterData, value: string) => {
    setQuarterData((prev) => {
      const updated = [...prev]
      updated[qi] = { ...updated[qi], [field]: value }
      return updated
    })
  }

  // кол-во кварталов
  const periodIdx = { q1: 1, q2: 2, q3: 3, year: 4 }[period]

  // нарастающий итог
  let totalIncome = 0
  let totalExpenses = 0
  let totalContributions = 0
  let totalAdvances = 0

  for (let i = 0; i < periodIdx; i++) {
    totalIncome += parseVal(quarterData[i].income)
    totalExpenses += parseVal(quarterData[i].expenses)
    totalContributions += parseVal(quarterData[i].contributions)
    totalAdvances += parseVal(quarterData[i].advances)
  }

  // база
  let taxBase: number
  if (taxObject === "income") {
    taxBase = totalIncome
  } else {
    taxBase = Math.max(0, totalIncome - totalExpenses)
  }

  // налог
  const initialTax = Math.round(taxBase * (effectiveRate / 100) * 100) / 100

  // минималка 1% (для Д−Р)
  const minTax = taxObject === "income-expense" && period === "year"
    ? Math.round(totalIncome * 0.01 * 100) / 100
    : 0

  // вычет взносов
  let deduction = 0
  if (taxObject === "income") {
    const maxDeduction = ownerType === "ip"
      ? initialTax // ИП — до 100%
      : Math.round(initialTax * 0.5 * 100) / 100 // ООО — 50%
    deduction = Math.min(totalContributions, maxDeduction)
  }

  const afterDeduction = Math.max(0, initialTax - deduction)
  const effectiveTax = taxObject === "income-expense" && period === "year"
    ? Math.max(afterDeduction, minTax)
    : afterDeduction

  const toPay = Math.max(0, Math.round((effectiveTax - totalAdvances) * 100) / 100)

  const isValid = totalIncome > 0

  const quarterLabels = ["I кв.", "II кв.", "III кв.", "IV кв."]

  return (
    <CalculatorLayout
      icon={FileSpreadsheet}
      title="Калькулятор УСН"
      description="Упрощённая система налогообложения"
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Форма собственности</Label>
          <RadioGroup value={ownerType} onValueChange={(v) => setOwnerType(v as OwnerType)} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ip" id="usn-ip" />
              <Label htmlFor="usn-ip" className="font-normal cursor-pointer">ИП</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ooo" id="usn-ooo" />
              <Label htmlFor="usn-ooo" className="font-normal cursor-pointer">ООО</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Объект налогообложения</Label>
          <RadioGroup value={taxObject} onValueChange={(v) => setTaxObject(v as TaxObject)} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="usn-income" />
              <Label htmlFor="usn-income" className="font-normal cursor-pointer">Доходы</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income-expense" id="usn-ie" />
              <Label htmlFor="usn-ie" className="font-normal cursor-pointer">Доходы − Расходы</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Период</Label>
          <RadioGroup value={period} onValueChange={(v) => setPeriod(v as Period)} className="space-y-1.5">
            {QUARTERS.map((q) => (
              <div key={q.value} className="flex items-center space-x-2">
                <RadioGroupItem value={q.value} id={`period-${q.value}`} />
                <Label htmlFor={`period-${q.value}`} className="font-normal cursor-pointer text-sm">{q.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usn-rate">Ставка (%)</Label>
          <Input
            id="usn-rate"
            type="number"
            min="0"
            max="20"
            step="0.1"
            placeholder={String(defaultRate)}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="bg-input/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Год</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="bg-input/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Квартальные данные</Label>
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            {quarterLabels.slice(0, periodIdx).map((label, i) => (
              <TabsTrigger key={i} value={String(i)}>{label}</TabsTrigger>
            ))}
          </TabsList>
          {quarterLabels.slice(0, periodIdx).map((_, i) => (
            <TabsContent key={i} value={String(i)} className="space-y-3 mt-3">
              <MoneyInput
                id={`q${i}-income`}
                label="Доходы за квартал"
                value={quarterData[i].income}
                onChange={(v) => updateQuarter(i, "income", v)}
              />
              {taxObject === "income-expense" && (
                <MoneyInput
                  id={`q${i}-expenses`}
                  label="Расходы за квартал"
                  value={quarterData[i].expenses}
                  onChange={(v) => updateQuarter(i, "expenses", v)}
                />
              )}
              <MoneyInput
                id={`q${i}-contributions`}
                label="Уплаченные взносы за квартал"
                value={quarterData[i].contributions}
                onChange={(v) => updateQuarter(i, "contributions", v)}
              />
              {i > 0 && (
                <MoneyInput
                  id={`q${i}-advances`}
                  label="Уплаченный аванс"
                  value={quarterData[i].advances}
                  onChange={(v) => updateQuarter(i, "advances", v)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow label="Доходы (нарастающим итогом)" value={`${formatCurrency(totalIncome)} ₽`} copyValue={String(totalIncome)} />
          {taxObject === "income-expense" && (
            <ResultRow label="Расходы (нарастающим итогом)" value={`${formatCurrency(totalExpenses)} ₽`} copyValue={String(totalExpenses)} />
          )}
          <ResultRow label="Налоговая база" value={`${formatCurrency(taxBase)} ₽`} copyValue={String(taxBase)} />
          <ResultRow label={`Налог (${effectiveRate}%)`} value={`${formatCurrency(initialTax)} ₽`} copyValue={String(initialTax)} />
          {taxObject === "income" && deduction > 0 && (
            <ResultRow label="Вычет (взносы)" value={`−${formatCurrency(deduction)} ₽`}
              sublabel={ownerType === "ip" ? "ИП без сотрудников: до 100%" : "ООО / ИП с сотрудниками: до 50%"}
              copyValue={String(deduction)}
            />
          )}
          {minTax > 0 && minTax > afterDeduction && (
            <ResultRow label="Минимальный налог (1%)" value={`${formatCurrency(minTax)} ₽`}
              sublabel="Применён минимальный налог"
              copyValue={String(minTax)}
            />
          )}
          {totalAdvances > 0 && (
            <ResultRow label="Уплаченные авансы" value={`−${formatCurrency(totalAdvances)} ₽`} copyValue={String(totalAdvances)} />
          )}
          <ResultRow label="К уплате" value={`${formatCurrency(toPay)} ₽`} highlight copyValue={String(toPay)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Лимиты УСН 2026:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Доход для применения: до {formatCurrency(USN_LIMITS.income, 0)} ₽</li>
          <li>Сотрудников: до {USN_LIMITS.employees}</li>
          <li>Повышенные ставки ({USN_LIMITS.increasedRate6}%/{USN_LIMITS.increasedRate15}%) при доходе свыше {formatCurrency(USN_LIMITS.incomeReduced, 0)} ₽ или более {USN_LIMITS.employeesReduced} сотрудников</li>
        </ul>
        <p className="mt-2"><strong>НДС на УСН (с 2025):</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Доход до 60 млн ₽ — освобождение от НДС</li>
          <li>60–250 млн ₽ — 5% (без вычетов) или 22% (с вычетами)</li>
          <li>250–450 млн ₽ — 7% (без вычетов) или 22% (с вычетами)</li>
        </ul>
        <p className="mt-2"><strong>Минимальный налог</strong> (для «Доходы − Расходы»): 1% от доходов, если рассчитанный налог меньше.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
