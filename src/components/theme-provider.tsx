"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export type ThemePack = "blue" | "emerald" | "purple" | "crimson" | "orange" | "college"

interface ThemeContextType {
  themePack: ThemePack
  setThemePack: (pack: ThemePack) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [themePack, setThemePackState] = React.useState<ThemePack>("blue")

  React.useEffect(() => {
    const saved = localStorage.getItem("crewarena-theme-pack") as ThemePack
    if (saved) {
      setThemePackState(saved)
      document.documentElement.setAttribute("data-theme-pack", saved)
    } else {
      document.documentElement.setAttribute("data-theme-pack", "blue")
    }
  }, [])

  const setThemePack = React.useCallback((pack: ThemePack) => {
    setThemePackState(pack)
    localStorage.setItem("crewarena-theme-pack", pack)
    document.documentElement.setAttribute("data-theme-pack", pack)
  }, [])

  return (
    <ThemeContext.Provider value={{ themePack, setThemePack }}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
