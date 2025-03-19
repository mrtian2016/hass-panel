import React, { useState, useEffect, useMemo } from 'react';
import './washing-animation.css';

const WashingAnimation = ({ isRunning }) => {
  const [animationClass, setAnimationClass] = useState(isRunning ? 'running' : 'paused');
  
  // Update animation class when running state changes
  useEffect(() => {
    setAnimationClass(isRunning ? 'running' : 'paused');
  }, [isRunning]);
  
  // Generate random clothes with memoization (only recreate when component mounts)
  const clothes = useMemo(() => {
    const clothesList = ['👕', '👖', '🧦', '👚', '🧣','👙'];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      type: clothesList[Math.floor(Math.random() * clothesList.length)],
      delay: Math.random() * 1,
      size: 20 + Math.random() * 60,
      position: i + 50,
      rotationSpeed: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  // Generate random bubbles with memoization
  const bubbles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: 5 + Math.random() * 10,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
      opacity: 0.5 + Math.random() * 0.4,
    }));
  }, []);
  
  // Add water particles for enhanced realism
  const waterParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className={`washing-animation-container ${animationClass}`}>
      <div className="washing-window">
        <div className="washing-glass"></div>
        <div className="center-axis"></div>
        
        {/* Water layer - only shown when running */}
        {isRunning && (
          <div className="water-container">
            <div className="water-layer"></div>
            <div className="water-wave"></div>
            
            {/* Water particles */}
            {waterParticles.map(particle => (
              <div 
                key={`particle-${particle.id}`}
                className="water-particle"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  opacity: particle.opacity,
                  animationDuration: `${particle.animationDuration}s`,
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Clothes - only shown when running */}
        {isRunning && (
          <div className="clothes-container">
            {clothes.map(cloth => (
              <div 
                key={`cloth-${cloth.id}`}
                className="clothing-item"
                style={{
                  fontSize: `${cloth.size}px`,
                  animationDelay: `${cloth.delay}s`,
                  transform: `translateY(${cloth.position}px)`,
                  animationDuration: `${5 / cloth.rotationSpeed}s`,
                }}
              >
                {cloth.type}
              </div>
            ))}
          </div>
        )}
        
        {/* Bubbles - only shown when running */}
        {isRunning && (
          <div className="bubbles-container">
            {bubbles.map(bubble => (
              <div 
                key={`bubble-${bubble.id}`}
                className="bubble"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.left}%`,
                  opacity: bubble.opacity,
                  animationDelay: `${bubble.delay}s`,
                  animationDuration: `${bubble.duration}s`,
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Status indicator */}
        <div className={`status-indicator ${isRunning ? 'active' : ''}`}></div>
        
        {/* Glass reflection */}
        <div className="glass-reflection"></div>
      </div>
    </div>
  );
};

export default WashingAnimation; 