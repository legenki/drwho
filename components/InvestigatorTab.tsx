import { useEffect, useState } from "react"
import { Search, Globe, Clock, Server, Shield } from "lucide-react"
import { db } from "../lib/db"
import { useLiveQuery } from "dexie-react-hooks"

interface WhoisData {
  domain?: {
    name?: string
    extension?: string
    punycode?: string
  }
  registrar?: {
    name?: string
    url?: string
  }
  dates?: {
    created?: string
    updated?: string
    expiration?: string
  }
  status?: string[]
}

export function InvestigatorTab() {
  const [targetUrl, setTargetUrl] = useState("")
  const [hostname, setHostname] = useState("")
  const [whois, setWhois] = useState<WhoisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch target from storage or active tab
  useEffect(() => {
    const fetchTarget = async () => {
      // Check storage first (from context menu)
      const storage = await chrome.storage.local.get("investigateTarget")
      if (storage.investigateTarget) {
        setTargetUrl(storage.investigateTarget)
        await chrome.storage.local.remove("investigateTarget") // clear it
      } else {
        // Fallback to active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) setTargetUrl(tab.url)
      }
    }
    fetchTarget()

    // Listen to storage changes for new targets
    const listener = (changes: any) => {
      if (changes.investigateTarget?.newValue) {
        setTargetUrl(changes.investigateTarget.newValue)
        chrome.storage.local.remove("investigateTarget")
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
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

  // Fetch Whois
  useEffect(() => {
    const fetchWhois = async () => {
      if (!hostname) return
      setLoading(true)
      setError("")
      setWhois(null)
      try {
        const res = await fetch(`https://who-dat.as93.net/${hostname}`)
        if (!res.ok) throw new Error("Не удалось получить данные о домене")
        const data = await res.json()
        setWhois(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWhois()
  }, [hostname])

  if (!hostname) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-12 glass-card p-8 rounded-2xl mx-4">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan" />
        <p className="font-medium text-lg text-gray-800 dark:text-gray-200">Откройте сайт или используйте контекстное меню для расследования.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-cyan/10 dark:bg-cyan/20 rounded-lg">
            <Globe className="text-cyan w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate drop-shadow-sm" title={hostname}>{hostname}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/60 dark:border-white/10 shadow-inner">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" /> Время здесь
            </div>
            <div className="text-lg font-bold text-cyan drop-shadow-sm">
              {stat ? Math.round(stat.totalTimeMs / 60000) : 0} мин
            </div>
          </div>
          <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/60 dark:border-white/10 shadow-inner">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5" /> Визиты
            </div>
            <div className="text-lg font-bold text-cyan drop-shadow-sm">
              {stat?.visitCount || 0}
            </div>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-400 animate-pulse">Анализируем данные...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        {whois && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Регистратор</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-right">{whois.registrar?.name || "Неизвестно"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Создан</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {whois.dates?.created ? new Date(whois.dates.created).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Истекает</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {whois.dates?.expiration ? new Date(whois.dates.expiration).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
