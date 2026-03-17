import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Suspense } from "react"
import RootLayout from "@/components/layout/RootLayout"
import Home from "@/pages/Home"
import NotFound from "@/pages/NotFound"
import { toolsRegistry } from "@/lib/tools-registry"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      ...toolsRegistry.map((tool) => ({
        path: `tools/${tool.id}`,
        element: (
          <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Загрузка...</div>}>
            <tool.component />
          </Suspense>
        ),
      })),
      { path: "*", element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
