import React, { useEffect, useRef, useState } from 'react';
import { createTimeline } from 'animejs';

interface SimplifiedClockAnimationProps {
  children: React.ReactNode;
}

const SimplifiedClockAnimation: React.FC<SimplifiedClockAnimationProps> = ({ children }) => {
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const childrenWrapperRef = useRef<HTMLDivElement>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Basic styles - will be refined later
  const styles = `
    .clock-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #222; /* Dark gray/black */
      z-index: 9999; /* Ensure it's on top */
      opacity: 1; /* Start visible, will be animated */
    }
    .clock-face {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background-color: #f0f0f0; /* Light gray for now */
      position: relative;
      overflow: hidden;
      border: 5px solid #111;
    }
    .clock-half {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .clock-half-top-left {
      background-color: #FF4500; /* Orange-red */
      clip-path: polygon(0 0, 100% 0, 0 100%); /* Triangle for top-left */
    }
    .clock-half-bottom-right {
      background-color: #1E90FF; /* Dodger blue */
      clip-path: polygon(100% 0, 100% 100%, 0 100%); /* Triangle for bottom-right, but needs to be the other half */
      /* Corrected clip-path for bottom-right to make a diagonal split with top-left */
      clip-path: polygon(100% 0, 100% 100%, 0% 100%, 100% 0);
      /* Let's rethink the halves for a simpler diagonal split.
         A single div with a gradient or two rotated divs might be better.
         For now, using two divs and trying to position them.
      */
    }

    /* Simpler approach for halves: Use two divs, each taking 50% height and 100% width, then rotate the container if needed, or use skewed divs.
       Let's try a conic gradient for the background of clock-face itself for the diagonal split.
    */
    .clock-face-gradient {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: conic-gradient(#FF4500 0deg 180deg, #1E90FF 180deg 360deg);
      position: relative;
      overflow: hidden;
      border: 5px solid #111;
    }

    .clock-x {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 100px; /* Large X */
      color: white;
      font-weight: bold;
      z-index: 10;
    }
    /* Alternative for X using divs if preferred later */
    .clock-x-line1, .clock-x-line2 {
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: white;
        height: 10px; /* Thickness of X lines */
        width: 120px; /* Length of X lines */
        z-index: 10;
    }
    .clock-x-line1 {
        transform: translate(-50%, -50%) rotate(45deg);
    }
    .clock-x-line2 {
        transform: translate(-50%, -50%) rotate(-45deg);
    }


    .hour-hand, .minute-hand {
      position: absolute;
      bottom: 50%; /* Pivot from center bottom */
      left: 50%;
      transform-origin: bottom center; /* Correct for vertical hands starting at 12 and rotating around their bottom base */
      z-index: 5;
    }
    .hour-hand {
      width: 8px;
      height: 90px; /* Length of hour hand */
      background-color: #333; /* Main hand color */
      /* Tip will be added via a pseudo-element or an inner div */
    }
    .hour-hand::after { /* Orange-red tip */
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 20px; /* Length of the tip */
        background-color: #FF4500;
    }

    .minute-hand {
      width: 6px;
      height: 120px; /* Length of minute hand */
      background-color: #333; /* Main hand color */
    }
    .minute-hand::after { /* Blue tip */
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 20px; /* Length of the tip */
        background-color: #1E90FF;
    }
    .children-wrapper {
      opacity: 0; /* Hidden initially */
      /* display: none; Will be controlled by isAnimationComplete for final state or directly by animation */
    }
  `;

  // For now, children are not rendered until animation completes.
  // This will be handled by the animation logic later.
  // const [showChildren, setShowChildren] = React.useState(false); // Replaced by isAnimationComplete and direct wrapper styling

  useEffect(() => {
    const tl = createTimeline({
      easing: 'easeInOutQuad',
      complete: () => {
        if (clockContainerRef.current) {
          // Ensure it's cleaned up after animation
          clockContainerRef.current.style.opacity = '0';
          clockContainerRef.current.style.display = 'none';
        }
        // Children wrapper is already faded in by the timeline.
        // setIsAnimationComplete(true); // This state can be used if children are conditionally rendered instead of animated.
                                     // For now, direct animation of opacity is fine.
      }
    });

    // Hour hand to 10 o'clock. Initial position is -90deg (9 o'clock) in JSX.
    // Target: -60deg (10 o'clock).
    tl.add({
      targets: hourHandRef.current,
      rotate: [-90, 360 * 2 - 60], // From -90deg (9 o'clock), 2 full spins, then to -60deg (10 o'clock)
      duration: 1800, // Increased duration for more spins
      easing: 'easeInOutQuint',
      boxShadow: ['0 0 0px 0px rgba(255, 69, 0, 0)', '0 0 25px 8px rgba(255, 69, 0, 0.6)', '0 0 0px 0px rgba(255, 69, 0, 0)'],
      // transform origin is bottom center, translateX(-50%) is applied in style
    }, 0);

    // Minute hand to 4 o'clock. Initial position is 0deg (12 o'clock) in JSX.
    // Target: 120deg (4 o'clock).
    tl.add({
      targets: minuteHandRef.current,
      rotate: [0, 360 * 3 + 120], // From 0deg (12 o'clock), 3 full spins, then to 120deg (4 o'clock)
      duration: 2300, // Increased duration
      easing: 'easeInOutQuint',
      boxShadow: ['0 0 0px 0px rgba(30, 144, 255, 0)', '0 0 25px 8px rgba(30, 144, 255, 0.6)', '0 0 0px 0px rgba(30, 144, 255, 0)'],
    }, 150); // Stagger start slightly

    // Fade out clock
    tl.add({
      targets: clockContainerRef.current,
      opacity: 0,
      duration: 600,
      easing: 'easeOutExpo',
    }, '-=500') // Overlap with the end of hand animations for smoother transition

    // Fade in children
    .add({
      targets: childrenWrapperRef.current,
      opacity: [0, 1],
      translateY: [15, 0], // Slight slide-up effect
      duration: 700,
      easing: 'easeOutExpo',
    }, '-=400'); // Start this as the clock is fading out

  }, []);

  return (
    <>
      <style>{styles}</style>
      {/* Clock container will be hidden by animation `complete` callback */}
      <div ref={clockContainerRef} className="clock-container">
        <div className="clock-face-gradient">
          <div className="clock-x">X</div>
          {/* Initial rotation set for animation start points */}
          <div ref={hourHandRef} className="hour-hand" style={{ transform: 'translateX(-50%) rotate(-90deg)' }}></div>
          <div ref={minuteHandRef} className="minute-hand" style={{ transform: 'translateX(-50%) rotate(0deg)' }}></div>
        </div>
      </div>
      {/* Children wrapper starts at opacity 0 (from CSS) and is faded in by animation */}
      <div ref={childrenWrapperRef} className="children-wrapper">
        {children}
      </div>
    </>
  );
};

export default SimplifiedClockAnimation;
