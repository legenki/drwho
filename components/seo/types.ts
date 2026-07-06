export interface SeoSummaryData {
  title: string
  description: string
  keywords: string
  url: string
  canonical: string
  robots: string
  author: string
  publisher: string
  lang: string
  hasGa: boolean
  robotsTxtUrl: string
  sitemapXmlUrl: string
  xfnRel: { rel: string; href: string; text: string }[]
}

export interface SeoHeaderData {
  tag: string
  text: string
}

export interface SeoImagesData {
  total: number
  withoutAlt: number
  withoutTitle: number
  list: { src: string; alt: string; title: string; hasAlt: boolean; hasTitle: boolean }[]
}

export interface SeoLinksData {
  total: number
  unique: number
  internal: number
  withoutTitle: number
  list: { href: string; text: string; title: string; hasTitle: boolean; isInternal: boolean }[]
}

export interface SeoSocialData {
  og: { property: string; content: string }[]
  twitter: { name: string; content: string }[]
  schema: string[]
  imageSrc: string
}

export interface SeoData {
  summary: SeoSummaryData
  headers: SeoHeaderData[]
  images: SeoImagesData
  links: SeoLinksData
  social: SeoSocialData
}
