import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ToastContext } from '../../context/ToastContext'
import { validateEmail } from '../../utils/validation'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { resetPassword } = useContext(AuthContext)
  const { showToast } = useContext(ToastContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }
    
    setLoading(true)
    
    try {
      await resetPassword(email)
      setEmailSent(true)
      showToast('Password reset email sent! Check your inbox.', 'success')
    } catch (error) {
      let errorMessage = 'Failed to send reset email'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      }
      showToast(errorMessage, 'error')
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {emailSent 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive reset instructions'}
          </p>
        </div>
        
        {!emailSent ? (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="auth-error">{errors.general}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>
            
            <div className="auth-footer">
              <button 
                onClick={handleBackToLogin}
                className="btn btn-outline w-100"
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <div className="email-sent-container">
            <div className="email-sent-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="email-sent-text">
              We've sent password reset instructions to <strong>{email}</strong>. 
              Please check your email and follow the link to reset your password.
            </p>
            <button 
              onClick={handleBackToLogin}
              className="btn btn-primary w-100 mt-lg"
            >
              Back to Login
            </button>
          </div>
        )}
        
        <div className="auth-footer">
          <p className="auth-footer-text">
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword