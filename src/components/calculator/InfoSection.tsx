import { useState, type ReactNode } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoSectionProps {
  children: ReactNode
  title?: string
}

export default function InfoSection({ children, title = "Справочная информация" }: InfoSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 rounded-lg bg-secondary/30 px-4 py-4 text-sm text-muted-foreground space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
