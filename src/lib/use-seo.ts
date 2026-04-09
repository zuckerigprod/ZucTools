import { useEffect, useRef } from "react"

interface SEOOptions {
  title: string
  description?: string
  keywords?: string
  canonical?: string
  type?: "website" | "article"
  jsonLd?: Record<string, unknown>
  noindex?: boolean
}

const SITE_NAME = "ZucTools"
const SITE_URL = "https://zuctools.ru"

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (el) {
    el.content = content
  } else {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    el.content = content
    document.head.appendChild(el)
  }
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (link) {
    link.href = url
  } else {
    link = document.createElement("link")
    link.rel = "canonical"
    link.href = url
    document.head.appendChild(link)
  }
}

const JSON_LD_ID = "dynamic-jsonld"

function setJsonLd(data: Record<string, unknown> | null) {
  let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
  if (data) {
    if (!script) {
      script = document.createElement("script")
      script.id = JSON_LD_ID
      script.type = "application/ld+json"
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
  } else {
    script?.remove()
  }
}

export function useSEO({ title, description, keywords, canonical, type, jsonLd, noindex }: SEOOptions) {
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : ""
  const jsonLdRef = useRef(jsonLdStr)
  jsonLdRef.current = jsonLdStr

  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`
    document.title = fullTitle

    const pageUrl = canonical || `${SITE_URL}${window.location.pathname}`

    // meta description
    if (description) {
      setMetaTag("name", "description", description)
    }

    // meta keywords
    if (keywords) {
      setMetaTag("name", "keywords", keywords)
    }

    // robots
    if (noindex) {
      setMetaTag("name", "robots", "noindex, nofollow")
    } else {
      setMetaTag("name", "robots", "index, follow")
    }

    // canonical
    setCanonical(pageUrl)

    // Open Graph
    setMetaTag("property", "og:title", fullTitle)
    setMetaTag("property", "og:url", pageUrl)
    setMetaTag("property", "og:type", type || "website")
    if (description) {
      setMetaTag("property", "og:description", description)
    }

    // Twitter Card
    setMetaTag("name", "twitter:title", fullTitle)
    if (description) {
      setMetaTag("name", "twitter:description", description)
    }

    // JSON-LD
    if (jsonLdRef.current) {
      setJsonLd(JSON.parse(jsonLdRef.current))
    }

    return () => {
      document.title = `${SITE_NAME} — Бесплатные онлайн-калькуляторы и инструменты`
      setCanonical(SITE_URL + "/")
      setMetaTag("name", "robots", "index, follow")
      setJsonLd(null)
    }
  }, [title, description, keywords, canonical, type, noindex, jsonLdStr])
}

// хелпер для генерации JSON-LD калькулятора
export function buildToolJsonLd(opts: {
  name: string
  description: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": opts.name,
    "url": opts.url,
    "description": opts.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB",
    },
    "inLanguage": "ru",
    "author": {
      "@type": "Organization",
      "name": "ZuckerigProd",
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://zuctools.ru/",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": opts.name,
          "item": opts.url,
        },
      ],
    },
  }
}
