import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import indexedDBService from '../../services/indexedDB';

import './History.css';
import logo from '../../assets/logo.png';

function History() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const navigate = useNavigate();

  const audioRefs = useRef({});
 
  const objectUrlMap = useRef({});

  const { currentUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    // load local recordings for current user (or 'local')
    fetchRecordings();

    const onSaved = (e) => {
      const r = e.detail
      setRecordings(prev => [r, ...prev])
    }

    const onUpdated = (e) => {
      const { id, ...updates } = e.detail
      setRecordings(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)))
    }

    window.addEventListener('recording-saved', onSaved)
    window.addEventListener('recording-updated', onUpdated)

    // revoke any created object URLs when component unmounts
    return () => {
      window.removeEventListener('recording-saved', onSaved)
      window.removeEventListener('recording-updated', onUpdated)
      Object.values(objectUrlMap.current).forEach(url => {
        try { URL.revokeObjectURL(url) } catch (e) {}
      });
      objectUrlMap.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // fetch from IndexedDB (local storage) for free persistent history
  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const userId = currentUser ? currentUser.uid : 'local'
      const local = await indexedDBService.getRecordings(userId)
      const list = Array.isArray(local) ? local.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
      setRecordings(list)
    } catch (err) {
      console.error('IndexedDB read failed:', err)
      showToast('Failed to load recordings', 'error')
      setRecordings([])
    } finally {
      setLoading(false)
    }
  };

  const makeObjectUrl = (recording) => {
    // if an object URL already exists for this id, return it
    if (objectUrlMap.current[recording.id]) {
      return objectUrlMap.current[recording.id];
    }

    // prefer already stored audioUrl if present (string), else create from audioBlob
    if (recording.audioUrl && typeof recording.audioUrl === 'string') {
      objectUrlMap.current[recording.id] = recording.audioUrl;
      return recording.audioUrl;
    }

    if (recording.audioBlob) {
      try {
        const url = URL.createObjectURL(recording.audioBlob);
        objectUrlMap.current[recording.id] = url;
        return url;
      } catch (e) {
        console.error('Failed to create object URL:', e);
        return null;
      }
    }

    return null;
  };

  const handlePlay = (id) => {
    // if already playing this id -> pause
    if (playingId === id) {
      const refEl = audioRefs.current[id];
      if (refEl) {
        refEl.pause();
      }
      setPlayingId(null);
      return;
    }

    // pause any other audio
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause();
    }

    // ensure audio element exists and has src
    const refEl = audioRefs.current[id];
    if (!refEl) {
      // try to create src from blob
      const rec = recordings.find(r => r.id === id);
      if (rec) {
        const url = makeObjectUrl(rec);
        if (url) {
          // create a temporary audio element and play
          const tempAudio = new Audio(url);
          audioRefs.current[id] = tempAudio;
          tempAudio.onended = () => setPlayingId(null);
          tempAudio.play();
          setPlayingId(id);
          return;
        }
      }
      showToast('Audio not available', 'error');
      return;
    }

    // if audio is paused -> play, else pause
    if (refEl.paused) {
      // ensure src is set
      if (!refEl.src) {
        const rec = recordings.find(r => r.id === id);
        if (rec) {
          const url = makeObjectUrl(rec);
          if (url) refEl.src = url;
        }
      }
      refEl.play();
      refEl.onended = () => setPlayingId(null);
      setPlayingId(id);
    } else {
      refEl.pause();
      setPlayingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) return;

    try {
      await indexedDBService.deleteRecording(id);

      // revoke object URL if present
      const url = objectUrlMap.current[id];
      if (url) {
        try { URL.revokeObjectURL(url); } catch (e) {}
        delete objectUrlMap.current[id];
      }

      // stop audio if playing
      if (playingId === id && audioRefs.current[id]) {
        try { audioRefs.current[id].pause(); } catch (e) {}
        setPlayingId(null);
      }

      setRecordings(prev => prev.filter(rec => rec.id !== id));
      showToast('Recording deleted', 'success');
    } catch (error) {
      console.error('Error deleting recording:', error);
      showToast('Failed to delete recording', 'error');
    }
  };

  const formatDateComponents = (isoOrDate) => {
    const d = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return { day: '', dateStr: '', timeStr: '' };

    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d); // Mon, Tue...
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); // Dec 11, 2025
    // remove comma to match "Dec 11 2025"
    const dateStrNoComma = dateStr.replace(/,/g, '');
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); // 08:43 PM

    return { day, dateStr: dateStrNoComma, timeStr };
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1>History</h1>
          <p>Your recorded practice sessions</p>
        </div>
        <div className="loading-spinner">
          <img src={logo} alt="Lingo" className="suspense-logo" />
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        
        <p className="history-subtitle">Your recorded practice sessions</p>
      </div>

      {recordings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎤</div>
          <h3>No Recordings Yet</h3>
          <p>Start practicing to see your history here!</p>
          <button className="btn btn-primary" onClick={() => navigate('/practice')}>Start Practicing</button>
        </div>
      ) : (
        <div className="recordings-list">
          {recordings.map((recording) => {
            // recording.createdAt could be ISO string or timestamp; handle both
            const created = recording.createdAt || recording.createdAtMs || recording.date || new Date().toISOString();
            const { day, dateStr, timeStr } = formatDateComponents(created);
            const audioSrc = makeObjectUrl(recording);

            return (
              <div key={recording.id} className="recording-card">
                {/* Hidden audio element - we'll control play/pause via JS */}
                <audio
                  ref={(el) => {
                    if (!el && audioRefs.current[recording.id] && audioRefs.current[recording.id] instanceof Audio) {
                      // nothing to do - it's a programmatic Audio
                      return;
                    }
                    audioRefs.current[recording.id] = el;
                    if (el && !el.src && audioSrc) el.src = audioSrc;
                  }}
                  src={audioSrc || undefined}
                  preload="none"
                />

                <div className="recording-info">
                  <div className="recording-date">
                    <span className="day">{day}</span>
                    <span className="date">{dateStr}</span>
                    <span className="time">{timeStr}</span>
                  </div>

                  <h3 className="recording-prompt">{recording.prompt || '—'}</h3>

                  {recording.notes ? (
                    <p className="recording-notes">{recording.notes}</p>
                  ) : null}

                  {recording.transcript ? (
                    <p className="recording-transcript" title={recording.transcript}>
                      {recording.transcript.length > 200 ? recording.transcript.slice(0, 200) + '…' : recording.transcript}
                    </p>
                  ) : null}

                  <div className="recording-meta">
                    <span className="duration">⏱️ {formatDuration(recording.duration || 0)}</span>
                    {recording.status && <span className="status"> • {recording.status}</span>}
                  </div>
                </div>

                <div className="recording-actions">
                  <button
                    className={`play-btn ${playingId === recording.id ? 'playing' : ''}`}
                    onClick={() => handlePlay(recording.id)}
                    aria-label={playingId === recording.id ? 'Pause' : 'Play'}
                  >
                    {playingId === recording.id ? '⏸️' : '▶️'}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(recording.id)}
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
