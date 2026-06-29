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
    <div className="flex flex-col h-screen bg-background text-white">
      {/* Header Tabs */}
      <div className="flex border-b border-[#1A2638] bg-[#0A1628] sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${activeTab === "timeline" ? "text-cyan border-b-2 border-cyan bg-[#1A2638]" : "text-gray-400 hover:bg-[#1A2638]"}`}
        >
          <Clock className="w-4 h-4" /> Timeline
        </button>
        <button 
          onClick={() => setActiveTab("investigator")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${activeTab === "investigator" ? "text-cyan border-b-2 border-cyan bg-[#1A2638]" : "text-gray-400 hover:bg-[#1A2638]"}`}
        >
          <Search className="w-4 h-4" /> Investigator
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Поиск по снимкам, заметкам и вкладкам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A2638] border border-[#2A3648] rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
            {filteredSnapshots?.map((snap) => {
              const totalTabs = snap.windows.reduce((acc, w) => acc + w.tabs.length, 0)
              return (
                <div key={snap.id} className="bg-[#1A2638] p-4 rounded-xl border border-[#2A3648] hover:border-cyan/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-100">{snap.name}</h3>
                      <div className="text-xs text-gray-400">
                        {new Date(snap.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-cyan/10 text-cyan px-2 py-1 rounded-md text-xs font-semibold">
                      {totalTabs} tabs
                    </div>
                  </div>
                  {snap.note && <p className="text-sm text-gray-300 mb-3">{snap.note}</p>}
                  
                  {/* Tab Previews */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {snap.windows.flatMap(w => w.tabs).slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-center w-6 h-6 bg-background rounded-full overflow-hidden border border-[#2A3648]" title={t.title}>
                        {t.favIconUrl ? (
                          <img src={t.favIconUrl} alt="" className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-600 rounded-full" />
                        )}
                      </div>
                    ))}
                    {totalTabs > 5 && (
                      <div className="flex items-center justify-center w-6 h-6 bg-background rounded-full text-[10px] text-gray-400 border border-[#2A3648]">
                        +{totalTabs - 5}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => restoreSnapshot(snap.id)}
                    className="w-full flex items-center justify-center gap-2 bg-purple hover:bg-purple/80 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4 text-gold" fill="currentColor" />
                    Восстановить
                  </button>
                </div>
              )
            })}
            {filteredSnapshots?.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>{searchQuery ? "Ничего не найдено по запросу." : "У вас еще нет снимков времени."}</p>
                {!searchQuery && <p className="text-xs mt-1">Откройте Popup и сохраните текущее состояние.</p>}
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
