import React, { useEffect, useState, useContext, useRef } from 'react';
import { ToastContext } from '../../context/ToastContext';
import './Vocabulary.css';

function Vocabulary() {
  const { showToast } = useContext(ToastContext);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const words = [
    { word: 'Articulate', meaning: 'Able to express ideas clearly and effectively.', example: 'She was able to articulate her thoughts during the interview.' },
    { word: 'Eloquent', meaning: 'Fluent and persuasive in speaking or writing.', example: 'His eloquent speech moved the audience.' },
    { word: 'Concise', meaning: 'Giving a lot of information clearly and in few words.', example: 'Keep your answers concise during meetings.' },
    { word: 'Artifice', meaning: 'Clever or cunning devices used to deceive.', example: 'He used artifice to avoid the direct question.' },
    { word: 'Empathy', meaning: 'The ability to understand and share the feelings of others.', example: 'Empathy helps build stronger relationships.' },
    { word: 'Assertive', meaning: 'Having or showing a confident and forceful personality.', example: 'Be assertive when asking for feedback.' },
    { word: 'Paraphrase', meaning: 'Express the meaning of something using different words.', example: 'Try to paraphrase what the speaker said to confirm understanding.' },
    { word: 'Proactive', meaning: 'Taking action in anticipation of future problems.', example: 'Be proactive and prepare talking points beforehand.' },
    { word: 'Conciliate', meaning: 'Stop someone from being angry; placate.', example: 'He tried to conciliate both parties after the argument.' },
    { word: 'Nuance', meaning: 'A subtle difference in meaning or tone.', example: 'Pay attention to nuance in tone when reading emails.' },
  ];

  useEffect(() => {
    const savedWords = JSON.parse(localStorage.getItem('savedVocab')) || [];
    setSaved(savedWords);
  }, []);

  const saveWord = (w) => {
    if (saved.find(s => s.word === w.word)) {
      showToast && showToast('Already saved', 'info');
      return;
    }
    const updated = [w, ...saved];
    setSaved(updated);
    localStorage.setItem('savedVocab', JSON.stringify(updated));
    showToast && showToast('Saved word', 'success');
  };

  const removeSaved = (w) => {
    const updated = saved.filter(s => s.word !== w.word);
    setSaved(updated);
    localStorage.setItem('savedVocab', JSON.stringify(updated));
  };

  const nextWord = () => setIndex((prev) => (prev + 1) % words.length);
  const prevWord = () => setIndex((prev) => (prev - 1 + words.length) % words.length);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast && showToast('Speech not supported', 'warning');
      return;
    }
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(uttr);
  };

  const onTouchStart = (e) => { touchStartRef.current = e.touches[0].clientY; };
  const onTouchMove = (e) => { touchEndRef.current = e.touches[0].clientY; };
  const onTouchEnd = () => {
    if (touchStartRef.current != null && touchEndRef.current != null) {
      const diff = touchStartRef.current - touchEndRef.current;
      if (diff > 100) nextWord();
      else if (diff < -100) prevWord();
    }
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const current = words[index];

  return (
    <div className="vocab-page">
      {/* Saved Panel */}
      <div className={`saved-panel ${panelOpen ? 'open' : ''}`}>
        <div className="saved-header">
          <button className="close-saved" onClick={() => setPanelOpen(false)} aria-label="Close saved words">✕</button>
          <h3>Saved Words</h3>
        </div>
        <div className="saved-list">
          {saved.length === 0 && <div className="empty">No saved words yet</div>}
          {saved.map((s, i) => (
            <div className="saved-item" key={i}>
              <div className="saved-left">
                <div className="saved-word">{s.word}</div>
                <div className="saved-meaning">{s.meaning}</div>
              </div>
              <div className="saved-actions">
                <button onClick={() => speak(s.word)} aria-label="speak">🔊</button>
                <button onClick={() => removeSaved(s)} aria-label="remove">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocab Card */}
      <div
        className="vocab-card"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="vocab-top">
          <button className="prev-btn" onClick={prevWord}>‹</button>
          <div className="vocab-title">Word</div>
          <button className="next-btn" onClick={nextWord}>›</button>
                    <button className="open-saved-btn" onClick={() => setPanelOpen(true)} aria-label="Open saved words">📑</button>
        </div>

        <div className="vocab-body">
          <div className="word-row">
            <h1 className="v-word">{current.word}</h1>
            <button className="speak-btn" onClick={() => speak(current.word)}>🔊</button>
          </div>
          <p className="v-meaning"><strong>Meaning:</strong> {current.meaning}</p>
          <p className="v-example"><strong>Example:</strong> {current.example}</p>
        </div>

        <div className="vocab-actions">
          <button className="save-btn" onClick={() => saveWord(current)}>💾 Save</button>
          <button className="next-word-btn" onClick={nextWord}>Next Word</button>
        </div>
      </div>
    </div>
  );
}

export default Vocabulary;
