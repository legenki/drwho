import { useEffect, useState } from "react"
import { Search, Globe } from "lucide-react"
import { db } from "../lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { SeoData } from "./seo/types"
import { SeoSummary } from "./seo/SeoSummary"
import { SeoHeaders } from "./seo/SeoHeaders"
import { SeoImages } from "./seo/SeoImages"
import { SeoLinks } from "./seo/SeoLinks"
import { SeoSocial } from "./seo/SeoSocial"
import { SeoTools } from "./seo/SeoTools"
import { GeneralTab } from "./investigator/GeneralTab"

interface WhoisData {
  registrar?: { name?: string }
  dates?: { created?: string; expiration?: string }
}

interface PageMetrics {
  title: string
  description: string
  scriptCount: number
  frameworks: string[]
  loadTime: number
  localEmails: string[]
  seo: SeoData
}

interface HunterData {
  data?: {
    emails?: Array<{ value: string; type: string; confidence: number }>
  }
}

type SubTab = "general" | "summary" | "headers" | "images" | "links" | "social" | "tools"

const DEFAULT_TABS = [
  { id: "general", label: "General" },
  { id: "summary", label: "Summary" },
  { id: "headers", label: "Headers" },
  { id: "images", label: "Images" },
  { id: "links", label: "Links" },
  { id: "social", label: "Social" },
  { id: "tools", label: "Tools" },
]

export function InvestigatorTab() {
  const [targetUrl, setTargetUrl] = useState("")
  const [hostname, setHostname] = useState("")
  const [tabId, setTabId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<SubTab>("general")
  
  const [tabs, setTabs] = useState(DEFAULT_TABS)
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const [dragOverTab, setDragOverTab] = useState<string | null>(null)

  const [whois, setWhois] = useState<WhoisData | null>(null)
  const [ipAddress, setIpAddress] = useState<string>("")
  const [pageMetrics, setPageMetrics] = useState<PageMetrics | null>(null)
  const [hunterData, setHunterData] = useState<HunterData | null>(null)
  const [hunterKeyMissing, setHunterKeyMissing] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    chrome.storage.local.get("subTabOrder").then(res => {
      if (res.subTabOrder) {
        const order = res.subTabOrder as string[]
        const newTabs = order.map(id => DEFAULT_TABS.find(t => t.id === id)).filter(Boolean) as typeof DEFAULT_TABS
        const missing = DEFAULT_TABS.filter(t => !order.includes(t.id))
        setTabs([...newTabs, ...missing])
      }
    })
  }, [])

  // Fetch target from storage or active tab
  useEffect(() => {
    const fetchTarget = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) setTabId(tab.id)

      const storage = await chrome.storage.local.get("investigateTarget")
      if (storage.investigateTarget) {
        setTargetUrl(storage.investigateTarget)
        await chrome.storage.local.remove("investigateTarget")
      } else if (tab?.url) {
        setTargetUrl(tab.url)
      }
    }
    fetchTarget()

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.investigateTarget?.newValue) {
        setTargetUrl(changes.investigateTarget.newValue)
        chrome.storage.local.remove("investigateTarget")
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          if (tab?.id) setTabId(tab.id)
        })
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  // Process URL to hostname
  useEffect(() => {
    if (targetUrl && targetUrl.startsWith("http")) {
      try {
        const url = new URL(targetUrl)
        setHostname(url.hostname)
      } catch {
        setHostname("")
      }
    } else {
      setHostname("")
    }
  }, [targetUrl])

  // Fetch local stats
  const stat = useLiveQuery(() => hostname ? db.domainStats.get(hostname) : undefined, [hostname])

  // Fetch Data (Whois, DNS, Page Metrics, Hunter)
  useEffect(() => {
    if (!hostname) return

    const fetchData = async () => {
      setLoading(true)
      setError("")
      setHunterData(null)
      
      try {
        fetch(`https://who-dat.as93.net/${hostname}`)
          .then(res => res.json())
          .then(data => setWhois(data))
          .catch(() => console.error("Whois error"))

        fetch(`https://dns.google/resolve?name=${hostname}`)
          .then(res => res.json())
          .then(data => {
            const aRecord = data.Answer?.find((a: any) => a.type === 1)
            const aaaaRecord = data.Answer?.find((a: any) => a.type === 28)
            const resolvedIp = aRecord?.data || aaaaRecord?.data
            if (resolvedIp) setIpAddress(resolvedIp)
          })
          .catch(() => console.error("DNS error"))

        const storage = await chrome.storage.local.get("hunterApiKey")
        if (storage.hunterApiKey) {
          setHunterKeyMissing(false)
          fetch(`https://api.hunter.io/v2/domain-search?domain=${hostname}&api_key=${storage.hunterApiKey}`)
            .then(res => res.json())
            .then(data => {
              if (data.data) setHunterData(data)
            })
            .catch(() => console.error("Hunter API Error"))
        } else {
          setHunterKeyMissing(true)
        }

        if (tabId) {
          chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            func: () => {
              const title = document.title
              const descMeta = document.querySelector('meta[name="description"]')
              const description = descMeta ? descMeta.getAttribute("content") || "" : ""
              
              const scriptCount = document.querySelectorAll("script").length
              const frameworks = []
              if ((window as any).React) frameworks.push("React")
              if ((window as any).__NEXT_DATA__) frameworks.push("Next.js")
              if ((window as any).__NUXT__) frameworks.push("Nuxt")
              if (document.querySelector("[ng-version]")) frameworks.push("Angular")
              
              const p = window.performance.timing
              const loadTime = p ? p.loadEventEnd - p.navigationStart : 0

              // Local Email Scraping
              const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
              const bodyText = document.body.textContent || ""
              const foundEmails = new Set<string>()
              
              const matches = bodyText.match(emailRegex)
              if (matches) matches.forEach(m => foundEmails.add(m.toLowerCase()))
              
              document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
                const href = a.getAttribute("href") || ""
                const email = href.replace("mailto:", "").split("?")[0].toLowerCase()
                // Do not use .test() on a global regex, it maintains state.
                if (email && email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)) foundEmails.add(email)
              })
              
              document.querySelectorAll('input, textarea').forEach(input => {
                const val = (input as HTMLInputElement).value
                if (val) {
                  const m = val.match(emailRegex)
                  if (m) m.forEach(email => foundEmails.add(email.toLowerCase()))
                }
              })

              // SEO REVERSE ENGINEERING
              const getMetaContent = (name: string) => document.querySelector(`meta[name="${name}" i]`)?.getAttribute("content") || ""
              const getLinkHref = (rel: string) => document.querySelector(`link[rel="${rel}" i]`)?.getAttribute("href") || ""
              const getHtmlLang = () => document.documentElement.getAttribute("lang") || ""
              
              const summary = {
                title: document.title,
                description: getMetaContent("description"),
                keywords: getMetaContent("keywords"),
                url: window.location.href,
                canonical: getLinkHref("canonical"),
                robots: getMetaContent("robots"),
                author: getLinkHref("author") || getMetaContent("author"),
                publisher: getLinkHref("publisher") || getMetaContent("publisher"),
                lang: getHtmlLang(),
                hasGa: Array.from(document.querySelectorAll("script")).some(s => {
                  const html = s.innerHTML.toLowerCase();
                  const src = (s.getAttribute("src") || "").toLowerCase();
                  return html.includes("google-analytics.com") || html.includes("googleanalytics") || src.includes("google-analytics.com");
                }),
                robotsTxtUrl: `${window.location.protocol}//${window.location.host}/robots.txt`,
                sitemapXmlUrl: `${window.location.protocol}//${window.location.host}/sitemap.xml`,
                xfnRel: Array.from(document.querySelectorAll("a[rel]")).map(a => ({
                  rel: a.getAttribute("rel") || "",
                  href: (a as HTMLAnchorElement).href || "",
                  text: (a as HTMLElement).innerText?.trim() || ""
                }))
              }

              const headers: {tag: string, text: string}[] = []
              document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(el => {
                headers.push({ tag: el.tagName.toUpperCase(), text: (el as HTMLElement).innerText.trim() })
              })

              const imgs = document.querySelectorAll("img")
              const imgList = Array.from(imgs).map(img => {
                const alt = img.getAttribute("alt")
                const title = img.getAttribute("title")
                return {
                  src: img.src || img.getAttribute("src") || "",
                  alt: alt || "",
                  title: title || "",
                  hasAlt: alt !== null && alt.trim() !== "",
                  hasTitle: title !== null && title.trim() !== ""
                }
              })
              const images = {
                total: imgs.length,
                withoutAlt: imgList.filter(i => !i.hasAlt).length,
                withoutTitle: imgList.filter(i => !i.hasTitle).length,
                list: imgList
              }

              const anchors = document.querySelectorAll("a")
              const currentHost = window.location.hostname
              const linksArr = Array.from(anchors)
              const uniqueLinks = new Set(linksArr.map(a => a.href))
              
              const linkList = linksArr.map(a => {
                const title = a.getAttribute("title")
                let isInternal = false
                try {
                  isInternal = new URL(a.href).hostname === currentHost || a.href.indexOf(currentHost) >= 0
                } catch {
                  isInternal = a.href.startsWith("/") || a.href.startsWith("#")
                }
                return {
                  href: a.href || "",
                  text: a.innerText?.trim() || "",
                  title: title || "",
                  hasTitle: title !== null && title.trim() !== "",
                  isInternal
                }
              })

              const links = {
                total: anchors.length,
                unique: uniqueLinks.size,
                internal: linkList.filter(l => l.isInternal).length,
                withoutTitle: linkList.filter(l => !l.hasTitle).length,
                list: linkList
              }

              const ogPrefixes = ["og:", "fb:", "article:", "music:", "video:", "book:", "profile:", "website:", "product:"]
              const ogTags = Array.from(document.querySelectorAll("meta[property]")).filter(m => {
                const prop = (m.getAttribute("property") || "").toLowerCase()
                return ogPrefixes.some(p => prop.startsWith(p))
              })
              
              const twitterTags = Array.from(document.querySelectorAll("meta[name^='twitter:'], meta[property^='twitter:']"))
              
              const social = {
                og: ogTags.map(m => ({
                  property: m.getAttribute("property") || "",
                  content: m.getAttribute("content") || ""
                })),
                twitter: twitterTags.map(m => ({
                  name: m.getAttribute("name") || m.getAttribute("property") || "",
                  content: m.getAttribute("content") || ""
                })),
                schema: Array.from(document.querySelectorAll("[itemtype]")).map(el => el.getAttribute("itemtype") || ""),
                imageSrc: getLinkHref("image_src")
              }

              const seo = { summary, headers, images, links, social }

              return { 
                title, description, scriptCount, frameworks, loadTime, 
                localEmails: Array.from(foundEmails),
                seo
              }
            }
          }).then((injectionResults) => {
            if (injectionResults && injectionResults.length > 0) {
              const allLocalEmails = new Set<string>()
              let mainResult: Partial<PageMetrics> = {}
              
              injectionResults.forEach(frame => {
                if (frame.result) {
                  const res = frame.result as PageMetrics
                  if (!mainResult.title) mainResult = res 
                  res.localEmails?.forEach(e => allLocalEmails.add(e))
                }
              })
              
              setPageMetrics({
                ...mainResult,
                localEmails: Array.from(allLocalEmails)
              } as PageMetrics)
            }
          }).catch(err => console.error("Script injection failed", err))
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [hostname, tabId])

  if (!hostname) {
    return (
      <div className="text-center text-N200 dark:text-DN200 mt-12 atl-card p-8 mx-4">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-30 text-N500 dark:text-DN300" />
        <p className="font-medium text-lg text-N800 dark:text-DN800">Open a website or use the context menu to investigate.</p>
      </div>
    )
  }

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleString() : "—"

  const localEmails = pageMetrics?.localEmails || []
  const hunterEmails = hunterData?.data?.emails?.map(e => e.value) || []
  const allEmails = Array.from(new Set([...localEmails, ...hunterEmails]))

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
    // Small delay ensures the browser captures the original drag image before styling changes
    setTimeout(() => setDraggedTab(id), 0)
  }

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedTab && draggedTab !== id) {
      setTabs(prevTabs => {
        const oldIndex = prevTabs.findIndex(t => t.id === draggedTab)
        const newIndex = prevTabs.findIndex(t => t.id === id)
        if (oldIndex === -1 || newIndex === -1) return prevTabs
        const newTabs = [...prevTabs]
        const [removed] = newTabs.splice(oldIndex, 1)
        newTabs.splice(newIndex, 0, removed)
        return newTabs
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
    setTabs(currentTabs => {
      chrome.storage.local.set({ subTabOrder: currentTabs.map(t => t.id) })
      return currentTabs
    })
  }

  const SubTabNav = () => (
    <div className="flex flex-wrap gap-4 mb-4 border-b-2 border-N40 dark:border-DN40">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragEnter={(e) => handleDragEnter(e, tab.id)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => e.preventDefault()}
            onClick={() => setActiveTab(tab.id as SubTab)}
            className={`
              shrink-0 px-2 pb-2 text-xs font-normal transition-colors cursor-pointer select-none relative
              ${isActive 
                ? "text-B400 dark:text-B300" 
                : "text-N400 dark:text-DN400 hover:text-N800 dark:hover:text-DN800 hover:bg-N20 dark:hover:bg-DN30 rounded-t"
              }
              ${draggedTab === tab.id ? "opacity-30 border-dashed border-N80" : "opacity-100"}
            `}
          >
            {tab.label}
            {isActive && <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-B400 dark:bg-B300 z-10" />}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 atl-card p-4">
        <div className="p-2 bg-N20 dark:bg-DN30 rounded shrink-0">
          <Globe className="text-N500 dark:text-DN300 w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg font-medium text-N800 dark:text-DN800 truncate" title={hostname}>{hostname}</h2>
          {ipAddress && <div className="text-sm text-N200 dark:text-DN200 font-mono mt-0.5">{ipAddress}</div>}
        </div>
      </div>

      <SubTabNav />

      {activeTab === "general" && (
        <GeneralTab
          hostname={hostname}
          url={targetUrl}
          ipAddress={ipAddress}
          whois={whois}
          localStats={stat}
          localEmails={localEmails}
          hunterEmails={hunterEmails}
          hunterKeyMissing={hunterKeyMissing}
        />
      )}

      {/* SEO Sub Tabs */}
      {activeTab !== "general" && pageMetrics?.seo && (
        <div className="animate-fade-in">
          {activeTab === "summary" && <SeoSummary data={pageMetrics.seo.summary} />}
          {activeTab === "headers" && <SeoHeaders data={pageMetrics.seo.headers} />}
          {activeTab === "images" && <SeoImages data={pageMetrics.seo.images} />}
          {activeTab === "links" && <SeoLinks data={pageMetrics.seo.links} />}
          {activeTab === "social" && <SeoSocial data={pageMetrics.seo.social} />}
          {activeTab === "tools" && targetUrl && hostname && <SeoTools url={targetUrl} hostname={hostname} />}
        </div>
      )}
      {activeTab !== "general" && !pageMetrics && (
        <div className="text-center text-gray-500 italic text-sm mt-4">Loading SEO data...</div>
      )}

    </div>
  )
}
