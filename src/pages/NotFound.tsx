import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useSEO } from "@/lib/use-seo"

export default function NotFound() {
  useSEO({ title: "Страница не найдена", noindex: true })
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up text-center">
      <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
        404
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Страница не найдена
      </p>
      <Button asChild variant="outline" className="gap-2">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Назад к инструментам
        </Link>
      </Button>
    </div>
  )
}
