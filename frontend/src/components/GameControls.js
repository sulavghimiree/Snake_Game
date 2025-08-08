import React from 'react';

const GameControls = ({ gameStatus, onRestart, onPause }) => {
  return (
    <div className="game-controls">
      {gameStatus === 'playing' && (
        <button className="game-button pause-button" onClick={onPause}>
          Pause
        </button>
      )}
      
      {gameStatus === 'paused' && (
        <button className="game-button pause-button" onClick={onPause}>
          Resume
        </button>
      )}
      
      {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'gameOver') && (
        <button className="game-button restart-button" onClick={onRestart}>
          New Game
        </button>
      )}
    </div>
  );
};

export default GameControls;
