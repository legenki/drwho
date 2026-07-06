import { useEffect, useState } from "react"
import { Settings, Save, Clock, Monitor, Sun, Moon, Palette } from "lucide-react"
import { useTheme } from "./lib/useTheme"
import "./style.css"

function OptionsPage() {
  const { theme, setTheme } = useTheme()
  const [autoSave, setAutoSave] = useState(false)
  const [intervalMinutes, setIntervalMinutes] = useState(60)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(["autoSave", "autoSaveInterval"]).then((res) => {
      if (res.autoSave !== undefined) setAutoSave(res.autoSave)
      if (res.autoSaveInterval !== undefined) setIntervalMinutes(res.autoSaveInterval)
    })
  }, [])

  const handleSave = async () => {
    await chrome.storage.local.set({
      autoSave,
      autoSaveInterval: intervalMinutes
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen text-N800 dark:text-DN800 p-8 bg-N20 dark:bg-DN10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-B400 w-10 h-10 drop-shadow-sm" />
          <h1 className="text-4xl font-bold text-N800 dark:text-DN800 drop-shadow-sm">
            Dr Who Settings
          </h1>
        </div>

        <div className="atl-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Palette className="w-5 h-5 text-N500 dark:text-DN300" />
            Appearance
          </h2>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setTheme("light")}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors ${
                theme === "light" 
                  ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                  : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
              }`}
            >
              <Sun className="w-8 h-8" />
              <span className="text-lg font-medium">Light</span>
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors ${
                theme === "dark" 
                  ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                  : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
              }`}
            >
              <Moon className="w-8 h-8" />
              <span className="text-lg font-medium">Dark</span>
            </button>
            <button 
              onClick={() => setTheme("system")}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors ${
                theme === "system" 
                  ? "border-B400 bg-B50 dark:bg-B500/20 text-B400" 
                  : "border-N40 dark:border-DN40 text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30"
              }`}
            >
              <Monitor className="w-8 h-8" />
              <span className="text-lg font-medium">System</span>
            </button>
          </div>
        </div>

        <div className="atl-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-N500 dark:text-DN300" />
            Auto-save Snapshots
          </h2>
          
          <div className="flex flex-col gap-6">
            <label className="flex items-center gap-4 cursor-pointer">
              <input 
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-5 h-5 accent-B400 cursor-pointer"
              />
              <span className="text-lg font-medium text-N800 dark:text-DN800">Enable auto-save (Time Travel)</span>
            </label>

            {autoSave && (
              <div className="flex items-center gap-4 pl-9">
                <span className="text-N500 dark:text-DN300 font-medium">Interval:</span>
                <input 
                  type="number"
                  min="5"
                  max="1440"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                  className="atl-input w-28 text-center text-lg font-medium"
                />
                <span className="text-N500 dark:text-DN300 font-medium">minutes</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={handleSave}
            className="atl-button-primary flex items-center gap-2 py-3 px-8 text-lg"
          >
            <Save className="w-6 h-6" />
            Save Settings
          </button>
          
          {saved && (
            <span className="text-green-600 dark:text-green-400 font-bold animate-pulse">Settings saved successfully!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
