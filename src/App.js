import { useState } from 'react';

/*
function Square({value, onSquareClick}) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}
*/

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? 'winning-square' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    const nextSquares = squares.slice();
    if(squares[i] || calculateResult(squares).result) {
      return;
    }
    if(xIsNext) { 
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);  
  }

  const gameResult = calculateResult(squares).result;
  const winningLine = calculateResult(squares).winningLine;
  let status;
  if(gameResult === "draw") {
    status = "Game Drawn";
  } else if (gameResult === "X" || gameResult === "O") {
    status = "Winner: " + gameResult;
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {Array(3).fill(null).map((_, rowIndex) => (
        <div className="board-row" key={rowIndex}>
          {Array(3).fill(null).map((_, colIndex) => {
            const squareIndex = rowIndex * 3 + colIndex;
            const isWinning = winningLine && winningLine.includes(squareIndex);
            return (
              <Square 
                key={squareIndex}
                value={squares[squareIndex]}
                onSquareClick={() => handleClick(squareIndex)}
                isWinning={isWinning}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove ] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <>
      <h1>Jack's Noughts & Crosses</h1>
      <div className="game">
        <div className="game-content">
          <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
          </div>
          <div className="game-info">
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    </>
  );
}

function calculateResult(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { result: squares[a], winningLine: lines[i] };
    }
  }
  // If there is no winner and no empty (null) squares then result = draw
  const containsNull = squares.some(element => element === null);
  if (!containsNull) {
    const result = "draw";
    const winningLine = null;
    return { result: "draw", winningLine: null };
    return "draw";
  }
  return { result: null, winningLine: null };
}