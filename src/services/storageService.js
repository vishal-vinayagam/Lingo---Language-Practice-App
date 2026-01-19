// Generic cloud storage service wrapper
// Expects an environment variable `VITE_UPLOAD_URL` (e.g. https://api.example.com/upload)
// The upload endpoint should accept a multipart/form-data POST with fields:
// - file: the binary blob
// - userId: id of the user
// - filename: desired filename
// Should return JSON { url: 'https://...' } on success.

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '/api/upload'

async function uploadRecording(blob, { userId, filename }) {
  const form = new FormData()
  form.append('file', blob, filename)
  if (userId) form.append('userId', userId)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: form,
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`)
    }

    const json = await res.json()
    if (!json || !json.url) throw new Error('Upload response missing url')
    return json.url
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

export default { uploadRecording }
