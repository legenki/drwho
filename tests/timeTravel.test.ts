import { describe, it, expect, beforeEach, vi } from "vitest"
import { saveSnapshot, restoreSnapshot } from "../lib/timeTravel"
import { db } from "../lib/db"

describe("Time Travel functionality", () => {
  beforeEach(async () => {
    await db.snapshots.clear()
    vi.clearAllMocks()
  })

  it("should save a snapshot of current windows and tabs", async () => {
    // Mock chrome.windows.getAll to return a mock window
    const mockWindows = [
      {
        id: 1,
        tabs: [
          { url: "https://example.com", title: "Example", favIconUrl: "", pinned: false },
          { url: "https://test.com", title: "Test", favIconUrl: "", pinned: true }
        ]
      }
    ]
    ;(global.chrome.windows.getAll as any).mockResolvedValue(mockWindows)

    const snapshotId = await saveSnapshot("Test Snapshot", "Test Note")

    const snapshot = await db.snapshots.get(snapshotId)
    expect(snapshot).toBeDefined()
    expect(snapshot?.name).toBe("Test Snapshot")
    expect(snapshot?.note).toBe("Test Note")
    expect(snapshot?.windows.length).toBe(1)
    expect(snapshot?.windows[0].tabs.length).toBe(2)
    expect(snapshot?.windows[0].tabs[0].url).toBe("https://example.com")
  })

  it("should restore a snapshot correctly", async () => {
    // Add a snapshot directly to DB
    const id = "test-id-123"
    await db.snapshots.add({
      id,
      createdAt: new Date(),
      name: "Restore Test",
      note: "",
      tags: [],
      windows: [
        {
          id: 1,
          tabs: [
            { url: "https://tab1.com", title: "Tab 1" },
            { url: "https://tab2.com", title: "Tab 2" }
          ]
        }
      ]
    })

    // Mock window creation to return a window id
    ;(global.chrome.windows.create as any).mockResolvedValue({ id: 99 })

    await restoreSnapshot(id)

    // Check if chrome.windows.create was called for the first tab
    expect(global.chrome.windows.create).toHaveBeenCalledWith({
      url: "https://tab1.com"
    })

    // Check if chrome.tabs.create was called for the second tab
    expect(global.chrome.tabs.create).toHaveBeenCalledWith({
      windowId: 99,
      url: "https://tab2.com",
      active: false,
      pinned: undefined
    })
  })
})
