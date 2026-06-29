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
      <div className="text-center text-gray-400 mt-10">
        <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>Откройте сайт или используйте контекстное меню для расследования.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#1A2638] p-4 rounded-xl border border-[#2A3648]">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-cyan w-5 h-5" />
          <h2 className="text-lg font-bold text-white truncate" title={hostname}>{hostname}</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#0A1628] p-3 rounded-lg border border-[#2A3648]">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Время здесь
            </div>
            <div className="text-sm font-semibold text-cyan">
              {stat ? Math.round(stat.totalTimeMs / 60000) : 0} мин
            </div>
          </div>
          <div className="bg-[#0A1628] p-3 rounded-lg border border-[#2A3648]">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Визиты
            </div>
            <div className="text-sm font-semibold text-cyan">
              {stat?.visitCount || 0}
            </div>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-400 animate-pulse">Анализируем данные...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        {whois && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-[#2A3648] pb-2">
              <span className="text-gray-400">Регистратор</span>
              <span className="text-gray-100 text-right">{whois.registrar?.name || "Неизвестно"}</span>
            </div>
            <div className="flex justify-between border-b border-[#2A3648] pb-2">
              <span className="text-gray-400">Создан</span>
              <span className="text-gray-100">
                {whois.dates?.created ? new Date(whois.dates.created).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2A3648] pb-2">
              <span className="text-gray-400">Истекает</span>
              <span className="text-gray-100">
                {whois.dates?.expiration ? new Date(whois.dates.expiration).toLocaleDateString() : "Неизвестно"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
