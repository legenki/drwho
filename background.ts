import { db } from "./lib/db"
import { saveSnapshot } from "./lib/timeTravel"

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

// --- Auto Save Logic (Alarms) ---

const AUTO_SAVE_ALARM = "drwho-autosave"

const setupAutoSave = async () => {
  const { autoSave, autoSaveInterval } = await chrome.storage.local.get(["autoSave", "autoSaveInterval"])
  await chrome.alarms.clear(AUTO_SAVE_ALARM)
  
  if (autoSave && autoSaveInterval) {
    chrome.alarms.create(AUTO_SAVE_ALARM, {
      periodInMinutes: autoSaveInterval
    })
  }
}

chrome.runtime.onInstalled.addListener(setupAutoSave)
chrome.runtime.onStartup.addListener(setupAutoSave)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === AUTO_SAVE_ALARM) {
    saveSnapshot("Auto Snapshot", "Сгенерировано автоматически")
  }
})

// Update alarm when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoSave || changes.autoSaveInterval) {
    setupAutoSave()
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
      let stat = await db.domainStats.get(activeDomain)
      const timeDiff = timeSpent
      
      if (stat) {
        stat.totalTimeMs += timeDiff
        stat.lastVisitedAt = now
        stat.visitCount += 1
        await db.domainStats.put(stat)
      } else {
        await db.domainStats.put({
          domain: activeDomain,
          totalTimeMs: timeDiff,
          visitCount: 1,
          firstVisitedAt: now,
          lastVisitedAt: now
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
