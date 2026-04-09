import { useState } from "react"
import { Baby } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { MROT, CONTRIBUTION_BASE, MATERNITY_DAYS } from "@/lib/constants/tax-constants"

type PregnancyType = "normal" | "complicated" | "multiple"

export default function MaternityCalculator() {
  useSEO({
    title: "Калькулятор декретных онлайн",
    description: "Рассчитайте пособие по беременности и родам. Учёт МРОТ, предельных баз, дней-исключений. Данные 2024–2026.",
    keywords: "калькулятор декретных, пособие по беременности и родам, декретные выплаты, расчёт декретных 2025, больничный по беременности",
    jsonLd: buildToolJsonLd({ name: "Калькулятор декретных", description: "Расчёт пособия по беременности и родам с учётом МРОТ и предельных баз", url: "https://zuctools.ru/tools/maternity-calculator" }),
  })

  const [startDate, setStartDate] = useState("")
  const [pregnancyType, setPregnancyType] = useState<PregnancyType>("normal")
  const [earnings, setEarnings] = useState("")
  const [excludedDays, setExcludedDays] = useState("0")

  const startD = startDate ? new Date(startDate) : null
  const year = startD ? startD.getFullYear() : 2026
  const prevYear1 = year - 1
  const prevYear2 = year - 2

  const earningsVal = parseNumber(earnings)
  const excludedVal = parseInt(excludedDays) || 0
  const days = MATERNITY_DAYS[pregnancyType]

  // расчётные дни (730/731 минус исключения)
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
  const totalCalcDays = (isLeap(prevYear1) || isLeap(prevYear2) ? 731 : 730) - excludedVal

  // ограничение по предельным базам
  const maxBase1 = CONTRIBUTION_BASE[prevYear1] || CONTRIBUTION_BASE[2026]
  const maxBase2 = CONTRIBUTION_BASE[prevYear2] || CONTRIBUTION_BASE[2025]
  const maxEarnings = maxBase1 + maxBase2
  const effectiveEarnings = Math.min(earningsVal, maxEarnings)

  // среднедневной
  const sdz = totalCalcDays > 0 ? effectiveEarnings / totalCalcDays : 0

  // мин. СДЗ по МРОТ
  const mrot = MROT[year] || MROT[2026]
  const minSDZ = (mrot * 24) / 730

  // макс. СДЗ
  const maxSDZ = maxEarnings / 730

  const effectiveSDZ = Math.max(Math.min(sdz, maxSDZ), minSDZ)
  const benefit = Math.round(effectiveSDZ * days * 100) / 100

  const isValid = earningsVal > 0 && totalCalcDays > 0

  return (
    <CalculatorLayout icon={Baby} title="Калькулятор декретных" description="Пособие по беременности и родам">
      <DateInput id="maternity-start" label="Дата начала декрета" value={startDate} onChange={setStartDate} />

      <div className="space-y-2">
        <Label>Вид беременности</Label>
        <RadioGroup value={pregnancyType} onValueChange={(v) => setPregnancyType(v as PregnancyType)} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="preg-normal" />
            <Label htmlFor="preg-normal" className="font-normal cursor-pointer">Обычная (140 дней)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complicated" id="preg-complicated" />
            <Label htmlFor="preg-complicated" className="font-normal cursor-pointer">Осложнённая (156 дней)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiple" id="preg-multiple" />
            <Label htmlFor="preg-multiple" className="font-normal cursor-pointer">Многоплодная (194 дня)</Label>
          </div>
        </RadioGroup>
      </div>

      <MoneyInput
        id="maternity-earnings"
        label={`Заработок за ${prevYear2}–${prevYear1} гг.`}
        value={earnings}
        onChange={setEarnings}
      />

      <div className="space-y-2">
        <Label htmlFor="excluded-days">Дни-исключения</Label>
        <Input
          id="excluded-days"
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
          <ResultRow label="Среднедневной заработок (СДЗ)" value={`${formatCurrency(effectiveSDZ)} ₽`}
            sublabel={sdz < minSDZ ? "Увеличен до минимума по МРОТ" : sdz > maxSDZ ? "Ограничен максимумом" : undefined}
            copyValue={String(effectiveSDZ)}
          />
          <ResultRow label="Дней декрета" value={String(days)} />
          <ResultRow label="Пособие по БиР" value={`${formatCurrency(benefit)} ₽`} highlight copyValue={String(benefit)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Формула:</strong> Пособие = СДЗ × Дни декрета</p>
        <p>СДЗ = Заработок за 2 года / (730 − дни-исключения)</p>
        <p className="mt-2"><strong>МРОТ и предельные базы:</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs mt-1">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-1">Год</th>
                <th className="text-right py-1">МРОТ</th>
                <th className="text-right py-1">Пред. база</th>
              </tr>
            </thead>
            <tbody>
              {[2024, 2025, 2026].map((y) => (
                <tr key={y} className="border-b border-border/30">
                  <td className="py-1">{y}</td>
                  <td className="text-right py-1">{formatCurrency(MROT[y] || 0, 0)} ₽</td>
                  <td className="text-right py-1">{formatCurrency(CONTRIBUTION_BASE[y] || 0, 0)} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2"><strong>Что входит в дни-исключения:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Периоды временной нетрудоспособности</li>
          <li>Отпуск по беременности и родам</li>
          <li>Отпуск по уходу за ребёнком</li>
          <li>Периоды освобождения от работы с сохранением зарплаты</li>
        </ul>
      </InfoSection>
    </CalculatorLayout>
  )
}
