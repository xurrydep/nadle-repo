// Leaderboard.jsx
import React from "react";

export default function Leaderboard({ leaderboard }) {
  return (
    <div className="leaderboard" aria-label="Leaderboard">
      <h3>Leaderboard</h3>
      {leaderboard.length > 0 ? (
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>
              <strong>{entry.name}</strong> — {formatTime(entry.time)} — {entry.attempts} tries
            </li>
          ))}
        </ul>
      ) : (
        <p>No scores yet</p>
      )}
    </div>
  );
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
