import { useEffect, useState } from "react"
import { Search, Globe, Clock, Server, Shield, Activity, Code, Calendar } from "lucide-react"
import { db } from "../lib/db"
import { useLiveQuery } from "dexie-react-hooks"

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
}

export function InvestigatorTab() {
  const [targetUrl, setTargetUrl] = useState("")
  const [hostname, setHostname] = useState("")
  const [tabId, setTabId] = useState<number | null>(null)
  
  const [whois, setWhois] = useState<WhoisData | null>(null)
  const [ipAddress, setIpAddress] = useState<string>("")
  const [pageMetrics, setPageMetrics] = useState<PageMetrics | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch target from storage or active tab
  useEffect(() => {
    const fetchTarget = async () => {
      const storage = await chrome.storage.local.get("investigateTarget")
      if (storage.investigateTarget) {
        setTargetUrl(storage.investigateTarget)
        await chrome.storage.local.remove("investigateTarget")
      } else {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          setTargetUrl(tab.url)
          if (tab.id) setTabId(tab.id)
        }
      }
    }
    fetchTarget()

    // Listen for storage changes (if Side Panel is already open when user clicks Context Menu)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.investigateTarget?.newValue) {
        setTargetUrl(changes.investigateTarget.newValue)
        chrome.storage.local.remove("investigateTarget")
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

  // Fetch Data (Whois, DNS, Page Metrics)
  useEffect(() => {
    if (!hostname) return

    const fetchData = async () => {
      setLoading(true)
      setError("")
      
      try {
        // 1. Fetch Whois
        fetch(`https://who-dat.as93.net/${hostname}`)
          .then(res => res.json())
          .then(data => setWhois(data))
          .catch(() => console.error("Whois error"))

        // 2. Fetch DNS (IP Address)
        fetch(`https://dns.google/resolve?name=${hostname}`)
          .then(res => res.json())
          .then(data => {
            const aRecord = data.Answer?.find((a: any) => a.type === 1)
            if (aRecord) setIpAddress(aRecord.data)
          })
          .catch(() => console.error("DNS error"))

        // 3. Inject Script (if we have tabId)
        if (tabId) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              // This runs IN the page context
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

              return { title, description, scriptCount, frameworks, loadTime }
            }
          }).then((injectionResults) => {
            if (injectionResults && injectionResults[0]?.result) {
              setPageMetrics(injectionResults[0].result as PageMetrics)
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
      <div className="text-center text-gray-500 dark:text-gray-400 mt-12 glass-card p-8 rounded-2xl mx-4">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan" />
        <p className="font-medium text-lg text-gray-800 dark:text-gray-200">Откройте сайт или используйте контекстное меню для расследования.</p>
      </div>
    )
  }

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleString() : "—"

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 glass-card p-4 rounded-2xl">
        <div className="p-3 bg-cyan/10 dark:bg-cyan/20 rounded-xl">
          <Globe className="text-cyan w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate drop-shadow-sm" title={hostname}>{hostname}</h2>
          {ipAddress && <div className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono mt-0.5">{ipAddress}</div>}
        </div>
      </div>

      {/* Local DB Stats */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan" /> Локальная статистика
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/60 dark:border-white/10 shadow-inner">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Время здесь</div>
            <div className="text-lg font-bold text-cyan">{stat ? Math.round(stat.totalTimeMs / 60000) : 0} мин</div>
          </div>
          <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/60 dark:border-white/10 shadow-inner">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Визиты</div>
            <div className="text-lg font-bold text-cyan">{stat?.visitCount || 0}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm border-t border-gray-300 dark:border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Первый визит</span>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatDate(stat?.firstVisitedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Последний визит</span>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatDate(stat?.lastVisitedAt)}</span>
          </div>
        </div>
      </div>

      {/* Page Metrics (Injected via Scripting) */}
      {pageMetrics && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple" /> Анализ страницы
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-1 border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Заголовок (Title)</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold line-clamp-2">{pageMetrics.title || "—"}</span>
            </div>
            {pageMetrics.frameworks.length > 0 && (
              <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3 items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Технологии</span>
                <div className="flex gap-1">
                  {pageMetrics.frameworks.map(f => (
                    <span key={f} className="bg-purple/10 text-purple px-2 py-0.5 rounded text-xs font-bold border border-purple/20">{f}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Кол-во скриптов</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">{pageMetrics.scriptCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Загрузка (LoadEvent)</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {pageMetrics.loadTime > 0 ? `${(pageMetrics.loadTime / 1000).toFixed(2)} с` : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Whois & External Data */}
      {whois && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-gold drop-shadow-sm" /> Whois Домена
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Регистратор</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-right max-w-[60%]">{whois.registrar?.name || "Неизвестно"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Создан</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {whois.dates?.created ? new Date(whois.dates.created).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Истекает</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {whois.dates?.expiration ? new Date(whois.dates.expiration).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
