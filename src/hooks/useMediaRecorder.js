// Updated useMediaRecorder.js
import { useState, useRef, useCallback } from 'react'

const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isRecorded, setIsRecorded] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  // Check if browser supports media recording
  const isSupported = () => {
    if (typeof window === 'undefined') return false
    return !!(navigator.mediaDevices && window.MediaRecorder)
  }

  const startRecording = useCallback(async () => {
    if (!isSupported()) {
      setError('Media recording not supported in this browser')
      throw new Error('Media recording not supported')
    }

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        video: false
      })
      
      streamRef.current = stream
      
      // Create media recorder with options that work across browsers
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      // Fallback for browsers that don't support webm
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4'
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      chunksRef.current = []
      
      // Setup event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current.mimeType || 'audio/webm'
        })
        const url = URL.createObjectURL(blob)
        
        setAudioBlob(blob)
        setAudioUrl(url)
        setIsRecorded(true)
        setError(null)
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
          streamRef.current = null
        }
      }
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setError(event.error?.message || 'Recording error')
        stopRecording()
      }
      
      // Start recording
      mediaRecorderRef.current.start(100) // Collect data every 100ms
      setIsRecording(true)
      setError(null)
      
      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setError(error.message || 'Failed to start recording')
      throw error
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const resetRecording = useCallback(() => {
    // Stop recording if active
    if (isRecording) {
      stopRecording()
    }
    
    // Cleanup
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      streamRef.current = null
    }
    
    // Clear media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null
    }
    
    // Reset state
    setIsRecording(false)
    setIsRecorded(false)
    setRecordingTime(0)
    setError(null)
    
    // Revoke old URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioUrl('')
    setAudioBlob(null)
    chunksRef.current = []
  }, [isRecording, stopRecording, audioUrl])

  return {
    isRecording,
    isRecorded,
    recordingTime,
    audioUrl,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported: isSupported()
  }
}

export default useMediaRecorder