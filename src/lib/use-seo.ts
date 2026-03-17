import { useEffect } from "react"

interface SEOOptions {
  title: string
  description?: string
}

const SITE_NAME = "ZucTools"

export function useSEO({ title, description }: SEOOptions) {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`

    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
      if (meta) {
        meta.content = description
      }
    }

    return () => {
      document.title = `${SITE_NAME} — Бесплатные онлайн-калькуляторы и инструменты`
    }
  }, [title, description])
}
