import { useState } from "react"
import { Thermometer } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { countCalendarDays } from "@/lib/utils/calendar"
import { MROT, CONTRIBUTION_BASE, SICK_LEAVE_PERCENT } from "@/lib/constants/tax-constants"

const EXPERIENCE_OPTIONS = [
  { value: "less-6m", label: "Менее 6 месяцев" },
  { value: "6m-5y", label: "От 6 мес. до 5 лет" },
  { value: "5y-8y", label: "От 5 до 8 лет" },
  { value: "8y+", label: "8 лет и более" },
]

const REASON_OPTIONS = [
  { value: "self", label: "Заболевание/травма работника" },
  { value: "child", label: "Уход за больным ребёнком" },
  { value: "family", label: "Уход за больным членом семьи" },
]

export default function SickLeaveCalculator() {
  useSEO({
    title: "Калькулятор больничного листа",
    description: "Рассчитайте пособие по временной нетрудоспособности. Учёт стажа, МРОТ, оплаты за счёт работодателя и СФР.",
    keywords: "калькулятор больничного, расчёт больничного листа, пособие по нетрудоспособности, оплата больничного, больничный лист 2025",
    jsonLd: buildToolJsonLd({ name: "Калькулятор больничного листа", description: "Расчёт пособия по временной нетрудоспособности с учётом стажа и МРОТ", url: "https://zuctools.ru/tools/sick-leave-calculator" }),
  })

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("self")
  const [experience, setExperience] = useState("8y+")
  const [earnings, setEarnings] = useState("")
  const [excludedDays, setExcludedDays] = useState("0")
  const [childAge, setChildAge] = useState("5")
  const [treatmentType, setTreatmentType] = useState<"ambulatory" | "hospital">("ambulatory")

  const startD = startDate ? new Date(startDate) : null
  const endD = endDate ? new Date(endDate) : null
  const year = startD ? startD.getFullYear() : 2026
  const prevYear1 = year - 1
  const prevYear2 = year - 2

  const earningsVal = parseNumber(earnings)
  const excludedVal = parseInt(excludedDays) || 0
  const isValid = startD && endD && endD >= startD && earningsVal > 0

  const sickDays = isValid ? countCalendarDays(startD, endD) : 0

  // расчётные дни
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
  const totalCalcDays = (isLeap(prevYear1) || isLeap(prevYear2) ? 731 : 730) - excludedVal

  // ограничение по базам
  const maxBase1 = CONTRIBUTION_BASE[prevYear1] || CONTRIBUTION_BASE[2026]
  const maxBase2 = CONTRIBUTION_BASE[prevYear2] || CONTRIBUTION_BASE[2025]
  const maxEarnings = maxBase1 + maxBase2
  const effectiveEarnings = Math.min(earningsVal, maxEarnings)

  // среднедневной
  const sdz = totalCalcDays > 0 ? effectiveEarnings / totalCalcDays : 0

  // мин. по МРОТ
  const mrot = MROT[year] || MROT[2026]
  const minSDZ = (mrot * 24) / 730
  const maxSDZ = maxEarnings / 730

  const baseSDZ = Math.max(Math.min(sdz, maxSDZ), minSDZ)

  // процент по стажу
  const pct = experience === "less-6m" ? 0 : SICK_LEAVE_PERCENT[experience]
  const dailyBenefit = experience === "less-6m"
    ? mrot / 30
    : Math.round(baseSDZ * (pct / 100) * 100) / 100

  // оплачиваемые дни
  let employerDays = 0
  let paidDays = sickDays

  if (reason === "self") {
    employerDays = Math.min(3, sickDays)
  } else if (reason === "child") {
    const age = parseInt(childAge) || 5
    if (age < 7) {
      paidDays = Math.min(sickDays, 60)
    } else if (age < 15) {
      paidDays = Math.min(sickDays, 15)
    } else {
      paidDays = Math.min(sickDays, 7)
    }
    employerDays = 0
  } else {
    // член семьи — до 7 дней
    paidDays = Math.min(sickDays, 7)
    employerDays = 0
  }

  // ребёнок амбулаторно: 10 дней по стажу, потом 50%
  let totalBenefit = 0
  if (reason === "child" && treatmentType === "ambulatory") {
    const fullDays = Math.min(10, paidDays)
    const halfDays = Math.max(0, paidDays - 10)
    totalBenefit = Math.round((dailyBenefit * fullDays + baseSDZ * 0.5 * halfDays) * 100) / 100
  } else {
    totalBenefit = Math.round(dailyBenefit * paidDays * 100) / 100
  }

  const employerPart = Math.round(dailyBenefit * employerDays * 100) / 100
  const sfrPart = Math.round((totalBenefit - employerPart) * 100) / 100

  return (
    <CalculatorLayout icon={Thermometer} title="Калькулятор больничного" description="Пособие по временной нетрудоспособности">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="sick-start" label="Начало больничного" value={startDate} onChange={setStartDate} />
        <DateInput id="sick-end" label="Окончание больничного" value={endDate} onChange={setEndDate} />
      </div>

      <div className="space-y-2">
        <Label>Причина нетрудоспособности</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="bg-input/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASON_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reason === "child" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="child-age">Возраст ребёнка (лет)</Label>
            <Input
              id="child-age"
              type="number"
              min="0"
              max="18"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="bg-input/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Тип лечения</Label>
            <RadioGroup value={treatmentType} onValueChange={(v) => setTreatmentType(v as "ambulatory" | "hospital")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambulatory" id="treat-amb" />
                <Label htmlFor="treat-amb" className="font-normal cursor-pointer">Амбулаторно</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hospital" id="treat-hosp" />
                <Label htmlFor="treat-hosp" className="font-normal cursor-pointer">Стационар</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Страховой стаж</Label>
        <Select value={experience} onValueChange={setExperience}>
          <SelectTrigger className="bg-input/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MoneyInput
        id="sick-earnings"
        label={`Заработок за ${prevYear2}–${prevYear1} гг.`}
        value={earnings}
        onChange={setEarnings}
      />

      <div className="space-y-2">
        <Label htmlFor="sick-excluded">Дни-исключения</Label>
        <Input
          id="sick-excluded"
          type="number"
          min="0"
          max="730"
          value={excludedDays}
          onChange={(e) => setExcludedDays(e.target.value)}
          className="bg-input/50 max-w-32"
        />
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow
            label="Расчётных дней"
            value={String(totalCalcDays)}
            sublabel={excludedVal > 0 ? `${isLeap(prevYear1) || isLeap(prevYear2) ? 731 : 730} − ${excludedVal} исключённых` : undefined}
          />
          <ResultRow label="СДЗ" value={`${formatCurrency(baseSDZ)} ₽`} copyValue={String(baseSDZ)} />
          <ResultRow label="Дневное пособие" value={`${formatCurrency(dailyBenefit)} ₽`}
            sublabel={experience === "less-6m" ? "По МРОТ (стаж < 6 мес.)" : `${pct}% от СДЗ`}
            copyValue={String(dailyBenefit)}
          />
          <ResultRow label="Дней больничного" value={String(sickDays)} />
          {reason === "self" && (
            <>
              <ResultRow label="За счёт работодателя (3 дня)" value={`${formatCurrency(employerPart)} ₽`} copyValue={String(employerPart)} />
              <ResultRow label="За счёт СФР" value={`${formatCurrency(sfrPart)} ₽`} copyValue={String(sfrPart)} />
            </>
          )}
          <ResultRow label="Итого пособие" value={`${formatCurrency(totalBenefit)} ₽`} highlight copyValue={String(totalBenefit)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Процент оплаты от стажа:</strong></p>
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-1">Стаж</th>
              <th className="text-right py-1">Оплата</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30"><td className="py-1">8 лет и более</td><td className="text-right py-1">100%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">5–8 лет</td><td className="text-right py-1">80%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">до 5 лет</td><td className="text-right py-1">60%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">менее 6 месяцев</td><td className="text-right py-1">по МРОТ</td></tr>
          </tbody>
        </table>
        <p className="mt-2"><strong>Уход за ребёнком:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>До 7 лет: оплачивается до 60 дней в году</li>
          <li>7–14 лет: до 15 дней за случай, 45 дней в году</li>
          <li>Амбулаторно: первые 10 дней — по стажу, далее — 50% СДЗ</li>
          <li>Стационар: все дни — по стажу</li>
        </ul>
      </InfoSection>
    </CalculatorLayout>
  )
}
