import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface EntranceAnimationProps {
  children: React.ReactNode;
}

const EntranceAnimation: React.FC<EntranceAnimationProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      anime({
        targets: wrapperRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutExpo',
      });
    }
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
};

export default EntranceAnimation;
