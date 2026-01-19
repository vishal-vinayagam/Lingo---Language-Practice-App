import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { ToastContext } from '../../context/ToastContext'
import Modal from './Modal'
import './Settings.css'

function Settings() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [autoUpload, setAutoUpload] = useState(true)

  const { currentUser, logout, updatePassword } = useContext(AuthContext)
  const { theme, themes, setTheme } = useContext(ThemeContext)
  const { showToast } = useContext(ToastContext)
  const navigate = useNavigate()

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    showToast(`Theme changed to ${newTheme}`, 'success')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    // Validate passwords
    const errors = {}
    if (!currentPassword) errors.currentPassword = 'Current password is required'
    if (!newPassword) errors.newPassword = 'New password is required'
    if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      await updatePassword(newPassword)
      showToast('Password updated successfully', 'success')
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
    } catch (error) {
      console.error('Error changing password:', error)
      let errorMessage = 'Failed to update password'
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please re-authenticate to change password'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      }
      showToast(errorMessage, 'error')
      setPasswordErrors({ general: errorMessage })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Logged out successfully', 'success')
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      showToast('Failed to logout', 'error')
    }
  }

  const handleToggleAutoUpload = () => {
    const newValue = !autoUpload
    setAutoUpload(newValue)
    localStorage.setItem('lingo-auto-upload', newValue.toString())
    showToast(
      `Auto-upload ${newValue ? 'enabled' : 'disabled'}`,
      'info'
    )
  }

  const handleExportData = () => {
    showToast('Data export feature coming soon', 'info')
  }

  const handleDeleteAccount = () => {
    showToast('Account deletion feature coming soon', 'warning')
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <p className="settings-subtitle">Customize your Lingo experience</p>
      </div>

      {/* User Info */}
      <div className="settings-section">
        <h2 className="section-title">Account</h2>
        <div className="user-info-card">
          <div className="user-avatar-large">
            {currentUser?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h3>{currentUser?.displayName || 'User'}</h3>
            <p>{currentUser?.email}</p>
            <p className="member-since">
              Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="settings-section">
        <h2 className="section-title">Appearance</h2>
        <div className="theme-selector">
          <div className="theme-options">
            <button
              className={`theme-option ${theme === themes.light ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.light)}
            >
              <div className="theme-preview light">
                <div className="preview-header"></div>
                <div className="preview-content"></div>
              </div>
              <span>Light</span>
            </button>
            
            <button
              className={`theme-option ${theme === themes.dark ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.dark)}
            >
              <div className="theme-preview dark">
                <div className="preview-header"></div>
                <div className="preview-content"></div>
              </div>
              <span>Dark</span>
            </button>
            
            <button
              className={`theme-option ${theme === themes.melange ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.melange)}
            >
              <div className="theme-preview melange">
                <div className="preview-header"></div>
                <div className="preview-content"></div>
              </div>
              <span>Melange</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="settings-section">
        <h2 className="section-title">Preferences</h2>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h3>Auto-upload Recordings</h3>
            <p>Automatically upload recordings to cloud when online</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoUpload}
              onChange={handleToggleAutoUpload}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h3>Export My Data</h3>
            <p>Download all your recordings and progress data</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={handleExportData}
          >
            Export
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="settings-section">
        <h2 className="section-title">Account Actions</h2>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h3>Change Password</h3>
            <p>Update your account password</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowChangePassword(true)}
          >
            Change
          </button>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h3>Delete Account</h3>
            <p>Permanently delete your account and all data</p>
          </div>
          <button
            className="btn btn-outline danger"
            onClick={handleDeleteAccount}
          >
            Delete
          </button>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowConfirmLogout(true)}
          >
            Logout
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="settings-section">
        <h2 className="section-title">About</h2>
        <div className="app-info">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Build:</strong> 2024.01.15</p>
          <p className="app-description">
            Lingo helps you master language skills through daily practice, 
            recording, and personalized feedback.
          </p>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="password-form">
          {passwordErrors.general && (
            <div className="form-error">{passwordErrors.general}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                if (passwordErrors.currentPassword) {
                  setPasswordErrors({ ...passwordErrors, currentPassword: '' })
                }
              }}
              disabled={isChangingPassword}
            />
            {passwordErrors.currentPassword && (
              <div className="error-message">{passwordErrors.currentPassword}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (passwordErrors.newPassword) {
                  setPasswordErrors({ ...passwordErrors, newPassword: '' })
                }
              }}
              disabled={isChangingPassword}
            />
            {passwordErrors.newPassword && (
              <div className="error-message">{passwordErrors.newPassword}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (passwordErrors.confirmPassword) {
                  setPasswordErrors({ ...passwordErrors, confirmPassword: '' })
                }
              }}
              disabled={isChangingPassword}
            />
            {passwordErrors.confirmPassword && (
              <div className="error-message">{passwordErrors.confirmPassword}</div>
            )}
          </div>
          
          <div className="modal-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowChangePassword(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Logout Modal */}
      <Modal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        title="Confirm Logout"
        size="small"
      >
        <div className="logout-confirm">
          <p>Are you sure you want to logout?</p>
          <div className="modal-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setShowConfirmLogout(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleLogout}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings