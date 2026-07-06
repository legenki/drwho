import { useEffect, useState } from "react"
import { Save, Clock, Settings, Monitor, Sun, Moon, Palette } from "lucide-react"
import { useTheme } from "../lib/useTheme"

export function SettingsTab() {
  const { theme, setTheme } = useTheme()
  const [autoSave, setAutoSave] = useState(false)
  const [intervalMinutes, setIntervalMinutes] = useState(60)
  const [hunterApiKey, setHunterApiKey] = useState("")
  const [vtApiKey, setVtApiKey] = useState("")
  const [abuseApiKey, setAbuseApiKey] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(["autoSave", "autoSaveInterval", "hunterApiKey", "vtApiKey", "abuseApiKey"]).then((res) => {
      if (res.autoSave !== undefined) setAutoSave(res.autoSave)
      if (res.autoSaveInterval !== undefined) setIntervalMinutes(res.autoSaveInterval)
      if (res.hunterApiKey !== undefined) setHunterApiKey(res.hunterApiKey)
      if (res.vtApiKey !== undefined) setVtApiKey(res.vtApiKey)
      if (res.abuseApiKey !== undefined) setAbuseApiKey(res.abuseApiKey)
    })
  }, [])

  const handleSave = async () => {
    await chrome.storage.local.set({
      autoSave,
      autoSaveInterval: intervalMinutes,
      hunterApiKey,
      vtApiKey,
      abuseApiKey
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 text-N800 dark:text-DN800">
      <div className="atl-card p-5">
        <h3 className="text-base font-medium text-N800 dark:text-DN800 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-N500 dark:text-DN300" />
          Appearance
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setTheme("light")}
            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
              theme === "light" 
                ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button 
            onClick={() => setTheme("dark")}
            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
              theme === "dark" 
                ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs font-medium">Dark</span>
          </button>
          <button 
            onClick={() => setTheme("system")}
            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
              theme === "system" 
                ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
      </div>

      <div className="atl-card p-5">
        <h3 className="text-base font-medium text-N800 dark:text-DN800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-N500 dark:text-DN300" />
          Auto-save Snapshots
        </h3>
        
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mt-1 w-4 h-4 accent-B400 cursor-pointer shrink-0"
            />
            <span className="text-sm font-medium text-N800 dark:text-DN800">
              Enable automatic saving of all tabs (Time Travel)
            </span>
          </label>

          {autoSave && (
            <div className="flex items-center gap-3 pl-7">
              <span className="text-sm text-N200 dark:text-DN200 font-medium">Interval:</span>
              <input 
                type="number"
                min="5"
                max="1440"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                className="atl-input w-20 text-center font-medium"
              />
              <span className="text-sm text-N200 dark:text-DN200 font-medium">min.</span>
            </div>
          )}
        </div>
      </div>

      {/* API Integrations */}
      <div className="atl-card p-5">
        <h3 className="text-base font-medium text-N800 dark:text-DN800 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-N500 dark:text-DN300" />
          API Integrations
        </h3>
        <p className="text-sm text-N200 dark:text-DN200 mb-4">
          Add API keys for third-party services to unlock advanced features in the "Investigate" tab. All keys are stored securely on your local device.
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-N800 dark:text-DN800">Hunter.io API Key (optional)</label>
          <input 
            type="password"
            placeholder="Example: 6c34...f8a0"
            value={hunterApiKey}
            onChange={(e) => setHunterApiKey(e.target.value)}
            className="atl-input w-full"
          />
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm font-medium text-N800 dark:text-DN800">VirusTotal API Key (optional)</label>
          <input 
            type="password"
            placeholder="Your VT key"
            value={vtApiKey}
            onChange={(e) => setVtApiKey(e.target.value)}
            className="atl-input w-full"
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm font-medium text-N800 dark:text-DN800">AbuseIPDB API Key (optional)</label>
          <input 
            type="password"
            placeholder="Your AbuseIPDB key"
            value={abuseApiKey}
            onChange={(e) => setAbuseApiKey(e.target.value)}
            className="atl-input w-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleSave}
          className="atl-button-primary w-full flex justify-center items-center gap-2 py-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
        
        {saved && (
          <div className="text-center text-green-600 dark:text-green-400 font-bold text-sm animate-pulse">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  )
}
