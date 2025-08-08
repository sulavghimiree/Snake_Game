import React, { useState, useEffect } from 'react';
import { detectMobile } from '../utils/mobileUtils';

const MobileDebug = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const info = detectMobile();
    setDeviceInfo({
      ...info,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      orientation: window.screen.orientation?.type || 'unknown'
    });
  }, []);

  if (!showDebug || !deviceInfo) return (
    <button 
      onClick={() => setShowDebug(true)}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '5px 10px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}
    >
      Debug
    </button>
  );

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '200px',
      zIndex: 1000
    }}>
      <button 
        onClick={() => setShowDebug(false)}
        style={{ float: 'right', background: 'none', color: 'white', border: 'none' }}
      >
        ×
      </button>
      <h4 style={{ margin: '0 0 10px 0' }}>Device Info</h4>
      <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
      <div>Touch: {deviceInfo.isTouch ? 'Yes' : 'No'}</div>
      <div>Screen: {deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
      <div>Pixel Ratio: {deviceInfo.pixelRatio}</div>
      <div>Orientation: {deviceInfo.orientation}</div>
      <div style={{ marginTop: '10px', fontSize: '10px', wordBreak: 'break-all' }}>
        UA: {deviceInfo.userAgent.substring(0, 50)}...
      </div>
    </div>
  );
};

export default MobileDebug;
