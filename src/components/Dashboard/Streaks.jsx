import React, { useEffect, useState } from "react";
import "./Streaks.css";

function Streaks() {
  const [completedDays, setCompletedDays] = useState({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Get today's date key
  const getDateKey = (date) => date.toISOString().split("T")[0];

  // Check streak when component loads
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("streakData"));
    if (savedData) {
      setCompletedDays(savedData.completedDays || {});
      setStreak(savedData.streak || 0);
      setBestStreak(savedData.bestStreak || 0);
    }

    markTodayComplete(); // automatically mark today every login
  }, []);

  // Save all data in localStorage
  const saveStreakData = (updatedDays, updatedStreak, updatedBest) => {
    localStorage.setItem(
      "streakData",
      JSON.stringify({
        completedDays: updatedDays,
        streak: updatedStreak,
        bestStreak: updatedBest,
      })
    );
  };

  // Mark today as completed automatically
  const markTodayComplete = () => {
    const today = new Date();
    const todayKey = getDateKey(today);

    if (completedDays[todayKey]) return; // already recorded today

    const updatedDays = { ...completedDays, [todayKey]: true };

    // Calculate streak
    let newStreak = 1;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    if (completedDays[yesterdayKey]) {
      newStreak = streak + 1;
    }

    const newBest = Math.max(bestStreak, newStreak);

    setCompletedDays(updatedDays);
    setStreak(newStreak);
    setBestStreak(newBest);

    saveStreakData(updatedDays, newStreak, newBest);
  };

  // Build current month calendar
  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateKey = getDateKey(new Date(year, month, d));
      days.push({
        day: d,
        completed: completedDays[dateKey] || false,
      });
    }
    return days;
  };

  return (
    <div className="streak-page">
      <h2 className="streak-title">🔥 Daily Streak</h2>

      <div className="streak-stats">
        <div className="stat-box">
          <h3>{streak}</h3>
          <p>Current Streak</p>
        </div>
        <div className="stat-box">
          <h3>{bestStreak}</h3>
          <p>Best Streak</p>
        </div>
      </div>

      <div className="calendar">
        {generateCalendar().map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${day.completed ? "completed" : ""}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Streaks;
