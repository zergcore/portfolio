import anime from 'animejs';
import React, { useEffect, useRef } from 'react';

const SpiralLoader = ({ onComplete }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    const count = 2024;
    const duration = 8000; // Shorter duration for loader
    const distance = 15; // Smaller for loader
    
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    const round = (value, decimals) => {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    };

    const container = animationRef.current;
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const hue = round(360 / count * i, 0);
      el.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0.8em;
        height: 0.8em;
        margin: -0.4em 0 0 -0.4em;
        font-size: 16px;
        border-radius: 0.8em;
        background: hsl(${hue}, 70%, 65%);
      `;
      container.appendChild(el);
    }

    const angle = (i) => mapRange(i, 0, count, 0, Math.PI * 100);
    
    const timeline = anime.timeline({
      complete: () => {
        // Wait a bit then call onComplete
        setTimeout(() => onComplete?.(), 1000);
      }
    });

    timeline.add({
      targets: container.children,
      translateX: (el, i) => `${Math.sin(angle(i)) * distance}rem`,
      translateY: (el, i) => `${Math.cos(angle(i)) * distance}rem`,
      scale: [0, 0.6, 0.3, 1, 0],
      easing: 'easeInOutSine',
      duration: duration,
      delay: anime.stagger(duration / count, { start: 0 })
    });

    timeline.seek(0);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div ref={animationRef} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        color: 'white',
        fontSize: '1.2rem',
        fontFamily: 'system-ui, sans-serif',
        opacity: 0.8
      }}>
        Loading...
      </div>
    </div>
  );
};

export default SpiralLoader;