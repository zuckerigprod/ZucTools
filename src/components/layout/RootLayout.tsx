import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import { ThemeProvider } from "@/lib/theme"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TooltipProvider>
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* фоновые круги */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-neon-purple/20 blur-3xl animate-float" />
          <div
            className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-neon-pink/20 blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-neon-blue/20 blur-3xl animate-float"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
