import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface ResultRowProps {
  label: string
  value: string
  highlight?: boolean
  sublabel?: string
  copyValue?: string
}

export default function ResultRow({ label, value, highlight, sublabel, copyValue }: ResultRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!copyValue) return
    await navigator.clipboard.writeText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      "flex flex-col gap-1 rounded-lg px-4 py-3",
      highlight ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-lg font-semibold",
            highlight ? "text-primary" : "text-foreground"
          )}>{value}</span>
          {copyValue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Копировать"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Скопировано" : "Копировать"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      {sublabel && (
        <span className="text-xs text-muted-foreground italic">{sublabel}</span>
      )}
    </div>
  )
}
