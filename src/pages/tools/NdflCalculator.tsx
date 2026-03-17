import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, formatNumber, parseNumber } from "@/lib/utils/format"
import { NDFL_SCALE_2025 } from "@/lib/constants/tax-constants"
import { calculateNDFL } from "@/lib/utils/ndfl"

const BRACKET_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-700",
]

interface BracketInfo {
  from: number
  to: number
  rate: number
  amount: number
  tax: number
}

function getBrackets(income: number): BracketInfo[] {
  const brackets: BracketInfo[] = []
  let remaining = income
  let prevLimit = 0

  for (const bracket of NDFL_SCALE_2025) {
    const bracketSize = bracket.limit === Infinity
      ? remaining
      : Math.min(remaining, bracket.limit - prevLimit)

    if (bracketSize <= 0) break

    brackets.push({
      from: prevLimit,
      to: prevLimit + bracketSize,
      rate: bracket.rate,
      amount: bracketSize,
      tax: Math.round(bracketSize * bracket.rate / 100 * 100) / 100,
    })

    remaining -= bracketSize
    prevLimit = bracket.limit === Infinity ? prevLimit + bracketSize : bracket.limit
  }

  return brackets
}

export default function NdflCalculator() {
  useSEO({
    title: "Калькулятор НДФЛ онлайн",
    description: "Расчёт НДФЛ по прогрессивной шкале 2025–2026 с визуализацией налоговых ступеней.",
  })

  const [amount, setAmount] = useState("")

  const income = parseNumber(amount)
  const isValid = !isNaN(income) && income > 0

  const totalNdfl = isValid ? calculateNDFL(income) : 0
  const effectiveRate = isValid ? Math.round(totalNdfl / income * 100 * 100) / 100 : 0
  const brackets = isValid ? getBrackets(income) : []
  const totalTax = brackets.reduce((s, b) => s + b.tax, 0)

  return (
    <CalculatorLayout icon={TrendingUp} title="Калькулятор НДФЛ" description="Прогрессивная шкала НДФЛ с 2025 года">
      <MoneyInput id="income" label="Годовой доход" value={amount} onChange={setAmount} />

      <Separator />

      {isValid && (
        <div className="space-y-4">
          {/* полоски ставок */}
          <div className="flex rounded-lg overflow-hidden h-8">
            {brackets.map((b, i) => {
              const widthPercent = (b.amount / income) * 100
              return (
                <div
                  key={i}
                  className={`${BRACKET_COLORS[i]} flex items-center justify-center text-white text-xs font-medium`}
                  style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  title={`${b.rate}%: ${formatCurrency(b.amount)} ₽`}
                >
                  {widthPercent > 8 ? `${b.rate}%` : ""}
                </div>
              )
            })}
          </div>

          {/* таблица */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 font-medium">Ставка</th>
                  <th className="text-left py-2 font-medium">Диапазон дохода</th>
                  <th className="text-right py-2 font-medium">Сумма</th>
                  <th className="text-right py-2 font-medium">Налог</th>
                </tr>
              </thead>
              <tbody>
                {brackets.map((b, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-2">
                      <span className={`inline-block w-3 h-3 rounded-sm mr-2 ${BRACKET_COLORS[i]}`} />
                      {b.rate}%
                    </td>
                    <td className="py-2">{formatCurrency(b.from, 0)} – {formatCurrency(b.to, 0)} ₽</td>
                    <td className="py-2 text-right">{formatCurrency(b.amount, 0)} ₽</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(b.tax)} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <ResultRow label="Итого НДФЛ" value={`${formatCurrency(totalNdfl)} ₽`} highlight copyValue={String(totalNdfl)} />
            <ResultRow label="Эффективная ставка" value={`${formatNumber(effectiveRate)}%`} copyValue={String(effectiveRate)} />
            <ResultRow label="На руки" value={`${formatCurrency(income - totalTax)} ₽`} copyValue={String(income - totalTax)} />
          </div>
        </div>
      )}

      <InfoSection>
        <p><strong>Прогрессивная шкала НДФЛ (с 2025 года):</strong></p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>13%</strong> — до 2 400 000 ₽</li>
          <li><strong>15%</strong> — от 2 400 000 до 5 000 000 ₽</li>
          <li><strong>18%</strong> — от 5 000 000 до 20 000 000 ₽</li>
          <li><strong>20%</strong> — от 20 000 000 до 50 000 000 ₽</li>
          <li><strong>22%</strong> — свыше 50 000 000 ₽</li>
        </ul>
        <p className="mt-2">Для нерезидентов применяется единая ставка 30%.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
