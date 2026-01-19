import React, { useState, useEffect, lazy, Suspense, useContext } from 'react'
import { 
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthContext } from './context/AuthContext'
import Splash from './components/Common/Splash'
import Navbar from './components/Common/Navbar'
import BottomNav from './components/Common/BottomNav'
import Toast from './components/Common/Toast'
import RouteLoader from './components/Common/RouteLoader'
import './App.css'
import logo from './assets/logo.png'

// Lazy load components
const Login = lazy(() => import('./components/Auth/Login'))
const Signup = lazy(() => import('./components/Auth/Signup'))
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'))
const Home = lazy(() => import('./components/Dashboard/Home'))
const Practice = lazy(() => import('./components/Dashboard/Practice'))
const History = lazy(() => import('./components/Dashboard/History'))
const Streaks = lazy(() => import('./components/Dashboard/Streaks'))
const Book = lazy(() => import('./components/Dashboard/Book'))
const Settings = lazy(() => import('./components/Common/Settings'))

function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext)
  return currentUser ? children : <Navigate to="/login" replace />
}

function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <RouteLoader />
      <Navbar />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <Splash />

  return (
    <div className="app">
      <Toast />
      <Suspense fallback={
        <div className="suspense-fallback">
          <img src={logo} alt="Lingo" className="suspense-logo" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  )
}

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout>
            <Home />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="practice" element={
        <PrivateRoute>
          <MainLayout>
            <Practice />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="history" element={
        <PrivateRoute>
          <MainLayout>
            <History />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="streaks" element={
        <PrivateRoute>
          <MainLayout>
            <Streaks />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="book" element={
        <PrivateRoute>
          <MainLayout>
            <Book />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="settings" element={
        <PrivateRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
)

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App