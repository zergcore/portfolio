import anime from 'animejs';
import React, { useEffect, useRef } from 'react';

const SpiralAnimation = () => {
 const animationRef = useRef(null);

 useEffect(() => {
   const count = 2024;
   const duration = 10000;
   const distance = 20;
   
   // Helper functions equivalent to anime.js utils
   const mapRange = (value, inMin, inMax, outMin, outMax) => {
     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
   };

   const round = (value, decimals) => {
     return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
   };

   // Clear and create elements
   const container = animationRef.current;
   container.innerHTML = '';
   
   for (let i = 0; i < count; i++) {
     const el = document.createElement('div');
     const hue = round(360 / count * i, 0);
     el.style.cssText = `
       position: absolute;
       top: 50%;
       left: 50%;
       width: 1em;
       height: 1em;
       margin: -0.5em 0 0 -0.5em;
       font-size: 20px;
       border-radius: 1em;
       background: hsl(${hue}, 60%, 60%);
     `;
     container.appendChild(el);
   }

   const angle = (i) => mapRange(i, 0, count, 0, Math.PI * 100);
   
   // Create timeline animation exactly like the original
   const timeline = anime.timeline({
     loop: true
   });

   timeline.add({
     targets: container.children,
     translateX: (el, i) => `${Math.sin(angle(i)) * distance}rem`,
     translateY: (el, i) => `${Math.cos(angle(i)) * distance}rem`,
     scale: [0, 0.4, 0.2, 0.9, 0],
     easing: 'easeInOutSine',
     duration: duration,
     delay: anime.stagger(duration / count, { start: 0 })
   });

   // Seek to 10 seconds like the original
   timeline.seek(10000);
 }, []);

 return (
   <div style={{
     overflow: 'hidden',
     position: 'absolute',
     width: '100%',
     height: '100vh',
     backgroundColor: 'black'
   }}>
     <div ref={animationRef} />
   </div>
 );
};

export default SpiralAnimation;