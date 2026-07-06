import { useEffect, useState } from "react"
import { Globe, Server, Network, Shield, AlertTriangle, ExternalLink, ShieldCheck, Mail } from "lucide-react"

interface GeneralTabProps {
  hostname: string
  url: string
  ipAddress: string
  whois: any
  localStats: any
  localEmails: string[]
  hunterEmails: string[]
  hunterKeyMissing: boolean
}

export function GeneralTab({ hostname, url, ipAddress, whois, localStats, localEmails, hunterEmails, hunterKeyMissing }: GeneralTabProps) {
  const [dns, setDns] = useState<any[]>([])
  const [ipData, setIpData] = useState<any>(null)
  const [sslData, setSslData] = useState<any[]>([])
  const [secHeaders, setSecHeaders] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  const [vtKey, setVtKey] = useState("")
  const [abuseKey, setAbuseKey] = useState("")
  const [vtData, setVtData] = useState<any>(null)

  useEffect(() => {
    if (!hostname) return

    const loadSettings = async () => {
      const storage = await chrome.storage.local.get(["vtApiKey", "abuseApiKey"])
      if (storage.vtApiKey) setVtKey(storage.vtApiKey)
      if (storage.abuseApiKey) setAbuseKey(storage.abuseApiKey)
    }

    const fetchOSINT = async () => {
      setLoading(true)

      // 1. DNS (Multiple queries since ANY isn't fully reliable via DoH)
      const dnsTypes = ["A", "MX", "TXT", "NS", "AAAA"]
      try {
        const dnsPromises = dnsTypes.map(type => 
          fetch(`https://dns.google/resolve?name=${hostname}&type=${type}`).then(res => res.json())
        )
        const results = await Promise.all(dnsPromises)
        const allRecords = results.flatMap(r => r.Answer || [])
        setDns(allRecords)
      } catch (e) { console.error("DNS fetch error", e) }

      // 2. IP Geo (ipwho.is — free, no key required)
      if (ipAddress) {
        try {
          const ipRes = await fetch(`https://ipwho.is/${ipAddress}`).then(res => res.json())
          if (ipRes.success) setIpData(ipRes)
        } catch (e) { console.error("IP API error", e) }
      }

      // 3. SSL / CT (crt.sh)
      try {
        const sslRes = await fetch(`https://crt.sh/?q=${hostname}&output=json`).then(res => res.json())
        // Take top 5 unique issuers or just latest 5
        setSslData(Array.isArray(sslRes) ? sslRes.slice(0, 5) : [])
      } catch (e) { console.error("crt.sh error", e) }

      // 4. Security Headers (via background script)
      try {
        chrome.runtime.sendMessage({ type: "FETCH_SECURITY_HEADERS", url: `https://${hostname}` }, (response) => {
          if (response?.success) {
            setSecHeaders(response.headers)
          }
        })
      } catch (e) { console.error("Security headers fetch error", e) }

      setLoading(false)
    }

    loadSettings().then(fetchOSINT)
  }, [hostname, ipAddress])

  // Threat Intel (VT) - fetch if key exists
  useEffect(() => {
    if (vtKey && hostname) {
      // VirusTotal API v3 - GET /domains/{domain}
      fetch(`https://www.virustotal.com/api/v3/domains/${hostname}`, {
        headers: { "x-apikey": vtKey }
      }).then(res => res.json())
        .then(data => setVtData(data.data?.attributes?.last_analysis_stats))
        .catch(e => console.error("VT error", e))
    }
  }, [vtKey, hostname])

  const allEmails = Array.from(new Set([...localEmails, ...hunterEmails]))

  // Helper functions
  const getHeader = (name: string) => secHeaders?.[name.toLowerCase()]
  
  const hasHSTS = !!getHeader("strict-transport-security")
  const hasCSP = !!getHeader("content-security-policy")
  const hasXFO = !!getHeader("x-frame-options")
  const server = getHeader("server") || getHeader("x-powered-by") || "Unknown"

  const txtRecords = dns.filter(d => d.type === 16)
  const mxRecords = dns.filter(d => d.type === 15)
  const hasSPF = txtRecords.some(d => typeof d.data === "string" && d.data.includes("v=spf1"))
  const hasDMARC = txtRecords.some(d => typeof d.data === "string" && d.data.includes("v=DMARC1"))

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const osintLinks = [
    { name: "VirusTotal", url: `https://www.virustotal.com/gui/domain/${hostname}` },
    { name: "URLScan", url: `https://urlscan.io/search/#domain:${hostname}` },
    { name: "Shodan", url: `https://www.shodan.io/search?query=${hostname}` },
    { name: "Censys", url: `https://search.censys.io/search?resource=hosts&q=${hostname}` },
    { name: "crt.sh", url: `https://crt.sh/?q=${hostname}` },
    { name: "DNSDumpster", url: `https://dnsdumpster.com/` },
    { name: "Wayback Machine", url: `https://web.archive.org/web/*/${hostname}` },
    { name: "SecurityTrails", url: `https://securitytrails.com/domain/${hostname}/dns` },
    { name: "Google Dorks (site:)", url: `https://www.google.com/search?q=site:${hostname}` },
  ]

  return (
    <div className="flex flex-col gap-4 animate-fade-in text-N800 dark:text-DN800 pb-10">
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-N200">Gathering intelligence...</div>
        </div>
      )}

      {/* Misconfigurations Hints — only show after security headers are loaded */}
      {!loading && secHeaders && (!hasHSTS || !hasSPF || !hasCSP) && (
        <div className="atl-card bg-Y50 dark:bg-Y500/20 border-Y200 dark:border-Y400 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-Y500 shrink-0" />
          <div className="text-sm">
            <strong className="block mb-1">Potential weaknesses:</strong>
            <ul className="list-disc pl-4 space-y-0.5">
              {!hasHSTS && <li>Missing HSTS (Strict-Transport-Security)</li>}
              {!hasCSP && <li>Missing Content-Security-Policy (CSP)</li>}
              {!hasSPF && <li>Missing SPF record (Email spoofing risk)</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* DNS Intelligence */}
        <div className="atl-card p-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <Network className="w-4 h-4 text-N500" /> DNS Intelligence
          </h3>
          <div className="text-xs space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-N200">A / AAAA</span>
              <div className="font-mono text-[11px] truncate">{dns.filter(d => d.type === 1 || d.type === 28).map(d => d.data).join(", ") || "—"}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-N200">MX (Mail)</span>
              <div className="font-mono text-[11px] line-clamp-2">{mxRecords.map(d => d.data).join(", ") || "—"}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-N200">TXT (SPF/DMARC/Verification)</span>
              <div className="font-mono text-[11px] line-clamp-3">{txtRecords.map(d => d.data).join(" | ") || "—"}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-N200">NS (Nameservers)</span>
              <div className="font-mono text-[11px] truncate">{dns.filter(d => d.type === 2).map(d => d.data).join(", ") || "—"}</div>
            </div>
          </div>
        </div>

        {/* IP & Network */}
        <div className="atl-card p-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <Server className="w-4 h-4 text-N500" /> IP + Network
          </h3>
          {ipData ? (
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-N200">IP</span>
                <span className="font-mono">{ipData.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-N200">Location</span>
                <span className="text-right">
                  {ipData.flag?.emoji} {ipData.country}, {ipData.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-N200">ISP</span>
                <span className="text-right max-w-[60%] truncate" title={ipData.connection?.isp}>{ipData.connection?.isp || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-N200">Organization</span>
                <span className="text-right max-w-[60%] truncate" title={ipData.connection?.org}>{ipData.connection?.org || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-N200">ASN</span>
                <span className="font-mono text-right">{ipData.connection?.asn ? `AS${ipData.connection.asn}` : "—"}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-N200">Data unavailable...</div>
          )}
        </div>

        {/* Security Posture & Tech */}
        <div className="atl-card p-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-N500" /> Security Posture
          </h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-N200">Server</span>
              <span className="font-mono max-w-[60%] truncate" title={server}>{server}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-N200">HSTS</span>
              <span>{hasHSTS ? <span className="atl-lozenge atl-lozenge-success">Yes</span> : <span className="atl-lozenge atl-lozenge-danger">No</span>}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-N200">CSP</span>
              <span>{hasCSP ? <span className="atl-lozenge atl-lozenge-success">Yes</span> : <span className="atl-lozenge atl-lozenge-danger">No</span>}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-N200">X-Frame-Options</span>
              <span>{hasXFO ? <span className="atl-lozenge atl-lozenge-success">Yes</span> : <span className="atl-lozenge atl-lozenge-danger">No</span>}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-N200">SPF</span>
              <span>{hasSPF ? <span className="atl-lozenge atl-lozenge-success">Yes</span> : <span className="atl-lozenge atl-lozenge-danger">No</span>}</span>
            </div>
          </div>
        </div>

        {/* SSL / Certificate Transparency */}
        <div className="atl-card p-4 overflow-hidden">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <Shield className="w-4 h-4 text-N500" /> Certificates (crt.sh)
          </h3>
          {sslData.length > 0 ? (
            <div className="text-xs space-y-2">
              <div className="flex justify-between mb-2">
                <span className="text-N200">Latest Issuer</span>
                <span className="text-right font-medium">{sslData[0].issuer_name?.split("CN=")[1] || "—"}</span>
              </div>
              <span className="text-N200 block mb-1">Associated SANs (Recent):</span>
              <div className="max-h-24 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {Array.from(new Set(sslData.flatMap(s => s.name_value?.split("\n") || []))).map((san, i) => (
                  <div key={i} className="font-mono text-[10px] bg-N20 dark:bg-DN20 p-1 rounded truncate">
                    {san}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-N200">Searching CT logs...</div>
          )}
        </div>

        {/* Contacts & Emails */}
        <div className="atl-card p-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <Mail className="w-4 h-4 text-N500" /> Contacts
          </h3>
          {allEmails.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {allEmails.map(email => (
                <div key={email} className="flex justify-between items-center text-xs bg-N10 dark:bg-DN10 p-1.5 rounded">
                  <span className="truncate">{email}</span>
                  <div className="flex gap-1 shrink-0">
                    {localEmails.includes(email) && <span className="atl-lozenge atl-lozenge-success text-[9px] px-1 py-0 h-4">Local</span>}
                    {hunterEmails.includes(email) && <span className="atl-lozenge atl-lozenge-discovery text-[9px] px-1 py-0 h-4">Hunter</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-N200 italic">No addresses found.</div>
          )}
          {hunterKeyMissing && (
            <div className="mt-2 text-xs text-P500 dark:text-P300">
              Add a Hunter.io key for OSINT email search.
            </div>
          )}
        </div>

        {/* Threat Intel / VT / WHOIS */}
        <div className="atl-card p-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-N500" /> Threat Intel & WHOIS
          </h3>
          <div className="text-sm space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-N200">Registrar</span>
              <span className="text-right max-w-[60%] truncate" title={whois?.registrar?.name}>{whois?.registrar?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-N200">Created</span>
              <span className="text-right">{whois?.dates?.created ? new Date(whois.dates.created).toLocaleDateString() : "—"}</span>
            </div>
          </div>
          
          {vtKey ? (
            <div className="bg-N20 dark:bg-DN20 p-2 rounded text-xs flex justify-between items-center">
              <span className="font-medium">VirusTotal Score</span>
              {vtData ? (
                <span className={`font-bold ${vtData.malicious > 0 ? "text-R400" : "text-G400"}`}>
                  {vtData.malicious} / {vtData.malicious + vtData.harmless + vtData.undetected}
                </span>
              ) : (
                <span className="text-N200">Loading...</span>
              )}
            </div>
          ) : (
             <div className="mt-2 text-xs text-P500 dark:text-P300">
               Add VT API key in settings.
             </div>
          )}
        </div>
      </div>

      {/* OSINT Hub */}
      <div className="atl-card p-4 mt-2">
        <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-3 mb-4">
          <Globe className="w-5 h-5 text-B400" /> OSINT Hub (Quick Links)
        </h3>
        <div className="flex flex-wrap gap-2">
          {osintLinks.map(link => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-N0 dark:bg-DN20 border border-N40 dark:border-DN40 rounded hover:bg-N20 dark:hover:bg-DN30 hover:border-N60 dark:hover:border-DN60 transition-colors"
            >
              {link.name} <ExternalLink className="w-3.5 h-3.5 text-N200" />
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
