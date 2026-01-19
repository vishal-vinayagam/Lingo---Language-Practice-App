import React from 'react'
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

function BottomNav() {
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/practice', icon: '🎤', label: 'Practice' },
    { path: '/book', icon: '📖', label: 'Book' },
    { path: '/streaks', icon: '🔥', label: 'Streaks' },
    { path: '/history', icon: '📚', label: 'History' },
    
   
  ]


  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav