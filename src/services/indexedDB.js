// src/services/indexedDB.js

const DB_NAME = "LingoDB"
const DB_VERSION = 1

// Store names
const STORES = {
  RECORDINGS: 'recordings'
}

class IndexedDBService {
  constructor () {
    this.db = null
    this.initPromise = this.init()
  }

  init () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error)
        reject(event.target.error)
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        if (!db.objectStoreNames.contains(STORES.RECORDINGS)) {
          const recordingsStore = db.createObjectStore(STORES.RECORDINGS, { keyPath: 'id', autoIncrement: true })
          recordingsStore.createIndex('userId', 'userId', { unique: false })
          recordingsStore.createIndex('status', 'status', { unique: false })
          recordingsStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  async ready () {
    await this.initPromise
    return this
  }

  async addRecording (recording) {
    await this.ready()
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORES.RECORDINGS], 'readwrite')
      const store = tx.objectStore(STORES.RECORDINGS)
      const req = store.add({ ...recording, createdAt: recording.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async getRecordings (userId) {
    await this.ready()
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORES.RECORDINGS], 'readonly')
      const store = tx.objectStore(STORES.RECORDINGS)
      const index = store.index('userId')
      const range = IDBKeyRange.only(userId)
      const req = index.getAll(range)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async getPendingRecordings (userId) {
    await this.ready()
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORES.RECORDINGS], 'readonly')
      const store = tx.objectStore(STORES.RECORDINGS)
      const index = store.index('userId')
      const range = IDBKeyRange.only(userId)
      const req = index.getAll(range)
      req.onsuccess = (event) => {
        const all = event.target.result || []
        const pending = all.filter(r => r.status === 'pending')
        resolve(pending)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async updateRecording (id, updates) {
    await this.ready()
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORES.RECORDINGS], 'readwrite')
      const store = tx.objectStore(STORES.RECORDINGS)
      const getReq = store.get(id)
      getReq.onsuccess = () => {
        const rec = getReq.result
        if (!rec) return reject(new Error('Not found'))
        const updated = { ...rec, ...updates, updatedAt: new Date().toISOString() }
        const putReq = store.put(updated)
        putReq.onsuccess = () => resolve(updated)
        putReq.onerror = () => reject(putReq.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  }

  async deleteRecording (id) {
    await this.ready()
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORES.RECORDINGS], 'readwrite')
      const store = tx.objectStore(STORES.RECORDINGS)
      const req = store.delete(id)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  }
}

const indexedDBService = new IndexedDBService()

export default indexedDBService
