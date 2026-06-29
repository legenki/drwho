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
    <div className="min-h-screen bg-[#0A1628] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-cyan w-8 h-8" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
            Настройки Dr Who
          </h1>
        </div>

        <div className="bg-[#1A2638] rounded-xl border border-[#2A3648] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" />
            Автосохранение снимков
          </h2>
          
          <div className="flex flex-col gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-5 h-5 accent-cyan rounded bg-[#0A1628] border-[#2A3648]"
              />
              <span className="text-gray-200">Включить автоматическое сохранение (Time Travel)</span>
            </label>

            {autoSave && (
              <div className="flex items-center gap-4 pl-8">
                <span className="text-gray-400">Интервал:</span>
                <input 
                  type="number"
                  min="5"
                  max="1440"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                  className="bg-[#0A1628] border border-[#2A3648] rounded px-3 py-1 text-white w-24 focus:border-cyan focus:outline-none"
                />
                <span className="text-gray-400">минут</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-cyan hover:bg-cyan/80 text-[#0A1628] font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Сохранить настройки
          </button>
          
          {saved && (
            <span className="text-green-400 text-sm animate-pulse">Настройки сохранены!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
