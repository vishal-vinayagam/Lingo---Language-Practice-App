import { useState, useRef, useEffect } from 'react'

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export default function useSpeechToText() {
  const SpeechRecognition = getSpeechRecognition()
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try {
        recognitionRef.current?.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
  }, [])

  const startListening = () => {
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser')
      return
    }

    // Don't start again if already listening
    if (recognitionRef.current && isListening) return

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onresult = e => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i]
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript + ' '
          } else {
            interim += result[0].transcript
          }
        }
        setTranscript((finalTranscriptRef.current + ' ' + interim).trim())
      }

      recognition.onend = () => {
        setIsListening(false)
        recognitionRef.current = null
      }

      recognition.onerror = (err) => {
        console.error('Speech recognition error', err)
        setIsListening(false)
        recognitionRef.current = null
      }

      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch (err) {
      console.error('Failed to start speech recognition', err)
      alert('Unable to access speech recognition')
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch (e) {
      console.warn('Error stopping recognition', e)
    }
    recognitionRef.current = null
    setIsListening(false)
  }

  const resetTranscript = () => {
    finalTranscriptRef.current = ''
    setTranscript('')
  }

  return { transcript, isListening, startListening, stopListening, resetTranscript }
}
