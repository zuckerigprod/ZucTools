import { useState } from "react"
import { Gavel } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, parseNumber } from "@/lib/utils/format"
import { numberToWords } from "@/lib/utils/number-to-words"
import { calculateCourtFee } from "@/lib/utils/court-fee"

export default function CourtFeeCalculator() {
  useSEO({
    title: "Калькулятор госпошлины в суд онлайн",
    description: "Расчёт госпошлины для судов общей юрисдикции и арбитражных судов по ст. 333.19 и 333.21 НК РФ.",
  })

  const [amount, setAmount] = useState("")
  const [courtType, setCourtType] = useState<"general" | "arbitration">("general")

  const sum = parseNumber(amount)
  const isValid = !isNaN(sum) && sum > 0

  const fee = isValid ? calculateCourtFee(sum, courtType) : 0

  return (
    <CalculatorLayout icon={Gavel} title="Госпошлина в суд" description="Расчёт госпошлины по имущественным искам">
      <MoneyInput id="amount" label="Цена иска" value={amount} onChange={setAmount} />

      <div className="space-y-2">
        <Label>Тип суда</Label>
        <RadioGroup value={courtType} onValueChange={(v) => setCourtType(v as "general" | "arbitration")} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="general" id="court-general" />
            <Label htmlFor="court-general" className="font-normal cursor-pointer">Общая юрисдикция</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="arbitration" id="court-arbitration" />
            <Label htmlFor="court-arbitration" className="font-normal cursor-pointer">Арбитражный суд</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow
            label="Госпошлина"
            value={`${formatCurrency(fee)} ₽`}
            highlight
            sublabel={numberToWords(fee)}
            copyValue={String(fee)}
          />
        </div>
      )}

      <InfoSection>
        <p><strong>Суды общей юрисдикции</strong> (ст. 333.19 НК РФ):</p>
        <table className="w-full text-xs mt-2 mb-3">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-1">Цена иска</th>
              <th className="text-left py-1">Госпошлина</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            <tr className="border-b border-border/30"><td className="py-1">до 20 000 ₽</td><td className="py-1">4%, мин. 400 ₽</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">20 001 – 100 000 ₽</td><td className="py-1">800 ₽ + 3%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">100 001 – 200 000 ₽</td><td className="py-1">3 200 ₽ + 2%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">200 001 – 1 000 000 ₽</td><td className="py-1">5 200 ₽ + 1%</td></tr>
            <tr><td className="py-1">свыше 1 000 000 ₽</td><td className="py-1">13 200 ₽ + 0,5%, макс. 60 000 ₽</td></tr>
          </tbody>
        </table>

        <p><strong>Арбитражные суды</strong> (ст. 333.21 НК РФ):</p>
        <table className="w-full text-xs mt-2">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-1">Цена иска</th>
              <th className="text-left py-1">Госпошлина</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30"><td className="py-1">до 100 000 ₽</td><td className="py-1">4%, мин. 2 000 ₽</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">100 001 – 200 000 ₽</td><td className="py-1">4 000 ₽ + 3%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">200 001 – 1 000 000 ₽</td><td className="py-1">7 000 ₽ + 2%</td></tr>
            <tr className="border-b border-border/30"><td className="py-1">1 000 001 – 2 000 000 ₽</td><td className="py-1">23 000 ₽ + 1%</td></tr>
            <tr><td className="py-1">свыше 2 000 000 ₽</td><td className="py-1">33 000 ₽ + 0,5%, макс. 200 000 ₽</td></tr>
          </tbody>
        </table>
      </InfoSection>
    </CalculatorLayout>
  )
}
