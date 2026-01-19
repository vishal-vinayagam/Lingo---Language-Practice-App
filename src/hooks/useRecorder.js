import { useRef, useState, useEffect } from "react"

export default function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [seconds, setSeconds] = useState(0)

  const mediaRef = useRef(null)
  const timerRef = useRef(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = new MediaRecorder(stream)
      mediaRef.current.stream = stream
    } catch (err) {
      console.error('Failed to access microphone', err)
      throw err
    }
    const chunks = []

    mediaRef.current.ondataavailable = e => chunks.push(e.data)
    mediaRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" })
      setAudioUrl(URL.createObjectURL(blob))
    }

    mediaRef.current.start()
    setRecording(true)

    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
  }

  const stop = () => {
    try {
      mediaRef.current?.stop()
    } catch (e) {}
    try {
      mediaRef.current?.stream?.getTracks().forEach(t => t.stop())
    } catch (e) {}
    clearInterval(timerRef.current)
    setRecording(false)
  }

  useEffect(() => {
    return () => {
      try { mediaRef.current?.stop() } catch (e) {}
      try { mediaRef.current?.stream?.getTracks().forEach(t => t.stop()) } catch (e) {}
      clearInterval(timerRef.current)
    }
  }, [])

  return { start, stop, recording, audioUrl, seconds }
}
