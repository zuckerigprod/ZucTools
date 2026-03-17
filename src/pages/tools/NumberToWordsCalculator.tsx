import { useState } from "react"
import { Type } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import MoneyInput from "@/components/calculator/MoneyInput"
import InfoSection from "@/components/calculator/InfoSection"
import { numberToWords } from "@/lib/utils/number-to-words"
import { parseNumber } from "@/lib/utils/format"

export default function NumberToWordsCalculator() {
  useSEO({
    title: "Сумма прописью онлайн",
    description: "Бесплатный онлайн-калькулятор: переведите число в текст прописью. Рубли и копейки. Для платёжных поручений и документов.",
  })

  const [amount, setAmount] = useState("")
  const [copied, setCopied] = useState(false)

  const sum = parseNumber(amount)
  const isValid = amount.trim() !== "" && !isNaN(sum) && sum >= 0
  const text = isValid ? numberToWords(sum) : ""

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <CalculatorLayout icon={Type} title="Сумма прописью" description="Преобразование числа в текст">
      <MoneyInput id="amount" label="Сумма (руб.)" value={amount} onChange={setAmount} />

      <Separator />

      {isValid && text && (
        <div className="space-y-3">
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-4">
            <p className="text-lg font-medium leading-relaxed">{text}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Скопировано" : "Копировать"}
          </Button>
        </div>
      )}

      <InfoSection>
        <p><strong>Как это работает:</strong></p>
        <p>Число разбивается на группы по три цифры (единицы, тысячи, миллионы, миллиарды) и каждая группа преобразуется в текст с учётом рода и склонения.</p>
        <p className="mt-2"><strong>Правила склонения:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>1 → рубль, тысяча, миллион</li>
          <li>2–4 → рубля, тысячи, миллиона</li>
          <li>5–20 → рублей, тысяч, миллионов</li>
          <li>21 → рубль (повторяется цикл)</li>
        </ul>
        <p className="mt-2"><strong>Примеры:</strong></p>
        <p>1 234,50 → «Одна тысяча двести тридцать четыре рубля 50 копеек»</p>
        <p>20 576,80 → «Двадцать тысяч пятьсот семьдесят шесть рублей 80 копеек»</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
