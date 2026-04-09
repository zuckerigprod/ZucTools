import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calculator } from "lucide-react"
import { useSEO, buildToolJsonLd } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import ResultRow from "@/components/calculator/ResultRow"

export default function PercentCalculator() {
  useSEO({
    title: "Калькулятор процентов онлайн",
    description: "Бесплатный калькулятор процентов: вычисление процента от числа, прибавление и вычитание процентов. Быстро и точно.",
    keywords: "калькулятор процентов, процент от числа, прибавить процент, вычесть процент, расчёт процентов онлайн",
    jsonLd: buildToolJsonLd({ name: "Калькулятор процентов онлайн", description: "Вычисление процента от числа, прибавление и вычитание процентов", url: "https://zuctools.ru/tools/percent-calculator" }),
  })
  const [number, setNumber] = useState("")
  const [percent, setPercent] = useState("")

  const num = parseFloat(number)
  const pct = parseFloat(percent)
  const isValid = !isNaN(num) && !isNaN(pct)

  const percentOfNumber = isValid ? (num * pct) / 100 : null
  const numberPlusPercent = isValid ? num + (num * pct) / 100 : null
  const numberMinusPercent = isValid ? num - (num * pct) / 100 : null

  const formatResult = (value: number | null) => {
    if (value === null) return "—"
    return Number.isInteger(value) ? value.toString() : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")
  }

  return (
    <CalculatorLayout icon={Calculator} title="Калькулятор процентов" description="Вычисление процентов от числа">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Число</Label>
          <Input
            id="number"
            type="number"
            placeholder="100"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="bg-input/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="percent">Процент (%)</Label>
          <Input
            id="percent"
            type="number"
            placeholder="15"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="bg-input/50"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <ResultRow
          label={`${percent || "X"}% от ${number || "числа"}`}
          value={formatResult(percentOfNumber)}
          copyValue={percentOfNumber !== null ? formatResult(percentOfNumber) : undefined}
        />
        <ResultRow
          label={`${number || "Число"} + ${percent || "X"}%`}
          value={formatResult(numberPlusPercent)}
          copyValue={numberPlusPercent !== null ? formatResult(numberPlusPercent) : undefined}
        />
        <ResultRow
          label={`${number || "Число"} − ${percent || "X"}%`}
          value={formatResult(numberMinusPercent)}
          copyValue={numberMinusPercent !== null ? formatResult(numberMinusPercent) : undefined}
        />
      </div>
    </CalculatorLayout>
  )
}
