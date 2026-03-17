import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import DateInput from "@/components/calculator/DateInput"
import MoneyInput from "@/components/calculator/MoneyInput"
import ResultRow from "@/components/calculator/ResultRow"
import InfoSection from "@/components/calculator/InfoSection"
import { formatCurrency, formatDate, parseNumber } from "@/lib/utils/format"
import { countCalendarDays } from "@/lib/utils/calendar"
import { getCBRatePeriods } from "@/lib/utils/calendar"
import { CB_RATE_HISTORY } from "@/lib/constants/tax-constants"

type PayerType = "ip" | "org"

const PAYMENT_TYPES = [
  { value: "tax", label: "Налоги" },
  { value: "contributions", label: "Страховые взносы" },
  { value: "other", label: "Прочие платежи" },
]

export default function PenaltyCalculator() {
  useSEO({
    title: "Калькулятор пеней по налогам",
    description: "Рассчитайте пени за просрочку уплаты налогов и взносов. Учёт ключевой ставки ЦБ, тип плательщика (ИП/организация).",
  })

  const [payerType, setPayerType] = useState<PayerType>("ip")
  const [paymentType, setPaymentType] = useState("tax")
  const [amount, setAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const debt = parseNumber(amount)
  const startD = startDate ? new Date(startDate) : null
  const endD = endDate ? new Date(endDate) : null
  const isValid = debt > 0 && startD && endD && endD > startD

  let totalDays = 0
  let totalPenalty = 0
  let periods: { from: Date; to: Date; rate: number; days: number; penalty: number }[] = []

  if (isValid) {
    totalDays = countCalendarDays(startD, endD) - 1 // без дня уплаты
    const cbPeriods = getCBRatePeriods(startD, endD)

    let dayCounter = 0
    for (const p of cbPeriods) {
      let periodPenalty = 0

      if (payerType === "org") {
        // орг: 30 дней 1/300, потом 1/150
        const daysInPeriod = p.days
        for (let d = 0; d < daysInPeriod; d++) {
          dayCounter++
          if (dayCounter <= 30) {
            periodPenalty += debt * (p.rate / 100) / 300
          } else {
            periodPenalty += debt * (p.rate / 100) / 150
          }
        }
      } else {
        // ИП: всегда 1/300
        periodPenalty = debt * (p.rate / 100) / 300 * p.days
        dayCounter += p.days
      }

      periodPenalty = Math.round(periodPenalty * 100) / 100
      totalPenalty += periodPenalty
      periods.push({ ...p, penalty: periodPenalty })
    }

    totalPenalty = Math.round(totalPenalty * 100) / 100
  }

  return (
    <CalculatorLayout icon={AlertTriangle} title="Расчёт пеней" description="Пени за просрочку налогов и взносов">
      <div className="space-y-2">
        <Label>Тип плательщика</Label>
        <RadioGroup value={payerType} onValueChange={(v) => setPayerType(v as PayerType)} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ip" id="payer-ip" />
            <Label htmlFor="payer-ip" className="font-normal cursor-pointer">ИП / Физлицо</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="org" id="payer-org" />
            <Label htmlFor="payer-org" className="font-normal cursor-pointer">Организация</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Вид платежа</Label>
        <Select value={paymentType} onValueChange={setPaymentType}>
          <SelectTrigger className="bg-input/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TYPES.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MoneyInput id="penalty-amount" label="Сумма задолженности" value={amount} onChange={setAmount} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateInput id="penalty-start" label="Дата начала просрочки" value={startDate} onChange={setStartDate} />
        <DateInput id="penalty-end" label="Дата уплаты" value={endDate} onChange={setEndDate} />
      </div>

      <Separator />

      {isValid && (
        <div className="space-y-3">
          <ResultRow label="Дней просрочки" value={String(totalDays)} />

          {periods.length > 1 && (
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Разбивка по периодам ставки ЦБ:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-1">Период</th>
                      <th className="text-right py-1">Ставка</th>
                      <th className="text-right py-1">Дней</th>
                      <th className="text-right py-1">Пени</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-1">{formatDate(p.from)} – {formatDate(p.to)}</td>
                        <td className="text-right py-1">{p.rate}%</td>
                        <td className="text-right py-1">{p.days}</td>
                        <td className="text-right py-1">{formatCurrency(p.penalty)} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {periods.length === 1 && (
            <ResultRow label={`Ставка ЦБ`} value={`${periods[0].rate}%`} />
          )}

          <ResultRow label="Итого пени" value={`${formatCurrency(totalPenalty)} ₽`} highlight copyValue={String(totalPenalty)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Правила расчёта пеней:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ИП и физлица:</strong> 1/300 ключевой ставки ЦБ за каждый день</li>
          <li><strong>Организации:</strong> первые 30 дней — 1/300 ставки, с 31-го дня — 1/150 ставки</li>
          <li>Пени начисляются за каждый календарный день просрочки</li>
          <li>День уплаты не включается в расчёт</li>
        </ul>
        <p className="mt-2"><strong>История ключевой ставки ЦБ (последние):</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs mt-1">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-1">С даты</th>
                <th className="text-right py-1">Ставка</th>
              </tr>
            </thead>
            <tbody>
              {CB_RATE_HISTORY.slice(0, 8).map((entry, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-1">{formatDate(new Date(entry.from))}</td>
                  <td className="text-right py-1">{entry.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>
    </CalculatorLayout>
  )
}
