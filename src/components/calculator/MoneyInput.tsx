import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sanitizePastedNumber } from "@/lib/utils/format"

interface MoneyInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MoneyInput({ id, label, value, onChange, placeholder = "0,00 руб." }: MoneyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // макс. 2 знака после запятой
    if (/^\d*[.,]?\d{0,2}$/.test(val) || val === "") {
      onChange(val)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const raw = e.clipboardData.getData("text")
    // чистим вставленное
    let cleaned = sanitizePastedNumber(raw).replace(".", ",")
    // минус не нужен для сумм
    cleaned = cleaned.replace(/^-/, "")
    if (/^\d*[,]?\d{0,2}$/.test(cleaned) || cleaned === "") {
      onChange(cleaned)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        className="bg-input/50"
      />
    </div>
  )
}
