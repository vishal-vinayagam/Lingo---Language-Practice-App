import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'

const app = express()
const PORT = process.env.UPLOAD_PORT || 3001

// ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

app.use(cors({ origin: true }))
app.use('/uploads', express.static(uploadsDir))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const name = `${Date.now()}-${safe}`
    cb(null, name)
  }
})

const upload = multer({ storage })

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const protocol = req.protocol
  const host = req.get('host')
  const url = `${protocol}://${host}/uploads/${req.file.filename}`
  return res.json({ url })
})

app.get('/', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Upload server listening on http://localhost:${PORT}`))
