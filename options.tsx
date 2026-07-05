import { useEffect, useState } from "react"
import { Settings, Save, Clock } from "lucide-react"
import "./style.css"

function OptionsPage() {
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
    <div className="min-h-screen text-gray-900 dark:text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-cyan w-10 h-10 drop-shadow-md" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent drop-shadow-sm">
            Настройки Dr Who
          </h1>
        </div>

        <div className="glass-card p-8 mb-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-gold" />
            Автосохранение снимков
          </h2>
          
          <div className="flex flex-col gap-6">
            <label className="flex items-center gap-4 cursor-pointer">
              <input 
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-6 h-6 accent-cyan rounded glass-input cursor-pointer"
              />
              <span className="text-lg font-medium text-gray-800 dark:text-gray-200">Включить автоматическое сохранение (Time Travel)</span>
            </label>

            {autoSave && (
              <div className="flex items-center gap-4 pl-10">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Интервал:</span>
                <input 
                  type="number"
                  min="5"
                  max="1440"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                  className="glass-input rounded-lg px-4 py-2 w-28 text-center text-lg font-bold"
                />
                <span className="text-gray-600 dark:text-gray-400 font-medium">минут</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 glass-button py-3 px-8 rounded-xl text-lg"
          >
            <Save className="w-6 h-6" />
            Сохранить настройки
          </button>
          
          {saved && (
            <span className="text-green-600 dark:text-green-400 font-bold animate-pulse">Настройки успешно сохранены!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
