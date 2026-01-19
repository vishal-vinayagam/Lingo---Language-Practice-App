import React, { useState, useEffect, useContext, useRef } from 'react'
import { ToastContext } from '../../context/ToastContext'
import { AuthContext } from '../../context/AuthContext'
import { prompts } from '../../utils/topics'
import useMediaRecorder from '../../hooks/useMediaRecorder'
import useSpeechToText from '../../hooks/useSpeechToText'
import './Practice.css'

import { db } from '../../firebase/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import storageService from '../../services/storageService'
import indexedDBService from '../../services/indexedDB'

function Practice() {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeRecorder, setActiveRecorder] = useState(0) // 0 = audio only, 1 = audio + transcript
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState('unknown')
  
  // Store recordings separately
  const [recordings, setRecordings] = useState({
    audioOnly: null,
    withTranscript: null
  })

  const { showToast } = useContext(ToastContext)
  const { currentUser } = useContext(AuthContext)

  // Check if browser supports media devices
  const isMediaDevicesSupported = typeof navigator !== 'undefined' && 
                                 navigator.mediaDevices && 
                                 navigator.mediaDevices.getUserMedia

  // Single recorder instance
  const {
    isRecording,
    isRecorded,
    recordingTime,
    audioUrl,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder()

  // Speech to text
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechToText()

  useEffect(() => {
    generateNewPrompt()
    checkMicrophonePermission()
    
    // Cleanup on unmount
    return () => {
      resetAll()
    }
  }, [])

  const checkMicrophonePermission = async () => {
    if (!isMediaDevicesSupported) {
      setMicrophonePermission('unsupported')
      showToast('Browser does not support microphone access', 'error')
      return
    }

    try {
      // Try to get permission state
      const permission = await navigator.permissions.query({ name: 'microphone' })
      setMicrophonePermission(permission.state)
      
      permission.onchange = () => {
        setMicrophonePermission(permission.state)
      }
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setMicrophonePermission('prompt')
    }
  }

  const requestMicrophonePermission = async () => {
    if (!isMediaDevicesSupported) {
      showToast('Microphone not supported in this browser', 'error')
      return false
    }

    try {
      // Just test the permission without actually recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Immediately stop all tracks
      stream.getTracks().forEach(track => track.stop())
      setMicrophonePermission('granted')
      showToast('Microphone permission granted!', 'success')
      return true
    } catch (error) {
      console.error('Microphone permission error:', error)
      setMicrophonePermission('denied')
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        showToast('Microphone access was denied. Please enable it in browser settings.', 'error')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        showToast('No microphone found. Please connect a microphone.', 'error')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        showToast('Microphone is already in use by another application.', 'error')
      } else {
        showToast('Cannot access microphone. Please check permissions.', 'error')
      }
      return false
    }
  }

  const generateNewPrompt = () => {
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)])
    resetAll()
  }

  const resetAll = () => {
    resetRecording()
    resetTranscript()
    setRecordings({
      audioOnly: null,
      withTranscript: null
    })
    setActiveRecorder(0)
  }

  const handleStartRecording = async () => {
    if (!currentPrompt) {
      showToast('Please generate a topic first', 'warning')
      return
    }

    // Check and request permission if needed
    if (microphonePermission !== 'granted') {
      const granted = await requestMicrophonePermission()
      if (!granted) return
    }

    // Show start recording popup
    showToast('🎤 Recording Started! Speak clearly...', 'success')
    
    try {
      startRecording()
      
      // Only start listening for transcript if it's the second recorder
      if (activeRecorder === 1) {
        startListening()
      }
    } catch (error) {
      console.error('Recording error:', error)
      showToast('Failed to start recording. Please try again.', 'error')
    }
  }

  const handleStopRecording = () => {
    // Show stop recording popup
    showToast('⏹️ Recording Stopped! Ready to save...', 'info')
    
    stopRecording()
    
    // Stop listening if active
    if (isListening) {
      stopListening()
    }
    
    // Save the recording to appropriate state
    if (activeRecorder === 0) {
      setRecordings(prev => ({
        ...prev,
        audioOnly: {
          audioUrl,
          audioBlob,
          recordingTime,
          isRecorded: true
        }
      }))
    } else {
      setRecordings(prev => ({
        ...prev,
        withTranscript: {
          audioUrl,
          audioBlob,
          recordingTime,
          transcript,
          isRecorded: true
        }
      }))
    }
    
    setShowStopModal(true)
  }

  const nextRecorder = () => {
    if (activeRecorder === 0) {
      setActiveRecorder(1)
      showToast('Switched to Audio + Transcript mode', 'info')
    }
  }

  const prevRecorder = () => {
    if (activeRecorder === 1) {
      setActiveRecorder(0)
      showToast('Switched to Audio Only mode', 'info')
    }
  }

  const getCurrentRecordingData = () => {
    if (activeRecorder === 0) {
      if (recordings.audioOnly) {
        return recordings.audioOnly
      }
      return {
        audioUrl,
        audioBlob,
        recordingTime,
        transcript: '',
        isRecorded
      }
    } else {
      if (recordings.withTranscript) {
        return recordings.withTranscript
      }
      return {
        audioUrl,
        audioBlob,
        recordingTime,
        transcript,
        isRecorded
      }
    }
  }

  const handleSaveRecording = async () => {
    const currentData = getCurrentRecordingData()
    
    if (!currentData.audioBlob || !currentUser) {
      showToast('No recording to save', 'warning')
      return
    }
    
    setIsUploading(true)
    setShowSaveModal(false)
    setShowStopModal(false)

    const data = {
      userId: currentUser.uid,
      prompt: currentPrompt,
      transcript: (currentData && currentData.transcript) ? currentData.transcript : transcript || '',
      notes,
      duration: currentData.recordingTime,
      recorderType: activeRecorder === 0 ? 'audio_only' : 'with_transcript',
      createdAt: new Date().toISOString()
    }

    try {
      const localId = await indexedDBService.addRecording({
        ...data,
        audioBlob: currentData.audioBlob,
        status: 'pending'
      })

      // dispatch event so History can update immediately
      try {
        const localRecord = { id: localId, ...data, status: 'pending', audioBlob: currentData.audioBlob }
        window.dispatchEvent(new CustomEvent('recording-saved', { detail: localRecord }))
      } catch (e) {}

      const filename = `recordings/${currentUser.uid}/${Date.now()}_${activeRecorder === 0 ? 'left' : 'right'}.webm`
      const uploadedUrl = await storageService.uploadRecording(currentData.audioBlob, {
        userId: currentUser.uid,
        filename
      })

      await setDoc(
        doc(db, 'users', currentUser.uid, 'recordings', Date.now().toString()),
        { ...data, audioUrl: uploadedUrl }
      )

      await indexedDBService.updateRecording(localId, {
        status: 'synced',
        audioUrl: uploadedUrl
      })

      try {
        window.dispatchEvent(new CustomEvent('recording-updated', { detail: { id: localId, status: 'synced', audioUrl: uploadedUrl } }))
      } catch (e) {}

      showToast('✅ Recording saved successfully!', 'success')
      
      // Reset after saving
      resetRecording()
      if (activeRecorder === 1) resetTranscript()
      
      // Clear saved recording
      if (activeRecorder === 0) {
        setRecordings(prev => ({ ...prev, audioOnly: null }))
      } else {
        setRecordings(prev => ({ ...prev, withTranscript: null }))
      }
      
    } catch (err) {
      console.error('Save error:', err)
      showToast('❌ Save failed. Please try again.', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentData = getCurrentRecordingData()

  return (
    <div className="practice-container">
      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💾 Save Recording</h3>
            <p>Do you want to save this {activeRecorder === 0 ? 'audio recording' : 'recording with transcript'}?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveRecording}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Recording Modal */}
      {showStopModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⏹️ Recording Complete</h3>
            <p>Your {activeRecorder === 0 ? 'audio recording' : 'recording with transcript'} is ready!</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  resetRecording()
                  if (activeRecorder === 1) resetTranscript()
                  if (activeRecorder === 0) {
                    setRecordings(prev => ({ ...prev, audioOnly: null }))
                  } else {
                    setRecordings(prev => ({ ...prev, withTranscript: null }))
                  }
                  setShowStopModal(false)
                }}
              >
                🔁 Re-record
              </button>
              <button 
                className="btn btn-success" 
                onClick={() => {
                  setShowStopModal(false)
                  setShowSaveModal(true)
                }}
              >
                💾 Save
              </button>
              <button 
                className="btn btn-text" 
                onClick={() => setShowStopModal(false)}
              >
                Listen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Permission Warning */}
      {microphonePermission === 'denied' && (
        <div className="permission-warning">
          <div className="permission-icon">🎤</div>
          <div className="permission-text">
            <strong>Microphone access denied.</strong> Please allow microphone access in your browser settings to use the recorder.
          </div>
          <button 
            className="permission-btn"
            onClick={requestMicrophonePermission}
          >
            Try Again
          </button>
        </div>
      )}

      {microphonePermission === 'unsupported' && (
        <div className="permission-warning">
          <div className="permission-icon">⚠️</div>
          <div className="permission-text">
            <strong>Browser not supported.</strong> This browser doesn't support microphone access. Please use Chrome, Firefox, or Edge.
          </div>
        </div>
      )}

      <div className="card prompt-section">
        <div className="prompt-header">
          <h2>🎯 Speaking Topic</h2>
          <div className="prompt-actions">
            <button className="btn btn-outline" onClick={generateNewPrompt}>
              🔄 New Topic
            </button>
          </div>
        </div>
        <p className="prompt-text">{currentPrompt}</p>
      </div>

      {/* Recorder Navigation */}
      <div className="recorder-navigation">
        <button 
          className={`nav-btn ${activeRecorder === 0 ? 'active' : ''}`}
          onClick={prevRecorder}
          disabled={!isMediaDevicesSupported || microphonePermission === 'denied'}
        >
          <span className="nav-icon">🎤</span>
          <span className="nav-label">Audio Only</span>
          {recordings.audioOnly && (
            <span className="nav-badge">✓</span>
          )}
        </button>
        
        <div className="nav-arrows">
          <button 
            className="arrow-btn" 
            onClick={prevRecorder}
            disabled={activeRecorder === 0 || !isMediaDevicesSupported || microphonePermission === 'denied'}
          >
            ◀
          </button>
          <div className="nav-indicator">
            <div className={`indicator-dot ${activeRecorder === 0 ? 'active' : ''}`}></div>
            <div className={`indicator-dot ${activeRecorder === 1 ? 'active' : ''}`}></div>
          </div>
          <button 
            className="arrow-btn" 
            onClick={nextRecorder}
            disabled={activeRecorder === 1 || !isMediaDevicesSupported || microphonePermission === 'denied'}
          >
            ▶
          </button>
        </div>

        <button 
          className={`nav-btn ${activeRecorder === 1 ? 'active' : ''}`}
          onClick={nextRecorder}
          disabled={!isMediaDevicesSupported || microphonePermission === 'denied'}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-label">Audio + Transcript</span>
          {recordings.withTranscript && (
            <span className="nav-badge">✓</span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="practice-main">
        {/* Recorder Section */}
        <div className="recorder-section">
          <div className="recorder-card">
            <div className="recorder-header">
              <h3>
                {activeRecorder === 0 ? '🎤 Audio Recorder' : '📝 Speech with Transcript'}
              </h3>
              <div className="recorder-status">
                {isRecording ? (
                  <div className="recording-indicator">
                    <div className="pulse-dot"></div>
                    <span>RECORDING</span>
                  </div>
                ) : currentData.isRecorded ? (
                  <div className="recorded-indicator">
                    <div className="recorded-dot"></div>
                    <span>READY</span>
                  </div>
                ) : (
                  <div className="ready-indicator">
                    <div className="ready-dot"></div>
                    <span>READY</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Display */}
            <div className="timer-display">
              <div className="timer-circle">
                <div className="timer-text">
                  {formatTime(isRecording ? recordingTime : (currentData.recordingTime || 0))}
                </div>
                <div className="timer-label">Duration</div>
              </div>
            </div>

            {/* Record Controls */}
            <div className="record-controls">
              {!isMediaDevicesSupported ? (
                <div className="browser-warning">
                  <div className="warning-icon">⚠️</div>
                  <p>Your browser doesn't support audio recording. Please use Chrome, Firefox, or Edge.</p>
                </div>
              ) : microphonePermission === 'denied' ? (
                <div className="permission-blocked">
                  <div className="blocked-icon">🚫</div>
                  <p>Microphone access is blocked. Please allow microphone access in browser settings.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={requestMicrophonePermission}
                  >
                    Request Permission
                  </button>
                </div>
              ) : !isRecording ? (
                <button
                  className="record-btn start-btn"
                  onClick={handleStartRecording}
                  disabled={isUploading}
                >
                  <span className="btn-icon">🎤</span>
                  <span className="btn-text">
                    {currentData.isRecorded ? 'Record Again' : 'Start Recording'}
                  </span>
                </button>
              ) : (
                <button
                  className="record-btn stop-btn"
                  onClick={handleStopRecording}
                >
                  <span className="btn-icon">⏹️</span>
                  <span className="btn-text">Stop Recording</span>
                </button>
              )}

              {(currentData.isRecorded || currentData.audioUrl) && (
                <div className="playback-controls">
                  <audio 
                    src={currentData.audioUrl} 
                    controls 
                    className="audio-player" 
                    key={currentData.audioUrl}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="action-btn secondary"
                onClick={() => {
                  resetRecording()
                  if (activeRecorder === 1) resetTranscript()
                  if (activeRecorder === 0) {
                    setRecordings(prev => ({ ...prev, audioOnly: null }))
                  } else {
                    setRecordings(prev => ({ ...prev, withTranscript: null }))
                  }
                }}
                disabled={isRecording || isUploading || !isMediaDevicesSupported}
              >
                🔄 Clear
              </button>
              <button
                className="action-btn primary"
                onClick={() => setShowSaveModal(true)}
                disabled={!currentData.isRecorded || isRecording || isUploading || !isMediaDevicesSupported}
              >
                💾 Save Recording
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Section (Only for second recorder) */}
        {activeRecorder === 1 && (
          <div className="transcript-section">
            <div className="transcript-card">
              <div className="transcript-header">
                <h3>📝 Live Transcript</h3>
                <div className="transcript-status">
                  {isListening ? (
                    <div className="listening-indicator">
                      <div className="pulse-dot"></div>
                      <span>LISTENING</span>
                    </div>
                  ) : (
                    <div className="idle-indicator">
                      <div className="idle-dot"></div>
                      <span>IDLE</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`transcript-box ${isListening ? 'active' : ''}`}>
                {currentData.transcript || transcript || 'Start speaking to see live transcript...'}
                {isListening && !transcript && !currentData.transcript && (
                  <div className="listening-placeholder">
                    <div className="sound-wave">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                    </div>
                    <p>Listening for speech...</p>
                  </div>
                )}
              </div>

              <div className="transcript-stats">
                <div className="stat">
                  <span className="stat-label">Words</span>
                  <span className="stat-value">
                    {currentData.transcript 
                      ? currentData.transcript.split(' ').filter(w => w.length > 0).length 
                      : transcript 
                        ? transcript.split(' ').filter(w => w.length > 0).length 
                        : 0
                    }
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Characters</span>
                  <span className="stat-value">
                    {currentData.transcript 
                      ? currentData.transcript.length 
                      : transcript 
                        ? transcript.length 
                        : 0
                    }
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Mode</span>
                  <span className="stat-value">
                    {isRecording ? 'Recording' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="notes-section">
        <div className="notes-card">
          <h3>📝 Notes</h3>
          <textarea
            placeholder="Add your notes here (grammar corrections, pronunciation tips, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
          />
          <div className="notes-footer">
            <small>Optional: Add feedback or observations about your recording</small>
          </div>
        </div>
      </div>

      {/* Recording Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Audio Only:</span>
          <span className={`status-value ${recordings.audioOnly ? 'recorded' : 'pending'}`}>
            {recordings.audioOnly ? '✓ Recorded' : '⏳ Pending'}
          </span>
        </div>
        <div className="status-divider"></div>
        <div className="status-item">
          <span className="status-label">With Transcript:</span>
          <span className={`status-value ${recordings.withTranscript ? 'recorded' : 'pending'}`}>
            {recordings.withTranscript ? '✓ Recorded' : '⏳ Pending'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Practice