import React, { useState } from "react";
import { WORDS } from "../data/words";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function Game() {
  const [guesses, setGuesses] = useState([]);       // Tahminler dizisi
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const answer = WORDS[0].toLowerCase();

  // Harf renklerini döndürür
  function getLetterStatus(letter, index) {
    if (answer[index] === letter) return "correct";      // Doğru yer (yeşil)
    else if (answer.includes(letter)) return "present";  // Kelimede var (sarı)
    else return "absent";                                 // Yok (gri)
  }

  function handleChange(e) {
    const val = e.target.value;
    if (val.length <= WORD_LENGTH && /^[a-zA-Z]*$/.test(val)) {
      setCurrentGuess(val.toLowerCase());
      setMessage("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage(`Lütfen ${WORD_LENGTH} harfli bir kelime girin.`);
      return;
    }

    // Burada kelime kontrolü yapılabilir (opsiyonel)

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === answer) {
      setMessage("Tebrikler! Doğru bildiniz.");
      setIsGameOver(true);
    } else if (newGuesses.length === MAX_GUESSES) {
      setMessage(`Oyun bitti. Doğru kelime: ${answer.toUpperCase()}`);
      setIsGameOver(true);
    }
  }

  return (
    <div>
      <div>
        {guesses.map((guess, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            {[...guess].map((letter, idx) => {
              const status = getLetterStatus(letter, idx);
              const color =
                status === "correct" ? "#6aaa64" :
                status === "present" ? "#c9b458" :
                "#787c7e";

              return (
                <div
                  key={idx}
                  style={{
                    width: 40,
                    height: 40,
                    margin: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "white",
                    backgroundColor: color,
                    borderRadius: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!isGameOver && (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <input
            type="text"
            value={currentGuess}
            onChange={handleChange}
            maxLength={WORD_LENGTH}
            style={{ fontSize: 24, textTransform: "uppercase", padding: 8, width: 220, textAlign: "center" }}
            disabled={isGameOver}
            autoFocus
          />
          <button type="submit" style={{ marginLeft: 8, padding: "8px 16px", fontSize: 18 }}>
            Tahmin Et
          </button>
        </form>
      )}

      <p style={{ marginTop: 16, fontWeight: "bold" }}>{message}</p>
    </div>
  );
}

export default Game;
