import React, { useEffect, useCallback, useRef, useState } from 'react';

const BOARD_SIZE = 20;

const GameBoard = ({ gameState, setGameState, gameStatus, onUpdateGame, playerName, onDirectionChange }) => {
  const gameLoopRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const boardRef = useRef();
  const [cellSize, setCellSize] = useState(20);
  const gameSpeed = 150; // milliseconds

  // Calculate responsive cell size
  useEffect(() => {
    const calculateCellSize = () => {
      if (boardRef.current) {
        const container = boardRef.current;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const minDimension = Math.min(containerWidth, containerHeight);
        const newCellSize = Math.floor(minDimension / BOARD_SIZE);
        setCellSize(Math.max(newCellSize, 10)); // Minimum 10px cells
      }
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    
    return () => window.removeEventListener('resize', calculateCellSize);
  }, []);

  const moveSnake = useCallback((direction) => {
    if (!gameState || gameState.game_over || gameStatus !== 'playing') return;

    const newSnake = [...gameState.snake];
    const head = [...newSnake[0]];

    // Move head based on direction
    switch (direction) {
      case 'up':
        head[1] -= 1;
        break;
      case 'down':
        head[1] += 1;
        break;
      case 'left':
        head[0] -= 1;
        break;
      case 'right':
        head[0] += 1;
        break;
      default:
        return;
    }

    // Check wall collision - ensure coordinates are within bounds
    if (head[0] < 0 || head[0] >= BOARD_SIZE || head[1] < 0 || head[1] >= BOARD_SIZE) {
      // Cancel any pending game loop immediately
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      
      const gameOverState = { ...gameState, game_over: true };
      setGameState(gameOverState);
      onUpdateGame(gameOverState);
      return;
    }

    // Check self collision
    if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
      // Cancel any pending game loop immediately
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      
      const gameOverState = { ...gameState, game_over: true };
      setGameState(gameOverState);
      onUpdateGame(gameOverState);
      return;
    }

    newSnake.unshift(head);

    let newScore = gameState.score;
    let newFood = gameState.food;

    // Check food collision
    if (head[0] === gameState.food[0] && head[1] === gameState.food[1]) {
      newScore += 10;
      // Generate new food position
      do {
        newFood = [
          Math.floor(Math.random() * BOARD_SIZE),
          Math.floor(Math.random() * BOARD_SIZE)
        ];
      } while (newSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    } else {
      newSnake.pop(); // Remove tail if no food eaten
    }

    const newGameState = {
      ...gameState,
      snake: newSnake,
      food: newFood,
      score: newScore,
      direction: direction
    };

    setGameState(newGameState);
    onUpdateGame(newGameState);
  }, [gameState, gameStatus, setGameState, onUpdateGame]);

  const handleKeyPress = useCallback((event) => {
    if (gameStatus !== 'playing') return;

    const key = event.key.toLowerCase();
    const currentDirection = gameState?.direction;

    let newDirection = null;

    switch (key) {
      case 'arrowup':
      case 'w':
        if (currentDirection !== 'down') newDirection = 'up';
        break;
      case 'arrowdown':
      case 's':
        if (currentDirection !== 'up') newDirection = 'down';
        break;
      case 'arrowleft':
      case 'a':
        if (currentDirection !== 'right') newDirection = 'left';
        break;
      case 'arrowright':
      case 'd':
        if (currentDirection !== 'left') newDirection = 'right';
        break;
      default:
        return;
    }

    if (newDirection) {
      event.preventDefault();
      moveSnake(newDirection);
    }
  }, [gameStatus, gameState, moveSnake]);

  // Handle direction changes from mobile controls
  const handleDirectionChange = useCallback((direction) => {
    if (gameStatus !== 'playing' || !gameState) return;

    const currentDirection = gameState.direction;
    
    // Prevent opposite direction (snake can't reverse into itself)
    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };

    if (opposites[direction] === currentDirection) {
      return; // Ignore opposite direction
    }

    moveSnake(direction);
  }, [gameStatus, gameState, moveSnake]);

  // Expose direction change function to parent
  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange.current = handleDirectionChange;
    }
  }, [handleDirectionChange, onDirectionChange]);

  const gameLoop = useCallback((timestamp) => {
    // Safety check - stop immediately if game is over or not playing
    if (gameStatus !== 'playing' || !gameState || gameState.game_over) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastUpdateTimeRef.current;

    if (deltaTime >= gameSpeed) {
      // Double-check game state before moving
      if (gameStatus === 'playing' && gameState && !gameState.game_over) {
        moveSnake(gameState.direction);
        lastUpdateTimeRef.current = timestamp;
      }
    }

    // Only continue loop if game is still active
    if (gameStatus === 'playing' && gameState && !gameState.game_over) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameStatus, gameState, moveSnake, gameSpeed]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameStatus === 'playing' && gameState && !gameState.game_over) {
      lastUpdateTimeRef.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStatus, gameState, gameLoop]);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="game-board-container">
      <div
        ref={boardRef}
        className="game-board"
        style={{
          width: BOARD_SIZE * cellSize,
          height: BOARD_SIZE * cellSize,
        }}
      >
        {/* Render snake */}
        {gameState.snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
            style={{
              left: segment[0] * cellSize,
              top: segment[1] * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
            }}
          />
        ))}

        {/* Render food */}
        <div
          className="food"
          style={{
            left: gameState.food[0] * cellSize,
            top: gameState.food[1] * cellSize,
            width: cellSize - 2,
            height: cellSize - 2,
          }}
        />

        {/* Game over overlay */}
        {gameState.game_over && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>{playerName}</p>
            <p>Final Score: {gameState.score}</p>
          </div>
        )}

        {/* Paused overlay */}
        {gameStatus === 'paused' && (
          <div className="game-over">
            <h2>Paused</h2>
            <p>Press Resume to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
