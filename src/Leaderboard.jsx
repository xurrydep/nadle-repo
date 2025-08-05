import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const { data, error } = await supabase
        .from("leaderboard")  // Tablo adınız
        .select("*")
        .order("time", { ascending: true })
        .limit(10);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
      } else {
        setLeaderboard(data);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard" aria-label="Leaderboard">
      <h3>Leaderboard</h3>
      {loading ? (
        <p>Loading...</p>
      ) : leaderboard.length > 0 ? (
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

// Zamanı mm:ss formatına çeviren yardımcı fonksiyon
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
