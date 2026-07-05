import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Clock, Search, BarChart2, Folder, Play, History, Filter } from "lucide-react"
import { db } from "./lib/db"
import { restoreSnapshot } from "./lib/timeTravel"
import { InvestigatorTab } from "./components/InvestigatorTab"
import "./style.css"

function SidePanel() {
  const [activeTab, setActiveTab] = useState<"timeline" | "investigator">("timeline")
  const [searchQuery, setSearchQuery] = useState("")

  const snapshots = useLiveQuery(() => db.snapshots.orderBy("createdAt").reverse().toArray())

  const filteredSnapshots = snapshots?.filter(snap => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return snap.name.toLowerCase().includes(q) || 
           snap.note?.toLowerCase().includes(q) || 
           snap.windows.some(w => w.tabs.some(t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)))
  })

  return (
    <div className="flex flex-col h-screen text-gray-900 dark:text-white">
      {/* Header Tabs */}
      <div className="flex p-4 gap-2 sticky top-0 z-10 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10 shadow-sm">
        <button 
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "timeline" 
              ? "bg-white/60 dark:bg-white/20 shadow-sm text-cyan drop-shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10"
          }`}
        >
          <Clock className="w-4 h-4" /> Таймлайн
        </button>
        <button 
          onClick={() => setActiveTab("investigator")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "investigator" 
              ? "bg-white/60 dark:bg-white/20 shadow-sm text-cyan drop-shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10"
          }`}
        >
          <Search className="w-4 h-4" /> Расследование
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input 
                type="text"
                placeholder="Поиск по снимкам, заметкам и вкладкам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-xl py-3 pl-10 pr-4"
              />
            </div>
            {filteredSnapshots?.map((snap) => {
              const totalTabs = snap.windows.reduce((acc, w) => acc + w.tabs.length, 0)
              return (
                <div key={snap.id} className="glass-card p-5 rounded-2xl hover:border-cyan/50 dark:hover:border-cyan/50 transition-all hover:shadow-cyan/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{snap.name}</h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(snap.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-cyan/10 dark:bg-cyan/20 text-cyan px-2.5 py-1 rounded-md text-xs font-bold border border-cyan/20">
                      {totalTabs} tabs
                    </div>
                  </div>
                  {snap.note && <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{snap.note}</p>}
                  
                  {/* Tab Previews */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {snap.windows.flatMap(w => w.tabs).slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-center w-7 h-7 bg-white/50 dark:bg-black/50 rounded-full overflow-hidden border border-white/40 dark:border-white/10 shadow-sm" title={t.title}>
                        {t.favIconUrl ? (
                          <img src={t.favIconUrl} alt="" className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full" />
                        )}
                      </div>
                    ))}
                    {totalTabs > 5 && (
                      <div className="flex items-center justify-center w-7 h-7 bg-white/50 dark:bg-black/50 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-white/40 dark:border-white/10 shadow-sm">
                        +{totalTabs - 5}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => restoreSnapshot(snap.id)}
                    className="w-full flex items-center justify-center gap-2 bg-purple/90 hover:bg-purple text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4 text-gold drop-shadow-sm" fill="currentColor" />
                    Восстановить
                  </button>
                </div>
              )
            })}
            {filteredSnapshots?.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12 glass-card p-8 rounded-2xl mx-4">
                <History className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan" />
                <p className="font-medium text-lg text-gray-800 dark:text-gray-200">{searchQuery ? "Ничего не найдено по запросу." : "У вас еще нет снимков."}</p>
                {!searchQuery && <p className="text-sm mt-2 opacity-80">Откройте Popup и сохраните текущее состояние.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === "investigator" && <InvestigatorTab />}
      </div>
    </div>
  )
}

export default SidePanel
