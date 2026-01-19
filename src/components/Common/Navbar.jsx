import React, { useState, useContext, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { ToastContext } from '../../context/ToastContext'
import './Navbar.css'
import logo from '../../assets/logo.png'; 

// Icons - you can use any icon library or replace with emojis
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const ChevronDown = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext)
  const { theme, themes, setTheme } = useContext(ThemeContext)
  const { showToast } = useContext(ToastContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/': return 'Dashboard'
      case '/practice': return 'Practice'
      case '/history': return 'History'
      case '/streaks': return 'Streaks'
      case '/book': return 'Study Book'
      case '/settings': return 'Settings'
      default: return 'Lingo'
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === themes.light ? themes.dark : themes.light
    setTheme(newTheme)
    showToast(`Theme switched to ${newTheme}`, 'info')
    setIsDropdownOpen(false)
  }

  const handleExportData = () => {
    showToast('Export feature coming soon!', 'info')
    setIsDropdownOpen(false)
  }

  const handleGoToSettings = () => {
    navigate('/settings')
    setIsDropdownOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Logged out successfully', 'success')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      showToast('Failed to logout', 'error')
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case themes.light: return <SunIcon />
      case themes.dark: return <MoonIcon />
      case themes.melange: return '🎨'
      default: return <SunIcon />
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Lingo Logo" className="logo-icon" />
            <span className="logo-text">Lingo</span>
          </Link>
        </div>
        
        <div className="navbar-center">
          <h1 className="navbar-title">{getPageTitle()}</h1>
        </div>
        
        <div className="navbar-right" ref={dropdownRef}>
          {currentUser && (
            <div className="user-profile-container">
              <button 
                className="user-profile-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-label="User menu"
              >
                <div className="user-info">
                  <span className="user-name">
                    {currentUser.displayName || 'User'}
                  </span>
                  <div className="user-avatar">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className={`dropdown-chevron ${isDropdownOpen ? 'rotated' : ''}`} />
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {/* User Info Header */}
                  <div className="dropdown-header">
                    <div className="dropdown-user-avatar">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="dropdown-user-info">
                      <h4>{currentUser.displayName || 'User'}</h4>
                      <p className="dropdown-user-email">{currentUser.email}</p>
                    </div>
                    <button 
                      className="dropdown-close-btn"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-label="Close menu"
                    >
                      <XIcon />
                    </button>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  {/* Menu Items */}
                  <div className="dropdown-content">
                    {/* Theme Toggle */}
                    <button 
                      className="dropdown-item"
                      onClick={handleThemeToggle}
                    >
                      <div className="dropdown-item-icon">
                        {getThemeIcon()}
                      </div>
                      <span className="dropdown-item-text">
                        {theme === themes.light ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </button>
                    
                    {/* Export Data */}
                    <button 
                      className="dropdown-item"
                      onClick={handleExportData}
                    >
                      <div className="dropdown-item-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                      <span className="dropdown-item-text">Export Data</span>
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    {/* Settings */}
                    <button 
                      className="dropdown-item"
                      onClick={handleGoToSettings}
                    >
                      <div className="dropdown-item-icon">
                        <SettingsIcon />
                      </div>
                      <span className="dropdown-item-text">Settings</span>
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    {/* Logout */}
                    <button 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <div className="dropdown-item-icon">
                        <LogOutIcon />
                      </div>
                      <span className="dropdown-item-text">Logout</span>
                    </button>
                  </div>
                  
                  {/* Version Info */}
                  <div className="dropdown-footer">
                    <span className="version-text">Lingo v1.0.0</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar