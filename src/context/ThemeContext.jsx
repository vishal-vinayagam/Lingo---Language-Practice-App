import React, { createContext, useState, useEffect } from 'react'

const themes = {
  light: 'light',
  dark: 'dark',
  melange: 'melange'
}

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('lingo-theme')
    return savedTheme && Object.values(themes).includes(savedTheme) 
      ? savedTheme 
      : themes.light
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = `theme-${theme}`
    
    // Save to localStorage
    localStorage.setItem('lingo-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes)
    const currentIndex = themeKeys.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    setTheme(themes[themeKeys[nextIndex]])
  }

  const setThemeByName = (themeName) => {
    if (Object.values(themes).includes(themeName)) {
      setTheme(themeName)
    }
  }

  const value = {
    theme,
    themes,
    toggleTheme,
    setTheme: setThemeByName
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}