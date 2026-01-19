import React, { useEffect } from 'react'
import './Splash.css'
import logo from '../../assets/logo.png'

function Splash() {
  useEffect(() => {
    // animation class to logo
    const logoElement = document.querySelector('.splash-logo')
    if (logoElement) {
      logoElement.classList.add('animate')
    }
  }, [])

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img 
          src={logo} 
          alt="Lingo Logo" 
          className="splash-logo"
        />
        <h1 className="splash-title">Lingo</h1>
        <p className="splash-subtitle">Master Your Language Skills</p>
      </div>
    </div>
  )
}

export default Splash