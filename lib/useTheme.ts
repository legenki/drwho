import { useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    // Load initial theme
    chrome.storage.local.get("theme").then((res) => {
      if (res.theme) {
        setTheme(res.theme as Theme)
      }
    })

    // Listen for changes from other pages
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.theme?.newValue) {
        setTheme(changes.theme.newValue as Theme)
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      let isDark = false

      if (theme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      } else {
        isDark = theme === "dark"
      }

      if (isDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    applyTheme()

    // Listen for system theme changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        applyTheme()
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme)
    chrome.storage.local.set({ theme: newTheme })
  }

  return { theme, setTheme: setThemeAndSave }
}
