import React from 'react';

const MotionLogo = ({ size = 32, className = '' }: { size?: number; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="sei-motion-logo"
        style={{ 
          width: size, 
          height: size,
          fontSize: `${size * 0.6}px`,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <span className="sei-logo-text">S</span>
        <div className="sei-logo-glow"></div>
      </div>
    </div>
  );
};

export default MotionLogo;