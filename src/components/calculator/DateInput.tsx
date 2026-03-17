import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

export default function DateInput({ id, label, value, onChange }: DateInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-input/50"
      />
    </div>
  )
}
