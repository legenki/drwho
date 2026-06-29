import { useState } from "react"
import { Clock, History, Search } from "lucide-react"
import { saveSnapshot } from "./lib/timeTravel"
import "./style.css"

function IndexPopup() {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSnapshot("Manual Snapshot", "")
      // Briefly show success state if needed
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setSaving(false), 500)
    }
  }

  return (
    <div className="w-[320px] p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="text-cyan w-6 h-6" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
          Dr Who
        </h1>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-purple hover:bg-purple/80 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70">
        <History className="w-5 h-5 text-gold" />
        {saving ? "Сохранение..." : "Сохранить момент во времени"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button className="flex flex-col items-center justify-center gap-2 bg-[#1A2638] hover:bg-[#2A3648] text-sm py-3 px-2 rounded-lg transition-colors border border-[#2A3648]">
          <Search className="w-5 h-5 text-cyan" />
          <span>Расследовать</span>
        </button>
        <button 
          onClick={() => chrome.runtime.openOptionsPage()} // Temporary, will change to side panel
          className="flex flex-col items-center justify-center gap-2 bg-[#1A2638] hover:bg-[#2A3648] text-sm py-3 px-2 rounded-lg transition-colors border border-[#2A3648]">
          <Clock className="w-5 h-5 text-cyan" />
          <span>Таймлайн</span>
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400 text-center">
        Готов к путешествиям во времени
      </div>
    </div>
  )
}

export default IndexPopup
