import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './RouteLoader.css'
import logo from '../../assets/logo.png'

const SHOW_PATHS = ['/', '/practice', '/book', '/streaks', '/history', '/settings']

export default function RouteLoader() {
  const location = useLocation()
  const prevPath = useRef(location.pathname)
  const [show, setShow] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const from = prevPath.current
    const to = location.pathname
    prevPath.current = to

    // Only show loader when navigating between main sections
    if (from !== to && SHOW_PATHS.includes(to)) {
      setShow(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShow(false), 1000)
    }

    return () => clearTimeout(timerRef.current)
  }, [location.pathname])

  if (!show) return null

  return (
    <div className="route-loader-overlay">
      <div className="route-loader-content">
        <img src={logo} alt="logo" className="route-loader-logo" />
      </div>
    </div>
  )
}
