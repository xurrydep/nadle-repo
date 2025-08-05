import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import Leaderboard from "./components/Leaderboard";
import { supabase } from "./lib/supabaseClient";

const WORDS = [
  "mon", "nadog", "nads", "quant", "what", "keone", "john", "karma", "chog",
  "moyaki", "molandak", "chogstar", "monadverse", "apriori", "bebop", "curvance",
  "dusted", "fastlane", "kintsu", "kizzy", "kuru", "magma", "rarebet", "talentum",
  "chewy", "llamao", "meowwnads", "nomads", "gmonad", "gnad", "turknads", "oldsex",
  "overnads", "mondana", "skrumpeys", "slmnd", "spiky", "wonad", "thedaks", "lemouch",
  "blocknads", "drake", "cult", "stagefun", "billmonday", "mongaming", "monartists",
  "yaps", "fullaccess", "commentmob", "roarr", "starlist", "mechabox", "blench",
  "realnads", "genesispass", "farmer", "goodmonad"
];

const MAX_ATTEMPTS = 6;

function getUserSeededWord() {
  const today = new Date().toISOString().slice(0, 10);
  const uid = localStorage.getItem("uid") || Math.floor(Math.random() * 100000).toString();
  localStorage.setItem("uid", uid);
  const hash = parseInt(today.split("-").join("") + uid) % WORDS.length;
  return WORDS[hash].toLowerCase();
}

// Zamanı mm:ss formatına çeviren yardımcı fonksiyon
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function App() {
  const [answer, setAnswer] = useState(getUserSeededWord());
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(0);
  const [invalidLetters, setInvalidLetters] = useState(new Set());
  const [letterStatuses, setLetterStatuses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const correctAudio = useRef(null);
  const presentAudio = useRef(null);
  const absentAudio = useRef(null);
  const hintAudio = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameOver && nameSubmitted) setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, nameSubmitted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || !nameSubmitted) return;
      const key = e.key;
      if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(key)) {
        if (currentGuess.length < answer.length) {
          setCurrentGuess((prev) => prev + key.toLowerCase());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameOver, nameSubmitted, answer.length]);

  useEffect(() => {
    if (currentGuess.length === answer.length && !gameOver && nameSubmitted) {
      submitGuess(currentGuess.toLowerCase());
    }
  }, [currentGuess, gameOver, nameSubmitted]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("time", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    } else {
      setLeaderboard(data);
    }
  }

  async function saveScore(name, time, attempts) {
    const { error } = await supabase.from("leaderboard").insert([{ name, time, attempts }]);
    if (error) {
      console.error("Error saving score:", error);
      return false;
    }
    return true;
  }

  async function submitGuess(guess) {
    if (guess.length !== answer.length) return;

    const isValidWord = WORDS.includes(guess);
    const statuses = Array(answer.length).fill("absent");
    const answerLetters = answer.split("");
    const guessLetters = guess.split("");
    const answerLetterUsed = Array(answer.length).fill(false);

    for (let i = 0; i < answer.length; i++) {
      if (guessLetters[i] === answerLetters[i]) {
        statuses[i] = "correct";
        answerLetterUsed[i] = true;
      }
    }

    for (let i = 0; i < answer.length; i++) {
      if (statuses[i] === "correct") continue;
      const idx = answerLetters.findIndex((l, j) => l === guessLetters[i] && !answerLetterUsed[j]);
      if (idx !== -1) {
        statuses[i] = "present";
        answerLetterUsed[idx] = true;
      }
    }

    if (!isValidWord) {
      const invalids = guessLetters.filter((ch) => !answerLetters.includes(ch));
      setInvalidLetters((prev) => {
        const newSet = new Set(prev);
        invalids.forEach((ch) => newSet.add(ch));
        return newSet;
      });
      setMessage("⚠️ Invalid word!");
    } else {
      setMessage("");
    }

    correctAudio.current?.pause();
    presentAudio.current?.pause();
    absentAudio.current?.pause();

    if (guess === answer) {
      correctAudio.current?.play();
      setMessage("🎉 Congratulations, you are nads.");
      setGameOver(true);
      document.body.classList.add("celebrate");

      // Skoru kaydet
      await saveScore(playerName || "Anon", time, guesses.length + 1);
      await fetchLeaderboard();

    } else if (statuses.includes("present")) {
      presentAudio.current?.play();
    } else {
      absentAudio.current?.play();
    }

    setGuesses((prev) => [...prev, guess]);
    setLetterStatuses((prev) => [...prev, statuses]);
    setCurrentGuess("");

    if (guess !== answer && guesses.length + 1 >= MAX_ATTEMPTS) {
      setGameOver(true);
      setMessage("Game Over! You are not nads.");

      // Skoru kaydet (game over)
      await saveScore(playerName || "Anon", time, guesses.length + 1);
      await fetchLeaderboard();
    }
  }

  const keyboard = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["⌫", ..."ZXCVBNM".split("")]
  ];

  function handleKeyClick(key) {
    if (gameOver || !nameSubmitted) return;
    if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key)) {
      if (currentGuess.length < answer.length) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
      }
    }
  }

  function getKeyStatus(key) {
    const lowerKey = key.toLowerCase();
    for (const statuses of letterStatuses) {
      for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] === "correct" && guesses[letterStatuses.indexOf(statuses)][i] === lowerKey) return "correct";
      }
    }
    for (const statuses of letterStatuses) {
      for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] === "present" && guesses[letterStatuses.indexOf(statuses)][i] === lowerKey) return "present";
      }
    }
    if (invalidLetters.has(lowerKey)) return "invalid";
    return "";
  }

  function useHint() {
    if (hintUsed) return;
    hintAudio.current?.play();
    const firstLetter = answer[0].toUpperCase();
    setMessage(`Hint: The first letter is "${firstLetter}".`);

    setCurrentGuess((prev) => {
      if (prev.toLowerCase().includes(answer[0])) return prev;
      if (prev.length === 0) return answer[0];
      if (prev.length < answer.length) return prev + answer[0];
      return prev;
    });

    setHintUsed(true);
  }

  return (
    <div className="game-container">
      <h1>NADLE</h1>

      {!nameSubmitted ? (
        <div className="name-input-container">
          <input
            className="name-input"
            placeholder="X (formerly Twitter) handle"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            aria-label="X (formerly Twitter) handle"
          />
          <button
            className="start-button"
            onClick={() => setNameSubmitted(true)}
            disabled={!playerName.trim()}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="timer">{formatTime(time)}</div>

          <div className="grid">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => (
              <div key={rowIdx} className="row">
                {Array.from({ length: answer.length }).map((_, colIdx) => {
                  const letter =
                    guesses[rowIdx]?.[colIdx] || (rowIdx === guesses.length ? currentGuess[colIdx] || "" : "");
                  const status = letterStatuses[rowIdx]?.[colIdx] || "";
                  return (
                    <div key={colIdx} className={`cell ${status}`}>
                      {letter?.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <button
            className="hint-button"
            onClick={useHint}
            disabled={hintUsed || gameOver}
            title={hintUsed ? "Hint already used" : "Get a hint (one time only)"}
          >
            Get a Hint
          </button>

          <div className="keyboard">
            {keyboard.map((row, i) => (
              <div key={i} className="key-row">
                {row.map((k) => (
                  <button key={k} onClick={() => handleKeyClick(k)} className={`key-btn ${getKeyStatus(k)}`}>
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <p className="message">{message}</p>

          {gameOver && <div className="confetti" />}

          <Leaderboard leaderboard={leaderboard} />
        </>
      )}

      <div className="footer-handle-box">X/DC: xurrydep</div>

      <audio ref={correctAudio} src="/sounds/congrats.wav" preload="auto" />
      <audio ref={presentAudio} src="/sounds/mf.wav" preload="auto" />
      <audio ref={absentAudio} src="/sounds/fart.wav" preload="auto" />
      <audio ref={hintAudio} src="/sounds/hint.wav" preload="auto" />
    </div>
  );
}
