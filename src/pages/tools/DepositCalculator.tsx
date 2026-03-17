import { useState } from "react"
import { PiggyBank } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, formatNumber, parseNumber, sanitizePastedNumber } from "@/lib/utils/format"
import { calculateDeposit } from "@/lib/utils/deposit"

const CAP_OPTIONS = [
  { value: "monthly", label: "Ежемесячная" },
  { value: "quarterly", label: "Ежеквартальная" },
  { value: "yearly", label: "Ежегодная" },
  { value: "none", label: "Без капитализации" },
]

export default function DepositCalculator() {
  useSEO({
    title: "Калькулятор вклада онлайн",
    description: "Расчёт доходности вклада с капитализацией процентов и ежемесячным пополнением.",
  })

  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [months, setMonths] = useState("")
  const [capitalization, setCapitalization] = useState("monthly")
  const [topUp, setTopUp] = useState("")

  const depositAmount = parseNumber(amount)
  const annualRate = parseNumber(rate)
  const termMonths = parseInt(months)
  const monthlyTopUp = parseNumber(topUp)
  const isValid = !isNaN(depositAmount) && depositAmount > 0 && !isNaN(annualRate) && annualRate > 0 && !isNaN(termMonths) && termMonths > 0

  const result = isValid
    ? calculateDeposit(depositAmount, annualRate, termMonths, capitalization as "monthly" | "quarterly" | "yearly" | "none", monthlyTopUp)
    : null

  return (
    <CalculatorLayout icon={PiggyBank} title="Калькулятор вклада" description="Расчёт процентов по вкладу с капитализацией">
      <MoneyInput id="deposit-amount" label="Сумма вклада" value={amount} onChange={setAmount} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-rate">Процентная ставка (% годовых)</Label>
          <Input
            id="deposit-rate"
            type="text"
            inputMode="decimal"
            placeholder="21"
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
          <Label htmlFor="deposit-months">Срок (месяцев)</Label>
          <Input
            id="deposit-months"
            type="text"
            inputMode="numeric"
            placeholder="12"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Капитализация</Label>
          <Select value={capitalization} onValueChange={setCapitalization}>
            <SelectTrigger className="bg-input/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAP_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <MoneyInput id="deposit-topup" label="Пополнение в месяц" value={topUp} onChange={setTopUp} placeholder="0" />
      </div>

      <Separator />

      {result && (
        <div className="space-y-3">
          <ResultRow label="Начисленные проценты" value={`${formatCurrency(result.totalInterest)} ₽`} highlight copyValue={String(result.totalInterest)} />
          <ResultRow label="Итоговая сумма" value={`${formatCurrency(result.finalAmount)} ₽`} highlight copyValue={String(result.finalAmount)} />
          <ResultRow label="Эффективная ставка" value={`${formatNumber(result.effectiveRate)}%`} copyValue={String(result.effectiveRate)} />
          {result.ndfl > 0 && (
            <ResultRow label="НДФЛ на проценты" value={`${formatCurrency(result.ndfl)} ₽`} sublabel="Сумма превышает необлагаемый порог" copyValue={String(result.ndfl)} />
          )}
        </div>
      )}

      <InfoSection>
        <p><strong>Капитализация</strong> — начисленные проценты прибавляются к телу вклада и участвуют в дальнейшем начислении.</p>
        <p className="mt-2"><strong>НДФЛ на проценты</strong> (с 2023 года): если сумма процентов за год превышает необлагаемый минимум (1 млн ₽ × максимальная ставка ЦБ на 1-е число месяца), разница облагается по ставке 13%.</p>
        <p className="mt-2"><strong>Эффективная ставка</strong> — реальная доходность с учётом капитализации, приведённая к годовым процентам.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
