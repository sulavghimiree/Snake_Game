// Mobile optimization utilities
export const detectMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile devices
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check for touch support
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  return {
    isMobile: isMobileDevice || (isTouchDevice && isSmallScreen),
    isTouch: isTouchDevice,
    isSmallScreen,
    userAgent
  };
};

export const preventZoom = () => {
  // Prevent zoom on mobile devices during gameplay
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

export const optimizeForMobile = () => {
  // Don't prevent scrolling entirely on mobile - just prevent zoom
  const { isMobile } = detectMobile();
  
  if (isMobile) {
    // Only prevent horizontal scrolling
    document.body.style.overflowX = 'hidden';
    
    // Set minimum height but allow vertical scrolling
    document.body.style.minHeight = '100vh';
    
    // Hide address bar on mobile browsers
    setTimeout(() => {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    }, 100);
  }
};

export const restoreScrolling = () => {
  document.body.style.overflowX = '';
  document.body.style.minHeight = '';
};

export const getOptimalBoardSize = () => {
  const { isMobile } = detectMobile();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  if (isMobile) {
    // Calculate optimal board size for mobile
    const maxBoardWidth = Math.min(screenWidth * 0.9, 400);
    const maxBoardHeight = Math.min(screenHeight * 0.6, 400);
    const cellSize = Math.floor(Math.min(maxBoardWidth, maxBoardHeight) / 20);
    
    return {
      boardSize: 20, // Keep 20x20 grid
      cellSize: Math.max(cellSize, 15), // Minimum 15px cells
      scale: cellSize / 20
    };
  }
  
  return {
    boardSize: 20,
    cellSize: 20,
    scale: 1
  };
};

export const hapticFeedback = () => {
  // Provide haptic feedback on mobile devices
  if (navigator.vibrate) {
    navigator.vibrate(50); // Short vibration
  }
};

export const setupMobileOptimizations = () => {
  const { isMobile } = detectMobile();
  
  if (isMobile) {
    preventZoom();
    optimizeForMobile();
  }
  
  return () => {
    if (isMobile) {
      restoreScrolling();
    }
  };
};
