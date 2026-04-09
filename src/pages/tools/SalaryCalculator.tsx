import { useState } from "react"
import { Wallet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { calculateSalaryGrossToNet, calculateSalaryNetToGross, type SalaryResult } from "@/lib/utils/salary"

const CHILDREN_OPTIONS = ["0", "1", "2", "3", "4", "5"]

export default function SalaryCalculator() {
  useSEO({
    title: "Калькулятор зарплаты онлайн",
    description: "Расчёт зарплаты: от начисленной к «на руки» и обратно, с НДФЛ, вычетами на детей и страховыми взносами.",
    keywords: "калькулятор зарплаты, расчёт зарплаты онлайн, зарплата на руки, НДФЛ с зарплаты, вычеты на детей, страховые взносы",
    jsonLd: buildToolJsonLd({ name: "Калькулятор зарплаты онлайн", description: "Расчёт зарплаты от начисленной к «на руки» и обратно с НДФЛ и взносами", url: "https://zuctools.ru/tools/salary-calculator" }),
  })

  const [tab, setTab] = useState("gross-to-net")
  const [amount, setAmount] = useState("")
  const [children, setChildren] = useState("0")
  const [resident, setResident] = useState("yes")
  const [msp, setMsp] = useState("no")

  const sum = parseNumber(amount)
  const isValid = !isNaN(sum) && sum > 0

  let result: SalaryResult | null = null
  if (isValid) {
    const childCount = parseInt(children)
    const isResident = resident === "yes"
    const isMsp = msp === "yes"

    if (tab === "gross-to-net") {
      result = calculateSalaryGrossToNet(sum, childCount, isResident, isMsp, 1)
    } else {
      result = calculateSalaryNetToGross(sum, childCount, isResident, isMsp, 1)
    }
  }

  return (
    <CalculatorLayout icon={Wallet} title="Калькулятор зарплаты" description="Расчёт зарплаты с НДФЛ и взносами">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gross-to-net">До вычета → На руки</TabsTrigger>
          <TabsTrigger value="net-to-gross">На руки → До вычета</TabsTrigger>
        </TabsList>
        <TabsContent value="gross-to-net" className="mt-4">
          <MoneyInput id="gross" label="Зарплата до вычета НДФЛ" value={amount} onChange={setAmount} />
        </TabsContent>
        <TabsContent value="net-to-gross" className="mt-4">
          <MoneyInput id="net" label="Желаемая зарплата на руки" value={amount} onChange={setAmount} />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Дети</Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger className="bg-input/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHILDREN_OPTIONS.map((n) => (
                <SelectItem key={n} value={n}>{n === "0" ? "Нет детей" : `${n}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Резидент РФ</Label>
          <RadioGroup value={resident} onValueChange={setResident} className="flex gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="res-yes" />
              <Label htmlFor="res-yes" className="font-normal cursor-pointer">Да</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="res-no" />
              <Label htmlFor="res-no" className="font-normal cursor-pointer">Нет</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Работодатель — МСП (малое/среднее предприятие)</Label>
        <RadioGroup value={msp} onValueChange={setMsp} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="msp-no" />
            <Label htmlFor="msp-no" className="font-normal cursor-pointer">Нет</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="msp-yes" />
            <Label htmlFor="msp-yes" className="font-normal cursor-pointer">Да</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {result && (
        <div className="space-y-3">
          <ResultRow label="Начислено (до вычета)" value={`${formatCurrency(result.gross)} ₽`} copyValue={String(result.gross)} />
          <ResultRow label="НДФЛ" value={`${formatCurrency(result.ndfl)} ₽`} copyValue={String(result.ndfl)} />
          <ResultRow label="На руки" value={`${formatCurrency(result.net)} ₽`} highlight copyValue={String(result.net)} />

          <div className="mt-2 pt-2 border-t border-border/30">
            <p className="text-sm font-medium text-muted-foreground mb-2">Взносы работодателя:</p>
          </div>
          <ResultRow label="ПФР (пенсионное)" value={`${formatCurrency(result.pensionContrib)} ₽`} copyValue={String(result.pensionContrib)} />
          <ResultRow label="ФОМС (медицинское)" value={`${formatCurrency(result.medicalContrib)} ₽`} copyValue={String(result.medicalContrib)} />
          <ResultRow label="ФСС (социальное)" value={`${formatCurrency(result.socialContrib)} ₽`} copyValue={String(result.socialContrib)} />
          <ResultRow label="НС (несч. случаи)" value={`${formatCurrency(result.accidentContrib)} ₽`} copyValue={String(result.accidentContrib)} />
          <ResultRow label="Итого взносы" value={`${formatCurrency(result.totalContrib)} ₽`} copyValue={String(result.totalContrib)} />
          <ResultRow label="Полная стоимость" value={`${formatCurrency(result.totalCost)} ₽`} highlight copyValue={String(result.totalCost)} />
        </div>
      )}

      <InfoSection>
        <p><strong>Формула расчёта:</strong></p>
        <p>На руки = Начислено − НДФЛ</p>
        <p>НДФЛ рассчитывается по прогрессивной шкале (с 2025 года): 13%, 15%, 18%, 20%, 22%.</p>
        <p className="mt-2"><strong>Вычеты на детей:</strong> 1 400 ₽ на 1-го и 2-го, 3 000 ₽ на 3-го и далее. Вычет действует пока доход нарастающим итогом не превысит 350 000 ₽.</p>
        <p className="mt-2"><strong>Взносы работодателя:</strong> ПФР 22%, ФОМС 5,1%, ФСС 2,9%, НС от 0,2%. Для МСП — сниженная совокупная ставка 15% на часть зарплаты свыше МРОТ.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
