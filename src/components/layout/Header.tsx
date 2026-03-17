import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Wrench, Sun, Moon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CATEGORY_ORDER } from "@/lib/tools-registry"
import { useTheme } from "@/lib/theme"

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Переключить тему"
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

function useCategoryLink() {
  const navigate = useNavigate()
  const location = useLocation()

  return (categoryName: string) => {
    const hash = `#cat-${categoryName}`
    if (location.pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/" + hash)
    }
  }
}

function DesktopNav() {
  const goToCategory = useCategoryLink()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {CATEGORY_ORDER.map((category) => (
        <Button
          key={category.name}
          variant="ghost"
          size="sm"
          onClick={() => goToCategory(category.name)}
          className="text-muted-foreground hover:text-foreground"
        >
          {category.name}
        </Button>
      ))}
    </nav>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  const goToCategory = useCategoryLink()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ZucTools
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 mt-4">
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setOpen(false)
                setTimeout(() => goToCategory(category.name), 150)
              }}
              className="flex flex-col items-start rounded-md px-3 py-3 text-left hover:bg-accent/10 transition-colors"
            >
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs text-muted-foreground">{category.description}</span>
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Wrench className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ZucTools
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <DesktopNav />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
