import React, { useMemo, useState } from "react";
import "./TicTacToe.css";
import circle_icon from "../assests/circle.png";
import cross_icon from "../assests/cross.png";

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const initialBoard = Array(9).fill("");

const TicTacToe = () => {
  const [board, setBoard] = useState(initialBoard);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState("");
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");

  const [scores, setScores] = useState({
    x: 0,
    o: 0,
    draws: 0,
  });

  const player1 = val1.trim() || "Player 1";
  const player2 = val2.trim() || "Player 2";

  const playTone = (frequency, duration = 0.12, type = "sine") => {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.onended = () => {
        audioCtx.close();
      };
    } catch (error) {
      console.log("Sound blocked:", error);
    }
  };

  const playMoveSound = (mark) => {
    if (mark === "x") {
      playTone(240, 0.08, "square");
    } else {
      playTone(440, 0.08, "sine");
    }
  };

  const playWinSound = () => {
    playTone(523, 0.12, "triangle");
    setTimeout(() => playTone(659, 0.12, "triangle"), 120);
    setTimeout(() => playTone(784, 0.18, "triangle"), 240);
  };

  const playDrawSound = () => {
    playTone(420, 0.1, "sine");
    setTimeout(() => playTone(320, 0.14, "sine"), 120);
  };

  const checkWinner = (updatedBoard) => {
    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern;

      if (
        updatedBoard[a] &&
        updatedBoard[a] === updatedBoard[b] &&
        updatedBoard[b] === updatedBoard[c]
      ) {
        return {
          mark: updatedBoard[a],
          pattern,
        };
      }
    }
    return null;
  };

  const getLineClass = (pattern) => {
    const key = pattern.join("-");

    switch (key) {
      case "0-1-2":
        return "line-row1";
      case "3-4-5":
        return "line-row2";
      case "6-7-8":
        return "line-row3";
      case "0-3-6":
        return "line-col1";
      case "1-4-7":
        return "line-col2";
      case "2-5-8":
        return "line-col3";
      case "0-4-8":
        return "line-diag1";
      case "2-4-6":
        return "line-diag2";
      default:
        return "";
    }
  };

  const handleBoxClick = (index) => {
    if (!gameStarted || board[index] !== "" || winner || isDraw) return;

    const updatedBoard = [...board];
    const currentMark = isXTurn ? "x" : "o";

    updatedBoard[index] = currentMark;
    setBoard(updatedBoard);
    playMoveSound(currentMark);

    const result = checkWinner(updatedBoard);

    if (result) {
      setWinner(result.mark);
      setWinningCells(result.pattern);
      setScores((prev) => ({
        ...prev,
        [result.mark]: prev[result.mark] + 1,
      }));

      setTimeout(() => {
        playWinSound();
        setShowPopup(true);
      }, 450);

      return;
    }

    if (updatedBoard.every((cell) => cell !== "")) {
      setIsDraw(true);
      setScores((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));

      setTimeout(() => {
        playDrawSound();
        setShowPopup(true);
      }, 250);

      return;
    }

    setIsXTurn((prev) => !prev);
  };

  const resetRound = () => {
    setBoard(initialBoard);
    setIsXTurn(true);
    setWinner("");
    setIsDraw(false);
    setWinningCells([]);
    setShowPopup(false);
  };

  const resetAll = () => {
    setBoard(initialBoard);
    setIsXTurn(true);
    setWinner("");
    setIsDraw(false);
    setWinningCells([]);
    setGameStarted(false);
    setShowPopup(false);
    setScores({
      x: 0,
      o: 0,
      draws: 0,
    });
    setVal1("");
    setVal2("");
  };

  const startGame = () => {
    setBoard(initialBoard);
    setIsXTurn(true);
    setWinner("");
    setIsDraw(false);
    setWinningCells([]);
    setShowPopup(false);
    setGameStarted(true);
  };

  const statusMessage = useMemo(() => {
    if (!gameStarted) return "Enter player names and start the fun!";
    if (winner === "x") return `🏆 ${player1} wins this round!`;
    if (winner === "o") return `🏆 ${player2} wins this round!`;
    if (isDraw) return "🤝 It’s a draw!";
    return isXTurn ? `❌ ${player1}'s turn` : `⭕ ${player2}'s turn`;
  }, [gameStarted, winner, isDraw, isXTurn, player1, player2]);

  const popupTitle = winner
    ? winner === "x"
      ? `${player1} Wins!`
      : `${player2} Wins!`
    : "It’s a Draw!";

  const popupText = winner
    ? "That was a brilliant round. Ready for the next one?"
    : "Nobody lost this one. Play again and break the tie!";

  const renderIcon = (value) => {
    if (value === "x") {
      return <img src={cross_icon} alt="cross" />;
    }

    if (value === "o") {
      return <img src={circle_icon} alt="circle" />;
    }

    return null;
  };

  return (
    <div className={`container ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <div className="floating-shape shape1"></div>
      <div className="floating-shape shape2"></div>
      <div className="floating-shape shape3"></div>

      <button
        className="theme-toggle"
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>

      <h1 className="title">
        Tic Tac Toe <span>Deluxe</span>
      </h1>
      <p className="subtitle">Animated board, live score, popup winner, theme switch, and sound effects.</p>

      <div className="game-card">
        {!gameStarted ? (
          <div className="input">
            <input
              className="input1"
              type="text"
              placeholder="Enter Player 1 Name"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
            />
            <input
              className="input2"
              type="text"
              placeholder="Enter Player 2 Name"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
            />
            <button className="primary-btn" onClick={startGame}>
              Start Game
            </button>
          </div>
        ) : (
          <>
            <div className="players-info">
              <p>❌ {player1}</p>
              <p>⭕ {player2}</p>
            </div>

            <div className="scoreboard">
              <div className="score-card">
                <span className="score-label">{player1}</span>
                <strong>{scores.x}</strong>
              </div>
              <div className="score-card">
                <span className="score-label">Draws</span>
                <strong>{scores.draws}</strong>
              </div>
              <div className="score-card">
                <span className="score-label">{player2}</span>
                <strong>{scores.o}</strong>
              </div>
            </div>

            <div className="status-pill">{statusMessage}</div>

            <div className="board">
              {winningCells.length > 0 && (
                <div className={`win-line ${getLineClass(winningCells)}`}></div>
              )}

              <div className="row">
                {board.slice(0, 3).map((value, index) => (
                  <div
                    key={index}
                    className={`boxes ${winningCells.includes(index) ? "win-box" : ""}`}
                    onClick={() => handleBoxClick(index)}
                  >
                    {renderIcon(value)}
                  </div>
                ))}
              </div>

              <div className="row">
                {board.slice(3, 6).map((value, index) => (
                  <div
                    key={index + 3}
                    className={`boxes ${winningCells.includes(index + 3) ? "win-box" : ""}`}
                    onClick={() => handleBoxClick(index + 3)}
                  >
                    {renderIcon(value)}
                  </div>
                ))}
              </div>

              <div className="row">
                {board.slice(6, 9).map((value, index) => (
                  <div
                    key={index + 6}
                    className={`boxes ${winningCells.includes(index + 6) ? "win-box" : ""}`}
                    onClick={() => handleBoxClick(index + 6)}
                  >
                    {renderIcon(value)}
                  </div>
                ))}
              </div>
            </div>

            <div className="action-row">
              <button className="ghost-btn" onClick={resetRound}>
                Reset Round
              </button>
              <button className="primary-btn" onClick={resetAll}>
                New Match
              </button>
            </div>
          </>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-emoji">{winner ? "🏆" : "🤝"}</div>
            <h2>{popupTitle}</h2>
            <p>{popupText}</p>

            <div className="popup-buttons">
              <button className="primary-btn" onClick={resetRound}>
                Play Again
              </button>
              <button className="ghost-btn" onClick={resetAll}>
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;