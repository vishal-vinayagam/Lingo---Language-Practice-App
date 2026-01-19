import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { ToastContext } from '../../context/ToastContext'
import Vocabulary from './Vocabulary'
import './Book.css'

function Book() {
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [showVocab, setShowVocab] = useState(false)

  const { currentUser } = useContext(AuthContext)
  const { showToast } = useContext(ToastContext)

  useEffect(() => {
    loadBookData()
  }, [])

  const loadBookData = async () => {
    setLoading(true)
    try {
      const sampleChapters = [
        {
          id: 1,
          title: 'How to Win Friends & Influence People',
          content: `Author: Dale Carnegie

Summary:
A classic guide to human relationships. Carnegie teaches practical techniques in handling people, ways to make people like you, and how to lead without causing offense. Key takeaways include showing genuine interest in others, remembering names, listening actively, praising honestly, and framing requests from the other person's perspective.

Practice:
Use one technique daily — e.g., ask open questions and listen without interrupting.`,
          duration: 20,
          level: 'Beginner'
        },
        {
          id: 2,
          title: 'Talk Like TED',
          content: `Author: Carmine Gallo

Summary:
Breaks down what makes TED speakers captivating. Focus on storytelling, emotional connection, and memorable delivery. Craft a single clear idea, use stories and visuals, and rehearse with authenticity and energy.

Practice:
Pick a 2-minute idea and practice telling it as a short story with a visual anchor.`,
          duration: 18,
          level: 'Beginner'
        },
        {
          id: 3,
          title: 'Crucial Conversations',
          content: `Authors: Kerry Patterson, Joseph Grenny, et al.

Summary:
Guide to high-stakes conversations. Create safety, state views persuasively, and achieve shared results. Techniques include mastering your stories, encouraging sharing, and finding mutual purpose.

Practice:
Apply the "Start with Heart" principle — focus on what you really want.`,
          duration: 25,
          level: 'Intermediate'
        },
        {
          id: 4,
          title: 'Never Split the Difference',
          content: `Author: Chris Voss

Summary:
Negotiation tactics for everyday communication — mirroring, labeling feelings, calibrated questions, and using silence. Listening and emotional intelligence guide outcomes.

Practice:
Use calibrated questions like "How can we solve this?" to promote collaboration.`,
          duration: 22,
          level: 'Intermediate'
        },
        {
          id: 5,
          title: 'The Charisma Myth',
          content: `Author: Olivia Fox Cabane

Summary:
Charisma as learnable behaviors — presence, warmth, power. Exercises for body language, mental states, and small talk to build a magnetic presence.

Practice:
Give full attention to the person speaking for an entire interaction.`,
          duration: 20,
          level: 'Advanced'
        }
      ]

      setChapters(sampleChapters)

      const saved = JSON.parse(localStorage.getItem('bookProgress')) || {}
      setProgress(saved)

      const firstNotCompleted = sampleChapters.find(c => !saved[c.id])
      setSelectedChapter(firstNotCompleted || sampleChapters[0])
    } catch (error) {
      console.error(error)
      showToast && showToast('Failed to load book content', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChapterSelect = (chapter) => setSelectedChapter(chapter)

  const handleToggleComplete = (chapterId) => {
    if (!currentUser) {
      const proceed = window.confirm('You are not logged in. Progress will be saved locally. Continue?')
      if (!proceed) return showToast && showToast('Login to save progress in cloud', 'warning')
    }

    const updated = { ...progress, [chapterId]: !progress[chapterId] }
    setProgress(updated)
    localStorage.setItem('bookProgress', JSON.stringify(updated))
    showToast && showToast(updated[chapterId] ? 'Chapter completed!' : 'Chapter marked incomplete', 'success')
  }

  const calculateProgress = () => {
    const completed = Object.values(progress).filter(Boolean).length
    return chapters.length ? Math.round((completed / chapters.length) * 100) : 0
  }

  return (
    <div className="book-container">
      <div className="book-header">
        <p className="book-subtitle">Communication exercises and lessons</p>

        <div className="vocab-btn-container">
          <button className="vocab-btn" onClick={() => setShowVocab(true)}>
            📘 Learn New Vocabulary
          </button>
        </div>

        {showVocab && (
          <div className="vocab-inline">
            <button className="close-vocab" onClick={() => setShowVocab(false)}>✕ Close Vocabulary</button>
            <Vocabulary />
          </div>
        )}

        <div className="book-progress">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
          <div className="progress-stats">
            {Object.values(progress).filter(Boolean).length} of {chapters.length} chapters completed
          </div>
        </div>
      </div>

      <div className="book-content">
        <div className="chapters-list">
          <h2 className="chapters-title">Recommended Books</h2>
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              className={`chapter-item ${selectedChapter?.id === chapter.id ? 'selected' : ''} ${progress[chapter.id] ? 'completed' : ''}`}
              onClick={() => handleChapterSelect(chapter)}
            >
              <div className="chapter-header">
                <div className="chapter-number">Book {chapter.id}</div>
                <div className="chapter-level">{chapter.level}</div>
              </div>
              <h3 className="chapter-title">{chapter.title}</h3>
              <div className="chapter-meta">
                <span className="chapter-duration">⏱️ {chapter.duration} min</span>
                <span className={`chapter-status ${progress[chapter.id] ? 'completed' : 'pending'}`}>
                  {progress[chapter.id] ? '✓ Completed' : '○ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedChapter && (
          <div className="chapter-content">
            <div className="chapter-content-header">
              <h2>{selectedChapter.title}</h2>
              <button
                className={`complete-btn ${progress[selectedChapter.id] ? 'completed' : ''}`}
                onClick={() => handleToggleComplete(selectedChapter.id)}
              >
                {progress[selectedChapter.id] ? '✓ Mark Incomplete' : '○ Mark Complete'}
              </button>
            </div>
            <div className="chapter-info">
              <span className="chapter-level-badge">{selectedChapter.level}</span>
              <span className="chapter-duration-badge">⏱️ {selectedChapter.duration} min read</span>
            </div>
            <div className="chapter-text">
              {selectedChapter.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="chapter-exercises">
              <h3>Practice Exercises</h3>
              <ul>
                <li>Read the chapter aloud twice</li>
                <li>Summarize the main points in your own words</li>
                <li>Practice the examples with a partner or recording</li>
                <li>Apply the concepts in your next conversation</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Book
