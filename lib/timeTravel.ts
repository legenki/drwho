import { v4 as uuidv4 } from "uuid"
import { db, type Snapshot } from "./db"

/**
 * Generates a unique name for a snapshot based on tab content.
 */
function generateSnapshotName(tabs: { url: string; title: string }[]): string {
  // Count domain frequency
  const domainCounts: Record<string, number> = {}
  for (const tab of tabs) {
    try {
      const host = new URL(tab.url).hostname.replace("www.", "")
      domainCounts[host] = (domainCounts[host] || 0) + 1
    } catch { /* skip invalid urls */ }
  }

  // Find top domain
  const topDomain = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  // Time format: "17:45"
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

  if (topDomain) {
    const others = tabs.length - (domainCounts[topDomain] || 0)
    if (others > 0) {
      return `${topDomain} +${others} · ${time}`
    }
    return `${topDomain} · ${time}`
  }

  return `Snapshot · ${time}`
}

/**
 * Saves current state of all windows and tabs.
 * If name is not provided, generates a unique name automatically.
 */
export async function saveSnapshot(name?: string, note: string = ""): Promise<string | null> {
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

  // Count total number of tabs
  const allTabs = snapshotWindows.flatMap(w => w.tabs)
  
  // Do not save empty snapshots
  if (allTabs.length === 0) {
    console.log("Skipping snapshot: no tabs found")
    return null
  }

  const snapshotName = name || generateSnapshotName(allTabs)

  const snapshot: Snapshot = {
    id: uuidv4(),
    createdAt: new Date(),
    name: snapshotName,
    note,
    tags: [],
    windows: snapshotWindows
  }

  await db.snapshots.add(snapshot)
  return snapshot.id
}


/**
 * Restores windows and tabs from a snapshot.
 */
export async function restoreSnapshot(snapshotId: string) {
  const snapshot = await db.snapshots.get(snapshotId)
  if (!snapshot) throw new Error("Snapshot not found")

  for (const win of snapshot.windows) {
    if (win.tabs.length === 0) continue
    
    // Create a new window with the first tab
    const firstTab = win.tabs[0]
    const newWindow = await chrome.windows.create({
      url: firstTab.url
    })

    // Add remaining tabs
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
