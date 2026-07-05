import { useEffect, useState } from "react"
import { Save, Clock, Settings } from "lucide-react"

export function SettingsTab() {
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
    <div className="flex flex-col gap-5 text-gray-900 dark:text-white">
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold" />
          Автосохранение снимков
        </h3>
        
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mt-1 w-5 h-5 accent-cyan rounded glass-input cursor-pointer shrink-0"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Включить автоматическое сохранение всех вкладок (Time Travel)
            </span>
          </label>

          {autoSave && (
            <div className="flex items-center gap-3 pl-8">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Интервал:</span>
              <input 
                type="number"
                min="5"
                max="1440"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                className="glass-input rounded-lg px-3 py-1.5 w-20 text-center font-bold"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">мин.</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleSave}
          className="flex items-center justify-center gap-2 glass-button py-3 px-6 rounded-xl text-base w-full"
        >
          <Save className="w-5 h-5" />
          Сохранить настройки
        </button>
        
        {saved && (
          <div className="text-center text-green-600 dark:text-green-400 font-bold text-sm animate-pulse">
            Настройки успешно сохранены!
          </div>
        )}
      </div>
    </div>
  )
}
