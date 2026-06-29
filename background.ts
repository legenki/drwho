import { db } from "./lib/db"

const MENU_INVESTIGATE_ID = "drwho-investigate"

// Setup Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_INVESTIGATE_ID,
    title: "Dr Who? Расследовать",
    contexts: ["page", "link"]
  })
})

// Handle Context Menu Click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU_INVESTIGATE_ID) {
    const targetUrl = info.linkUrl || info.pageUrl
    if (targetUrl) {
      // Save target to local storage for the sidepanel to pick up
      await chrome.storage.local.set({ investigateTarget: targetUrl })
      
      // Open side panel
      if (tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId })
      }
    }
  }
})

// --- Basic Domain Time Tracking ---

let activeDomain = ""
let lastTimeActive = Date.now()

const updateDomainTime = async () => {
  if (!activeDomain) return
  const now = Date.now()
  const timeSpent = now - lastTimeActive
  
  if (timeSpent > 0) {
    try {
      const stat = await db.domainStats.get(activeDomain)
      if (stat) {
        await db.domainStats.update(activeDomain, {
          totalTimeMs: stat.totalTimeMs + timeSpent,
          lastVisit: new Date(now),
          visitCount: stat.visitCount + 1
        })
      } else {
        await db.domainStats.add({
          domain: activeDomain,
          totalTimeMs: timeSpent,
          visitCount: 1,
          lastVisit: new Date(now)
        })
      }
    } catch (e) {
      console.error("Failed to update domain stats:", e)
    }
  }
  
  lastTimeActive = now
}

const handleActiveChange = async (url?: string) => {
  await updateDomainTime()
  
  if (url && url.startsWith("http")) {
    try {
      const hostname = new URL(url).hostname
      activeDomain = hostname
    } catch {
      activeDomain = ""
    }
  } else {
    activeDomain = ""
  }
  lastTimeActive = Date.now()
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  handleActiveChange(tab.url)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleActiveChange(changeInfo.url)
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    handleActiveChange("")
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId })
    if (tabs.length > 0) {
      handleActiveChange(tabs[0].url)
    }
  }
})

// Handle idle state
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === "active") {
    lastTimeActive = Date.now()
  } else {
    // Idle or Locked
    updateDomainTime()
    activeDomain = "" // Stop tracking until active again
  }
})
