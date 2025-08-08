import React, { useEffect, useState } from 'react';

const MobileControls = ({ gameStatus, onDirectionChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [lastDirection, setLastDirection] = useState(null);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchControl = (direction) => {
    if (gameStatus !== 'playing') return;
    
    // Prevent opposite direction (snake can't reverse into itself)
    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };

    if (lastDirection && opposites[direction] === lastDirection) {
      return; // Ignore opposite direction
    }

    setLastDirection(direction);
    onDirectionChange(direction);
  };

  // Handle swipe gestures
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent scrolling
    };

    const handleTouchEnd = (e) => {
      if (gameStatus !== 'playing') return;

      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 30;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            handleTouchControl('right');
          } else {
            handleTouchControl('left');
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            handleTouchControl('down');
          } else {
            handleTouchControl('up');
          }
        }
      }
    };

    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
      gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
      gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });

      return () => {
        gameBoard.removeEventListener('touchstart', handleTouchStart);
        gameBoard.removeEventListener('touchmove', handleTouchMove);
        gameBoard.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, gameStatus, lastDirection]);

  if (!isMobile) return null;

  return (
    <>
      <div className="swipe-hint">
        💡 Swipe on the game board or use buttons below to control the snake
      </div>
      
      <div className={`touch-controls ${gameStatus === 'playing' ? 'show' : ''}`}>
        <button 
          className="touch-btn up" 
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchControl('up');
          }}
          disabled={gameStatus !== 'playing'}
          aria-label="Move up"
        >
          ↑
        </button>
        
        <button 
          className="touch-btn left" 
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchControl('left');
          }}
          disabled={gameStatus !== 'playing'}
          aria-label="Move left"
        >
          ←
        </button>
        
        <button 
          className="touch-btn right" 
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchControl('right');
          }}
          disabled={gameStatus !== 'playing'}
          aria-label="Move right"
        >
          →
        </button>
        
        <button 
          className="touch-btn down" 
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchControl('down');
          }}
          disabled={gameStatus !== 'playing'}
          aria-label="Move down"
        >
          ↓
        </button>
      </div>
    </>
  );
};

export default MobileControls;
