import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface CalculatorLayoutProps {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
  maxWidth?: string
}

export default function CalculatorLayout({
  icon: Icon,
  title,
  description,
  children,
  maxWidth = "max-w-2xl",
}: CalculatorLayoutProps) {
  return (
    <div className={`${maxWidth} mx-auto animate-fade-in-up`}>
      <Button asChild variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Назад к инструментам
        </Link>
      </Button>

      <Card className="bg-white/80 shadow-md border-border light:text-gray-900 dark:bg-card/60 dark:shadow-none dark:border-border/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
