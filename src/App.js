import { useState, useEffect } from 'react';

function Square({ value, onSquareClick, isWinning, isLatestMove }) {
  // isWinning will be true if the square is part of a winning line - for CSS formatting purposes
  return (
    <button
      className={`square ${value === 'X' ? 'x-square' : 'o-square'} ${isWinning ? 'winning-square' : ''} ${isLatestMove ? 'latest-move' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, lastMoveIndex }) {
  const gameResult = calculateResult(squares).result;
  const winningLine = calculateResult(squares).winningLine;

  function handleClick(i) {
    const nextSquares = squares.slice();    // Create nextSquares so that squares is immutable
    if(squares[i] || gameResult) {          // If square already has an X or O then exit handleClick()
      return;
    } 

    if(xIsNext) {                           // Is X the next move
      nextSquares[i] = "X";                 // Set value for the ith element in the nextSquares array
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);                    // Call the passed down function onPlay passing the nextSquares array
  }

  return (
    <>
      {Array(3).fill(null).map((_, rowIndex) => (               // Three empty rows
        <div className="board-row" key={rowIndex}>
          {Array(3).fill(null).map((_, colIndex) => {           // With three empty columns
            const squareIndex = rowIndex * 3 + colIndex;        // Index the squares 0 to 8
            const isWinning = winningLine && winningLine.includes(squareIndex);     // Winning square if index is in winningLine
            const isLatestMove = squareIndex === lastMoveIndex;
            return (
              <Square                                           // Call Square function
                key={squareIndex}
                value={squares[squareIndex]}
                onSquareClick={() => handleClick(squareIndex)}
                isWinning={isWinning}
                isLatestMove={isLatestMove}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

function Game({ updateScoreboard, resetScoreboard }) {                // Pass down functions to modify the overall Scoreboard
  const [history, setHistory] = useState([Array(9).fill(null)]);      // History of moves will enable "time machine"
  const [currentMove, setCurrentMove ] = useState(0);                 // Keep track od the current move
  const [showMoves, setShowMoves] = useState(false);                  // Toggle whether moves should be displayed
  const [startingPlayer, setStartingPlayer] = useState('X');          // Track the starting player
  const currentSquares = history[currentMove];                        // Current state of Game is the latest array in history

  let xIsNext;
  if (startingPlayer === 'X') {                                       // If X starts the game then xISNext is true for even moves
    xIsNext = currentMove % 2 === 0;                                  // 0, 2, 4, 6, 8
  } else {                                                            // and false for odd moves 1, 3, 5, 7
    xIsNext = currentMove % 2 != 0;                                   // 
  }

  function handlePlay(nextSquares) {                                  // Function that will be passed down to the Board
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);                                          // This will allow thr Board to update the history array with 
    setCurrentMove(nextHistory.length - 1);                           // ...the latest squares and set current move from the history array
  }

  function jumpTo(nextMove) {                                 // Function for when a moves button is selected
    setCurrentMove(nextMove);                                 
  }

  function newGame() {                                        // What to do when the New Game button is pressed
    setHistory([Array(9).fill(null)]);                        // Reset history array to nulls
    setCurrentMove(0);                                        // Current move back to zero
    setShowMoves(false);                                      // Turn off the time machine
    setStartingPlayer(startingPlayer === 'X' ? 'O' : 'X');    // Toggle starting player between X and O
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Move " + move;
    } else {
      description = "Start";
    }

    if (move === currentMove) {                         // Render content for the moves buttons
      return (                                              
        <div key={move} className="move-text">            
          {description}
        </div>
      );
    }

    return (
      <div key={move} className="move-button">
        <button onClick={() => jumpTo(move)}>{description}</button>
      </div>
    );
  });

  useEffect(() => {
    const result = calculateResult(currentSquares).result;
    if (result && result !== "draw") {
      updateScoreboard(result);
    }
  }, [currentSquares]);

  // Calculate the status
  let status;
  if (calculateResult(currentSquares).result === "draw") {
    status = "Draw";
  } else if (calculateResult(currentSquares).result) {
    status = calculateResult(currentSquares).result + " WINS THIS GAME";
  } else {
    status = "Next Move: " + (xIsNext ? "X" : "O");
  }

  function sumIndices(array) {                          // Return the summ of indices for an arrayy
    let indexSum = 0;
    if (array !== undefined) {
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== null && array[i] !== undefined) {
          indexSum += i;
        }
      }
      return indexSum
    }
  }
  // Sum indices in history of the current move and subtract sum of indices in the previous move
  // This will be passed down to Board and then to Square so it can be styled by CSS 
  let lastMoveIndex = sumIndices(history[currentMove]) - sumIndices(history[currentMove - 1])

  // Render the Game content. First the Board and then the game control buttons and the time machine
  return (
    <>
      <div className="game">
        <div className="game-status">{status}</div>
        <div className="game-content">
          <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} updateScoreboard={updateScoreboard} startingPlayer lastMoveIndex={lastMoveIndex}/>
          </div>
          <div className="game-info">
            <div className="game-control"> 
              <button className="big-button" onClick={newGame}>New Game</button>
              <button className="big-button" onClick={resetScoreboard}>Reset Scores</button>
            </div>
            <div className="game-moves">
            Time Machine
              <label className="toggle-switch">
                <input type="checkbox" checked={showMoves} onChange={() => setShowMoves(!showMoves)} />
                <span className="slider round"></span>
              </label>
              {showMoves && (
                <div className="moves-buttons-content">
                  {moves.map((move, index) => (
                    <div key={index}>
                      {move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function calculateResult(squares) {              
  const lines = [                  // The winning straight lines: 3x horizontal, 3x vertical and 2x diagonal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {      // Calculate if there is a winning line
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

function Scoreboard({ xWins, oWins }) {           // Render the Scoreboard content
  return (
    <>
      <div className="scoreboard">
        <div><b>===SCOREBOARD===</b></div>
        <div>X wins: {xWins}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O wins: {oWins}</div>
      </div>
    </>
  );
}

function Competition() {                          // Competition spans multiple games
  const [xWins, setXWins] = useState(0);          // Start scores at nill-nill
  const [oWins, setOWins] = useState(0);

  function updateScoreboard(result) {             // Every time a result happens update the scoreboard with the result
    if (result === 'X') {
      setXWins(prevWins => prevWins + 1);
    } else if (result === 'O') {
      setOWins(prevWins => prevWins + 1);
    }
  }

  function resetScoreboard() {                    // Function to reset the overall scoreboard back to nil-nil
    setXWins(0);
    setOWins(0);
  }

  // Render the overall content. First a heading, then the scoreboard and then the Game (with includes 
  // the Board, the contolr buttons abnd the time machine).
  return (
    <>
      <div className="competition">
        <Scoreboard xWins={xWins} oWins={oWins} />
        <Game updateScoreboard={updateScoreboard} resetScoreboard={resetScoreboard} />
        </div>
    </>
  )
}

export default Competition;                       // Call competition as the default function and starting point