import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toolsRegistry, CATEGORY_ORDER } from "@/lib/tools-registry"
import { useSEO } from "@/lib/use-seo"

export default function Home() {
  useSEO({
    title: "Бесплатные онлайн-калькуляторы и инструменты",
    description: "ZucTools — бесплатные онлайн-калькуляторы и утилиты: проценты, НДС, налоги, зарплата и многое другое. Быстро, удобно, без регистрации.",
  })

  return (
    <div className="flex flex-col gap-16 py-4">
      {/* герой */}
      <section className="relative flex flex-col items-center text-center gap-6 py-12 md:py-20 animate-fade-in-up">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-pink/10 animate-glow-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          Бесплатные онлайн-инструменты
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-neon-blue bg-[length:200%_auto] animate-[gradient-shift_6s_ease-in-out_infinite] bg-clip-text text-transparent">
            ZucTools
          </span>
        </h1>

        <p className="max-w-lg text-lg md:text-xl text-muted-foreground">
          Набор полезных калькуляторов и утилит.
          <br className="hidden sm:block" />
          Быстро, удобно, без регистрации.
        </p>

        <Button asChild size="lg" className="gap-2 mt-2">
          <a href="#tools">
            Смотреть инструменты
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </section>

      {/* инструменты */}
      <section id="tools" className="flex flex-col gap-12">
        {CATEGORY_ORDER.map((category) => {
          const tools = toolsRegistry.filter((t) => t.category === category.name)
          if (tools.length === 0) return null

          return (
            <div key={category.name} id={`cat-${category.name}`} className="flex flex-col gap-6 scroll-mt-20">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => {
                  const Icon = tool.icon
                  return (
                    <Link
                      key={tool.id}
                      to={`/tools/${tool.id}`}
                      className="group animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <Card className="h-full bg-white/80 shadow-md border-border light:text-gray-900 dark:bg-card/60 dark:shadow-none dark:border-border/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.15)] hover:border-primary/50">
                        <CardHeader>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="mt-3 text-lg group-hover:text-primary transition-colors">
                            {tool.name}
                          </CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
