import { useState } from "react"
import { Users } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { calculateSalaryGrossToNet, type SalaryResult } from "@/lib/utils/salary"
import { ACCIDENT_RATES } from "@/lib/constants/tax-constants"

const DISTRICT_COEFFICIENTS = [
  { value: "1.0", label: "Без коэффициента" },
  { value: "1.15", label: "1.15 — Урал, Западная Сибирь" },
  { value: "1.2", label: "1.2 — Пермский край, Екатеринбург" },
  { value: "1.3", label: "1.3 — Томская обл., Иркутская обл." },
  { value: "1.4", label: "1.4 — Республика Бурятия" },
  { value: "1.5", label: "1.5 — Ханты-Мансийский АО" },
  { value: "1.6", label: "1.6 — Мурманская область" },
  { value: "1.8", label: "1.8 — Норильск" },
  { value: "2.0", label: "2.0 — Чукотка, Камчатка" },
]

export default function EmployeeCostCalculator() {
  useSEO({
    title: "Стоимость сотрудника — калькулятор для работодателя",
    description: "Рассчитайте полную стоимость сотрудника: оклад, НДФЛ, страховые взносы, районный коэффициент.",
    keywords: "стоимость сотрудника, расходы на сотрудника, калькулятор работодателя, страховые взносы работодатель, ФОТ калькулятор",
    jsonLd: buildToolJsonLd({ name: "Стоимость сотрудника для работодателя", description: "Расчёт полной стоимости сотрудника с учётом всех взносов", url: "https://zuctools.ru/tools/employee-cost-calculator" }),
  })

  const [salary, setSalary] = useState("")
  const [district, setDistrict] = useState("1.0")
  const [riskClass, setRiskClass] = useState("1")
  const [msp, setMsp] = useState("no")

  const baseSalary = parseNumber(salary)
  const districtCoeff = parseFloat(district)
  const isValid = !isNaN(baseSalary) && baseSalary > 0

  const monthlyGross = isValid ? Math.round(baseSalary * districtCoeff * 100) / 100 : 0

  let result: SalaryResult | null = null
  if (isValid) {
    result = calculateSalaryGrossToNet(
      monthlyGross,
      0,
      true,
      msp === "yes",
      parseInt(riskClass),
    )
  }

  const annualCost = result ? Math.round(result.totalCost * 12 * 100) / 100 : 0

  return (
    <CalculatorLayout icon={Users} title="Стоимость сотрудника" description="Полная стоимость для работодателя" maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MoneyInput id="salary" label="Оклад (до районного коэфф.)" value={salary} onChange={setSalary} />

        <div className="space-y-2">
          <Label>Районный коэффициент</Label>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-input/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_COEFFICIENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Класс профессионального риска (1-32)</Label>
          <Select value={riskClass} onValueChange={setRiskClass}>
            <SelectTrigger className="bg-input/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCIDENT_RATES.map((rate, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1} класс — {rate}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>МСП</Label>
          <RadioGroup value={msp} onValueChange={setMsp} className="flex gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="ec-msp-no" />
              <Label htmlFor="ec-msp-no" className="font-normal cursor-pointer">Нет</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="ec-msp-yes" />
              <Label htmlFor="ec-msp-yes" className="font-normal cursor-pointer">Да</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">Получает сотрудник</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ResultRow label="Начислено" value={`${formatCurrency(result.gross)} ₽`} copyValue={String(result.gross)} />
              <ResultRow label="НДФЛ" value={`${formatCurrency(result.ndfl)} ₽`} copyValue={String(result.ndfl)} />
              <ResultRow label="На руки" value={`${formatCurrency(result.net)} ₽`} highlight copyValue={String(result.net)} />
            </CardContent>
          </Card>

          <Card className="bg-sky-500/5 border-sky-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-sky-600 dark:text-sky-400">Платит работодатель</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ResultRow label="ПФР" value={`${formatCurrency(result.pensionContrib)} ₽`} copyValue={String(result.pensionContrib)} />
              <ResultRow label="ФОМС" value={`${formatCurrency(result.medicalContrib)} ₽`} copyValue={String(result.medicalContrib)} />
              <ResultRow label="ФСС" value={`${formatCurrency(result.socialContrib)} ₽`} copyValue={String(result.socialContrib)} />
              <ResultRow label="НС" value={`${formatCurrency(result.accidentContrib)} ₽`} copyValue={String(result.accidentContrib)} />
              <ResultRow label="Итого взносы" value={`${formatCurrency(result.totalContrib)} ₽`} copyValue={String(result.totalContrib)} />
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-3">
            <ResultRow label="Стоимость в месяц" value={`${formatCurrency(result.totalCost)} ₽`} highlight copyValue={String(result.totalCost)} />
            <ResultRow label="Стоимость в год" value={`${formatCurrency(annualCost)} ₽`} highlight copyValue={String(annualCost)} />
          </div>
        </div>
      )}

      <InfoSection>
        <p><strong>Полная стоимость сотрудника</strong> = Начисленная зарплата + все взносы работодателя.</p>
        <p className="mt-1">Включает: ПФР (22%), ФОМС (5,1%), ФСС (2,9%), НС (от 0,2%).</p>
        <p className="mt-1">Для МСП ставки снижены: 15% совокупно на часть зарплаты выше МРОТ.</p>
        <p className="mt-1">Районный коэффициент увеличивает начисленную зарплату.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
