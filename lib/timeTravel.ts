import { v4 as uuidv4 } from "uuid"
import { db, type Snapshot } from "./db"

/**
 * Сохраняет текущее состояние всех окон и вкладок.
 */
export async function saveSnapshot(name: string = "Manual Snapshot", note: string = ""): Promise<string> {
  const windows = await chrome.windows.getAll({ populate: true })
  
  const snapshotWindows = windows.map((win) => ({
    id: win.id ?? 0,
    tabs: (win.tabs || []).map((tab) => ({
      url: tab.url || "",
      title: tab.title || "",
      favIconUrl: tab.favIconUrl,
      pinned: tab.pinned
    }))
  }))

  const snapshot: Snapshot = {
    id: uuidv4(),
    createdAt: new Date(),
    name,
    note,
    tags: [],
    windows: snapshotWindows
  }

  await db.snapshots.add(snapshot)
  return snapshot.id
}

/**
 * Восстанавливает окна и вкладки из снимка.
 */
export async function restoreSnapshot(snapshotId: string) {
  const snapshot = await db.snapshots.get(snapshotId)
  if (!snapshot) throw new Error("Snapshot not found")

  for (const win of snapshot.windows) {
    if (win.tabs.length === 0) continue
    
    // Создаем новое окно с первой вкладкой
    const firstTab = win.tabs[0]
    const newWindow = await chrome.windows.create({
      url: firstTab.url
    })

    // Добавляем остальные вкладки
    for (let i = 1; i < win.tabs.length; i++) {
      const tab = win.tabs[i]
      await chrome.tabs.create({
        windowId: newWindow.id,
        url: tab.url,
        active: false,
        pinned: tab.pinned
      })
    }
  }
}
