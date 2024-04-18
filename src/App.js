import { useState, useEffect } from 'react';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={`square ${value === 'X' ? 'x-square' : 'o-square'} ${isWinning ? 'winning-square' :  ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, updateScoreboard }) {
  const gameResult = calculateResult(squares).result;
  const winningLine = calculateResult(squares).winningLine;

  function handleClick(i) {
    const nextSquares = squares.slice();
    if(squares[i] || gameResult) {          // If square already selected exit handleClick
      return;
    } 

    if(xIsNext) { 
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);  
  }

  let status;
  if(gameResult === "draw") {
    status = "Game Drawn";
  } else if (gameResult) {
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

function Game({ updateScoreboard }) {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove ] = useState(0);
  const [showMoves, setShowMoves] = useState(false); 
  const [startingPlayer, setStartingPlayer] = useState('X'); // Track the starting player
  const currentSquares = history[currentMove];

  let xIsNext;
  if (startingPlayer === 'X') {
    xIsNext = currentMove % 2 === 0;
  } else {
    xIsNext = currentMove % 2 != 0;
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function newGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setShowMoves(false);
    // Toggle starting player between X and O
    setStartingPlayer(startingPlayer === 'X' ? 'O' : 'X');
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Move " + move;
    } else {
      description = "Game Start";
    }

    // Check if it's the current move
    if (move === currentMove) {
      return (
        <li key={move}>
          <span>{description}</span>
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  useEffect(() => {
    const result = calculateResult(currentSquares).result;
    if (result && result !== "draw") {
      updateScoreboard(result);
    }
  }, [currentSquares]);

  return (
    <>
      <div className="game">
        <div className="game-content">
          <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} updateScoreboard={updateScoreboard} startingPlayer />
          </div>
          <div className="game-info">
            <button className="big-button" onClick={() => setShowMoves(!showMoves)}>
                {showMoves ? "Hide Moves" : "Show Moves"}
              </button>
              {showMoves && (
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {moves.map((move, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      {move}
                    </li>
                  ))}
                </ol>
              )}
          </div>
        </div>
        <div> 
          <button className="big-button" onClick={newGame}>New Game</button>
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
    return { result: "draw", winningLine: null };
  }
  return { result: null, winningLine: null };
}

function Scoreboard({ xWins, oWins }) {
  return (
    <>
      <div className="scoreboard">
        <div>X Wins: {xWins}</div>
        <div>O Wins: {oWins}</div>
      </div>
    </>
  );
}

function Competition() {
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);

  function updateScoreboard(result) {
    if (result === 'X') {
      setXWins(prevWins => prevWins + 1);
    } else if (result === 'O') {
      setOWins(prevWins => prevWins + 1);
    }
  }

  function resetScoreboard(result) {
    setXWins(0);
    setOWins(0);
  }

  return (
    <>
      <div className="competition">
        <h1>Jack's Noughts & Crosses</h1>
        <Scoreboard xWins={xWins} oWins={oWins} />
        <Game updateScoreboard={updateScoreboard}/>
        <button className="big-button" onClick={resetScoreboard}>Rest Scoreboard</button>
      </div>
    </>
  )
}

export default Competition;