import React from 'react';

const PlayerInput = ({ playerName, setPlayerName, onStartGame, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame();
  };

  return (
    <form onSubmit={handleSubmit} className="player-input">
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        disabled={loading}
        maxLength={20}
        autoFocus
      />
      <button
        type="submit"
        className="game-button start-button"
        disabled={loading || !playerName.trim()}
      >
        {loading ? 'Starting...' : 'Start Game'}
      </button>
    </form>
  );
};

export default PlayerInput;
