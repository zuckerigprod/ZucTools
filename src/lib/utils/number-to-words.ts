const UNITS_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
const UNITS_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
const TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]

interface GroupDef {
  one: string
  few: string
  many: string
  feminine: boolean
}

const GROUPS: GroupDef[] = [
  { one: "", few: "", many: "", feminine: false },
  { one: "тысяча", few: "тысячи", many: "тысяч", feminine: true },
  { one: "миллион", few: "миллиона", many: "миллионов", feminine: false },
  { one: "миллиард", few: "миллиарда", many: "миллиардов", feminine: false },
  { one: "триллион", few: "триллиона", many: "триллионов", feminine: false },
  { one: "квадриллион", few: "квадриллиона", many: "квадриллионов", feminine: false },
]

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs >= 11 && abs <= 19) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

function convertGroup(n: number, feminine: boolean): string {
  if (n === 0) return ""
  const parts: string[] = []
  const h = Math.floor(n / 100)
  const remainder = n % 100
  const t = Math.floor(remainder / 10)
  const u = remainder % 10

  if (h > 0) parts.push(HUNDREDS[h])
  if (t === 1) {
    parts.push(TEENS[u])
  } else {
    if (t > 1) parts.push(TENS[t])
    if (u > 0) parts.push(feminine ? UNITS_F[u] : UNITS_M[u])
  }
  return parts.join(" ")
}

// 20576.80 → "Двадцать тысяч пятьсот семьдесят шесть рублей 80 копеек"
export function numberToWords(amount: number): string {
  if (amount < 0) return `минус ${numberToWords(-amount)}`

  const rubles = Math.floor(amount)
  const kopecks = Math.round((amount - rubles) * 100)

  if (rubles === 0 && kopecks === 0) {
    return "Ноль рублей 00 копеек"
  }

  // разбиваем по 3 цифры
  const groups: number[] = []
  let num = rubles
  if (num === 0) {
    groups.push(0)
  } else {
    while (num > 0) {
      groups.push(num % 1000)
      num = Math.floor(num / 1000)
    }
  }

  if (groups.length > GROUPS.length) {
    return "Число слишком большое для преобразования"
  }

  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g === 0 && groups.length > 1) continue
    const group = GROUPS[i]
    const text = convertGroup(g, group.feminine)
    if (text) {
      parts.push(text)
      if (group.one) {
        parts.push(pluralize(g, group.one, group.few, group.many))
      }
    }
  }

  const rubWord = pluralize(rubles, "рубль", "рубля", "рублей")
  const kopWord = pluralize(kopecks, "копейка", "копейки", "копеек")
  const kopStr = String(kopecks).padStart(2, "0")

  let result = parts.join(" ") + " " + rubWord + " " + kopStr + " " + kopWord
  // заглавная первая буква
  result = result.charAt(0).toUpperCase() + result.slice(1)
  return result
}
