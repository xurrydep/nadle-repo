import React from "react";
import "./Leaderboard.css";

export default function Leaderboard({ leaderboard, show = true }) {
  if (!show || !leaderboard.length) {
    return null;
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <ol className="leaderboard-list">
        {leaderboard.slice(0, 10).map(({ name, time, attempts }, idx) => (
          <li key={idx}>
            <span className="rank">{idx + 1}.</span>{" "}
            <span className="name">{name}</span>{" "}
            <span className="details">
              — {formatTime(time)} — {attempts} tries
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}
