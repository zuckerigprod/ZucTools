import { useState } from "react"
import { Receipt } from "lucide-react"
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

const VAT_RATES = [
  { value: "5", label: "5%" },
  { value: "7", label: "7%" },
  { value: "10", label: "10%" },
  { value: "18", label: "18%" },
  { value: "20", label: "20%" },
  { value: "22", label: "22%" },
]

export default function VatCalculator() {
  useSEO({
    title: "Калькулятор НДС онлайн",
    description: "Бесплатный онлайн-калькулятор НДС: выделение и начисление НДС по ставкам 5%, 7%, 10%, 18%, 20%, 22%. Быстрый расчёт с суммой прописью.",
  })

  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"add" | "extract">("add")
  const [rate, setRate] = useState("20")

  const sum = parseNumber(amount)
  const r = parseFloat(rate) / 100
  const isValid = !isNaN(sum) && sum > 0

  let vatAmount = 0
  let withoutVat = 0
  let withVat = 0

  if (isValid) {
    if (type === "add") {
      vatAmount = sum * r
      withoutVat = sum
      withVat = sum + vatAmount
    } else {
      vatAmount = sum * r / (1 + r)
      withVat = sum
      withoutVat = sum - vatAmount
    }
    vatAmount = Math.round(vatAmount * 100) / 100
    withoutVat = Math.round(withoutVat * 100) / 100
    withVat = Math.round(withVat * 100) / 100
  }

  return (
    <CalculatorLayout icon={Receipt} title="Калькулятор НДС" description="Начисление и выделение НДС">
      <MoneyInput id="amount" label="Сумма" value={amount} onChange={setAmount} />

      <div className="space-y-2">
        <Label>Тип расчёта</Label>
        <RadioGroup value={type} onValueChange={(v) => setType(v as "add" | "extract")} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="add" id="vat-add" />
            <Label htmlFor="vat-add" className="font-normal cursor-pointer">Начислить НДС</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="extract" id="vat-extract" />
            <Label htmlFor="vat-extract" className="font-normal cursor-pointer">Выделить НДС</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Ставка НДС</Label>
        <RadioGroup value={rate} onValueChange={setRate} className="flex flex-wrap gap-3">
          {VAT_RATES.map((r) => (
            <div key={r.value} className="flex items-center space-x-1.5">
              <RadioGroupItem value={r.value} id={`rate-${r.value}`} />
              <Label htmlFor={`rate-${r.value}`} className="font-normal cursor-pointer">{r.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow
            label="Сумма НДС"
            value={`${formatCurrency(vatAmount)} ₽`}
            highlight
            sublabel={numberToWords(vatAmount)}
            copyValue={String(vatAmount)}
          />
          <ResultRow label="Сумма без НДС" value={`${formatCurrency(withoutVat)} ₽`} copyValue={String(withoutVat)} />
          <ResultRow label="Сумма с НДС" value={`${formatCurrency(withVat)} ₽`} copyValue={String(withVat)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Ставки НДС в России:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>22%</strong> — новая базовая ставка с 2026 года (вместо 20%)</li>
          <li><strong>20%</strong> — базовая ставка до 2025 года включительно</li>
          <li><strong>10%</strong> — продовольственные товары, детские товары, медикаменты, книги</li>
          <li><strong>5% и 7%</strong> — специальные ставки для плательщиков УСН с 2025 года</li>
          <li><strong>18%</strong> — базовая ставка до 2019 года (для пересчёта)</li>
          <li><strong>0%</strong> — экспорт, международные перевозки</li>
        </ul>
        <p className="mt-2"><strong>Формулы:</strong></p>
        <p>Начислить: НДС = Сумма × Ставка</p>
        <p>Выделить: НДС = Сумма × Ставка / (1 + Ставка)</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
