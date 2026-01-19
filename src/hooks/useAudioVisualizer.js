import { useEffect, useState } from 'react'

export default function useAudioVisualizer(active) {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) return

    let audioCtx, analyser, source, data

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioCtx = new AudioContext()
      analyser = audioCtx.createAnalyser()
      source = audioCtx.createMediaStreamSource(stream)
      analyser.fftSize = 256
      data = new Uint8Array(analyser.frequencyBinCount)

      source.connect(analyser)

      const animate = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b) / data.length
        setLevel(avg)
        requestAnimationFrame(animate)
      }
      animate()
    })

    return () => audioCtx?.close()
  }, [active])

  return level
}
