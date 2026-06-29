import "fake-indexeddb/auto"
import { vi } from "vitest"

const chromeMock = {
  windows: {
    getAll: vi.fn(),
    create: vi.fn(),
    WINDOW_ID_NONE: -1,
    onFocusChanged: { addListener: vi.fn() }
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn(),
    get: vi.fn(),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() }
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  runtime: {
    onInstalled: { addListener: vi.fn() }
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: { addListener: vi.fn() }
  },
  sidePanel: {
    open: vi.fn()
  },
  idle: {
    onStateChanged: { addListener: vi.fn() }
  }
}

global.chrome = chromeMock as any
