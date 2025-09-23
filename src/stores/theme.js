import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
      },
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },
      initializeTheme: () => {
        const storedTheme = get().theme
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(storedTheme)
      }
    }),
    {
      name: 'talent-flow-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)