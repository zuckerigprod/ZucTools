// "1 234 567,89"
export function formatCurrency(value: number, decimals = 2): string {
  const fixed = Math.abs(value).toFixed(decimals)
  const [intPart, decPart] = fixed.split(".")
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")
  const sign = value < 0 ? "−" : ""
  return decPart ? `${sign}${formatted},${decPart}` : `${sign}${formatted}`
}

// число с пробелами
export function formatNumber(value: number, decimals?: number): string {
  const num = decimals !== undefined ? value.toFixed(decimals) : String(value)
  const [intPart, decPart] = num.split(".")
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")
  return decPart ? `${formatted},${decPart}` : formatted
}

// "12.02.2026"
export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

// склонение: 5 → "рублей"
export function getPluralForm(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs >= 11 && abs <= 19) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

// "1 234,56 ₽"
export function formatRub(value: number, decimals = 2): string {
  return `${formatCurrency(value, decimals)}\u00A0₽`
}

// парсинг строки в число (пробелы, ₽, юникодный минус)
export function parseNumber(raw: string): number {
  const cleaned = raw
    .replace(/[\s\u00A0]/g, "")
    .replace(/₽/g, "")
    .replace(/−/g, "-")
    .replace(",", ".")
    .trim()
  return parseFloat(cleaned) || 0
}

// очистка вставленного текста
export function sanitizePastedNumber(raw: string): string {
  return raw
    .replace(/[\s\u00A0]/g, "")
    .replace(/[₽%]/g, "")
    .replace(/−/g, "-")
    .trim()
}
