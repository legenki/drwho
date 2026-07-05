import { useState } from "react"
import { Clock, History, Search } from "lucide-react"
import { saveSnapshot } from "./lib/timeTravel"
import "./style.css"

function IndexPopup() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSnapshot("Manual Snapshot", "")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const openTimeline = () => {
    // In real app, might just open sidepanel or send message
    chrome.runtime.openOptionsPage() 
  }

  return (
    <div className="w-[320px] p-5 flex flex-col gap-5 text-gray-900 dark:text-white">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="text-cyan w-8 h-8 drop-shadow-md" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent drop-shadow-sm">
          Dr Who
        </h1>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving || saved}
        className={`relative flex items-center justify-center gap-2 py-4 px-4 rounded-xl transition-all duration-300 ${
          saved ? "bg-green-500/80 text-white" : "glass-button"
        } disabled:opacity-80`}>
        <History className={`w-5 h-5 ${saved ? 'text-white' : 'text-purple'}`} />
        <span className="font-bold text-lg">
          {saved ? "Сохранено!" : saving ? "Сохранение..." : "Сохранить момент"}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button className="glass-card flex flex-col items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-white/10 text-sm py-4 px-2 rounded-xl transition-all cursor-pointer">
          <Search className="w-6 h-6 text-cyan" />
          <span className="font-medium">Расследовать</span>
        </button>
        <button 
          onClick={openTimeline}
          className="glass-card flex flex-col items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-white/10 text-sm py-4 px-2 rounded-xl transition-all cursor-pointer">
          <Clock className="w-6 h-6 text-purple" />
          <span className="font-medium">Таймлайн</span>
        </button>
      </div>

      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
        Готов к путешествиям во времени
      </div>
    </div>
  )
}

export default IndexPopup
