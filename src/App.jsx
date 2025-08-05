import React, { useEffect, useState, useRef } from "react";
import "./App.css";

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

function getUserSeededWord() {
  const today = new Date().toISOString().slice(0, 10);
  const uid = localStorage.getItem("uid") || Math.floor(Math.random() * 100000).toString();
  localStorage.setItem("uid", uid);
  const hash = parseInt(today.split("-").join("") + uid) % WORDS.length;
  return WORDS[hash].toLowerCase();
}

const MAX_ATTEMPTS = 6;

function loadLeaderboard() {
  try {
    const data = localStorage.getItem("nadle_leaderboard");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(scores) {
  localStorage.setItem("nadle_leaderboard", JSON.stringify(scores));
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
      if (!gameOver) setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

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
      } else if (key === "Enter") {
        if (currentGuess.length === answer.length) {
          submitGuess(currentGuess.toLowerCase());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameOver, nameSubmitted]);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  function submitGuess(guess) {
    if (guess.length !== answer.length) return;

    const isValidWord = WORDS.includes(guess);
    const statuses = Array(answer.length).fill("absent");
    const answerLetters = answer.split("");
    const guessLetters = guess.split("");
    const answerLetterUsed = Array(answer.length).fill(false);

    // Doğru pozisyon ve harfleri işaretle
    for (let i = 0; i < answer.length; i++) {
      if (guessLetters[i] === answerLetters[i]) {
        statuses[i] = "correct";
        answerLetterUsed[i] = true;
      }
    }

    // Doğru harf yanlış pozisyonu işaretle
    for (let i = 0; i < answer.length; i++) {
      if (statuses[i] === "correct") continue;
      const idx = answerLetters.findIndex(
        (l, j) => l === guessLetters[i] && !answerLetterUsed[j]
      );
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

      // Alt satıra geç
      setGuesses((prev) => [...prev, guess]);
      setLetterStatuses((prev) => [...prev, statuses]);
      setCurrentGuess("");

      if (guesses.length + 1 >= MAX_ATTEMPTS) {
        setGameOver(true);
        setMessage("Game Over! You are not nads.");
        saveScore();
      }
      return;
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
      saveScore();
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
      saveScore();
    }
  }

  function saveScore() {
    const currentScores = loadLeaderboard();
    const newScore = { name: playerName || "Anon", time, attempts: guesses.length + 1 };
    currentScores.push(newScore);
    currentScores.sort((a, b) => a.time - b.time || a.attempts - b.attempts);
    saveLeaderboard(currentScores.slice(0, 10));
    setLeaderboard(currentScores.slice(0, 10));
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

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
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
                  <button
                    key={k}
                    onClick={() => handleKeyClick(k)}
                    className={`key-btn ${getKeyStatus(k)}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <p className="message">{message}</p>

          {/* Sayfanın en alt ortasında kutu içinde X/DC: xurrydep */}
          <div className="footer-handle-box">X/DC: xurrydep</div>
        </>
      )}

      <audio ref={correctAudio} src="/sounds/congrats.wav" preload="auto" />
      <audio ref={presentAudio} src="/sounds/mf.wav" preload="auto" />
      <audio ref={absentAudio} src="/sounds/fart.wav" preload="auto" />
      <audio ref={hintAudio} src="/sounds/hint.wav" preload="auto" />
    </div>
  );
}
