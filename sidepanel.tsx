import { useState, useRef, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Clock, Search, Play, History, Settings, Pencil, Trash2, Check, X } from "lucide-react"
import { db } from "./lib/db"
import { restoreSnapshot } from "./lib/timeTravel"
import { useTheme } from "./lib/useTheme"
import { InvestigatorTab } from "./components/InvestigatorTab"
import { SettingsTab } from "./components/SettingsTab"
import "./style.css"

function SidePanel() {
  useTheme()
  const [activeTab, setActiveTab] = useState<"timeline" | "investigator" | "settings">("timeline")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const snapshots = useLiveQuery(() => db.snapshots.orderBy("createdAt").reverse().toArray(), [])

  const filteredSnapshots = snapshots?.filter(snap => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return snap.name.toLowerCase().includes(q) || 
           snap.note?.toLowerCase().includes(q) || 
           snap.windows.some(w => w.tabs.some(t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)))
  })

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditValue(currentName)
    setDeletingId(null)
  }

  const saveEdit = async () => {
    if (editingId && editValue.trim()) {
      await db.snapshots.update(editingId, { name: editValue.trim() })
    }
    setEditingId(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit()
    if (e.key === "Escape") cancelEdit()
  }

  const confirmDelete = async (id: string) => {
    await db.snapshots.delete(id)
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col h-screen text-N800 dark:text-DN800 bg-N20 dark:bg-DN10">
      {/* Header Tabs */}
      <div className="flex p-4 gap-2 sticky top-0 z-10 bg-N0 dark:bg-DN20 border-b border-N40 dark:border-DN40 shadow-sm">
        <button 
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-colors ${
            activeTab === "timeline" 
              ? "bg-B50 dark:bg-B500/20 text-B400" 
              : "text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30 hover:text-N800 dark:hover:text-DN800"
          }`}
        >
          <Clock className="w-4 h-4" /> Timeline
        </button>
        <button 
          onClick={() => setActiveTab("investigator")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-colors ${
            activeTab === "investigator" 
              ? "bg-B50 dark:bg-B500/20 text-B400" 
              : "text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30 hover:text-N800 dark:hover:text-DN800"
          }`}
        >
          <Search className="w-4 h-4" /> Investigate
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded transition-colors ${
            activeTab === "settings" 
              ? "bg-B50 dark:bg-B500/20 text-B400" 
              : "text-N400 dark:text-DN400 hover:bg-N20 dark:hover:bg-DN30 hover:text-N800 dark:hover:text-DN800"
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-N200 dark:text-DN200" />
              <input 
                type="text"
                placeholder="Search snapshots, notes, and tabs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="atl-input w-full pl-10 pr-4"
              />
            </div>
            {filteredSnapshots?.map((snap) => {
              const totalTabs = snap.windows.reduce((acc, w) => acc + w.tabs.length, 0)
              const isEditing = editingId === snap.id
              const isDeleting = deletingId === snap.id

              return (
                <div key={snap.id} className="atl-card p-5 hover:border-B400 transition-colors">
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="atl-input text-base font-semibold py-1 px-2 flex-1 min-w-0"
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 rounded text-G400 hover:bg-G50 dark:hover:bg-G500/20 transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded text-N400 hover:bg-N30 dark:hover:bg-DN30 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-lg truncate">{snap.name}</h3>
                      )}
                      <div className="text-xs text-N200 dark:text-DN200 font-medium mt-0.5">
                        {new Date(snap.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="atl-lozenge atl-lozenge-inprogress">
                        {totalTabs} tabs
                      </div>
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEdit(snap.id, snap.name)}
                            className="p-1.5 rounded text-N200 dark:text-DN200 hover:text-B400 hover:bg-N20 dark:hover:bg-DN30 transition-colors"
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(isDeleting ? null : snap.id)}
                            className="p-1.5 rounded text-N200 dark:text-DN200 hover:text-R400 hover:bg-R50 dark:hover:bg-R500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {isDeleting && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-3 rounded bg-R50 dark:bg-R500/10 border border-R200 dark:border-R400/30">
                      <span className="text-sm text-R500 dark:text-R300 font-medium">Delete this snapshot?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDelete(snap.id)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-R400 hover:bg-R500 text-white transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-N0 dark:bg-DN20 border border-N40 dark:border-DN40 text-N800 dark:text-DN800 hover:bg-N20 dark:hover:bg-DN30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {snap.note && <p className="text-sm text-N800 dark:text-DN800 mb-3">{snap.note}</p>}
                  
                  {/* Tab Previews */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {snap.windows.flatMap(w => w.tabs).slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-center w-7 h-7 bg-N0 dark:bg-DN20 rounded-full overflow-hidden border border-N40 dark:border-DN40 shadow-sm" title={t.title}>
                        {t.favIconUrl ? (
                          <img src={t.favIconUrl} alt="" className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 bg-N40 dark:bg-DN40 rounded-full" />
                        )}
                      </div>
                    ))}
                    {totalTabs > 5 && (
                      <div className="flex items-center justify-center w-7 h-7 bg-N0 dark:bg-DN20 rounded-full text-[10px] font-bold text-N200 dark:text-DN200 border border-N40 dark:border-DN40 shadow-sm">
                        +{totalTabs - 5}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => restoreSnapshot(snap.id)}
                    className="atl-button-primary w-full flex items-center justify-center gap-2 py-2"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Restore
                  </button>
                </div>
              )
            })}
            {filteredSnapshots?.length === 0 && (
              <div className="text-center text-N200 dark:text-DN200 mt-12 atl-card p-8 mx-4">
                <History className="w-12 h-12 mx-auto mb-4 opacity-30 text-N500 dark:text-DN300" />
                <p className="font-medium text-lg text-N800 dark:text-DN800">{searchQuery ? "Nothing found." : "You have no snapshots yet."}</p>
                {!searchQuery && <p className="text-sm mt-2">Use auto-save or context menu.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === "investigator" && <InvestigatorTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  )
}

export default SidePanel
