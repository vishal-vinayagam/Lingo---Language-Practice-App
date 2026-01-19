import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContext } from '../../context/ToastContext'
import { quotes } from '../../utils/quotes'
import { prompts } from '../../utils/topics'
import Modal from '../Common/Modal'
import './Home.css'

function Home() {
  const [quote, setQuote] = useState(null)
  const [sentence, setSentence] = useState(null)
  const [story, setStory] = useState(null)
  const [showRandomModal, setShowRandomModal] = useState(false)
  const [randomQuote, setRandomQuote] = useState(null)
  const [youtubeVideos] = useState([
    { id: 1, title: 'Daily English Practice', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
    { id: 2, title: 'Pronunciation Guide', videoId: '9bZkp7q19f0', thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg' },
    { id: 3, title: 'Conversation Skills', videoId: 'CevxZvSJLk8', thumbnail: 'https://img.youtube.com/vi/CevxZvSJLk8/maxresdefault.jpg' }
  ])
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)

  const { showToast } = useContext(ToastContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Load daily content
    const today = new Date().toDateString()
    const dailyIndex = Math.abs(hashCode(today)) % quotes.length
    
    setQuote(quotes[dailyIndex])
    setSentence({
      text: prompts[Math.abs(hashCode(today + 'sentence')) % prompts.length],
      meaning: "Practice this sentence to improve your pronunciation and confidence."
    })
    setStory({
      title: "The Journey of Learning",
      content: "Every language learner starts with a single word. Today, that word is 'progress'. Each step, no matter how small, brings you closer to fluency."
    })
  }, [])

  const hashCode = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  const handlePracticeNow = () => {
    navigate('/practice')
  }

  const handleRandomSurprise = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setRandomQuote(quotes[randomIndex])
    setShowRandomModal(true)
  }

  const handleVideoClick = (video) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
  }

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Welcome Back!</h1>
        <p className="home-date">{formatDate()}</p>
      </div>

      {/* Quote of the Day */}
      <div className="card daily-quote">
        <div className="quote-icon">💭</div>
        <h2 className="section-title">Quote of the Day</h2>
        {quote && (
          <>
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </>
        )}
      </div>

      {/* Sentence of the Day */}
      <div className="card daily-sentence">
        <div className="sentence-icon">🗣️</div>
        <h2 className="section-title">Sentence to Practice</h2>
        {sentence && (
          <>
            <p className="sentence-text">{sentence.text}</p>
            <div className="sentence-meaning">
              <strong>Meaning:</strong> {sentence.meaning}
            </div>
          </>
        )}
      </div>

      {/* Micro-story */}
      <div className="card daily-story">
        <div className="story-icon">📖</div>
        <h2 className="section-title">Today's Story</h2>
        {story && (
          <>
            <h3 className="story-title">{story.title}</h3>
            <p className="story-content">{story.content}</p>
          </>
        )}
      </div>

      {/* Practice Now CTA */}
      <div className="practice-cta-container">
        <button 
          className="btn btn-primary practice-cta"
          onClick={handlePracticeNow}
        >
          🎤 Practice Now
        </button>
      </div>

      {/* YouTube Videos */}
      <div className="videos-section">
        <h2 className="section-title">Practice Videos</h2>
        <div className="videos-grid">
          {youtubeVideos.map(video => (
            <div 
              key={video.id} 
              className="video-card"
              onClick={() => handleVideoClick(video)}
            >
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-play-overlay">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <h3 className="video-title">{video.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Random Surprise Button */}
      <button 
        className="random-surprise-btn"
        onClick={handleRandomSurprise}
        aria-label="Random surprise"
      >
        <span className="surprise-icon">🎁</span>
      </button>

      {/* Random Quote Modal */}
      {showRandomModal && randomQuote && (
        <Modal
          isOpen={showRandomModal}
          onClose={() => setShowRandomModal(false)}
          title="Random Inspiration"
        >
          <div className="random-quote-modal">
            <p className="random-quote-text">"{randomQuote.text}"</p>
            <p className="random-quote-author">— {randomQuote.author}</p>
          </div>
        </Modal>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <Modal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          title={selectedVideo.title}
          size="large"
        >
          <div className="video-modal">
            <div className="video-wrapper">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Home